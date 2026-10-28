/**
 * Servicio de pacientes y expedientes.
 *
 * Reglas de seguridad:
 *  - TODAS las consultas usan sentencias parametrizadas (prepared statements).
 *  - La búsqueda SIEMPRE filtra por nombre y aplica LIMIT (no enumeración total).
 *  - El identificador interno (patient_id, UUID) es la clave relacional;
 *    el nombre es solo criterio de búsqueda.
 *  - Detección de duplicados antes de crear.
 */
import { getDatabase } from '../db/index.js';
import { uuid, normalizeName, duplicateFingerprint } from '../utils/crypto.js';
import { Errors } from '../utils/errors.js';

const PSEUDONYM_RE = /^TUS-\d{4,}$/;

function nextPseudonym(db) {
  const row = db
    .prepare(
      `SELECT MAX(CAST(SUBSTR(pseudonym, 5) AS INTEGER)) AS maxn FROM patients WHERE pseudonym LIKE 'TUS-%'`
    )
    .get();
  const next = (row && row.maxn ? row.maxn : 0) + 1;
  return `TUS-${String(next).padStart(4, '0')}`;
}

/**
 * Búsqueda de pacientes por nombre (parametrizada, limitada).
 */
export function searchPatients(query, { limit = 10 } = {}) {
  const db = getDatabase();
  const norm = normalizeName(query);

  // Búsqueda por CURP si el término parece una CURP
  const looksLikeCurp = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(String(query).toUpperCase().trim());
  if (looksLikeCurp) {
    return db
      .prepare(
        `SELECT patient_id, pseudonym, nombre_completo, estado, actualizado_en, es_dato_prueba
         FROM patients WHERE curp = ? ORDER BY actualizado_en DESC LIMIT ?`
      )
      .all(String(query).toUpperCase().trim(), Math.min(limit, 10));
  }

  if (norm.length < 2) {
    // Evitar consultas demasiado amplias / enumeración desde términos triviales.
    throw Errors.badRequest('El criterio de búsqueda debe tener al menos 2 caracteres.');
  }

  return db
    .prepare(
      `SELECT patient_id, pseudonym, nombre_completo, estado, actualizado_en, es_dato_prueba
       FROM patients
       WHERE nombre_normalizado LIKE ? AND activo = 1
       ORDER BY nombre_normalizado ASC
       LIMIT ?`
    )
    .all(`%${norm}%`, Math.min(limit, 10));
}

export function getPatientById(patientId) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM patients WHERE patient_id = ? LIMIT 1').get(patientId) || null;
}

export function getPatientByPseudonym(pseudonym) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM patients WHERE pseudonym = ? LIMIT 1').get(pseudonym) || null;
}

/**
 * Recupera el expediente completo de un paciente por identificador interno.
 */
export function getRecord(patientId) {
  const db = getDatabase();
  const patient = getPatientById(patientId);
  if (!patient) throw Errors.notFound('Paciente no encontrado.');

  const record = db.prepare('SELECT * FROM clinical_records WHERE patient_id = ? LIMIT 1').get(patientId) || null;
  const evaluations = db
    .prepare(
      `SELECT evaluation_id, fecha_eval, aplico, scoring_version, schema_version, vector24_json, notas, creado_en
       FROM initial_evaluations WHERE patient_id = ? ORDER BY fecha_eval DESC LIMIT 100`
    )
    .all(patientId);
  const observations = db
    .prepare(
      `SELECT observation_id, week_number, fecha_entrega, validation_state, preprocessing_version, analysis_state
       FROM weekly_observations WHERE patient_id = ? ORDER BY week_number DESC LIMIT 200`
    )
    .all(patientId);
  const runs = db
    .prepare(
      `SELECT run_id, engine, state, model_version, preprocessing_version, input_hash, started_at, finished_at
       FROM model_runs WHERE patient_id = ? ORDER BY started_at DESC LIMIT 100`
    )
    .all(patientId);

  return { patient, record, evaluations, observations, model_runs: runs };
}

/**
 * Detección de duplicados por nombre normalizado + CURP.
 */
export function findDuplicates({ nombre_completo, curp }) {
  const db = getDatabase();
  const norm = normalizeName(nombre_completo);
  const rows = db
    .prepare(
      `SELECT patient_id, pseudonym, nombre_completo, curp, estado FROM patients
       WHERE nombre_normalizado = ? LIMIT 5`
    )
    .all(norm);
  // Refina por CURP si se proporciona
  const curpUp = String(curp ?? '').toUpperCase().trim();
  return rows.map((r) => ({
    ...r,
    coincide_curp: curpUp ? r.curp === curpUp : null,
  }));
}

/**
 * Crea un paciente + expediente clínico en una sola transacción.
 */
export function createPatient(input, { actor = 'system', actorRole = 'system', allowDuplicate = false } = {}) {
  const db = getDatabase();

  if (!input || !input.nombre_completo || !String(input.nombre_completo).trim()) {
    throw Errors.badRequest('El nombre completo es obligatorio.');
  }
  if (!input.estado) throw Errors.badRequest('El estado clínico es obligatorio.');

  const duplicates = findDuplicates(input);
  if (duplicates.length > 0 && !allowDuplicate) {
    throw Errors.conflict(
      'Existe un paciente con nombre similar. Confirme explícitamente antes de crear un registro duplicado.'
    );
  }

  const patientId = uuid();
  const pseudonym = nextPseudonym(db);
  const now = new Date().toISOString();

  db.exec('BEGIN');
  try {
    db.prepare(
      `INSERT INTO patients
         (patient_id, pseudonym, nombre_completo, nombre_normalizado, curp, expediente_fisico,
          fecha_nacimiento, edad, sexo, contacto_emergencia, telefono_emergencia, estado,
          es_dato_prueba, activo, creado_en, creado_por, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`
    ).run(
      patientId,
      pseudonym,
      String(input.nombre_completo).trim(),
      normalizeName(input.nombre_completo),
      input.curp ? String(input.curp).toUpperCase().trim() : null,
      input.expediente_fisico ?? null,
      input.fecha_nacimiento ?? null,
      Number.isFinite(input.edad) ? input.edad : null,
      input.sexo ?? null,
      input.contacto_emergencia ?? null,
      input.telefono_emergencia ?? null,
      input.estado,
      input.es_dato_prueba ? 1 : 0,
      now,
      actor,
      now
    );

    db.prepare(
      `INSERT INTO clinical_records
         (record_id, patient_id, ingreso, droga_impacto, diagnostico_cie, diagnostico_impresion,
          sesiones, creado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
    ).run(
      uuid(),
      patientId,
      input.ingreso ?? now.slice(0, 10),
      input.droga_impacto ?? null,
      input.diagnostico_cie ?? null,
      input.diagnostico_impresion ?? null,
      now,
      now
    );

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw Errors.internal(err.message);
  }

  return getRecord(patientId);
}

export function isValidPseudonym(p) {
  return PSEUDONYM_RE.test(String(p));
}
