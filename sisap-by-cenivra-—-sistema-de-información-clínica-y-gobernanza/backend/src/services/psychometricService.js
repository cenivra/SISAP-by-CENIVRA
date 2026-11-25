/**
 * Servicio de Evaluación Psicométrica Digital y Comparación Longitudinal (3 Niveles SQLite).
 * - Nivel 1: psychometric_evaluations
 * - Nivel 2: psychometric_item_responses (preservadas íntegramente ante recalibración algorítmica)
 * - Nivel 3: psychometric_results (append-only por versión de algoritmo)
 *
 * Garantías:
 *  - Excluye OCI-R como instrumento aplicable.
 *  - Nunca sobrescribe evaluaciones completadas (`application_status === 'completed'`).
 *  - Conserva historial longitudinal y emite alertas explícitas cuando se comparan versiones distintas.
 */
import { getDatabase } from '../db/index.js';
import { uuid } from '../utils/crypto.js';
import { Errors } from '../utils/errors.js';
import { recordEvent } from './auditService.js';
import {
  isInstrumentExcluded,
  normalizeInstrumentId,
  resolveInstrumentConfig,
} from '../psychometrics/instrumentCatalog.js';
import {
  numericSequenceToDigitalResponses,
  scorePsychometricEvaluation,
} from '../psychometrics/scoringEngine.js';

function safeJsonParse(raw, fallback = null) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function resolvePatientRecord(db, patientIdOrPseudonym) {
  const clean = String(patientIdOrPseudonym || '').trim();
  if (!clean) return null;
  return (
    db
      .prepare('SELECT patient_id, pseudonym, sexo, edad, estado FROM patients WHERE patient_id = ? OR pseudonym = ? LIMIT 1')
      .get(clean, clean) || null
  );
}

/**
 * Construye el paquete completo de 3 niveles para una evaluación guardada.
 */
function hydrateEvaluationBundle(db, evalRow) {
  const responses = db
    .prepare(
      `SELECT response_row_id, evaluation_id, item_id, item_number, canonical_code, selected_label, numeric_code, modified_at
       FROM psychometric_item_responses
       WHERE evaluation_id = ?
       ORDER BY item_number ASC`
    )
    .all(evalRow.evaluation_id);

  const results = db
    .prepare(
      `SELECT result_id, evaluation_id, total_score, technical_total_score, mean_score,
              subscales_json, recoded_values_json, missing_items_json, derived_indicators_json,
              interpretation_json, numeric_sequence, algorithm_version, calculated_at
       FROM psychometric_results
       WHERE evaluation_id = ?
       ORDER BY calculated_at DESC`
    )
    .all(evalRow.evaluation_id)
    .map((r) => ({
      result_id: r.result_id,
      evaluation_id: r.evaluation_id,
      total_score: r.total_score,
      technical_total_score: r.technical_total_score,
      mean_score: r.mean_score,
      subscales: safeJsonParse(r.subscales_json, []),
      recoded_values: safeJsonParse(r.recoded_values_json, []),
      missing_items: safeJsonParse(r.missing_items_json, {}),
      derived_indicators: safeJsonParse(r.derived_indicators_json, {}),
      interpretation: safeJsonParse(r.interpretation_json, {}),
      numeric_sequence: r.numeric_sequence,
      algorithm_version: r.algorithm_version,
      calculated_at: r.calculated_at,
    }));

  return {
    evaluation: {
      ...evalRow,
      complements: safeJsonParse(evalRow.complements_json, null),
    },
    responses,
    latestResult: results[0] || null,
    resultsHistory: results,
  };
}

/**
 * Persiste una evaluación nueva o actualiza un borrador existente en los 3 niveles.
 * Rechaza con HTTP 409 cualquier intento de sobrescribir una evaluación ya completada.
 */
