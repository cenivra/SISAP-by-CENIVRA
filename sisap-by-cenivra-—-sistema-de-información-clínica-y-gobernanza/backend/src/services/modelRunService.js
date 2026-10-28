/**
 * Servicio de trazabilidad de ejecuciones de modelo.
 *
 * ADVERTENCIA: Los motores A y B están DESACTIVADOS.
 * Este servicio NO ejecuta inferencia. Existe para registrar y consultar
 * intentos (que en la práctica registran estado 'failed' por modelo no
 * disponible), preservando la trazabilidad sin producir resultados ficticios.
 */
import { getDatabase } from '../db/index.js';
import { uuid } from '../utils/crypto.js';
import { Errors } from '../utils/errors.js';

const ENGINES = new Set(['motor_A_narrative', 'motor_B_scales']);

export function recordRun(input, { actor = 'system' } = {}) {
  const db = getDatabase();
  if (!input || !ENGINES.has(input.engine)) {
    throw Errors.badRequest('engine debe ser motor_A_narrative o motor_B_scales.');
  }
  const state = input.state ?? 'failed';
  if (!['pending', 'processing', 'completed', 'failed'].includes(state)) {
    throw Errors.badRequest('state inválido.');
  }

  const runId = uuid();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO model_runs
       (run_id, engine, patient_id, reference_kind, reference_id, state, model_version,
        preprocessing_version, input_hash, error_code, error_message, started_at, finished_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    runId,
    input.engine,
    input.patient_id ?? null,
    input.reference_kind ?? null,
    input.reference_id ?? null,
    state,
    input.model_version ?? 'unavailable',
    input.preprocessing_version ?? null,
    input.input_hash ?? null,
    input.error_code ?? null,
    input.error_message ?? null,
    now,
    state === 'completed' || state === 'failed' ? now : null
  );

  return { run_id: runId, state };
}

export function listRuns({ limit = 50 } = {}) {
  const db = getDatabase();
  const n = Math.min(Math.max(Number(limit) || 50, 1), 200);
  return db
    .prepare(
      `SELECT run_id, engine, patient_id, state, model_version, preprocessing_version,
              input_hash, error_code, started_at, finished_at
       FROM model_runs ORDER BY started_at DESC LIMIT ?`
    )
    .all(n);
}

/**
 * Guarda salidas de un run. Bloqueado mientras los motores estén desactivados:
 * solo permite guardar si el run está 'completed' con salidas válidas.
 * Sirve como frontera para el futuro cableado del Motor A/B.
 */
export function recordOutput(input) {
  const db = getDatabase();
  const run = db.prepare('SELECT run_id, state FROM model_runs WHERE run_id = ?').get(input.run_id);
  if (!run) throw Errors.notFound('run_id no encontrado.');
  if (run.state !== 'completed') {
    throw Errors.badRequest('Solo se pueden registrar salidas de un run en estado completed.');
  }
  const outputId = uuid();
  db.prepare(
    `INSERT INTO model_outputs
       (output_id, run_id, head_name, output_type, dimensionality, values_json, is_valid, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    outputId,
    input.run_id,
    input.head_name,
    input.output_type ?? null,
    Number.isFinite(input.dimensionality) ? input.dimensionality : null,
    input.values ? JSON.stringify(input.values) : null,
    input.is_valid ? 1 : 0,
    new Date().toISOString()
  );
  return { output_id: outputId };
}
