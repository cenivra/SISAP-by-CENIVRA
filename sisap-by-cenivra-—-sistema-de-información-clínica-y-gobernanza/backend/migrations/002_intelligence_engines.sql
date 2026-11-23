-- ============================================================================
-- SISAP by CENIVRA — Migración 002: Motores de Inteligencia Longitudinal y Clínica
-- Preserva intacto 001_initial_schema.sql sin alteraciones destructivas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- follow_up_evaluations — capturas longitudinales de escalas clínicas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS follow_up_evaluations (
  follow_up_id       TEXT PRIMARY KEY,
  patient_id         TEXT NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  evaluation_date    TEXT NOT NULL,
  session_number     INTEGER CHECK (session_number IS NULL OR session_number >= 1),
  instrument         TEXT NOT NULL CHECK (
                       instrument IN ('BADS','GAD-7','EROS','BSCS','PSS-4','SHAPS','UCLA-3','BIS-11','STAXI-2','BSL-23')
                     ),
  total_score        REAL NOT NULL,
  subscales_json     TEXT,
  items_json         TEXT NOT NULL,
  items_count        INTEGER NOT NULL CHECK (items_count >= 1),
  clinical_severity  TEXT,
  clinician_id       TEXT,
  notes              TEXT,
  schema_version     TEXT NOT NULL DEFAULT '1.0.0',
  creado_en          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_followup_patient_date
  ON follow_up_evaluations (patient_id, evaluation_date);

CREATE INDEX IF NOT EXISTS idx_followup_instrument
  ON follow_up_evaluations (patient_id, instrument, evaluation_date);

-- ----------------------------------------------------------------------------
-- clinical_formulations — síntesis trazables con evidencia E1-E5 y revisión humana obligatoria
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinical_formulations (
  formulation_id     TEXT PRIMARY KEY,
  patient_id         TEXT NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  model_run_id       TEXT REFERENCES model_runs(run_id) ON DELETE SET NULL,
  evidence_level     TEXT NOT NULL CHECK (
                       evidence_level IN ('E1_explicit','E2_contextual','E3_observational','E4_latent_hypothesis','E5_insufficient')
                     ),
  review_status      TEXT NOT NULL DEFAULT 'pending_human_review' CHECK (
                       review_status IN ('pending_human_review','reviewed_approved','reviewed_modified','rejected')
                     ),
  summary_text       TEXT NOT NULL,
  domains_json       TEXT NOT NULL,
  provenance_json    TEXT NOT NULL,
  created_by         TEXT NOT NULL,
  reviewed_by        TEXT,
  reviewed_at        TEXT,
  creado_en          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_formulations_patient
  ON clinical_formulations (patient_id, creado_en);
