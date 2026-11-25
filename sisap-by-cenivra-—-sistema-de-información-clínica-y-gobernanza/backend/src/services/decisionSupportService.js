/**
 * Motor 5: Servicio de Inteligencia para Apoyo a la Toma de Decisiones Clínicas.
 * Integra salidas de los Motores 1..4 para exploración de patrones, incertidumbre normativa,
 * alertas de discrepancia multimodal y reportes dinámicos con taxonomía E1..E5.
 * RESTRICCIÓN EPISTEMOLÓGICA: Prohibido emitir diagnósticos automáticos o prescripciones terapéuticas.
 */
import { getDatabase } from '../db/index.js';
import { uuid } from '../utils/crypto.js';
import { Errors } from '../utils/errors.js';
import { recordEvent } from './auditService.js';
import { buildPatientMultimodalProfile } from './multimodalService.js';
import { loadReferencePercentiles12d, analyzeLatentProfile } from '../../../engines/autoencoder/embeddings/latentSpaceAnalyzer.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '../../../engines/autoencoder');

function buildEvidenceDrivenFindings(multimodal) {
  const findings = [];
  const latentRun = multimodal.latent_snapshot;
  const longitudinal = multimodal.longitudinal_snapshot;
  const narratives = multimodal.narrative_snapshot;

  if (latentRun?.outputs?.latent_12d_representation) {
    const rep = latentRun.outputs.latent_12d_representation;
    const rec = latentRun.outputs.decoder_reconstruction_error || null;
    const vec = Array.isArray(rep.latent_vector)
      ? rep.latent_vector
      : Array.from({ length: 12 }, (_, i) => rep.dimensions?.[`latent_${String(i + 1).padStart(2, '0')}`]);

    const analysis = vec.every((v) => typeof v === 'number' && Number.isFinite(v))
      ? analyzeLatentProfile(vec, rec, ENGINE_ROOT)
      : null;

    if (analysis) {
      findings.push({
        finding_id: 'latent_geometry_position',
        domain: 'Representación latente 12D (Motor 1)',
        evidence_level: 'E4_latent_hypothesis',
        summary: `Distancia L2 al centro mediano de la cohorte (N=166): ${analysis.geometry.distance_to_cohort_median_p50}. ${analysis.geometry.n_outside_p05_p95} de 12 dimensiones fuera del intervalo p05-p95.`,
        uncertainty_context: `Dimensiones opacas (MOD-03) sin etiqueta clínica validada; dispersión respecto a cuartiles empíricos de 166 sujetos.`,
        review_status: 'pending_human_review',
      });
      if (rec && Number.isFinite(rec.mse_z)) {
        const topVar = rec.top_discrepancy_variables?.[0];
        findings.push({
          finding_id: 'decoder_reconstruction_fit',
          domain: 'Error de reconstrucción del Autoencoder (Motor 1)',
          evidence_level: 'E4_latent_hypothesis',
          summary: `MSE global en espacio Z = ${rec.mse_z.toFixed(4)} (RMSE = ${Math.sqrt(rec.mse_z).toFixed(4)}).${topVar ? ` Mayor residuo puntual en '${topVar.variable}' (error² = ${topVar.squared_error.toFixed(4)}).` : ''}`,
          uncertainty_context: 'Indica fidelidad geométrica de reconstrucción respecto al manifold entrenado (N=166), no gravedad diagnóstica.',
          review_status: 'pending_human_review',
        });
      }
    }
  } else {
    findings.push({
      finding_id: 'latent_missing',
      domain: 'Representación latente 12D (Motor 1)',
      evidence_level: 'E5_insufficient',
      summary: 'No existe una inferencia latente completada registrada para este expediente.',
      uncertainty_context: 'Requiere batería basal completa de 6 instrumentos sin valores ausentes (regla D-06).',
      review_status: 'pending_human_review',
    });
  }

  for (const alert of longitudinal.alerts || []) {
    findings.push({
      finding_id: `longitudinal_${alert.instrument}`,
      domain: `Trayectoria longitudinal ${alert.instrument} (Motor 2)`,
      evidence_level: alert.evidence_level || 'E1_explicit',
      summary: alert.message,
      uncertainty_context: 'Calculado mediante Índice de Cambio Confiable (RCI Jacobson-Truax) con umbral ±1.96.',
      review_status: 'pending_human_review',
    });
  }

  const hits = narratives.summary?.aggregate_process_hits || {};
  const riskHits = (hits.craving_impulso || 0) + (hits.evitacion_experiencial || 0) + (hits.disregulacion_afectiva || 0);
  if (riskHits > 0) {
    findings.push({
      finding_id: 'narrative_process_signals',
      domain: 'Señales léxicas en narrativas semanales (Motor 3)',
      evidence_level: 'E1_explicit',
      summary: `Se detectaron ${riskHits} coincidencias léxicas exploratorias vinculadas a procesos de riesgo en ${narratives.summary.weekly_observations_analyzed} registro(s) semanal(es).`,
      uncertainty_context: 'Extracción léxica determinista exploratoria (modelo neuronal ONNX no activo); requiere lectura y juicio clínico del terapeuta.',
      review_status: 'pending_human_review',
    });
  }

  return findings;
}

