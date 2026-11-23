import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { makeTempDbEnv, cleanupTempDir } from './helpers.js';

let dir;
let dbmod;
let patients;

before(async () => {
  dir = makeTempDbEnv();
  dbmod = await import('../src/db/index.js');
  patients = await import('../src/services/patientService.js');
  dbmod.openDatabase({ quiet: true });
});

after(() => {
  dbmod.closeDatabase();
  cleanupTempDir(dir);
});

test('T-06: creación de paciente + expediente (transacción)', () => {
  const rec = patients.createPatient(
    { nombre_completo: 'PACIENTE PRUEBA ALFA', estado: 'Residencial', es_dato_prueba: true },
    { allowDuplicate: true }
  );
  assert.ok(rec.patient.patient_id, 'patient_id presente');
  assert.ok(rec.patient.pseudonym.startsWith('TUS-'), 'pseudónimo TUS-');
  assert.ok(rec.record.record_id, 'clinical_record creado');
});

test('T-04: búsqueda parametrizada por nombre', () => {
  const res = patients.searchPatients('PRUEBA ALFA');
  assert.ok(Array.isArray(res));
  assert.ok(res.length >= 1, 'encuentra al menos uno');
  assert.ok(res.length <= 10, 'respeta el límite de 10');
});

test('T-04b: búsqueda parametrizada exacta por seudónimo TUS-XXXX (PRB-008)', () => {
  const byName = patients.searchPatients('PRUEBA ALFA');
  assert.ok(byName.length >= 1);
  const targetPseudo = byName[0].pseudonym;
  const byPseudo = patients.searchPatients(targetPseudo.toLowerCase());
  assert.equal(byPseudo.length, 1);
  assert.equal(byPseudo[0].pseudonym, targetPseudo);
});

test('T-06b: prevención de duplicados sin confirmación', () => {
  assert.throws(
    () => patients.createPatient({ nombre_completo: 'PACIENTE PRUEBA ALFA', estado: 'Residencial' }),
    /duplicad|similar/i
  );
});

test('T-08: búsqueda con entrada SQL maliciosa es inofensiva', () => {
  const res = patients.searchPatients("' OR 1=1 --");
  // No debe devolver todo: la normalización deja "or 1 1" que no coincide con nadie esperado
  assert.ok(Array.isArray(res));
  assert.ok(res.length <= 10);
});

test('búsqueda con término corto es rechazada', () => {
  assert.throws(() => patients.searchPatients('a'), /2 caracteres|inválida/i);
});

test('T-07: evaluación se vincula al paciente correcto', async () => {
  const rec = patients.createPatient(
    { nombre_completo: 'PACIENTE PRUEBA BETA', estado: 'Ambulatorio', es_dato_prueba: true },
    { allowDuplicate: true }
  );
  const ev = await import('../src/services/evaluationService.js');
  const { evaluation_id } = ev.createEvaluation({
    patient_id: rec.patient.patient_id,
    responses: [{ instrument: 'GAD_7', items: [0, 1, 2, 3, 0, 1, 2] }],
    scores: [{ instrument: 'GAD_7', subscale: 'total', value: 9 }],
  });
  const full = patients.getRecord(rec.patient.patient_id);
  assert.equal(full.evaluations.length, 1);
  assert.equal(full.evaluations[0].evaluation_id, evaluation_id);
});

test('T-09: transacción revertida no deja registro parcial', async () => {
  const ev = await import('../src/services/evaluationService.js');
  // patient_id inexistente -> debe fallar y no crear nada
  assert.throws(() => ev.createEvaluation({ patient_id: 'no-existe-uuid' }), /no encontrado/i);
  const db = dbmod.getDatabase();
  const n = db
    .prepare("SELECT COUNT(*) AS n FROM initial_evaluations WHERE patient_id = 'no-existe-uuid'")
    .get().n;
  assert.equal(n, 0, 'sin registros huérfanos');
});