export function savePsychometricEvaluation(input, { actor = 'clinician_local' } = {}) {
  if (!input || typeof input !== 'object') {
    throw Errors.badRequest('Cuerpo JSON inválido para guardar evaluación psicométrica.');
  }

  const rawInst = String(input.instrument_id || input.instrumentId || '').trim();
  if (isInstrumentExcluded(rawInst)) {
    throw Errors.badRequest(`El instrumento ${rawInst} está excluido del catálogo activo y no puede aplicarse.`);
  }
  const instrumentId = normalizeInstrumentId(rawInst);
  if (!instrumentId) {
    throw Errors.badRequest(`Instrumento psicométrico inválido o no soportado: ${rawInst}`);
  }

  const db = getDatabase();
  const patientRef = input.patient_id || input.patientId || input.pseudonym;
  const patient = resolvePatientRecord(db, patientRef);
  if (!patient) {
    throw Errors.notFound('Paciente no encontrado en padrón local.');
  }

  const requestedStatus = input.application_status || input.status || 'completed';
  if (!['draft', 'completed'].includes(requestedStatus)) {
    throw Errors.badRequest(`application_status inválido: ${requestedStatus}. Use 'draft' o 'completed'.`);
  }

  const captureMode = input.capture_mode || 'digital_form';
  const scoringMode = input.scoring_mode || 'manual_estandar';
  const requestedVersion = input.instrument_version || input.instrumentVersion || undefined;
  const config = resolveInstrumentConfig(instrumentId, requestedVersion);

  // Si llega numeric_sequence legada en lugar de respuestas digitales, convertir automáticamente
  let normalizedResponses = input.responses;
  if ((!normalizedResponses || (Array.isArray(normalizedResponses) && normalizedResponses.length === 0)) && input.numeric_sequence) {
    normalizedResponses = numericSequenceToDigitalResponses(instrumentId, input.numeric_sequence, config.version);
  }
  if (!normalizedResponses) {
    normalizedResponses = [];
  }

  const optionalComplements = input.optional_complements || input.complements || {};
  const nowIso = new Date().toISOString();

  // Calcular puntuación y validar rangos de respuestas ingresadas
  let scored;
  try {
    scored = scorePsychometricEvaluation({
      instrumentId: config.id,
      instrumentVersion: config.version,
      responses: normalizedResponses,
      optionalComplements,
      scoringMode,
      nowIso,
    });
  } catch (err) {
    throw Errors.badRequest(err.message);
  }

  // Si se intenta cerrar como 'completed', exigir completitud válida sin imputación silenciosa
  if (requestedStatus === 'completed' && !scored.derivedIndicators.completeness.isValidForScoring) {
    throw Errors.badRequest(
      `No puede cerrarse como evaluación completada: ${scored.derivedIndicators.completeness.warnings.join(' ')}`
    );
  }

  const existingEvalId = input.evaluation_id ? String(input.evaluation_id).trim() : null;
  let targetEvalId = existingEvalId || uuid();
  let isUpdateToDraft = false;

  if (existingEvalId) {
    const existingRow = db
      .prepare('SELECT * FROM psychometric_evaluations WHERE evaluation_id = ? LIMIT 1')
      .get(existingEvalId);

    if (existingRow) {
      if (existingRow.application_status === 'completed') {
        throw Errors.conflict(
          `La evaluación ${existingEvalId} ya se encuentra cerrada como 'completed' y no puede sobrescribirse.`
        );
      }
      isUpdateToDraft = true;
    }
  }

  const startedAt = input.started_at || nowIso;
  const completedAt = requestedStatus === 'completed' ? input.completed_at || nowIso : null;
  const evaluator = String(input.evaluator || actor || 'clinician_local').trim();
  const sessionContext = String(input.session_context || 'evaluacion_clinica').trim();
  const notes = input.notes ? String(input.notes) : null;
  const complementsJson = Object.keys(optionalComplements).length > 0 ? JSON.stringify(optionalComplements) : null;

  db.exec('BEGIN IMMEDIATE');
  try {
    if (isUpdateToDraft) {
      db.prepare(
        `UPDATE psychometric_evaluations
         SET instrument_version = ?, completed_at = ?, evaluator = ?, application_status = ?,
             capture_mode = ?, scoring_mode = ?, session_context = ?, complements_json = ?,
             notes = ?, actualizado_en = ?
         WHERE evaluation_id = ?`
      ).run(
        config.version,
        completedAt,
        evaluator,
        requestedStatus,
        captureMode,
        scoringMode,
        sessionContext,
        complementsJson,
        notes,
        nowIso,
        targetEvalId
      );

      db.prepare('DELETE FROM psychometric_item_responses WHERE evaluation_id = ?').run(targetEvalId);
      db.prepare('DELETE FROM psychometric_results WHERE evaluation_id = ?').run(targetEvalId);
    } else {
      db.prepare(
        `INSERT INTO psychometric_evaluations
           (evaluation_id, patient_id, instrument_id, instrument_version, language,
            started_at, completed_at, evaluator, application_status, capture_mode,
            scoring_mode, session_context, complements_json, notes, creado_en, actualizado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        targetEvalId,
        patient.patient_id,
        config.id,
        config.version,
        config.language,
        startedAt,
        completedAt,
        evaluator,
        requestedStatus,
        captureMode,
        scoringMode,
        sessionContext,
        complementsJson,
        notes,
        nowIso,
        nowIso
      );
    }

    // Nivel 2: Insertar respuestas individuales
    const insertResp = db.prepare(
      `INSERT INTO psychometric_item_responses
         (response_row_id, evaluation_id, item_id, item_number, canonical_code, selected_label, numeric_code, modified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const rawRow of scored.rawResponses) {
      insertResp.run(
        uuid(),
        targetEvalId,
        rawRow.itemId,
        rawRow.displayNumber,
        rawRow.canonicalCode,
        rawRow.selectedOptionLabel,
        rawRow.numericCode,
        rawRow.modifiedAt || nowIso
      );
    }

    // Nivel 3: Insertar resultado calculado y metadatos
    const resultId = uuid();
    db.prepare(
      `INSERT INTO psychometric_results
         (result_id, evaluation_id, total_score, technical_total_score, mean_score,
          subscales_json, recoded_values_json, missing_items_json, derived_indicators_json,
          interpretation_json, numeric_sequence, algorithm_version, calculated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      resultId,
      targetEvalId,
      scored.calculatedScores.totalScore,
      scored.calculatedScores.technicalReferenceTotal,
      scored.calculatedScores.meanScore,
      JSON.stringify({
        subscales: scored.calculatedScores.subscales,
        subscaleMap: scored.calculatedScores.subscaleMap,
        alternateScoringModes: scored.calculatedScores.alternateScoringModes,
      }),
      JSON.stringify(scored.recodedResponses),
      JSON.stringify({
        missingItems: scored.derivedIndicators.completeness.missingItems,
        missingItemIds: scored.derivedIndicators.completeness.missingItemIds,
        missingDisplayNumbers: scored.derivedIndicators.completeness.missingDisplayNumbers,
        isValidForScoring: scored.derivedIndicators.completeness.isValidForScoring,
        warnings: scored.derivedIndicators.completeness.warnings,
      }),
      JSON.stringify(scored.derivedIndicators),
      JSON.stringify(scored.interpretations),
      scored.derivedIndicators.numericSequence,
      scored.algorithmVersion,
      nowIso
    );

    // Si es completada y aplica seguimiento longitudinal compatible, reflejar también en follow_up_evaluations para Motor 2
    if (requestedStatus === 'completed') {
      const mirrorTotal =
        scored.calculatedScores.totalScore ??
        scored.calculatedScores.technicalReferenceTotal ??
        0;
      const numericOnly = scored.derivedIndicators.numericArray.filter((v) => v !== null && Number.isFinite(v));
      if (numericOnly.length > 0) {
        db.prepare(
          `INSERT INTO follow_up_evaluations
             (follow_up_id, patient_id, evaluation_date, session_number, instrument, total_score,
              subscales_json, items_json, items_count, clinical_severity, clinician_id, notes, schema_version, creado_en)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          uuid(),
          patient.patient_id,
          (completedAt || startedAt).slice(0, 10),
          input.session_number ?? null,
          config.id,
          mirrorTotal,
          JSON.stringify(scored.calculatedScores.subscaleMap),
          JSON.stringify(numericOnly),
          numericOnly.length,
          scored.interpretations.level,
          evaluator,
          `[Centro Psicométrico ${config.version}] ${notes || ''}`.trim(),
          '1.0.0',
          nowIso
        );
      }
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  recordEvent({
    action: requestedStatus === 'completed' ? 'psychometric.evaluation.completed' : 'psychometric.evaluation.draft',
    subjectPseudonym: patient.pseudonym,
    details: `instrument=${config.id} version=${config.version} status=${requestedStatus} eval=${targetEvalId}`,
  });

  return getPsychometricEvaluationById(targetEvalId);
}

export function getPsychometricEvaluationById(evaluationId) {
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM psychometric_evaluations WHERE evaluation_id = ? LIMIT 1')
    .get(evaluationId);
  if (!row) throw Errors.notFound('Evaluación psicométrica no encontrada.');
  return hydrateEvaluationBundle(db, row);
}

/**
 * Recalcula resultados con la versión vigente del algoritmo conservando intactas
 * las respuestas originales en psychometric_item_responses (agrega nueva fila en psychometric_results).
 */
export function recalculateEvaluationResults(evaluationId, { scoringMode } = {}) {
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM psychometric_evaluations WHERE evaluation_id = ? LIMIT 1')
    .get(evaluationId);
  if (!row) throw Errors.notFound('Evaluación psicométrica no encontrada.');

  const responses = db
    .prepare('SELECT item_id, selected_label, numeric_code, modified_at FROM psychometric_item_responses WHERE evaluation_id = ? ORDER BY item_number ASC')
    .all(evaluationId)
    .map((r) => ({
      itemId: r.item_id,
      selectedOptionLabel: r.selected_label,
      numericCode: r.numeric_code,
      modifiedAt: r.modified_at,
    }));

  const nowIso = new Date().toISOString();
  const complements = safeJsonParse(row.complements_json, {});
  const scored = scorePsychometricEvaluation({
    instrumentId: row.instrument_id,
    instrumentVersion: row.instrument_version,
    responses,
    optionalComplements: complements || {},
    scoringMode: scoringMode || row.scoring_mode || 'manual_estandar',
    nowIso,
  });

  const resultId = uuid();
  db.prepare(
    `INSERT INTO psychometric_results
       (result_id, evaluation_id, total_score, technical_total_score, mean_score,
        subscales_json, recoded_values_json, missing_items_json, derived_indicators_json,
        interpretation_json, numeric_sequence, algorithm_version, calculated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    resultId,
    evaluationId,
    scored.calculatedScores.totalScore,
    scored.calculatedScores.technicalReferenceTotal,
    scored.calculatedScores.meanScore,
    JSON.stringify({
      subscales: scored.calculatedScores.subscales,
      subscaleMap: scored.calculatedScores.subscaleMap,
      alternateScoringModes: scored.calculatedScores.alternateScoringModes,
    }),
    JSON.stringify(scored.recodedResponses),
    JSON.stringify({
      missingItems: scored.derivedIndicators.completeness.missingItems,
      missingItemIds: scored.derivedIndicators.completeness.missingItemIds,
      missingDisplayNumbers: scored.derivedIndicators.completeness.missingDisplayNumbers,
      isValidForScoring: scored.derivedIndicators.completeness.isValidForScoring,
      warnings: scored.derivedIndicators.completeness.warnings,
    }),
    JSON.stringify(scored.derivedIndicators),
    JSON.stringify(scored.interpretations),
    scored.derivedIndicators.numericSequence,
    scored.algorithmVersion,
    nowIso
  );

  return getPsychometricEvaluationById(evaluationId);
}

/**
 * Analiza trayectoria longitudinal por instrumento y advierte explícitamente si se comparan versiones distintas.
 */
export function buildLongitudinalInstrumentComparison(bundles) {
  const byInstrument = {};
  for (const b of bundles) {
    const inst = b.evaluation.instrument_id;
    if (!byInstrument[inst]) byInstrument[inst] = [];
    byInstrument[inst].push(b);
  }

  const comparisons = {};
  for (const [instId, list] of Object.entries(byInstrument)) {
    const completed = list
      .filter((item) => item.evaluation.application_status === 'completed')
      .sort((a, b) => (a.evaluation.completed_at || a.evaluation.started_at).localeCompare(b.evaluation.completed_at || b.evaluation.started_at));

    const versionsObserved = [...new Set(completed.map((c) => c.evaluation.instrument_version))];
    const versionMismatchWarning = versionsObserved.length > 1;
    let versionWarningMessage = null;
    if (versionMismatchWarning) {
      if (instId === 'BADS') {
        versionWarningMessage =
          `Advertencia longitudinal: el historial mezcla versiones distintas de BADS (${versionsObserved.join(' vs. ')}). La versión v22 excluye P4, P10 y P16; compare las puntuaciones mediante medias por reactivo o subconjunto común.`;
      } else if (instId === 'STAXI-2') {
        versionWarningMessage =
          `Advertencia longitudinal: existen aplicaciones con distinta versión de STAXI-2 (${versionsObserved.join(' vs. ')}). Coteje las escalas de 49 ítems TEA como marco común.`;
      } else {
        versionWarningMessage = `Advertencia longitudinal: se detectan múltiples versiones de ${instId} (${versionsObserved.join(', ')}). Verificar equivalencia de codificación antes de comparar puntuaciones directas.`;
      }
    }

    const timeline = completed.map((c, idx) => {
      const res = c.latestResult;
      const prev = idx > 0 ? completed[idx - 1].latestResult : null;
      const metricNow = res?.total_score ?? res?.technical_total_score ?? null;
      const metricPrev = prev?.total_score ?? prev?.technical_total_score ?? null;
      return {
        evaluation_id: c.evaluation.evaluation_id,
        date: (c.evaluation.completed_at || c.evaluation.started_at).slice(0, 10),
        timestamp: c.evaluation.completed_at || c.evaluation.started_at,
        version: c.evaluation.instrument_version,
        evaluator: c.evaluation.evaluator,
        total_score: res?.total_score ?? null,
        technical_total_score: res?.technical_total_score ?? null,
        mean_score: res?.mean_score ?? null,
        subscaleMap: res?.subscales?.subscaleMap || {},
        delta_from_previous: metricNow !== null && metricPrev !== null ? Number((metricNow - metricPrev).toFixed(4)) : null,
      };
    });

    comparisons[instId] = {
      instrument_id: instId,
      total_applications: list.length,
      completed_count: completed.length,
      draft_count: list.filter((x) => x.evaluation.application_status === 'draft').length,
      versionsObserved,
      versionMismatchWarning,
      versionWarningMessage,
      timeline,
    };
  }

  return comparisons;
}

export function listPatientPsychometricEvaluations(patientIdOrPseudonym) {
  const db = getDatabase();
  const patient = resolvePatientRecord(db, patientIdOrPseudonym);
  if (!patient) {
    throw Errors.notFound('Paciente no encontrado.');
  }

  const rows = db
    .prepare(
      `SELECT * FROM psychometric_evaluations
       WHERE patient_id = ?
       ORDER BY started_at DESC, creado_en DESC`
    )
    .all(patient.patient_id);

  const bundles = rows.map((row) => hydrateEvaluationBundle(db, row));
  const longitudinal = buildLongitudinalInstrumentComparison(bundles);

  return {
    patient: {
      patient_id: patient.patient_id,
      pseudonym: patient.pseudonym,
    },
    count: bundles.length,
    evaluations: bundles,
    longitudinal_by_instrument: longitudinal,
  };
}
