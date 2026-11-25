/**
 * Motor 1: Servicio de inferencia del Autoencoder, Gobernanza Central de Modelos
 * y trazabilidad completa (8 campos obligatorios) sobre SQLite.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getDatabase } from '../db/index.js';
import { uuid, sha256 } from '../utils/crypto.js';
import { AppError, Errors } from '../utils/errors.js';
import { recordEvent } from './auditService.js';
import {
  ORDEN_CANONICO_22,
  ORDEN_CANONICO_24,
  sha256File,
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
const ADMIN_ROLES = new Set(['superadmin', 'admin']);

function verifyArtifactHashOnDisk(artifactPathRel, expectedSha256) {
  if (!artifactPathRel || !artifactPathRel.startsWith('models/')) {
    return { checkable: false, ok: false, observedSha256: null, reason: 'Artefacto externo o heredado no ejecutable' };
  }
  const absPath = path.join(ENGINE_ROOT, artifactPathRel);
  if (!fs.existsSync(absPath)) {
    return { checkable: true, ok: false, observedSha256: null, reason: `Archivo ausente: ${artifactPathRel}` };
  }
  const observed = sha256File(absPath);
  const ok = observed === String(expectedSha256 || '').toLowerCase();
  return {
    checkable: true,
    ok,
    observedSha256: observed,
    reason: ok ? 'SHA-256 verificado en disco' : `Discrepancia SHA-256 en ${artifactPathRel}`,
  };
}

export function getActiveDefaultGovernanceModel() {
  const db = getDatabase();
  const row = db
    .prepare(
      `SELECT model_id, model_version, display_name, architecture_spec, input_variables_count,
              latent_dim, artifact_path, artifact_sha256, preprocessing_version,
              input_schema_version, governance_state, clinical_use_allowed,
              validation_summary, updated_by, updated_at
       FROM model_governance_registry
       WHERE governance_state = 'ACTIVE_DEFAULT'
       LIMIT 1`
    )
    .get();
  if (!row) {
    throw new AppError(
      'NO_ACTIVE_MODEL',
      'No existe ningún modelo autorizado en estado ACTIVE_DEFAULT dentro del registro central.',
      500
    );
  }
  return row;
}

export function getModelGovernanceRegistry() {
  const db = getDatabase();
  const rows = db
    .prepare(
      `SELECT model_id, model_version, display_name, architecture_spec, input_variables_count,
              latent_dim, artifact_path, artifact_sha256, preprocessing_version,
              input_schema_version, governance_state, clinical_use_allowed,
              validation_summary, updated_by, updated_at
       FROM model_governance_registry
       ORDER BY
         CASE governance_state
           WHEN 'ACTIVE_DEFAULT' THEN 1
           WHEN 'VALIDATED_ELIGIBLE' THEN 2
           WHEN 'EXPERIMENTAL_RESTRICTED' THEN 3
           WHEN 'HISTORICAL_LEGACY' THEN 4
           ELSE 5
         END,
         model_id ASC`
    )
    .all();

  const models = rows.map((row) => {
    const integrity = verifyArtifactHashOnDisk(row.artifact_path, row.artifact_sha256);
    return {
      ...row,
      clinical_use_allowed: Boolean(row.clinical_use_allowed),
      disk_integrity: integrity,
    };
  });

  const activeModel = models.find((m) => m.governance_state === 'ACTIVE_DEFAULT') || null;

  const recentRuns = db
    .prepare(
      `SELECT mr.run_id,
              COALESCE(mr.model_id, mr.model_version) AS model_id,
              mr.model_version,
              mr.artifact_sha256,
              mr.preprocessing_version,
              mr.input_schema_version,
              COALESCE(mr.finished_at, mr.started_at) AS executed_at,
              COALESCE(mr.reference_id, mr.patient_id) AS patient_or_evaluation_id,
              mr.patient_id,
              p.pseudonym AS patient_pseudonym,
              mr.state AS execution_status,
              mr.executed_by,
              mr.actor_role,
              mr.input_hash,
              mr.error_code,
              mr.error_message
       FROM model_runs mr
       LEFT JOIN patients p ON p.patient_id = mr.patient_id
       WHERE mr.engine = 'motor_B_scales'
       ORDER BY COALESCE(mr.finished_at, mr.started_at) DESC
       LIMIT 25`
    )
    .all();

  const governanceEvents = db
    .prepare(
      `SELECT event_id, occurred_at, actor, actor_role, action, details
       FROM audit_events
       WHERE action LIKE 'model.governance.%' OR action = 'engine.autoencoder.integrity_failed'
       ORDER BY occurred_at DESC, rowid DESC
       LIMIT 15`
    )
    .all();

  return {
    registry_source: 'sqlite:model_governance_registry',
    active_model_id: activeModel?.model_id || null,
    active_model: activeModel,
    models,
    recent_runs: recentRuns,
    governance_events: governanceEvents,
  };
}

export function setActiveDefaultModel({ modelId, actor = 'system', actorRole = 'unknown', justification = '' }) {
  if (!ADMIN_ROLES.has(actorRole)) {
    recordEvent({
      actor,
      actorRole,
      action: 'model.governance.unauthorized_attempt',
      details: `intento_cambio_modelo=${String(modelId || '')}`,
    });
    throw Errors.forbidden(
      'Solo Superadministración o Administración del Centro pueden autorizar o cambiar el modelo activo.'
    );
  }

  const cleanId = String(modelId || '').trim();
  if (!cleanId) {
    throw Errors.badRequest('Debe especificar model_id.');
  }

  const db = getDatabase();
  const target = db
    .prepare('SELECT * FROM model_governance_registry WHERE model_id = ?')
    .get(cleanId);
  if (!target) {
    throw Errors.notFound(`Modelo no encontrado en el registro central: ${cleanId}`);
  }

  if (
    target.clinical_use_allowed !== 1 ||
    ['EXPERIMENTAL_RESTRICTED', 'HISTORICAL_LEGACY', 'INVALID_EXCLUDED'].includes(target.governance_state)
  ) {
    recordEvent({
      actor,
      actorRole,
      action: 'model.governance.blocked_activation',
      details: `modelo=${cleanId} estado=${target.governance_state}`,
    });
    throw Errors.badRequest(
      `Activación bloqueada por gobernanza: '${cleanId}' tiene estado ${target.governance_state} y no es elegible para inferencia clínica por defecto.`
    );
  }

  const integrity = verifyArtifactHashOnDisk(target.artifact_path, target.artifact_sha256);
  if (!integrity.ok) {
    recordEvent({
      actor,
      actorRole,
      action: 'model.governance.integrity_failed',
      details: `modelo=${cleanId} motivo=${integrity.reason}`,
    });
    throw new AppError(
      'MODEL_INTEGRITY_FAILED',
      `Verificación SHA-256 fallida antes de activar '${cleanId}': ${integrity.reason}.`,
      500
    );
  }

  const now = new Date().toISOString();
  db.exec('BEGIN');
  try {
    db.prepare(
      `UPDATE model_governance_registry
       SET governance_state = 'VALIDATED_ELIGIBLE', updated_by = ?, updated_at = ?
       WHERE governance_state = 'ACTIVE_DEFAULT' AND model_id <> ?`
    ).run(actor, now, cleanId);

    db.prepare(
      `UPDATE model_governance_registry
       SET governance_state = 'ACTIVE_DEFAULT', updated_by = ?, updated_at = ?
       WHERE model_id = ?`
    ).run(actor, now, cleanId);

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  recordEvent({
    actor,
    actorRole,
    action: 'model.governance.set_active',
    details: `active_model=${cleanId} version=${target.model_version} motivo=${String(justification || 'administración').slice(0, 100)}`,
  });

  return getModelGovernanceRegistry();
}

export function getAutoencoderStatusAndReference() {
  const bundle = loadVerifiedRegistryAndArtifacts(ENGINE_ROOT);
  const percentiles12d = loadReferencePercentiles12d(ENGINE_ROOT);
  let activeModelId = bundle.registry.default_production_model_id;
  let governanceModels = [];
  try {
    const gov = getModelGovernanceRegistry();
    activeModelId = gov.active_model_id || activeModelId;
    governanceModels = gov.models;
  } catch {
    // Fallback controlado si aún no se abrió BD en consulta estática aislada
  }

  return {
    engine_id: 'motor_1_autoencoder',
    status: 'active_verified',
    default_model_id: activeModelId,
    canonical_reference_cohort_n: bundle.registry.canonical_reference_cohort_n,
    integrity: bundle.integrityReport,
    models: bundle.registry.models,
    governance_models: governanceModels,
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

  const db = getDatabase();
  const activeGov = getActiveDefaultGovernanceModel();
  const actor = options.actor || 'clinician_local';
  const actorRole = options.actorRole || 'clinician';
  const requestedModelId = options.modelId || payload.model_id || null;
  const modoScoring = options.modoScoring || payload.modo_scoring || 'excel_canonico';
  const persist = Boolean(options.persist ?? payload.persist);

  if (!['excel_canonico', 'manual_estandar'].includes(modoScoring)) {
    throw Errors.badRequest(`modo_scoring inválido: ${modoScoring}`);
  }

  let effectiveModelId = activeGov.model_id;
  if (requestedModelId && requestedModelId !== activeGov.model_id) {
    if (!['encoder_22_checkpoint_fase2', 'encoder_24_deployed'].includes(requestedModelId)) {
      throw Errors.badRequest(`Modelo bloqueado o no compatible con ejecución clínica: ${requestedModelId}`);
    }
    if (!ADMIN_ROLES.has(actorRole)) {
      recordEvent({
        actor,
        actorRole,
        action: 'model.governance.clinical_override_blocked',
        details: `requested=${requestedModelId} active=${activeGov.model_id}`,
      });
      throw Errors.forbidden(
        `El rol clínico '${actorRole}' ejecuta automáticamente el modelo activo (${activeGov.model_id}) y no puede seleccionar modelos alternativos o experimentales.`
      );
    }
    effectiveModelId = requestedModelId;
  }

  const effectiveGov =
    db.prepare('SELECT * FROM model_governance_registry WHERE model_id = ?').get(effectiveModelId) || activeGov;

  if (effectiveGov.governance_state === 'INVALID_EXCLUDED' || effectiveGov.governance_state === 'HISTORICAL_LEGACY') {
    throw Errors.badRequest(`El modelo '${effectiveModelId}' está excluido o marcado como histórico (${effectiveGov.governance_state}).`);
  }

  const patientId = payload.patient_id || null;
  let patientRow = null;
  if (persist) {
    if (!patientId) {
      throw Errors.badRequest('Se requiere patient_id para persistir la ejecución en la base de datos.');
    }
    patientRow = db
      .prepare('SELECT patient_id, pseudonym FROM patients WHERE patient_id = ? OR pseudonym = ?')
      .get(patientId, patientId);
    if (!patientRow) {
      throw Errors.notFound('Paciente no encontrado.');
    }
  }

  // Protección Fail-Safe (6E): verificar SHA-256 real en disco antes de inferir; cero fallback silencioso
  const diskIntegrity = verifyArtifactHashOnDisk(effectiveGov.artifact_path, effectiveGov.artifact_sha256);
  if (!diskIntegrity.ok) {
    const failNow = new Date().toISOString();
    const failRunId = uuid();
    if (persist && patientRow) {
      db.prepare(
        `INSERT INTO model_runs
           (run_id, engine, patient_id, reference_kind, reference_id, state,
            model_id, model_version, artifact_sha256, preprocessing_version, input_schema_version,
            input_hash, executed_by, actor_role, error_code, error_message, started_at, finished_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        failRunId,
        'motor_B_scales',
        patientRow.patient_id,
        payload.reference_kind || 'initial_evaluation',
        payload.reference_id || payload.id_registro || failRunId,
        'failed',
        effectiveGov.model_id,
        effectiveGov.model_version,
        diskIntegrity.observedSha256 || 'MISSING_OR_MISMATCH',
        effectiveGov.preprocessing_version,
        effectiveGov.input_schema_version,
        crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'),
        actor,
        actorRole,
        'MODEL_INTEGRITY_FAILED',
        diskIntegrity.reason,
        failNow,
        failNow
      );
    }
    recordEvent({
      actor,
      actorRole,
      action: 'engine.autoencoder.integrity_failed',
      subjectPseudonym: patientRow?.pseudonym || null,
      details: `model=${effectiveGov.model_id} reason=${diskIntegrity.reason}`,
    });
    throw new AppError(
      'MODEL_INTEGRITY_FAILED',
      `Verificación criptográfica SHA-256 fallida para '${effectiveGov.model_id}'. Inferencia abortada sin fallback silencioso.`,
      500
    );
  }

  const result = runFullPipelineSisap(payload, {
    modelId: effectiveModelId,
    modoScoring,
    engineRootDir: ENGINE_ROOT,
  });

  const executedAt = result.timestamp_utc || new Date().toISOString();
  const evalRefId = payload.reference_id || result.registro_id || patientRow?.patient_id || 'ANON_UNSPECIFIED';
  const traceability = {
    model_id: effectiveGov.model_id,
    model_version: effectiveGov.model_version,
    artifact_sha256: effectiveGov.artifact_sha256,
    preprocessing_version: effectiveGov.preprocessing_version,
    input_schema_version: effectiveGov.input_schema_version,
    executed_at: executedAt,
    patient_or_evaluation_id: patientRow?.patient_id || evalRefId,
    evaluation_reference_id: evalRefId,
    execution_status: result.status === 'completed' ? 'completed' : 'failed',
    executed_by: actor,
    actor_role: actorRole,
  };
  result.model_id = effectiveGov.model_id;
  result.traceability = traceability;

  if (persist && patientRow) {
    const runId = uuid();
    const inputHash =
      result.status === 'completed'
        ? sha256(JSON.stringify(result.preprocesamiento_capa4.vector_entrada_modelo))
        : crypto.createHash('sha256').update(JSON.stringify(result.validation_summary)).digest('hex');

    db.prepare(
      `INSERT INTO model_runs
         (run_id, engine, patient_id, reference_kind, reference_id, state,
          model_id, model_version, artifact_sha256, preprocessing_version, input_schema_version,
          input_hash, executed_by, actor_role, error_code, error_message, started_at, finished_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      runId,
      'motor_B_scales',
      patientRow.patient_id,
      payload.reference_kind || 'initial_evaluation',
      evalRefId,
      traceability.execution_status,
      effectiveGov.model_id,
      effectiveGov.model_version,
      effectiveGov.artifact_sha256,
      effectiveGov.preprocessing_version,
      effectiveGov.input_schema_version,
      inputHash,
      actor,
      actorRole,
      result.status === 'completed' ? null : result.stage_failed || 'D06_VALIDATION_FAILED',
      result.status === 'completed'
        ? null
        : `${result.validation_summary?.n_incidencias || 1} incidencias D-06`,
      executedAt,
      executedAt
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
        executedAt
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
        executedAt
      );
    }

    recordEvent({
      actor,
      actorRole,
      action: 'engine.autoencoder.infer',
      subjectPseudonym: patientRow.pseudonym,
      details: `run_id=${runId} model_id=${effectiveGov.model_id} sha=${effectiveGov.artifact_sha256.slice(0, 12)} state=${result.status}`,
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
      `SELECT run_id, engine, patient_id, reference_kind, reference_id, state,
              COALESCE(model_id, model_version) AS model_id,
              model_version, artifact_sha256, preprocessing_version, input_schema_version,
              input_hash, executed_by, actor_role, started_at, finished_at
       FROM model_runs
       WHERE patient_id = ? AND engine = 'motor_B_scales' AND state = 'completed'
       ORDER BY COALESCE(finished_at, started_at) DESC LIMIT 1`
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
