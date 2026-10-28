-- ============================================================================
-- SISAP by CENIVRA — Esquema inicial de base de datos LOCAL DE PRUEBAS
-- Migración: 001
-- Motor: SQLite
--
-- ADVERTENCIA DE GOBERNANZA:
--   Esta base es de PRUEBAS LOCALES. No contiene expedientes reales.
--   Los pesos de los modelos NO se almacenan aquí (ver 06_proteccion_modelos).
--   Las tablas model_runs/model_outputs existen para trazabilidad de cualquier
--   inferencia futura, pero los motores permanecen DESACTIVADOS.
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Historial de migraciones
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  version     INTEGER PRIMARY KEY,
  name        TEXT    NOT NULL,
  checksum    TEXT,
  applied_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- patients — identidad (criterio de búsqueda, NO clave primaria)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
  patient_id          TEXT PRIMARY KEY,                 -- UUID interno estable
  pseudonym           TEXT NOT NULL UNIQUE,             -- TUS-XXXX (identificador clínico visible)
  nombre_completo     TEXT NOT NULL,                    -- criterio de búsqueda (dato protegido)
  nombre_normalizado  TEXT NOT NULL,                    -- forma normalizada para búsqueda
  curp                TEXT,
  expediente_fisico   TEXT,
  fecha_nacimiento    TEXT,
  edad                INTEGER,
  sexo                TEXT CHECK (sexo IN ('M','F','Otro')),
  contacto_emergencia TEXT,
  telefono_emergencia TEXT,
  estado              TEXT NOT NULL CHECK (estado IN (
                        'En desintoxicación','Residencial','Ambulatorio',
                        'Seguimiento','Alta por objetivos','Baja voluntaria')),
  es_dato_prueba      INTEGER NOT NULL DEFAULT 0,       -- 1 = fixture sintético
  activo              INTEGER NOT NULL DEFAULT 1,
  creado_en           TEXT    NOT NULL,
  creado_por          TEXT,
  actualizado_en      TEXT
);

CREATE INDEX IF NOT EXISTS idx_patients_nombre_norm ON patients (nombre_normalizado);
CREATE INDEX IF NOT EXISTS idx_patients_curp        ON patients (curp);

-- ---------------------------------------------------------------------------
-- clinical_records — expediente clínico (1:1 con patients)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinical_records (
  record_id             TEXT PRIMARY KEY,
  patient_id            TEXT NOT NULL UNIQUE
                          REFERENCES patients(patient_id) ON DELETE RESTRICT,
  ingreso               TEXT,
  droga_impacto         TEXT,
  diagnostico_cie       TEXT,
  diagnostico_impresion TEXT,
  sesiones              INTEGER NOT NULL DEFAULT 0,
  creado_en             TEXT NOT NULL,
  actualizado_en        TEXT
);

