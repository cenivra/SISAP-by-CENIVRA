/**
 * Motor 1: Servicio de inferencia del Autoencoder y análisis de espacio latente.
 * Conecta el motor verificado engines/autoencoder con SQLite (model_runs, model_outputs)
 * y la bitácora append-only audit_events sin atribuir significados clínicos no validados.
 */
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getDatabase } from '../db/index.js';
import { uuid, sha256 } from '../utils/crypto.js';
import { Errors } from '../utils/errors.js';
import { recordEvent } from './auditService.js';
import {
  ORDEN_CANONICO_22,
  ORDEN_CANONICO_24,
  loadVerifiedRegistryAndArtifacts,
  runFullPipelineSisap,
  inferCandidate17v,
} from '../../../engines/autoencoder/inference/autoencoderInferenceEngine.js';
import {
  loadReferencePercentiles12d,
  compareLatentVectors,
} from '../../../engines/autoencoder/embeddings/latentSpaceAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '../../../engines/autoencoder');

export function getAutoencoderStatusAndReference() {
  const bundle = loadVerifiedRegistryAndArtifacts(ENGINE_ROOT);
  const percentiles12d = loadReferencePercentiles12d(ENGINE_ROOT);
  return {
    engine_id: 'motor_1_autoencoder',
    status: 'active_verified',
    default_model_id: bundle.registry.default_production_model_id,
    canonical_reference_cohort_n: bundle.registry.canonical_reference_cohort_n,
    integrity: bundle.integrityReport,
    models: bundle.registry.models,
    canonical_order_24: ORDEN_CANONICO_24,
    canonical_order_22: ORDEN_CANONICO_22,
    percentiles_12d: percentiles12d,
    normalization_params_24: bundle.refParams.normalizacion_final_24,
    epistemological_constraints: {
      mod_03_opaque_dimensions: true,
      d03_clustering_excluded: true,
      d06_silent_imputation_prohibited: true,
    },
  };
}

export function executeAutoencoderInference(payload, options = {}) {
  if (!payload || typeof payload !== 'object') {
    throw Errors.badRequest('El cuerpo de la solicitud debe ser un objeto JSON estructurado.');
  }

  const modelId = options.modelId || payload.model_id || 'encoder_22_checkpoint_fase2';
  const modoScoring = options.modoScoring || payload.modo_scoring || 'excel_canonico';
  const persist = Boolean(options.persist ?? payload.persist);
  const actor = options.actor || 'clinician_local';
  const actorRole = options.actorRole || 'clinician';

  if (!['encoder_22_checkpoint_fase2', 'encoder_24_deployed'].includes(modelId)) {
    throw Errors.badRequest(`model_id no soportado para inferencia clínica: ${modelId}`);
  }
  if (!['excel_canonico', 'manual_estandar'].includes(modoScoring)) {
    throw Errors.badRequest(`modo_scoring inválido: ${modoScoring}`);
  }

  const patientId = payload.patient_id || null;
  let patientRow = null;
  if (persist) {
    if (!patientId) {
      throw Errors.badRequest('Se requiere patient_id para persistir la ejecución en la base de datos.');
    }
    const db = getDatabase();
    patientRow = db
      .prepare('SELECT patient_id, pseudonym FROM patients WHERE patient_id = ?')
      .get(patientId);
    if (!patientRow) {
      throw Errors.notFound('Paciente no encontrado.');
    }
  }

  const result = runFullPipelineSisap(payload, {
    modelId,
    modoScoring,
    engineRootDir: ENGINE_ROOT,
  });

  if (persist && patientRow) {
    const db = getDatabase();
    const runId = uuid();
    const now = new Date().toISOString();
    const inputHash =
      result.status === 'completed'
        ? sha256(JSON.stringify(result.preprocesamiento_capa4.vector_entrada_modelo))
        : crypto.createHash('sha256').update(JSON.stringify(result.validation_summary)).digest('hex');

    db.prepare(
      `INSERT INTO model_runs
         (run_id, engine, patient_id, reference_kind, reference_id, state, model_version,
          preprocessing_version, input_hash, error_code, error_message, started_at, finished_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      runId,
      'motor_B_scales',
      patientRow.patient_id,
      payload.reference_kind || 'initial_evaluation',
      payload.reference_id || result.registro_id,
      result.status === 'completed' ? 'completed' : 'failed',
      modelId,
      '1.0.0-MFR-REF-166',
      inputHash,
      result.status === 'completed' ? null : result.stage_failed || 'D06_VALIDATION_FAILED',
      result.status === 'completed'
        ? null
        : `${result.validation_summary?.n_incidencias || 1} incidencias D-06`,
      now,
      now
    );

    if (result.status === 'completed') {
      db.prepare(
        `INSERT INTO model_outputs
           (output_id, run_id, head_name, output_type, dimensionality, values_json, is_valid, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        uuid(),
        runId,
        'latent_12d_representation',
        'continuous_latent_vector',
        12,
        JSON.stringify({
          dimensions: result.dimensions,
          latent_vector: result.latent_vector,
          geometry: result.latent_analysis.geometry,
          top_deviant_dimensions: result.latent_analysis.top_deviant_dimensions,
        }),
        1,
        now
      );

      db.prepare(
        `INSERT INTO model_outputs
           (output_id, run_id, head_name, output_type, dimensionality, values_json, is_valid, creado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        uuid(),
        runId,
        'decoder_reconstruction_error',
        'reconstruction_residuals',
        result.model_metadata.n_input,
        JSON.stringify({
          mse_z: result.reconstruction.mse_z,
          mae_z: result.reconstruction.mae_z,
          rmse_z: result.reconstruction.rmse_z,
          top_discrepancy_variables: result.latent_analysis.reconstruction.top_discrepancy_variables,
          per_variable: result.reconstruction.per_variable,
        }),
        1,
        now
      );
    }

    recordEvent({
      actor,
      actorRole,
      action: 'engine.autoencoder.infer',
      subjectPseudonym: patientRow.pseudonym,
      details: `run_id=${runId} model=${modelId} state=${result.status}`,
    });

    result.persistence = {
      persisted: true,
      run_id: runId,
      patient_id: patientRow.patient_id,
    };
  }

  return result;
}

export function inferCandidate17ForComparison(subscalesObj) {
  return inferCandidate17v(subscalesObj, ENGINE_ROOT);
}

export function getLatestPatientLatentRun(patientId) {
  const db = getDatabase();
  const run = db
    .prepare(
      `SELECT run_id, engine, patient_id, reference_kind, reference_id, state, model_version,
              preprocessing_version, input_hash, started_at, finished_at
       FROM model_runs
       WHERE patient_id = ? AND engine = 'motor_B_scales' AND state = 'completed'
       ORDER BY finished_at DESC LIMIT 1`
    )
    .get(patientId);

  if (!run) return null;

  const outputs = db
    .prepare(
      `SELECT output_id, head_name, output_type, dimensionality, values_json, is_valid, creado_en
       FROM model_outputs WHERE run_id = ?`
    )
    .all(run.run_id);

  const parsedOutputs = {};
  for (const out of outputs) {
    try {
      parsedOutputs[out.head_name] = out.values_json ? JSON.parse(out.values_json) : null;
    } catch {
      parsedOutputs[out.head_name] = null;
    }
  }

  return {
    run,
    outputs: parsedOutputs,
  };
}

export { compareLatentVectors };