export function getPatientDecisionSupportReport(patientId) {
  const multimodal = buildPatientMultimodalProfile(patientId);
  const percentilesRef = loadReferencePercentiles12d(ENGINE_ROOT);
  const findings = buildEvidenceDrivenFindings(multimodal);

  const db = getDatabase();
  const formulations = db
    .prepare(
      `SELECT formulation_id, patient_id, model_run_id, evidence_level, review_status,
              summary_text, domains_json, provenance_json, created_by, reviewed_by, reviewed_at, creado_en
       FROM clinical_formulations
       WHERE patient_id = ?
       ORDER BY creado_en DESC LIMIT 20`
    )
    .all(patientId)
    .map((f) => ({
      ...f,
      domains: JSON.parse(f.domains_json),
      provenance: JSON.parse(f.provenance_json),
    }));

  // Evaluar análisis latente enriquecido si existe run
  let latentDetail = null;
  const rep = multimodal.latent_snapshot?.outputs?.latent_12d_representation;
  const rec = multimodal.latent_snapshot?.outputs?.decoder_reconstruction_error || null;
  if (rep) {
    const vec = Array.isArray(rep.latent_vector)
      ? rep.latent_vector
      : Array.from({ length: 12 }, (_, i) => rep.dimensions?.[`latent_${String(i + 1).padStart(2, '0')}`]);
    if (vec.every((v) => typeof v === 'number' && Number.isFinite(v))) {
      latentDetail = analyzeLatentProfile(vec, rec, ENGINE_ROOT);
    }
  }

  return {
    engine_id: 'motor_5_decision_support',
    generated_at_utc: new Date().toISOString(),
    patient: multimodal.patient,
    multimodal_alignment: multimodal.alignment_summary,
    modality_provenance_matrix: multimodal.modality_provenance_matrix,
    motor_1_autoencoder: {
      run: multimodal.latent_snapshot?.run || null,
      latent_profile: latentDetail,
      reconstruction: rec,
      cohort_percentiles_ref_12d: percentilesRef,
    },
    motor_2_longitudinal: multimodal.longitudinal_snapshot,
    motor_3_narrative: multimodal.narrative_snapshot,
    motor_5_synthesis: {
      findings,
      clinical_formulations_history: formulations,
      governance_constraints: {
        automatic_diagnosis_disabled: true,
        therapeutic_prescription_disabled: true,
        mandatory_human_review_status: 'pending_human_review',
        mod_03_opaque_latent_labels: true,
      },
    },
  };
}

export function createClinicalFormulation(patientId, input, { actor = 'clinician_local' } = {}) {
  if (!input || typeof input !== 'object') {
    throw Errors.badRequest('Cuerpo JSON inválido para crear formulación clínica.');
  }
  const summaryText = input.summary_text ? String(input.summary_text).trim() : '';
  if (summaryText.length < 10) {
    throw Errors.badRequest('summary_text debe describir la hipótesis o síntesis clínica con al menos 10 caracteres.');
  }

  const evidenceLevel = input.evidence_level || 'E1_explicit';
  if (!['E1_explicit', 'E2_contextual', 'E3_observational', 'E4_latent_hypothesis', 'E5_insufficient'].includes(evidenceLevel)) {
    throw Errors.badRequest(`evidence_level inválido: ${evidenceLevel}`);
  }

  const db = getDatabase();
  const patient = db.prepare('SELECT patient_id, pseudonym FROM patients WHERE patient_id = ?').get(patientId);
  if (!patient) throw Errors.notFound('Paciente no encontrado.');

  const formulationId = uuid();
  const now = new Date().toISOString();
  const reviewStatus = input.review_status || 'pending_human_review';
  if (!['pending_human_review', 'reviewed_approved', 'reviewed_modified', 'rejected'].includes(reviewStatus)) {
    throw Errors.badRequest(`review_status inválido: ${reviewStatus}`);
  }

  db.prepare(
    `INSERT INTO clinical_formulations
       (formulation_id, patient_id, model_run_id, evidence_level, review_status,
        summary_text, domains_json, provenance_json, created_by, reviewed_by, reviewed_at, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    formulationId,
    patientId,
    input.model_run_id || null,
    evidenceLevel,
    reviewStatus,
    summaryText,
    JSON.stringify(input.domains || []),
    JSON.stringify(input.provenance || { source: 'clinician_decision_support_workspace' }),
    actor,
    reviewStatus === 'pending_human_review' ? null : actor,
    reviewStatus === 'pending_human_review' ? null : now,
    now
  );

  recordEvent({
    actor,
    actorRole: 'clinician',
    action: 'formulation.create',
    subjectPseudonym: patient.pseudonym,
    details: `formulation_id=${formulationId} evidence=${evidenceLevel} review=${reviewStatus}`,
  });

  return {
    formulation_id: formulationId,
    patient_id: patientId,
    evidence_level: evidenceLevel,
    review_status: reviewStatus,
    creado_en: now,
  };
}
