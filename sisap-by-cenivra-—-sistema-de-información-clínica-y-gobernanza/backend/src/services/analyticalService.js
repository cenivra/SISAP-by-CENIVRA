/**
 * Motor 2: Servicio de Inteligencia Analítica Longitudinal.
 * Gestiona capturas de seguimiento psicométrico (follow_up_evaluations) y analiza
 * trayectorias intraindividuales, tasas de cambio, Índice de Cambio Confiable (RCI)
 * cuando existen parámetros psicométricos documentados y discrepancias multimodales.
 */
import { getDatabase } from '../db/index.js';
import { uuid } from '../utils/crypto.js';
import { Errors } from '../utils/errors.js';
import { recordEvent } from './auditService.js';

const ALLOWED_INSTRUMENTS = new Set([
  'BADS',
  'GAD-7',
  'EROS',
  'BSCS',
  'PSS-4',
  'SHAPS',
  'UCLA-3',
  'BIS-11',
  'STAXI-2',
  'BSL-23',
]);

// Parámetros de referencia para RCI = (X2 - X1) / (SD * sqrt(2 * (1 - r_xx)))
// Fuente GAD-7 SD=5.8538: cohorte canónica N=166 de SISAP; r_xx: literatura psicométrica estándar.
const NORMATIVE_RCI_PARAMS = Object.freeze({
  'GAD-7': { sd: 5.853773711604051, r_xx: 0.83, source: 'Cohorte TUS N=166 (SD) + Spitzer 2006 (r_xx=0.83)', higher_is_worse: true },
  'BSL-23': { sd: 24.56472699502826, r_xx: 0.82, source: 'Cohorte TUS N=166 (SD_integrado) + Bohus 2009 (r_xx=0.82)', higher_is_worse: true },
  EROS: { sd: 6.95, r_xx: 0.85, source: 'Referencia Barraca & Pérez-Álvarez (r_xx=0.85)', higher_is_worse: false },
  BADS: { sd: 22.4, r_xx: 0.74, source: 'Referencia Kanter et al. BADS (r_xx=0.74)', higher_is_worse: false },
});

function safeJsonParse(raw, fallback = null) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function createFollowUpEvaluation(input, { actor = 'clinician_local' } = {}) {
  if (!input || typeof input !== 'object') {
    throw Errors.badRequest('Se requiere un cuerpo JSON válido para registrar el seguimiento.');
  }
  const patientId = input.patient_id ? String(input.patient_id).trim() : '';
  const instrument = input.instrument ? String(input.instrument).trim() : '';
  const evalDate = input.evaluation_date ? String(input.evaluation_date).trim() : new Date().toISOString().slice(0, 10);

  if (!patientId) throw Errors.badRequest('patient_id es obligatorio.');
  if (!ALLOWED_INSTRUMENTS.has(instrument)) {
    throw Errors.badRequest(`instrument inválido (${instrument}).`);
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw Errors.badRequest('Se requiere el arreglo completo de ítems crudos sin valores ausentes (regla D-06).');
  }
  const numericItems = input.items.map(Number);
  if (numericItems.some((v) => !Number.isFinite(v))) {
    throw Errors.badRequest('Todos los ítems deben ser numéricos finitos; no se permite imputación silenciosa.');
  }
  const totalScore = Number(input.total_score);
  if (!Number.isFinite(totalScore)) {
    throw Errors.badRequest('total_score debe ser un número finito.');
  }
  const sessionNumber =
    input.session_number !== undefined && input.session_number !== null && input.session_number !== ''
      ? Number(input.session_number)
      : null;
  if (sessionNumber !== null && (!Number.isInteger(sessionNumber) || sessionNumber < 1)) {
    throw Errors.badRequest('session_number debe ser un entero positivo.');
  }

  const db = getDatabase();
  const patient = db.prepare('SELECT patient_id, pseudonym FROM patients WHERE patient_id = ?').get(patientId);
  if (!patient) {
    throw Errors.notFound('Paciente no encontrado.');
  }

  const followUpId = uuid();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO follow_up_evaluations
       (follow_up_id, patient_id, evaluation_date, session_number, instrument, total_score,
        subscales_json, items_json, items_count, clinical_severity, clinician_id, notes, schema_version, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    followUpId,
    patientId,
    evalDate,
    sessionNumber,
    instrument,
    totalScore,
    input.subscales ? JSON.stringify(input.subscales) : null,
    JSON.stringify(numericItems),
    numericItems.length,
    input.clinical_severity ? String(input.clinical_severity) : null,
    input.clinician_id ? String(input.clinician_id) : actor,
    input.notes ? String(input.notes) : null,
    '1.0.0',
    now
  );

  recordEvent({
    actor,
    actorRole: 'clinician',
    action: 'followup.create',
    subjectPseudonym: patient.pseudonym,
    details: `follow_up_id=${followUpId} instrument=${instrument} items=${numericItems.length}`,
  });

  return {
    follow_up_id: followUpId,
    patient_id: patientId,
    evaluation_date: evalDate,
    session_number: sessionNumber,
    instrument,
    total_score: totalScore,
    clinical_severity: input.clinical_severity || null,
    creado_en: now,
  };
}

