-- ============================================================================
-- SISAP by CENIVRA — Migración 004: Gobernanza Central de Modelos Autoencoder
-- y Trazabilidad Completa de 8 Campos en model_runs (IEC 62304 §5.5 / §8)
-- ============================================================================

-- 1. Registro Central de Modelos Gobernado (fuente de verdad en servidor/SQLite)
CREATE TABLE IF NOT EXISTS model_governance_registry (
  model_id               TEXT PRIMARY KEY,
  model_version          TEXT NOT NULL,
  display_name           TEXT NOT NULL,
  architecture_spec      TEXT NOT NULL,
  input_variables_count  INTEGER NOT NULL,
  latent_dim             INTEGER NOT NULL,
  artifact_path          TEXT NOT NULL,
  artifact_sha256        TEXT NOT NULL,
  preprocessing_version  TEXT NOT NULL,
  input_schema_version   TEXT NOT NULL,
  governance_state       TEXT NOT NULL CHECK (
                           governance_state IN (
                             'ACTIVE_DEFAULT',
                             'VALIDATED_ELIGIBLE',
                             'EXPERIMENTAL_RESTRICTED',
                             'HISTORICAL_LEGACY',
                             'INVALID_EXCLUDED'
                           )
                         ),
  clinical_use_allowed   INTEGER NOT NULL DEFAULT 0 CHECK (clinical_use_allowed IN (0, 1)),
  validation_summary     TEXT NOT NULL,
  updated_by             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);