-- ---------------------------------------------------------------------------
-- initial_evaluations — evaluaciones iniciales de escalas (Motor B preparado)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS initial_evaluations (
  evaluation_id    TEXT PRIMARY KEY,
  patient_id       TEXT NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  fecha_eval       TEXT NOT NULL,
  aplico           TEXT,
  scoring_version  TEXT NOT NULL,
  schema_version   TEXT NOT NULL,
  vector24_json    TEXT,                                -- vector canónico 24 cols (JSON)
  notas            TEXT,
  creado_en        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_eval_patient ON initial_evaluations (patient_id, fecha_eval);

-- ---------------------------------------------------------------------------
-- scale_responses — respuestas crudas por instrumento
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scale_responses (
  response_id    TEXT PRIMARY KEY,
  evaluation_id  TEXT NOT NULL REFERENCES initial_evaluations(evaluation_id) ON DELETE CASCADE,
  instrument     TEXT NOT NULL CHECK (instrument IN (
                    'BIS_11','BSL_23','GAD_7','STAXI_2','BADS','EROS')),
  items_json     TEXT NOT NULL,                         -- arreglo JSON de respuestas
  items_count    INTEGER,
  schema_version TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scaleresp_eval ON scale_responses (evaluation_id);

-- ---------------------------------------------------------------------------
-- scale_scores — puntuaciones calculadas con procedencia y versión
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scale_scores (
  score_id       TEXT PRIMARY KEY,
  evaluation_id  TEXT NOT NULL REFERENCES initial_evaluations(evaluation_id) ON DELETE CASCADE,
  instrument     TEXT NOT NULL,
  subscale       TEXT NOT NULL,
  value          REAL,
  rules_version  TEXT NOT NULL,                         -- versión de las reglas de scoring
  is_derived     INTEGER NOT NULL DEFAULT 0             -- 0 = directo, 1 = compuesto
);

CREATE INDEX IF NOT EXISTS idx_scores_eval ON scale_scores (evaluation_id);

-- ---------------------------------------------------------------------------
-- weekly_observations — observaciones semanales (Motor A preparado)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_observations (
  observation_id         TEXT PRIMARY KEY,
  patient_id             TEXT NOT NULL REFERENCES patients(patient_id) ON DELETE RESTRICT,
  week_number            INTEGER NOT NULL,
  fecha_entrega          TEXT,
  text_json              TEXT NOT NULL,                 -- respuestas q1..q8 (JSON)
  validation_state       TEXT,
  preprocessing_version  TEXT,
  analysis_state         TEXT NOT NULL DEFAULT 'pending'
                           CHECK (analysis_state IN ('pending','processing','completed','failed')),
  creado_en              TEXT NOT NULL,
  UNIQUE (patient_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_weekly_patient ON weekly_observations (patient_id, week_number);

-- ---------------------------------------------------------------------------
-- model_runs — trazabilidad de intentos de inferencia (motores DESACTIVADOS)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_runs (
  run_id                 TEXT PRIMARY KEY,
  engine                 TEXT NOT NULL CHECK (engine IN ('motor_A_narrative','motor_B_scales')),
  patient_id             TEXT REFERENCES patients(patient_id) ON DELETE SET NULL,
  reference_kind         TEXT,
  reference_id           TEXT,
  state                  TEXT NOT NULL CHECK (state IN ('pending','processing','completed','failed')),
  model_version          TEXT,
  preprocessing_version  TEXT,
  input_hash             TEXT,                          -- SHA-256, sin revelar contenido
  error_code             TEXT,
  error_message          TEXT,
  started_at             TEXT,
  finished_at            TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_engine_state ON model_runs (engine, state);

-- ---------------------------------------------------------------------------
-- model_outputs — salidas de inferencia (vacía mientras motores desactivados)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS model_outputs (
  output_id      TEXT PRIMARY KEY,
  run_id         TEXT NOT NULL REFERENCES model_runs(run_id) ON DELETE CASCADE,
  head_name      TEXT NOT NULL,
  output_type    TEXT,
  dimensionality INTEGER,
  values_json    TEXT,
  is_valid       INTEGER NOT NULL DEFAULT 0,
  creado_en      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_outputs_run ON model_outputs (run_id);

-- ---------------------------------------------------------------------------
-- audit_events — bitácora APPEND-ONLY (WORM)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
  event_id         TEXT PRIMARY KEY,
  occurred_at      TEXT NOT NULL,
  actor            TEXT,
  actor_role       TEXT,
  action           TEXT NOT NULL,
  subject_pseudonym TEXT,
  details          TEXT,                                -- NUNCA datos clínicos identificables
  ip               TEXT,
  prev_hash        TEXT,
  hash             TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_occurred ON audit_events (occurred_at);

-- Triggers WORM: prohibir UPDATE y DELETE sobre audit_events
CREATE TRIGGER IF NOT EXISTS tr_audit_no_update
BEFORE UPDATE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'VIOLACION DE GOBERNANZA: audit_events es append-only (WORM).');
END;

CREATE TRIGGER IF NOT EXISTS tr_audit_no_delete
BEFORE DELETE ON audit_events
BEGIN
  SELECT RAISE(ABORT, 'VIOLACION DE GOBERNANZA: audit_events es append-only (WORM).');
END;