export function listFollowUpEvaluations(patientId) {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT follow_up_id, patient_id, evaluation_date, session_number, instrument, total_score,
              subscales_json, items_json, items_count, clinical_severity, clinician_id, notes, schema_version, creado_en
       FROM follow_up_evaluations
       WHERE patient_id = ?
       ORDER BY evaluation_date ASC, COALESCE(session_number, 0) ASC, creado_en ASC`
    )
    .all(patientId);

  return rows.map((r) => ({
    ...r,
    subscales: safeJsonParse(r.subscales_json, null),
    items: safeJsonParse(r.items_json, []),
  }));
}

function buildBaselineInstrumentPoints(db, patientId) {
  const evals = db
    .prepare(
      `SELECT evaluation_id, fecha_eval, creado_en FROM initial_evaluations
       WHERE patient_id = ? ORDER BY fecha_eval ASC, creado_en ASC`
    )
    .all(patientId);

  const byInstrument = {};
  for (const ev of evals) {
    const scores = db
      .prepare('SELECT instrument, subscale, value FROM scale_scores WHERE evaluation_id = ?')
      .all(ev.evaluation_id);

    const dateLabel = ev.fecha_eval || ev.creado_en.slice(0, 10);
    const mapScore = (inst, subscaleName, targetKey = inst) => {
      const match = scores.find((s) => s.instrument === inst && s.subscale === subscaleName && Number.isFinite(s.value));
      if (!match) return;
      if (!byInstrument[targetKey]) byInstrument[targetKey] = [];
      byInstrument[targetKey].push({
        date: dateLabel,
        label: 'Línea base (T0)',
        session_number: 0,
        value: Number(match.value),
        source_table: 'scale_scores',
        source_id: ev.evaluation_id,
      });
    };

    mapScore('GAD-7', 'gad_total_bruto', 'GAD-7');
    mapScore('EROS', 'eros_total_activo', 'EROS');
    mapScore('BADS', 'total_bads_invertido', 'BADS');
    mapScore('BSL-23', 'bsl_total_integrado', 'BSL-23');
    mapScore('BIS-11', 'total_bruto_30_items', 'BIS-11');
  }
  return byInstrument;
}

export function analyzePatientLongitudinalTrajectory(patientId) {
  const db = getDatabase();
  const patient = db
    .prepare('SELECT patient_id, pseudonym, edad, sexo, estado FROM patients WHERE patient_id = ?')
    .get(patientId);
  if (!patient) throw Errors.notFound('Paciente no encontrado.');

  const baselinePoints = buildBaselineInstrumentPoints(db, patientId);
  const followUps = listFollowUpEvaluations(patientId);
  const weeklyObs = db
    .prepare(
      `SELECT observation_id, week_number, fecha_entrega, text_json, analysis_state, creado_en
       FROM weekly_observations WHERE patient_id = ? ORDER BY week_number ASC`
    )
    .all(patientId);

  const seriesByInstrument = { ...baselinePoints };
  for (const fu of followUps) {
    if (!seriesByInstrument[fu.instrument]) seriesByInstrument[fu.instrument] = [];
    seriesByInstrument[fu.instrument].push({
      date: fu.evaluation_date,
      label: fu.session_number ? `Sesión ${fu.session_number}` : `Seguimiento (${fu.evaluation_date})`,
      session_number: fu.session_number,
      value: Number(fu.total_score),
      clinical_severity: fu.clinical_severity,
      source_table: 'follow_up_evaluations',
      source_id: fu.follow_up_id,
    });
  }

  const trajectories = {};
  const alerts = [];

  for (const [inst, points] of Object.entries(seriesByInstrument)) {
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    const nPoints = sorted.length;
    const first = sorted[0];
    const last = sorted[nPoints - 1];
    const prev = nPoints >= 2 ? sorted[nPoints - 2] : null;
    const deltaFirstLast = nPoints >= 2 ? Number((last.value - first.value).toFixed(4)) : null;
    const deltaPrevLast = prev ? Number((last.value - prev.value).toFixed(4)) : null;

    let rci = null;
    let rciStatus = nPoints < 2 ? 'INSUFFICIENT_OBSERVATIONS_LT2' : 'NOT_APPLICABLE_MISSING_NORMATIVE_PARAMS';
    let rciDirection = 'undetermined';

    const norm = NORMATIVE_RCI_PARAMS[inst];
    if (nPoints >= 2 && norm) {
      const seDiff = norm.sd * Math.sqrt(2 * (1 - norm.r_xx));
      const rciVal = (last.value - first.value) / seDiff;
      rci = Number(rciVal.toFixed(4));
      rciStatus = 'COMPUTED_JACOBSON_TRUAX';
      if (Math.abs(rciVal) >= 1.96) {
        const improved = norm.higher_is_worse ? rciVal < -1.96 : rciVal > 1.96;
        rciDirection = improved ? 'reliable_improvement' : 'reliable_deterioration';
        alerts.push({
          type: improved ? 'RELIABLE_CHANGE_POSITIVE' : 'RELIABLE_CHANGE_DETERIORATION',
          severity: improved ? 'info' : 'warning',
          instrument: inst,
          rci,
          message: `${inst}: cambio confiable entre ${first.label} (${first.value}) y ${last.label} (${last.value}), RCI = ${rci}.`,
          evidence_level: 'E1_explicit',
        });
      } else {
        rciDirection = 'no_reliable_change';
      }
    }

    trajectories[inst] = {
      instrument: inst,
      observations_count: nPoints,
      points: sorted,
      latest_value: last.value,
      baseline_or_first_value: first.value,
      delta_first_to_last: deltaFirstLast,
      delta_previous_to_last: deltaPrevLast,
      rci,
      rci_status: rciStatus,
      rci_interpretation: rciDirection,
      normative_source: norm ? norm.source : null,
    };
  }

  return {
    engine_id: 'motor_2_analytical_longitudinal',
    patient_id: patient.patient_id,
    pseudonym: patient.pseudonym,
    summary: {
      baseline_instruments_count: Object.keys(baselinePoints).length,
      follow_up_records_count: followUps.length,
      weekly_observations_count: weeklyObs.length,
      tracked_instruments: Object.keys(trajectories),
      longitudinal_ready_instruments: Object.values(trajectories)
        .filter((t) => t.observations_count >= 2)
        .map((t) => t.instrument),
    },
    trajectories,
    alerts,
  };
}