-- Sembrado idempotente de las 4 generaciones + artefactos excluidos auditados (SISAP-ARCH-AE-GOV-001)
INSERT OR IGNORE INTO model_governance_registry (
  model_id, model_version, display_name, architecture_spec, input_variables_count, latent_dim,
  artifact_path, artifact_sha256, preprocessing_version, input_schema_version,
  governance_state, clinical_use_allowed, validation_summary, updated_by, updated_at
) VALUES
(
  'encoder_22_checkpoint_fase2',
  '1.0.0-20260628-22v',
  'Autoencoder Canónico Fase 2 (22→32→24→12→24→32→22)',
  '22->32(SELU)->24(SELU)->12(Linear)->24(SELU)->32(SELU)->22(Linear)',
  22,
  12,
  'models/pesos_autoencoder_22_completo.json',
  '313dcd2d8f7c136222eaff1c56583b02af332c259ff0aee85b02f349b93c3d9e',
  '1.0.0-MFR-REF-166',
  'contrato_entrada_24v_v1.0.0',
  'ACTIVE_DEFAULT',
  1,
  'Verificado matemático exacto en N=166 (max_abs_diff=1.151e-7 vs checkpoint_fase2.rds, r=1.000000, paridad R↔JS=0.0000e+0). Uso exclusivo E4_latent_hypothesis con revisión humana obligatoria.',
  'system_migration_004',
  '2026-11-23T00:00:00.000Z'
),
(
  'encoder_24_deployed',
  '0.9.0-20260629-24v-unseeded',
  'Autoencoder Shiny Reentrenado (24→32→24→12→24→32→24)',
  '24->32(SELU)->24(SELU)->12(Linear)->24(SELU)->32(SELU)->24(Linear)',
  24,
  12,
  'models/pesos_autoencoder_24_completo.json',
  '46d44a7ad05eabadc1caf70488bf2f9d6e513cb7486bdeed9d3e4bf3808694c6',
  '1.0.0-MFR-REF-166',
  'contrato_entrada_24v_v1.0.0',
  'EXPERIMENTAL_RESTRICTED',
  0,
  'Reentrenado sin semilla aleatoria fija en script original (L19049-19135). No reproduce representaciones_completas.csv ni tiene percentiles 12D propios validados.',
  'system_migration_004',
  '2026-11-23T00:00:00.000Z'
),
(
  'ae_tus_17to12_m3k12',
  '0.1.0-20261115-17v-fold1',
  'Prototipo Confirmatorio M3-k12 (17→24→12→24→17)',
  '17->24(SELU)->12(Linear)->24(SELU)->17(Linear)',
  17,
  12,
  'models/pesos_candidato_17_m3k12.json',
  '28b3a56666c1feb6712e9f4c3bdd1fa16f010bc80b76b6dddc540fdeffd31a44',
  'preproc_v1_2026-11-14',
  'contrato_entrada_17v_confirmatorio_v1',
  'EXPERIMENTAL_RESTRICTED',
  0,
  'Prototipo confirmatorio entrenado en 1 fold (80%, n=132). MSE_orig=10.76 peor que PCA-12 (9.07); congruencia de ejes |r|=0.141. Solo investigación aislada.',
  'system_migration_004',
  '2026-11-23T00:00:00.000Z'
),
(
  'ae8mt_21vars_icaimh2026',
  '0.8.0-20260416-21v-legacy',
  'Rama Histórica AE8MT / Publicación ICAIMH 2026 (21 vars, N=155)',
  '21/16->12->8/10 (Histórico)',
  21,
  12,
  'legacy/99_HISTORICO_NO_CANONICO/AE8MT_21VARS',
  'b6476bec9ac1a59e8d429357f0fbb2f1d9c8351f34fac3a270cfd13e89c23e8a',
  'legacy_preproc_21vars',
  'legacy_21vars_v0',
  'HISTORICAL_LEGACY',
  0,
  'Rama histórica con contradicción documental entre corte N=155x21 y métricas N=166x22; binarios guardados con cuello 8/10.',
  'system_migration_004',
  '2026-11-23T00:00:00.000Z'
),
(
  'encoder_projection_weights_24x12',
  '0.0.0-invalid-ui-matrix',
  'Matriz Lineal Heredada ENCODER_PROJECTION_WEIGHTS (24×12)',
  'Linear(w1*w2*wb sin sesgos ni SELU) / v1.0.0 filas pacientes ID 1..24',
  24,
  12,
  'src/data/autoencoderData.ts',
  'non_executable_ui_reference',
  'none',
  'none',
  'INVALID_EXCLUDED',
  0,
  'En v1.0.0 contenía las primeras 24 filas de pacientes de representaciones_completas.csv; en v1.1.0 es producto lineal sin activación SELU. Bloqueado contra uso clínico.',
  'system_migration_004',
  '2026-11-23T00:00:00.000Z'
),
(
  'gmm_model_2_legacy',
  '0.0.0-excluded-d03',
  'Clustering GMM Heredado (G=2/3/4)',
  'Gaussian Mixture Model sobre latentes 12D',
  12,
  2,
  'data/modelo/gmm_model_2.json',
  'b739f0838c608e8a2ecfb5d2507f657464b0f5123d8e1f46617041b228f1744e',
  'legacy_cluster',
  'none',
  'INVALID_EXCLUDED',
  0,
  'Excluido explícitamente por regla D-03 y contradicción entre soluciones G=2, G=3 y G=4 sin replicabilidad (Jaccard 0.269).',
  'system_migration_004',
  '2026-11-23T00:00:00.000Z'
),
(
  'roberta_bsc_bio_ehr_es_onnx_stub',
  '0.0.0-incomplete-onnx',
  'Modelo NLP RoBERTa Clínica (modelo.onnx 1.38 MB incompleto)',
  'RoBERTa-base ONNX sin pesos densos (>400 MB requeridos)',
  512,
  768,
  'data/modelo/nlp/bsc-bio-ehr-es/modelo.onnx',
  '8990bfee89a353114f69e327178ead2a8c98dd7ef72bce3b67005f5564661d2a',
  'none',
  'none',
  'INVALID_EXCLUDED',
  0,
  'Archivo ONNX truncado de 1.38 MB sin external_data ni onnxruntime-node; Motor 3 opera con módulo léxico determinista trazable E1..E5.',
  'system_migration_004',
  '2026-11-23T00:00:00.000Z'
);

-- 2. Ampliar model_runs para completar los 8 campos obligatorios de trazabilidad
ALTER TABLE model_runs ADD COLUMN model_id TEXT;
ALTER TABLE model_runs ADD COLUMN artifact_sha256 TEXT;
ALTER TABLE model_runs ADD COLUMN input_schema_version TEXT;
ALTER TABLE model_runs ADD COLUMN executed_by TEXT;
ALTER TABLE model_runs ADD COLUMN actor_role TEXT;

CREATE INDEX IF NOT EXISTS idx_runs_model_id_state ON model_runs (model_id, state, finished_at);
