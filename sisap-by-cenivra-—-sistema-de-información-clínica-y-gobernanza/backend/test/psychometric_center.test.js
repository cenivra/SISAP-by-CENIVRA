/**
 * Pruebas obligatorias del Centro de Evaluación Psicométrica y Captura Digital:
 * - Catálogo activo (6 instrumentos) y exclusión estricta de OCI-R.
 * - Verificación independiente por instrumento: número de reactivos, opciones, codificación,
 *   inversiones, totales, subescalas y manejo de faltantes (sin imputación silenciosa).
 * - Equivalencia matemática 1:1 entre captura digital por reactivos y captura numérica legada.
 * - Almacenamiento en 3 niveles (evaluación / respuestas / resultados), borradores e inmutabilidad
 *   frente a sobrescritura (HTTP 409) y recálculo preservando respuestas originales.
 * - Comparación longitudinal y advertencia ante mezcla de versiones (BADS v22 vs v25).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sisap-psych-center-test-'));
process.env.SISAP_DB_DIR = tmpDir;
process.env.SISAP_DB_FILE = 'psych_center_test.sqlite3';

const { openDatabase, closeDatabase, healthCheck } = await import('../src/db/index.js');
const { createPatient } = await import('../src/services/patientService.js');
const { route } = await import('../src/routes/index.js');
const {
  ACTIVE_INSTRUMENT_IDS,
  isInstrumentExcluded,
  resolveInstrumentConfig,
} = await import('../src/psychometrics/instrumentCatalog.js');
const {
  scorePsychometricEvaluation,
  verifyCaptureEquivalence,
} = await import('../src/psychometrics/scoringEngine.js');

function buildResponsesArray(config, valuesByDisplayNumber) {
  return config.items.map((item, idx) => {
    const val = valuesByDisplayNumber[idx];
    return {
      itemId: item.itemId,
      numericCode: val === undefined ? null : val,
    };
  });
}

test('PSYC-01: Migración 003 crea 3 tablas psicométricas, catálogo tiene 6 instrumentos y OCI-R está excluido', async () => {
  openDatabase({ quiet: true });
  const h = healthCheck();
  assert.equal(h.ok, true);
  assert.equal(h.tables, 15);
  assert.deepEqual(h.missingTables, []);
  assert.ok(h.migrationsApplied >= 3);

  const catRes = await route({
    method: 'GET',
    pathname: '/api/psychometrics/catalog',
    query: new URLSearchParams(),
    body: null,
  });
  assert.equal(catRes.status, 200);
  const ids = catRes.body.instruments.map((i) => i.id);
  assert.deepEqual(ids, ['BIS-11', 'BSL-23', 'GAD-7', 'EROS', 'BADS', 'STAXI-2']);
  assert.equal(catRes.body.instruments.find((i) => i.id === 'BIS-11').itemCount, 30);
  assert.equal(catRes.body.instruments.find((i) => i.id === 'BSL-23').itemCount, 23);
  assert.equal(catRes.body.instruments.find((i) => i.id === 'GAD-7').itemCount, 7);
  assert.equal(catRes.body.instruments.find((i) => i.id === 'EROS').itemCount, 10);
  assert.equal(catRes.body.instruments.find((i) => i.id === 'BADS').itemCount, 22);
  assert.equal(catRes.body.instruments.find((i) => i.id === 'STAXI-2').itemCount, 57);

  assert.equal(isInstrumentExcluded('OCI-R'), true);
  assert.ok(!ids.includes('OCI-R'));

  await assert.rejects(
    () =>
      route({
        method: 'POST',
        pathname: '/api/psychometrics/score',
        query: new URLSearchParams(),
        body: { instrument_id: 'OCI-R', responses: [] },
      }),
    /excluido/i
  );
});

test('PSYC-02: BIS-11 (30 reactivos) aplica 11 inversiones (5 - x) y calcula 1.º y 2.º orden exactamente', () => {
  const cfg = resolveInstrumentConfig('BIS-11', 'v1.0-patton1995-es');
  assert.equal(cfg.items.length, 30);

  // Secuencia determinista asimétrica [1..4]
  const raw = Array.from({ length: 30 }, (_, i) => ((i * 3) % 4) + 1);
  const revSet = new Set([1, 7, 8, 9, 10, 12, 13, 15, 20, 29, 30]);
  const expectedRecoded = raw.map((v, idx) => (revSet.has(idx + 1) ? 5 - v : v));
  const sumIndices = (arr, idxs) => idxs.reduce((acc, i) => acc + arr[i - 1], 0);

  const res = scorePsychometricEvaluation({
    instrumentId: 'BIS-11',
    instrumentVersion: 'v1.0-patton1995-es',
    responses: buildResponsesArray(cfg, raw),
    scoringMode: 'manual_estandar',
  });

  assert.equal(res.calculatedScores.totalScore, expectedRecoded.reduce((a, b) => a + b, 0));
  assert.equal(res.calculatedScores.subscaleMap.attention, sumIndices(expectedRecoded, [5, 9, 11, 20, 28]));
  assert.equal(res.calculatedScores.subscaleMap.cognitive_instability, sumIndices(expectedRecoded, [6, 24, 26]));
  assert.equal(res.calculatedScores.subscaleMap.motor, sumIndices(expectedRecoded, [2, 3, 4, 17, 19, 22, 25]));
  assert.equal(res.calculatedScores.subscaleMap.perseverance, sumIndices(expectedRecoded, [16, 21, 23, 30]));
  assert.equal(res.calculatedScores.subscaleMap.self_control, sumIndices(expectedRecoded, [1, 7, 8, 12, 13, 14]));
  assert.equal(res.calculatedScores.subscaleMap.cognitive_complexity, sumIndices(expectedRecoded, [10, 15, 18, 27, 29]));
  assert.equal(
    res.calculatedScores.subscaleMap.attentional_2nd,
    res.calculatedScores.subscaleMap.attention + res.calculatedScores.subscaleMap.cognitive_instability
  );
  assert.equal(
    res.calculatedScores.subscaleMap.motor_2nd,
    res.calculatedScores.subscaleMap.motor + res.calculatedScores.subscaleMap.perseverance
  );
  assert.equal(
    res.calculatedScores.subscaleMap.nonplanning_2nd,
    res.calculatedScores.subscaleMap.self_control + res.calculatedScores.subscaleMap.cognitive_complexity
  );
});

test('PSYC-03: BSL-23 (23 reactivos) calcula suma, media, alertas de riesgo y complemento opcional', () => {
  const cfg = resolveInstrumentConfig('BSL-23');
  assert.equal(cfg.items.length, 23);

  const raw = new Array(23).fill(2); // Suma=46, media=2.0 -> Banda Alta (1.88..2.67)
  raw[4] = 3; // P5 "Pensé en hacerme daño" -> alerta crítica

  const res = scorePsychometricEvaluation({
    instrumentId: 'BSL-23',
    responses: buildResponsesArray(cfg, raw),
    optionalComplements: {
      bslGeneral01: 0.45,
      bslBehavioral11: [1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 0], // suma=5
    },
  });

  assert.equal(res.calculatedScores.totalScore, 47);
  assert.equal(res.calculatedScores.meanScore, Number((47 / 23).toFixed(4)));
  assert.equal(res.interpretations.level, 'Alta');
  assert.equal(res.calculatedScores.technicalReferenceTotal, 52); // 47 + 5
  assert.equal(res.derivedIndicators.completeness.criticalSafetyAlerts.length, 3); // P5, P7(=2), P18(=2) -> >=1
});

test('PSYC-04: GAD-7 (7 reactivos) calcula suma, severidad y Z-scores exactos', () => {
  const cfg = resolveInstrumentConfig('GAD-7');
  assert.equal(cfg.items.length, 7);

  const raw = [2, 3, 1, 2, 1, 0, 2]; // total = 11 -> Moderada
  const res = scorePsychometricEvaluation({
    instrumentId: 'GAD-7',
    responses: buildResponsesArray(cfg, raw),
  });

  assert.equal(res.calculatedScores.totalScore, 11);
  assert.equal(res.interpretations.level, 'Moderada');
  assert.equal(res.derivedIndicators.cohortZScores.gad_zscore_piloto_n10, Number(((11 - 7.4) / 5.853773711604051).toFixed(6)));
});

test('PSYC-05: EROS (10 reactivos) aplica inversión [2,5,6,7,9] y calcula modelo validado de 9 ítems (sin EROS7)', () => {
  const cfg = resolveInstrumentConfig('EROS');
  assert.equal(cfg.items.length, 10);

  //            1  2  3  4  5  6  7  8  9  10
  const raw = [4, 1, 3, 4, 2, 1, 2, 3, 1, 4];
  // Recodificados: P1=4, P2=4, P3=3, P4=4, P5=3, P6=4, P7=3, P8=3, P9=4, P10=4 -> Total 10 = 36
  // Factor 1 Agrado [1,3,4,8,10] = 4+3+4+3+4 = 18
  // Factor 2 Ausencia disforia (recod) [2,5,6,9] = 4+3+4+4 = 15
  // Total validado 9 ítems (sin P7) = 33
  const res = scorePsychometricEvaluation({
    instrumentId: 'EROS',
    responses: buildResponsesArray(cfg, raw),
  });

  assert.equal(res.calculatedScores.totalScore, 36);
  assert.equal(res.calculatedScores.technicalReferenceTotal, 25); // suma directa excel_canonico
  assert.equal(res.calculatedScores.subscaleMap.eros_f1_agrado_5, 18);
  assert.equal(res.calculatedScores.subscaleMap.eros_f2_disforia_4_inv, 15);
  assert.equal(res.calculatedScores.subscaleMap.eros_f2_disforia_4_raw, 5);
  assert.equal(res.calculatedScores.subscaleMap.eros_validado_9, 33);
});

test('PSYC-06: BADS-22 (22 reactivos validados, sin P4/P10/P16) y BADS-25 calculan perfil conductual exacto', () => {
  const cfg22 = resolveInstrumentConfig('BADS', 'v22.0-tus-nct07395700');
  assert.equal(cfg22.items.length, 22);
  const canonicalCodes = cfg22.items.map((x) => x.canonicalCode);
  assert.ok(!canonicalCodes.includes('P4'));
  assert.ok(!canonicalCodes.includes('P10'));
  assert.ok(!canonicalCodes.includes('P16'));

  // Asignamos valor 4 a Activación (P3,P5,P7,P11,P12,P23), 2 a Evitación (7 ítems), 1 a Laboral (5 ítems), 3 a Social (4 ítems)
  const responses22 = cfg22.items.map((it) => {
    if (['BADS_P3', 'BADS_P5', 'BADS_P7', 'BADS_P11', 'BADS_P12', 'BADS_P23'].includes(it.itemId)) {
      return { itemId: it.itemId, numericCode: 4 };
    }
    if (['BADS_P1', 'BADS_P2', 'BADS_P6', 'BADS_P21', 'BADS_P22'].includes(it.itemId)) {
      return { itemId: it.itemId, numericCode: 1 };
    }
    if (['BADS_P17', 'BADS_P18', 'BADS_P19', 'BADS_P20'].includes(it.itemId)) {
      return { itemId: it.itemId, numericCode: 3 };
    }
    return { itemId: it.itemId, numericCode: 2 };
  });

  const res22 = scorePsychometricEvaluation({
    instrumentId: 'BADS',
    instrumentVersion: 'v22.0-tus-nct07395700',
    responses: responses22,
  });

  // Activación = 6*4 = 24 (Autónoma 12, Regulada 12)
  // Evitación = 7*2 = 14
  // Laboral = 5*1 = 5
  // Social = 4*3 = 12
  // Deterioro Funcional Integrado = 5 + 12 = 17
  // Disfunción/Evitación Total = 14 + 5 + 12 = 31
  // Total Técnico Referencial = 24 + (96 - 31) = 89
  assert.equal(res22.calculatedScores.totalScore, null);
  assert.equal(res22.calculatedScores.subscaleMap.bads_activation, 24);
  assert.equal(res22.calculatedScores.subscaleMap.bads_activation_autonomous, 12);
  assert.equal(res22.calculatedScores.subscaleMap.bads_activation_regulated, 12);
  assert.equal(res22.calculatedScores.subscaleMap.bads_avoidance, 14);
  assert.equal(res22.calculatedScores.subscaleMap.bads_work, 5);
  assert.equal(res22.calculatedScores.subscaleMap.bads_social, 12);
  assert.equal(res22.calculatedScores.subscaleMap.bads_functional_impairment, 17);
  assert.equal(res22.calculatedScores.subscaleMap.bads_dysfunction_avoidance_total, 31);
  assert.equal(res22.calculatedScores.technicalReferenceTotal, 89);

  // Versión de 25 reactivos (compatibilidad Autoencoder)
  const cfg25 = resolveInstrumentConfig('BADS', 'v25.0-barraca2011');
  assert.equal(cfg25.items.length, 25);
  const raw25 = new Array(25).fill(3); // 7*3=21, rev 18*3=54 -> total_bads_invertido = 75
  const res25 = scorePsychometricEvaluation({
    instrumentId: 'BADS',
    instrumentVersion: 'v25.0-barraca2011',
    responses: buildResponsesArray(cfg25, raw25),
  });
  assert.equal(res25.calculatedScores.technicalReferenceTotal, 75);
});

test('PSYC-07: STAXI-2 (57 reactivos con 49 autorizados TEA + 8 pendientes) calcula subescalas e IEI exactamente', () => {
  const cfg57 = resolveInstrumentConfig('STAXI-2', 'v57.0-tea49-hybrid');
  assert.equal(cfg57.items.length, 57);
  assert.equal(cfg57.items.slice(0, 49).filter((i) => !i.pendingAuthorizedText).length, 49);
  assert.equal(cfg57.items.slice(49, 57).filter((i) => i.pendingAuthorizedText).length, 8);

  // Responder únicamente los 49 reactivos españoles TEA autorizados:
  // Parte 1 (1..15) = 2 -> Sent=10, ExpF=10, ExpV=10 => Estado=30
  // Parte 2 (16..25) = 3 -> Temp=15, Reacc=15 => Rasgo=30
  // Parte 3 (26..49): C.Ext y C.Int = 4 (cext=24, cint=24), E.Ext y E.Int = 2 (eext=12, eint=12)
  // IEI = (12 + 12) - (24 + 24) + 36 = 24 - 48 + 36 = 12
  const cextSet = new Set([26, 30, 33, 36, 41, 43]);
  const cintSet = new Set([44, 45, 46, 47, 48, 49]);
  const responses57 = cfg57.items.slice(0, 49).map((it) => {
    const n = it.displayNumber;
    let val = 2;
    if (n >= 16 && n <= 25) val = 3;
    else if (cextSet.has(n) || cintSet.has(n)) val = 4;
    return { itemId: it.itemId, numericCode: val };
  });

  const res = scorePsychometricEvaluation({
    instrumentId: 'STAXI-2',
    instrumentVersion: 'v57.0-tea49-hybrid',
    responses: responses57,
  });

  assert.equal(res.derivedIndicators.completeness.isValidForScoring, true);
  assert.equal(res.calculatedScores.subscaleMap.staxi_state_total, 30);
  assert.equal(res.calculatedScores.subscaleMap.staxi_trait_total, 30);
  assert.equal(res.calculatedScores.subscaleMap.staxi_expresion_externa, 12);
  assert.equal(res.calculatedScores.subscaleMap.staxi_expresion_interna, 12);
  assert.equal(res.calculatedScores.subscaleMap.staxi_control_externo, 24);
  assert.equal(res.calculatedScores.subscaleMap.staxi_control_interno, 24);
  assert.equal(res.calculatedScores.subscaleMap.staxi_iei, 12);
});

test('PSYC-08: Manejo estricto de valores faltantes y fuera de rango sin imputación silenciosa', () => {
  const cfg = resolveInstrumentConfig('GAD-7');
  const partial = buildResponsesArray(cfg, [1, 2, 1, null, 2, 0, 1]);
  const res = scorePsychometricEvaluation({ instrumentId: 'GAD-7', responses: partial });
  assert.equal(res.derivedIndicators.completeness.isValidForScoring, false);
  assert.equal(res.derivedIndicators.completeness.missingItems, 1);
  assert.deepEqual(res.derivedIndicators.completeness.missingItemIds, ['GAD7_4']);
  assert.equal(res.calculatedScores.totalScore, null);

  assert.throws(
    () =>
      scorePsychometricEvaluation({
        instrumentId: 'GAD-7',
        responses: buildResponsesArray(cfg, [1, 2, 1, 5, 2, 0, 1]),
      }),
    /fuera de opciones válidas/i
  );
});

test('PSYC-09: Equivalencia exacta captura digital vs secuencia numérica legada en los 6 instrumentos', () => {
  for (const id of ACTIVE_INSTRUMENT_IDS) {
    const cfg = resolveInstrumentConfig(id);
    const defaultOpt = cfg.responseOptions[1]?.value ?? cfg.responseOptions[0].value;
    const responses = cfg.items.map((it, idx) => {
      if (it.pendingAuthorizedText) return { itemId: it.itemId, numericCode: null };
      const opts =
        cfg.sectionResponseOptions && cfg.sectionResponseOptions[it.section]
          ? cfg.sectionResponseOptions[it.section]
          : cfg.responseOptions;
      return { itemId: it.itemId, numericCode: opts[idx % opts.length]?.value ?? defaultOpt };
    });

    const eq = verifyCaptureEquivalence(id, responses, cfg.version, 'manual_estandar');
    assert.equal(eq.equivalent, true, `${id} debe producir paridad digital === secuencia legada`);
    assert.equal(eq.maxSubscaleDiff, 0);
  }
});

test('PSYC-10 y PSYC-11: Persistencia 3 niveles, borradores, bloqueo HTTP 409, recálculo y alerta longitudinal de versiones', async () => {
  const { patient } = await createPatient({
    nombre_completo: 'Paciente Prueba Centro Psicometrico',
    fecha_nacimiento: '1990-05-12',
    edad: 36,
    sexo: 'M',
    estado: 'Ambulatorio',
    es_dato_prueba: 1,
  });

  // 1. Guardar borrador incompleto de EROS
  const cfgEros = resolveInstrumentConfig('EROS');
  const draftRes = await route({
    method: 'POST',
    pathname: '/api/psychometrics/evaluations',
    query: new URLSearchParams(),
    body: {
      patient_id: patient.patient_id,
      instrument_id: 'EROS',
      evaluator: 'psicologo_test',
      application_status: 'draft',
      responses: [{ itemId: 'EROS_1', numericCode: 4 }],
    },
  });
  assert.equal(draftRes.status, 200);
  const draftId = draftRes.body.evaluation.evaluation_id;
  assert.equal(draftRes.body.evaluation.application_status, 'draft');

  // 2. Completar el borrador y cerrarlo en los 3 niveles
  const fullEros = cfgEros.items.map((it) => ({ itemId: it.itemId, numericCode: 3 }));
  const closeRes = await route({
    method: 'POST',
    pathname: '/api/psychometrics/evaluations',
    query: new URLSearchParams(),
    body: {
      evaluation_id: draftId,
      patient_id: patient.patient_id,
      instrument_id: 'EROS',
      evaluator: 'psicologo_test',
      application_status: 'completed',
      responses: fullEros,
    },
  });
  assert.equal(closeRes.status, 201);
  assert.equal(closeRes.body.evaluation.application_status, 'completed');
  assert.equal(closeRes.body.responses.length, 10);
  assert.equal(closeRes.body.latestResult.total_score, 25); // 5 directos(3)*5 + 5 inversos(2)*5 = 25

  // 3. Intentar sobrescribir evaluación completada -> HTTP 409 Conflict
  await assert.rejects(
    () =>
      route({
        method: 'POST',
        pathname: '/api/psychometrics/evaluations',
        query: new URLSearchParams(),
        body: {
          evaluation_id: draftId,
          patient_id: patient.patient_id,
          instrument_id: 'EROS',
          evaluator: 'otro',
          application_status: 'completed',
          responses: fullEros,
        },
      }),
    (err) => err.httpStatus === 409 && err.code === 'CONFLICT'
  );

  // 4. Recalcular conservando intactas las 10 respuestas originales
  const recalc = await route({
    method: 'POST',
    pathname: `/api/psychometrics/evaluations/${draftId}/recalculate`,
    query: new URLSearchParams(),
    body: {},
  });
  assert.equal(recalc.status, 200);
  assert.equal(recalc.body.resultsHistory.length, 2);
  assert.equal(recalc.body.responses.length, 10);

  // 5. Registrar BADS-22 seguido de BADS-25 para verificar alerta longitudinal de mezcla de versiones
  const cfgBads22 = resolveInstrumentConfig('BADS', 'v22.0-tus-nct07395700');
  const cfgBads25 = resolveInstrumentConfig('BADS', 'v25.0-barraca2011');

  await route({
    method: 'POST',
    pathname: '/api/psychometrics/evaluations',
    query: new URLSearchParams(),
    body: {
      patient_id: patient.patient_id,
      instrument_id: 'BADS',
      instrument_version: 'v22.0-tus-nct07395700',
      evaluator: 'psicologo_test',
      application_status: 'completed',
      started_at: '2026-10-01T10:00:00.000Z',
      completed_at: '2026-10-01T10:15:00.000Z',
      responses: cfgBads22.items.map((it) => ({ itemId: it.itemId, numericCode: 3 })),
    },
  });

  await route({
    method: 'POST',
    pathname: '/api/psychometrics/evaluations',
    query: new URLSearchParams(),
    body: {
      patient_id: patient.patient_id,
      instrument_id: 'BADS',
      instrument_version: 'v25.0-barraca2011',
      evaluator: 'psicologo_test',
      application_status: 'completed',
      started_at: '2026-10-15T10:00:00.000Z',
      completed_at: '2026-10-15T10:15:00.000Z',
      responses: cfgBads25.items.map((it) => ({ itemId: it.itemId, numericCode: 4 })),
    },
  });

  const histRes = await route({
    method: 'GET',
    pathname: `/api/patients/${patient.patient_id}/psychometrics`,
    query: new URLSearchParams(),
    body: null,
  });
  assert.equal(histRes.status, 200);
  const badsSummary = histRes.body.longitudinal_by_instrument.BADS;
  assert.equal(badsSummary.completed_count, 2);
  assert.equal(badsSummary.versionMismatchWarning, true);
  assert.ok(badsSummary.versionWarningMessage.includes('P4, P10 y P16'));
});

test.after(() => {
  closeDatabase();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
