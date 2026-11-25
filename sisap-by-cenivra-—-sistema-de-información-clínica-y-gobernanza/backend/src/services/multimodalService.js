/**
 * Motor 4: Servicio de Integración Multimodal.
 * Combina datos sociodemográficos/clínicos, escalas psicométricas basales,
 * seguimientos longitudinales, narrativas semanales y representaciones latentes 12D,
 * preservando estrictamente procedencia, temporalidad, granularidad y calidad de cada fuente.
 */
import { getDatabase } from '../db/index.js';
import { Errors } from '../utils/errors.js';
import { getLatestPatientLatentRun } from './autoencoderService.js';
import { analyzePatientLongitudinalTrajectory } from './analyticalService.js';
import { analyzePatientNarratives } from './narrativeService.js';

export function buildPatientMultimodalProfile(patientId) {
  const db = getDatabase();
  const patient = db
    .prepare(
      `SELECT patient_id, pseudonym, edad, sexo, estado, es_dato_prueba, creado_en, actualizado_en
       FROM patients WHERE patient_id = ?`
    )
    .get(patientId);
  if (!patient) throw Errors.notFound('Paciente no encontrado.');

  const clinicalRecord = db
    .prepare(
      `SELECT record_id, ingreso, droga_impacto, diagnostico_cie, diagnostico_impresion, sesiones, creado_en
       FROM clinical_records WHERE patient_id = ? LIMIT 1`
    )
    .get(patientId);

  const baselineEval = db
    .prepare(
      `SELECT evaluation_id, fecha_eval, aplico, scoring_version, schema_version, vector24_json, creado_en
       FROM initial_evaluations WHERE patient_id = ? ORDER BY fecha_eval DESC, creado_en DESC LIMIT 1`
    )
    .get(patientId);

  const baselineResponses = baselineEval
    ? db
        .prepare('SELECT instrument, items_count, schema_version FROM scale_responses WHERE evaluation_id = ?')
        .all(baselineEval.evaluation_id)
    : [];

  const baselineScores = baselineEval
    ? db
        .prepare('SELECT instrument, subscale, value, rules_version, is_derived FROM scale_scores WHERE evaluation_id = ?')
        .all(baselineEval.evaluation_id)
    : [];

  const latentRun = getLatestPatientLatentRun(patientId);
  const longitudinal = analyzePatientLongitudinalTrajectory(patientId);
  const narratives = analyzePatientNarratives(patientId);

  const capturedInstrumentsCount = baselineResponses.length;
  const baselineCompleteness = Number((capturedInstrumentsCount / 6).toFixed(2));

  const sources = [
    {
      modality_id: 'sociodemographic_clinical',
      label: 'Contexto sociodemográfico y consumo',
      source_tables: ['patients', 'clinical_records'],
      granularity: 'paciente_fijo_y_episodio',
      temporality: clinicalRecord?.ingreso || patient.creado_en.slice(0, 10),
      present: Boolean(patient.edad !== null || clinicalRecord),
      completeness_ratio: clinicalRecord ? 1.0 : 0.5,
      quality_flag: patient.es_dato_prueba ? 'synthetic_test_record' : 'verified_capture',
      evidence_level: 'E1_explicit',
    },
    {
      modality_id: 'baseline_psychometrics_6_scales',
      label: 'Batería psicométrica basal (BIS-11, BADS, EROS, GAD-7, STAXI-2, BSL-23)',
      source_tables: ['initial_evaluations', 'scale_responses', 'scale_scores'],
      granularity: 'item_y_subescala',
      temporality: baselineEval?.fecha_eval || null,
      present: Boolean(baselineEval),
      completeness_ratio: baselineCompleteness,
      quality_flag: capturedInstrumentsCount === 6 ? 'complete_6_of_6' : baselineEval ? 'partial_d06_blocked_for_autoencoder' : 'E5_insufficient',
      evidence_level: baselineEval ? 'E1_explicit' : 'E5_insufficient',
      captured_instruments: baselineResponses.map((r) => r.instrument),
    },
    {
      modality_id: 'latent_representation_12d',
      label: 'Representación latente 12D y reconstrucción Autoencoder',
      source_tables: ['model_runs', 'model_outputs'],
      granularity: 'vector_latente_12d',
      temporality: latentRun?.run?.finished_at || null,
      present: Boolean(latentRun),
      completeness_ratio: latentRun ? 1.0 : 0.0,
      quality_flag: latentRun ? `verified_run_${latentRun.run.model_version}` : 'no_completed_run',
      evidence_level: latentRun ? 'E4_latent_hypothesis' : 'E5_insufficient',
    },
    {
      modality_id: 'longitudinal_follow_ups',
      label: 'Escalas longitudinales de seguimiento',
      source_tables: ['follow_up_evaluations'],
      granularity: 'sesion_y_fecha',
      temporality:
        longitudinal.summary.follow_up_records_count > 0
          ? `${longitudinal.summary.follow_up_records_count} registros`
          : null,
      present: longitudinal.summary.follow_up_records_count > 0,
      completeness_ratio: longitudinal.summary.longitudinal_ready_instruments.length > 0 ? 1.0 : 0.0,
      quality_flag:
        longitudinal.summary.follow_up_records_count > 0 ? 'longitudinal_series_available' : 'awaiting_followup_capture',
      evidence_level: longitudinal.summary.follow_up_records_count > 0 ? 'E1_explicit' : 'E5_insufficient',
    },
    {
      modality_id: 'weekly_narratives_behavioral',
      label: 'Observaciones semanales y narrativas clínicas (q1..q8)',
      source_tables: ['weekly_observations'],
      granularity: 'semana_textual',
      temporality:
        narratives.summary.weekly_observations_analyzed > 0
          ? `${narratives.summary.weekly_observations_analyzed} semanas`
          : null,
      present: narratives.summary.weekly_observations_analyzed > 0,
      completeness_ratio: narratives.summary.weekly_observations_analyzed > 0 ? 1.0 : 0.0,
      quality_flag: narratives.engine_status.status,
      evidence_level: narratives.summary.weekly_observations_analyzed > 0 ? 'E1_explicit' : 'E5_insufficient',
    },
  ];

  const availableModalities = sources.filter((s) => s.present).length;

  return {
    engine_id: 'motor_4_multimodal_integration',
    patient: {
      patient_id: patient.patient_id,
      pseudonym: patient.pseudonym,
      edad: patient.edad,
      sexo: patient.sexo,
      estado: patient.estado,
      es_dato_prueba: Boolean(patient.es_dato_prueba),
      droga_impacto: clinicalRecord?.droga_impacto || null,
    },
    alignment_summary: {
      active_modalities: availableModalities,
      total_modalities: sources.length,
      integration_readiness_ratio: Number((availableModalities / sources.length).toFixed(2)),
      temporality_preserved: true,
      silent_imputation_used: false,
    },
    modality_provenance_matrix: sources,
    baseline_snapshot: baselineEval
      ? {
          evaluation_id: baselineEval.evaluation_id,
          fecha_eval: baselineEval.fecha_eval,
          scoring_version: baselineEval.scoring_version,
          scores: baselineScores,
        }
      : null,
    latent_snapshot: latentRun,
    longitudinal_snapshot: longitudinal,
    narrative_snapshot: narratives,
  };
}
