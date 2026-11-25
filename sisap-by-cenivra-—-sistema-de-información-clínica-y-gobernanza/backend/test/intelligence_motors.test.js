/**
 * Pruebas integradas de los Motores 2, 3, 4 y 5 + migración 002 (follow_up_evaluations y clinical_formulations).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sisap-motors-test-'));
process.env.SISAP_DB_DIR = tmpDir;
process.env.SISAP_DB_FILE = 'motors_test.sqlite3';

const { openDatabase, closeDatabase, healthCheck } = await import('../src/db/index.js');
const { createPatient } = await import('../src/services/patientService.js');
const { createEvaluation, createWeeklyObservation } = await import('../src/services/evaluationService.js');
const { executeAutoencoderInference } = await import('../src/services/autoencoderService.js');
const { route } = await import('../src/routes/index.js');

test('MOT-01: Migración 002 crea tablas longitudinales y healthCheck reporta OK', () => {
  const db = openDatabase({ quiet: true });
  const h = healthCheck();
  assert.equal(h.ok, true);
  assert.ok(h.tables >= 12);
  assert.deepEqual(h.missingTables, []);
  assert.ok(h.migrationsApplied >= 2);
  const tableNames = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((r) => r.name);
  assert.ok(tableNames.includes('follow_up_evaluations'));
  assert.ok(tableNames.includes('clinical_formulations'));
});

test('MOT-02: Flujo completo Motores 1..5 vía API (seguimiento, RCI, narrativa E1-E5, matriz multimodal y formulación)', async () => {
  const { patient } = await createPatient({
    nombre_completo: 'Paciente Prueba Longitudinal',
    fecha_nacimiento: '1992-03-15',
    edad: 34,
    sexo: 'F',
    estado: 'Ambulatorio',
    es_dato_prueba: 1,
    droga_impacto: 'Alcohol',
  });

  // 1. Evaluación inicial basal + Motor 1
  createEvaluation({
    patient_id: patient.patient_id,
    fecha_eval: '2026-10-01',
    scales: {
      gad7: [3, 3, 3, 3, 2, 2, 2], // GAD total = 18
      bis11: Array.from({ length: 30 }, () => 2),
      bads: Array.from({ length: 25 }, () => 3),
      eros: Array.from({ length: 10 }, () => 2),
      staxi2: Array.from({ length: 49 }, () => 2),
      bsl23: Array.from({ length: 23 }, () => 1),
    },
    scores: [
      { instrument: 'GAD-7', subscale: 'gad_total_bruto', value: 18, is_derived: false },
      { instrument: 'BADS', subscale: 'total_bads_invertido', value: 72, is_derived: false },
    ],
  });

  executeAutoencoderInference({
    patient_id: patient.patient_id,
    persist: true,
    edad: 34,
    sexo: 'F',
    tiempo_consumo: 8,
    trat_previos: 1,
    sustancia_principal: 'Alcohol',
    bis11: { modo_captura: 'excel_canonico', respuestas: Array(30).fill(2) },
    bads: { modo_captura: 'items_crudos', respuestas: Array(25).fill(3) },
    eros: { modo_captura: 'excel_canonico', respuestas: Array(10).fill(2) },
    gad7: { modo_captura: 'items_crudos', respuestas: [3, 3, 3, 3, 2, 2, 2] },
    staxi2: { modo_captura: 'items_crudos', respuestas: Array(49).fill(2) },
    bsl23: {
      modo_captura: 'items_crudos',
      respuestas: Array(23).fill(1),
      respuestas_conductuales: Array(11).fill(0),
      general_score_0_1: 0.6,
    },
  });

  // 2. Registro cuantitativo longitudinal con mejoría confiable (GAD-7 baja de 18 a 4 -> RCI < -1.96)
  const fuPost = await route({
    method: 'POST',
    pathname: '/api/follow-ups',
    query: new URLSearchParams(),
    body: {
      patient_id: patient.patient_id,
      evaluation_date: '2026-11-15',
      session_number: 4,
      instrument: 'GAD-7',
      total_score: 4,
      items: [1, 1, 1, 0, 1, 0, 0],
      clinical_severity: 'Mínima',
      notes: 'Reducción sostenida de ansiedad generalizada tras 4 sesiones.',
    },
  });
  assert.equal(fuPost.status, 201);

  // 3. Narrativa semanal con señales léxicas explícitas (E1)
  createWeeklyObservation({
    patient_id: patient.patient_id,
    week_number: 2,
    fecha_entrega: '2026-11-10',
    text_json: {
      q1_descripcion: 'Semana estable aunque apareció craving leve el viernes por la noche.',
      q3_estrategias: 'Usé respiración diafragmática y salí a caminar para evitar aislarme.',
    },
  });

  // 4. Reporte completo de los 5 motores
  const intelRes = await route({
    method: 'GET',
    pathname: `/api/patients/${patient.patient_id}/intelligence`,
    query: new URLSearchParams(),
    body: null,
  });
  assert.equal(intelRes.status, 200);
  assert.equal(intelRes.body.multimodal_alignment.active_modalities, 5);
  assert.equal(intelRes.body.motor_2_longitudinal.trajectories['GAD-7'].rci_interpretation, 'reliable_improvement');
  assert.equal(intelRes.body.motor_3_narrative.summary.review_status, 'pending_human_review');
  assert.equal(intelRes.body.motor_5_synthesis.governance_constraints.automatic_diagnosis_disabled, true);
  assert.equal(intelRes.body.motor_5_synthesis.governance_constraints.therapeutic_prescription_disabled, true);

  // 5. Formulación clínica trazable con revisión humana pendiente
  const formRes = await route({
    method: 'POST',
    pathname: `/api/patients/${patient.patient_id}/formulations`,
    query: new URLSearchParams(),
    body: {
      summary_text: 'Descenso significativo en GAD-7 (RCI favorable) con afrontamiento activo reportado en semana 2.',
      evidence_level: 'E1_explicit',
      domains: ['longitudinal_rci', 'narrative_process'],
    },
  });
  assert.equal(formRes.status, 201);
  assert.equal(formRes.body.review_status, 'pending_human_review');

  // 6. Estado general de motores
  const statusRes = await route({
    method: 'GET',
    pathname: '/api/engines/status',
    query: new URLSearchParams(),
    body: null,
  });
  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.motors.motor_1_autoencoder.integrity_verified, true);
  assert.equal(statusRes.body.motors.motor_5_decision_support.automatic_diagnosis_allowed, false);
});

test.after(() => {
  closeDatabase();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
