/**
 * Pruebas automatizadas del Motor 1 (Autoencoder TUS + LatentSpaceAnalyzer + SHA-256 + D-06).
 * Ejecución aislada con base SQLite temporal (sin alterar sisap_test.sqlite3).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sisap-ae-test-'));
process.env.SISAP_DB_DIR = tmpDir;
process.env.SISAP_DB_FILE = 'ae_test.sqlite3';

const { openDatabase, closeDatabase } = await import('../src/db/index.js');
const { createPatient } = await import('../src/services/patientService.js');
const { verifyChain } = await import('../src/services/auditService.js');
const {
  loadVerifiedRegistryAndArtifacts,
  runFullPipelineSisap,
  inferCandidate17v,
} = await import('../../engines/autoencoder/inference/autoencoderInferenceEngine.js');
const {
  compareLatentVectors,
} = await import('../../engines/autoencoder/embeddings/latentSpaceAnalyzer.js');
const { executeAutoencoderInference } = await import('../src/services/autoencoderService.js');
const { route } = await import('../src/routes/index.js');

function buildValidPayload(overrides = {}) {
  return {
    id_registro: 'SYNTH_TEST_001',
    edad: 32,
    sexo: 'M',
    tiempo_consumo: 9,
    trat_previos: 2,
    sustancia_principal: 'Cannabis',
    bis11: { modo_captura: 'excel_canonico', respuestas: Array.from({ length: 30 }, (_, i) => (i % 4) + 1) },
    bads: { modo_captura: 'items_crudos', respuestas: Array.from({ length: 25 }, (_, i) => i % 6) },
    eros: { modo_captura: 'excel_canonico', respuestas: Array.from({ length: 10 }, (_, i) => (i % 4) + 1) },
    gad7: { modo_captura: 'items_crudos', respuestas: [2, 1, 2, 1, 2, 1, 2] },
    staxi2: { modo_captura: 'items_crudos', respuestas: Array.from({ length: 49 }, (_, i) => (i % 3) + 1) },
    bsl23: {
      modo_captura: 'items_crudos',
      respuestas: Array.from({ length: 23 }, (_, i) => i % 3),
      respuestas_conductuales: Array.from({ length: 11 }, (_, i) => i % 2),
      general_score_0_1: 0.55,
    },
    ...overrides,
  };
}

test('AE-01: Registro de modelos supera verificación criptográfica SHA-256 completa', () => {
  const bundle = loadVerifiedRegistryAndArtifacts();
  assert.equal(bundle.integrityReport.verified, true);
  assert.ok(bundle.integrityReport.verified_artifacts_count >= 7);
  assert.equal(bundle.registry.default_production_model_id, 'encoder_22_checkpoint_fase2');
});

test('AE-02: Pipeline 5 capas (encoder 22v y 24v) genera 12 dimensiones finitas, reconstrucción y opacidad MOD-03', () => {
  const payload = buildValidPayload();
  const res22 = runFullPipelineSisap(payload, { modelId: 'encoder_22_checkpoint_fase2' });
  assert.equal(res22.status, 'completed');
  assert.equal(res22.latent_vector.length, 12);
  assert.ok(res22.latent_vector.every(Number.isFinite));
  assert.equal(res22.reconstruction.per_variable.length, 22);
  assert.ok(Number.isFinite(res22.reconstruction.mse_z));
  assert.equal(res22.latent_analysis.epistemological_guardrail.mod_03_opaque_dimensions, true);
  assert.equal(res22.latent_analysis.epistemological_guardrail.clinical_diagnosis_allowed, false);

  const res24 = runFullPipelineSisap(payload, { modelId: 'encoder_24_deployed' });
  assert.equal(res24.status, 'completed');
  assert.equal(res24.reconstruction.per_variable.length, 24);

  const comp = compareLatentVectors(res22.latent_vector, res24.latent_vector);
  assert.equal(comp.per_dimension_delta.length, 12);
  assert.ok(Number.isFinite(comp.euclidean_distance_l2));
});

test('AE-03: Compuerta D-06 rechaza faltantes/incoherencias sin imputación silenciosa', () => {
  const missingGad = buildValidPayload({
    gad7: { modo_captura: 'items_crudos', respuestas: [2, null, 2, 1, 2, 1, 2] },
  });
  const fail1 = runFullPipelineSisap(missingGad);
  assert.equal(fail1.status, 'failed');
  assert.equal(fail1.stage_failed, 'CAPA_1_VALIDACION_ESQUEMA');
  assert.equal(fail1.dimensions.latent_01, null);

  const impossibleYears = buildValidPayload({ edad: 20, tiempo_consumo: 25 });
  const fail2 = runFullPipelineSisap(impossibleYears);
  assert.equal(fail2.status, 'failed');
  assert.ok(fail2.validation_summary.incidencias.some((i) => i.campo === 'tiempo_consumo'));
});

test('AE-04: Separación semántica EROS vs tiempo_consumo mantiene invariantes las dimensiones latentes', () => {
  const pLowEros = buildValidPayload({ eros: { modo_captura: 'excel_canonico', respuestas: Array(10).fill(1) } });
  const pHighEros = buildValidPayload({ eros: { modo_captura: 'excel_canonico', respuestas: Array(10).fill(4) } });

  const r1 = runFullPipelineSisap(pLowEros);
  const r2 = runFullPipelineSisap(pHighEros);

  assert.equal(r1.variables_derivadas_capa3.separacion_eros_tiempo_consumo.EROS_raw, 10);
  assert.equal(r2.variables_derivadas_capa3.separacion_eros_tiempo_consumo.EROS_raw, 40);
  assert.equal(
    r1.preprocesamiento_capa4.vector_preprocesado_24.tiempo_consumoEROS,
    r2.preprocesamiento_capa4.vector_preprocesado_24.tiempo_consumoEROS
  );
  for (let i = 0; i < 12; i++) {
    assert.equal(r1.latent_vector[i], r2.latent_vector[i]);
  }
});

test('AE-05: Prototipo confirmatorio ae_tus_17to12_m3k12 infiere y rechaza entradas incompletas', () => {
  const ok = inferCandidate17v({
    bis_atencion: 9,
    bis_motor: 12,
    bis_autocontrol: 10,
    bis_inestabilidad_cognitiva: 6,
    bis_perseverancia: 8,
    bis_impulsividad_motora: 16,
    bis_impulsividad_no_planeada: 21,
    staxi_estado: 16,
    staxi_rasgo: 16,
    bsl_total: 11.5,
    bsl_conductual: 3,
    gad_total: 7,
    bads_activacion: 26.5,
    bads_evitacion_rumia: 23,
    bads_afectacion_trabajo: 21,
    bads_afectacion_social: 17,
    eros_total: 27,
  });
  assert.equal(ok.status, 'ACCEPTED');
  assert.equal(ok.z.length, 12);
  assert.ok(Number.isFinite(ok.mse_reconstruccion_orig));

  const bad = inferCandidate17v({ bis_atencion: 9 });
  assert.equal(bad.status, 'REJECTED');
});

test('AE-06: Servicio de backend y rutas persisten model_runs/model_outputs e integridad WORM', async () => {
  openDatabase({ quiet: true });
  const created = await createPatient({
    nombre_completo: 'Paciente Prueba Autoencoder',
    fecha_nacimiento: '1994-05-10',
    edad: 32,
    sexo: 'M',
    estado: 'Ambulatorio',
    es_dato_prueba: 1,
    droga_impacto: 'Cannabis',
  });

  const persisted = executeAutoencoderInference(
    buildValidPayload({
      patient_id: created.patient.patient_id,
      persist: true,
    })
  );
  assert.equal(persisted.status, 'completed');
  assert.equal(persisted.persistence.persisted, true);

  const refRes = await route({
    method: 'GET',
    pathname: '/api/engines/autoencoder/reference',
    query: new URLSearchParams(),
    body: null,
  });
  assert.equal(refRes.status, 200);
  assert.equal(refRes.body.percentiles_12d.length, 12);

  const chain = verifyChain();
  assert.equal(chain.valid, true);
});

test.after(() => {
  closeDatabase();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
