-- ============================================================================
-- SISAP by CENIVRA — Migración 003: Centro de Evaluación Psicométrica (3 Niveles)
-- Conserva respuestas individuales inmutables tras cierre e historial longitudinal.
-- Preserva intactas 001_initial_schema.sql y 002_intelligence_engines.sql.
-- ============================================================================

-- Nivel 1: Evaluación (metadatos de sesión, instrumento, versión y estado)
CREATE TABLE IF NOT EXISTS psychometric_evaluations (
  evaluation_id       TEXT PRIMARY KEY,
  patient_id          TEXT NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  instrument_id       TEXT NOT NULL CHECK (
                        instrument_id IN ('BIS-11','BSL-23','GAD-7','EROS','BADS','STAXI-2')
                      ),
  instrument_version  TEXT NOT NULL,
  language            TEXT NOT NULL DEFAULT 'es',
  started_at          TEXT NOT NULL,
  completed_at        TEXT,
  evaluator           TEXT NOT NULL,
  application_status  TEXT NOT NULL CHECK (application_status IN ('draft','completed','archived')),
  capture_mode        TEXT NOT NULL DEFAULT 'digital_form' CHECK (capture_mode IN ('digital_form','numeric_sequence_legacy')),
  scoring_mode        TEXT NOT NULL DEFAULT 'manual_estandar' CHECK (scoring_mode IN ('manual_estandar','excel_canonico')),
  session_context     TEXT NOT NULL DEFAULT 'evaluacion_clinica',
  complements_json    TEXT,
  notes               TEXT,
  creado_en           TEXT NOT NULL,
  actualizado_en      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_psych_eval_patient_inst
  ON psychometric_evaluations (patient_id, instrument_id, started_at);

CREATE INDEX IF NOT EXISTS idx_psych_eval_status
  ON psychometric_evaluations (patient_id, application_status);

-- Nivel 2: Respuestas individuales por reactivo
CREATE TABLE IF NOT EXISTS psychometric_item_responses (
  response_row_id     TEXT PRIMARY KEY,
  evaluation_id       TEXT NOT NULL REFERENCES psychometric_evaluations(evaluation_id) ON DELETE RESTRICT,
  item_id             TEXT NOT NULL,
  item_number         INTEGER NOT NULL CHECK (item_number >= 1),
  canonical_code      TEXT,
  selected_label      TEXT,
  numeric_code        REAL,
  modified_at         TEXT NOT NULL,
  UNIQUE (evaluation_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_psych_resp_eval
  ON psychometric_item_responses (evaluation_id, item_number);

-- Nivel 3: Resultados versionados y separables de las respuestas originales
CREATE TABLE IF NOT EXISTS psychometric_results (
  result_id               TEXT PRIMARY KEY,
  evaluation_id           TEXT NOT NULL REFERENCES psychometric_evaluations(evaluation_id) ON DELETE RESTRICT,
  total_score             REAL,
  technical_total_score   REAL,
  mean_score              REAL,
  subscales_json          TEXT NOT NULL,
  recoded_values_json     TEXT NOT NULL,
  missing_items_json      TEXT NOT NULL,
  derived_indicators_json TEXT NOT NULL,
  interpretation_json     TEXT NOT NULL,
  numeric_sequence        TEXT NOT NULL,
  algorithm_version       TEXT NOT NULL,
  calculated_at           TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_psych_res_eval
  ON psychometric_results (evaluation_id, calculated_at);
