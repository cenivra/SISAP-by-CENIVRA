/**
 * Pruebas unitarias automatizadas de módulos TypeScript Frontend (SISAP v1.1.0).
 * Ejecución nativa reproducible con `node --import tsx --test src/test/*.test.ts`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

// Habilitar entorno mínimo window/WebCrypto en Node >=22 para probar servicios cliente
if (typeof (globalThis as { window?: unknown }).window === 'undefined') {
  (globalThis as { window?: unknown }).window = globalThis;
}

const {
  ACTIVE_INSTRUMENT_IDS,
  isInstrumentExcluded,
  resolveInstrumentConfig,
} = await import('../psychometrics/instrumentCatalog.ts');
const {
  scorePsychometricEvaluation,
  verifyCaptureEquivalence,
} = await import('../psychometrics/scoringEngine.ts');
const {
  computeBis11,
  computeBsl23,
  computeGad7,
  computeStaxi2,
  computeBads,
  computeEros,
  assemble24Vector,
  validateCompleteEvaluationD06,
} = await import('../services/scalesEngine.ts');
const { AutoencoderEngine } = await import('../services/autoencoderEngine.ts');
const {
  generateSalt,
  generateAesKeyHex,
  hashPasswordPbkdf2,
  verifyPassword,
  encryptAesGcm,
  decryptAesGcm,
  sha256Hex,
  getCurrentOtpCode,
} = await import('../services/cryptoService.ts');
const { TelemetryService, sanitizeTelemetryString } = await import('../services/telemetryService.ts');

test('FE-01: Catálogo psicométrico TS expone exactamente 6 activos, excluye OCI-R y mantiene paridad captura digital/numérica', () => {
  assert.deepEqual(ACTIVE_INSTRUMENT_IDS, ['BIS-11', 'BSL-23', 'GAD-7', 'EROS', 'BADS', 'STAXI-2']);
  assert.equal(isInstrumentExcluded('OCI-R'), true);

  for (const id of ACTIVE_INSTRUMENT_IDS) {
    const cfg = resolveInstrumentConfig(id);
    const responses = cfg.items.map((it) => ({
      itemId: it.itemId,
      numericCode: it.pendingAuthorizedText ? null : id === 'GAD-7' || id === 'BSL-23' || id === 'BADS' ? 2 : 3,
    }));
    const scored = scorePsychometricEvaluation({ instrumentId: id, responses });
    assert.equal(scored.derivedIndicators.completeness.isValidForScoring, true);
    const eq = verifyCaptureEquivalence(id, responses, cfg.version, 'manual_estandar');
    assert.equal(eq.equivalent, true, `${id} TS parity`);
  }
});

test('FE-02: scalesEngine valida compuerta estricta D-06 y rechaza inconsistencias sin imputación', () => {
  const validD06 = validateCompleteEvaluationD06({
    edad: 32,
    tiempo_consumo: 8,
    trat_previos: 2,
    raw_bis_11: Array(30).fill('2').join(' '),
    raw_bsl_23: Array(23).fill('1').join(' '),
    raw_bsl_23_conductual: Array(11).fill('0').join(' '),
    bsl_general_0_1: 0.6,
    raw_gad_7: '2 1 2 1 2 1 2',
    raw_staxi_2: Array(49).fill('2').join(' '),
    raw_bads: Array(25).fill('3').join(' '),
    raw_eros: Array(10).fill('2').join(' '),
    modo_scoring: 'excel_canonico',
  });
  assert.equal(validD06.valido, true);
  assert.equal(validD06.n_incidencias, 0);

  const invalidAge = validateCompleteEvaluationD06({
    edad: 20,
    tiempo_consumo: 25,
    trat_previos: 1,
    raw_bis_11: Array(30).fill('2').join(' '),
    raw_bsl_23: '1 2', // incompleto
    raw_bsl_23_conductual: Array(11).fill('0').join(' '),
    bsl_general_0_1: 1.5, // fuera de rango
    raw_gad_7: '2 1 2 1 2 1 2',
    raw_staxi_2: Array(49).fill('2').join(' '),
    raw_bads: Array(25).fill('3').join(' '),
    raw_eros: Array(10).fill('2').join(' '),
    modo_scoring: 'manual_estandar',
  });
  assert.equal(invalidAge.valido, false);
  assert.ok(invalidAge.n_incidencias >= 3);
});

test('FE-03: Vector 24v, Winsorización e inferencia Autoencoder SELU 12D en cliente TS funcionan y mantienen opacidad', () => {
  const bis = computeBis11(Array(30).fill(2), 'excel_canonico');
  const staxi = computeStaxi2(Array(49).fill(2));
  const bsl = computeBsl23(Array(23).fill(1), Array(11).fill(0), 0.6);
  const gad = computeGad7([2, 1, 2, 1, 2, 1, 2]);
  const bads = computeBads(Array(25).fill(3));
  const erosLow = computeEros(Array(10).fill(1), 'excel_canonico');
  const erosHigh = computeEros(Array(10).fill(4), 'excel_canonico');

  const vecA = assemble24Vector({
    bis,
    staxi,
    bsl,
    gad,
    bads,
    erosTotal: erosLow,
    edad: 34,
    tiempoConsumo: 10,
    tratPrevios: 2,
    sustanciaPrincipal: 'Alcohol',
  });
  const vecB = assemble24Vector({
    bis,
    staxi,
    bsl,
    gad,
    bads,
    erosTotal: erosHigh,
    edad: 34,
    tiempoConsumo: 10,
    tratPrevios: 2,
    sustanciaPrincipal: 'Alcohol',
  });

  assert.equal(vecA.tiempo_consumoEROS, vecB.tiempo_consumoEROS);
  const res22 = AutoencoderEngine.runVerifiedInference(vecA, 'encoder_22_checkpoint_fase2');
  const res24 = AutoencoderEngine.runVerifiedInference(vecA, 'encoder_24_deployed');
  assert.equal(res22.latentDimensions.length, 12);
  assert.equal(res22.perVariableReconstruction.length, 22);
  assert.equal(res24.perVariableReconstruction.length, 24);
  assert.ok(res22.latentDimensions.every((d) => Number.isFinite(d.rawValue)));
  assert.ok(Number.isFinite(res22.verifiedMetrics.mse_z));
  assert.ok(res22.summaryIndices.clase_latente_3b.includes('MOD-03') || res22.summaryIndices.clase_latente_3b.includes('GMM excluido'));
});

test('FE-04: Criptografía WebCrypto PBKDF2-SHA256, AES-GCM y OTP operan correctamente', async () => {
  const salt = generateSalt(16);
  const hash = await hashPasswordPbkdf2('ClaveSegura#2026', salt);
  assert.equal(hash.length, 64);
  assert.equal(await verifyPassword('ClaveSegura#2026', salt, hash), true);
  assert.equal(await verifyPassword('ClaveIncorrecta', salt, hash), false);

  const keyHex = generateAesKeyHex();
  const enc = await encryptAesGcm('{"registro":"sintetico"}', keyHex);
  const dec = await decryptAesGcm(enc.cipherText, enc.iv, keyHex);
  assert.equal(dec, '{"registro":"sintetico"}');

  const digest = await sha256Hex('SISAP-WORM-CHECK');
  assert.equal(digest.length, 64);
  const otp = getCurrentOtpCode();
  assert.match(otp.code, /^\d{6}$/);
});

test('FE-05: Telemetría desactivada por defecto y sanitización elimina PHI, TUS-XXXX, CURP y rutas', () => {
  assert.equal(TelemetryService.isTelemetryEnabled(), false);
  const raw =
    'Error leyendo paciente TUS-0042 CURP ABCD900101HDFXYZ01 correo user@example.org en C:\\Users\\admin\\app\\foo.ts con craving';
  const cleaned = sanitizeTelemetryString(raw);
  assert.ok(!cleaned.includes('TUS-0042'));
  assert.ok(!cleaned.includes('ABCD900101HDFXYZ01'));
  assert.ok(!cleaned.includes('user@example.org'));
  assert.ok(!cleaned.includes('admin'));
  assert.ok(!cleaned.includes('craving'));
  assert.ok(cleaned.includes('[REDACTED_CLINICAL]'));
});

test('FE-06: Catálogo clínico de evaluación y headers RBAC en PatientApiService operan correctamente', async () => {
  if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
    const store = new Map<string, string>();
    (globalThis as { localStorage?: Storage }).localStorage = {
      get length() {
        return store.size;
      },
      clear: () => store.clear(),
      getItem: (k: string) => store.get(k) ?? null,
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      removeItem: (k: string) => {
        store.delete(k);
      },
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
    } as Storage;
  }

  const { INSTRUMENTOS_CATALOGO } = await import('../constants/clinicalConstants.ts');
  const { PatientApiService } = await import('../services/patientApiService.ts');
  const { StorageService } = await import('../services/storageService.ts');

  const staxiEntry = INSTRUMENTOS_CATALOGO.find((s) => s.id === 'STAXI_2');
  assert.ok(staxiEntry, 'STAXI_2 debe existir en INSTRUMENTOS_CATALOGO');
  assert.equal(staxiEntry.items, 49);

  PatientApiService.setSessionActor('psicologo', 'psicologo');
  const headers = PatientApiService.getActorHeaders();
  assert.equal(headers['X-SISAP-Actor'], 'psicologo');
  assert.equal(headers['X-SISAP-Role'], 'psicologo');

  PatientApiService.setApiBase('http://127.0.0.1:8091/api/');
  assert.equal(PatientApiService.getApiBase(), 'http://127.0.0.1:8091/api');
  PatientApiService.setApiBase('/api');

  StorageService.setAppMode('institutional');
  assert.equal(StorageService.getAppMode(), 'institutional');
  StorageService.setAppMode('demo');
  assert.equal(StorageService.getAppMode(), 'demo');
});
