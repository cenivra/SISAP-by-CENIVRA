/**
 * Servicio de evaluaciones iniciales y observaciones semanales.
 *
 * Motor B (escalas) y Motor A (narraciones) permanecen DESACTIVADOS.
 * Este servicio solo PERSISTE captura y scoring de escalas; NO ejecuta
 * el autoencoder ni genera salidas de modelo.
 */
import { getDatabase } from '../db/index.js';
import { uuid, sha256 } from '../utils/crypto.js';
import { Errors } from '../utils/errors.js';

export const SCHEMA_VERSION = 'sisap-local-1.0.0';
export const SCORING_VERSION = 'scoring-rules-1.0.0';

/**
 * Crea una evaluación inicial con sus respuestas y puntuaciones.
 * Todo dentro de una transacción.
 */
export function createEvaluation(input, { actor = 'system' } = {}) {
  const db = getDatabase();
  if (!input || !input.patient_id) throw Errors.badRequest('patient_id es obligatorio.');

  const patient = db.prepare('SELECT patient_id FROM patients WHERE patient_id = ?').get(input.patient_id);
  if (!patient) throw Errors.notFound('Paciente no encontrado.');

  const evaluationId = uuid();
  const now = new Date().toISOString();

  db.exec('BEGIN');
  try {
    db.prepare(
      `INSERT INTO initial_evaluations
         (evaluation_id, patient_id, fecha_eval, aplico, scoring_version, schema_version, vector24_json, notas, creado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      evaluationId,
      input.patient_id,
      input.fecha_eval ?? now.slice(0, 10),
      input.aplico ?? actor,
      input.scoring_version ?? SCORING_VERSION,
      input.schema_version ?? SCHEMA_VERSION,
      input.vector24 ? JSON.stringify(input.vector24) : null,
      input.notas ?? null,
      now
    );

    // Respuestas por instrumento
    if (Array.isArray(input.responses)) {
      const insResp = db.prepare(
        `INSERT INTO scale_responses (response_id, evaluation_id, instrument, items_json, items_count, schema_version)
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      for (const r of input.responses) {
        insResp.run(
          uuid(),
          evaluationId,
          r.instrument,
          JSON.stringify(r.items),
          Array.isArray(r.items) ? r.items.length : null,
          SCHEMA_VERSION
        );
      }
    }

    // Puntuaciones calculadas
    if (Array.isArray(input.scores)) {
      const insScore = db.prepare(
        `INSERT INTO scale_scores (score_id, evaluation_id, instrument, subscale, value, rules_version, is_derived)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      for (const s of input.scores) {
        insScore.run(
          uuid(),
          evaluationId,
          s.instrument,
          s.subscale,
          Number.isFinite(s.value) ? s.value : null,
          s.rules_version ?? SCORING_VERSION,
          s.is_derived ? 1 : 0
        );
      }
    }

    // Actualiza contador de sesiones/evaluaciones del expediente
    db.prepare('UPDATE clinical_records SET actualizado_en = ? WHERE patient_id = ?').run(now, input.patient_id);
    db.prepare('UPDATE patients SET actualizado_en = ? WHERE patient_id = ?').run(now, input.patient_id);

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw Errors.internal(err.message);
  }

  return { evaluation_id: evaluationId };
}

/**
 * Crea una observación semanal. NO ejecuta inferencia (Motor A desactivado).
 * El estado de análisis queda en 'pending'.
 */
export function createWeeklyObservation(input, { actor = 'system' } = {}) {
  const db = getDatabase();
  if (!input || !input.patient_id) throw Errors.badRequest('patient_id es obligatorio.');
  if (!Number.isInteger(input.week_number) || input.week_number < 1) {
    throw Errors.badRequest('week_number debe ser un entero >= 1.');
  }

  const patient = db.prepare('SELECT patient_id FROM patients WHERE patient_id = ?').get(input.patient_id);
  if (!patient) throw Errors.notFound('Paciente no encontrado.');

  const observationId = uuid();
  const now = new Date().toISOString();

  try {
    db.prepare(
      `INSERT INTO weekly_observations
         (observation_id, patient_id, week_number, fecha_entrega, text_json, validation_state,
          preprocessing_version, analysis_state, creado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).run(
      observationId,
      input.patient_id,
      input.week_number,
      input.fecha_entrega ?? now.slice(0, 10),
      JSON.stringify(input.text ?? {}),
      input.validation_state ?? 'unvalidated',
      input.preprocessing_version ?? 'preproc-1.0.0',
      now
    );
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      throw Errors.conflict('Ya existe una observación para esa semana y paciente.');
    }
    throw Errors.internal(err.message);
  }

  return { observation_id: observationId, analysis_state: 'pending' };
}

/** Hash de entrada para trazabilidad sin revelar el contenido. */
export function hashInput(objOrString) {
  const s = typeof objOrString === 'string' ? objOrString : JSON.stringify(objOrString);
  return sha256(s);
}
