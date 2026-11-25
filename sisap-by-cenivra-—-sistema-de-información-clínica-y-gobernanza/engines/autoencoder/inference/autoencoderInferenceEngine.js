/**
 * @module autoencoderInferenceEngine
 * @description Motor determinista de inferencia y reconstrucción del Autoencoder TUS en Node.js (ESM).
 * Implementa paridad numérica exacta con el pipeline de 5 capas en R (R/01..R/07):
 *   - Capa 1 & 1B: Validación D-06 estricta (prohibida imputación silenciosa con ceros).
 *   - Capa 2: Puntuación psicométrica independiente (BIS-11, BADS, EROS, GAD-7, STAXI-2, BSL-23).
 *   - Capa 3: Variables derivadas, compuestos Nivel 2B y separación explícita EROS / tiempo_consumo.
 *   - Capa 4: Winsorización [q01, q99] y estandarización Z-score con parámetros fijos de cohorte (N = 166).
 *   - Capa 5: Encoder (SELU) + Decoder (SELU) con verificación SHA-256 contra model_registry.json.
 * Soporta además el prototipo confirmatorio aislado ae_tus_17to12_m3k12 (17 -> 24 -> 12 -> 24 -> 17).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { analyzeLatentProfile } from '../embeddings/latentSpaceAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ENGINE_ROOT = path.resolve(__dirname, '..');

export const SELU_ALPHA = 1.6732632423543772848170429916717;
export const SELU_SCALE = 1.0507009873554804934193349852946;

export const ORDEN_CANONICO_24 = Object.freeze([
  'BIS_11BIS_motor',
  'BIS_11BIS_nonplanning',
  'BIS_11BIS_cognitive_instability',
  'BIS_11BIS_perseverance',
  'BIS_11BIS_motor_impulsivity',
  'BIS_11BIS_total_calculado',
  'compuesto_bis',
  'STAXI_2STAXI_state',
  'STAXI_2STAXI_trait',
  'STAXI_2STAXI_temperamento',
  'compuesto_staxi',
  'BSL_23BSL_general',
  'BSL_23BSL_total_integrado',
  'compuesto_bsl',
  'GAD_7GAD_zscore',
  'BADS_bads_activation',
  'BADS_bads_avoidance',
  'BADS_bads_work',
  'BADS_bads_social',
  'edad',
  'tiempo_consumo',
  'trat_previos',
  'tiempo_consumoEROS',
  'trat_previosEROS',
]);

export const ORDEN_CANONICO_22 = Object.freeze(
  ORDEN_CANONICO_24.filter((v) => v !== 'STAXI_2STAXI_temperamento' && v !== 'compuesto_staxi')
);

export const ORDEN_CANDIDATO_17 = Object.freeze([
  'bis_atencion',
  'bis_motor',
  'bis_autocontrol',
  'bis_inestabilidad_cognitiva',
  'bis_perseverancia',
  'bis_impulsividad_motora',
  'bis_impulsividad_no_planeada',
  'staxi_estado',
  'staxi_rasgo',
  'bsl_total',
  'bsl_conductual',
  'gad_total',
  'bads_activacion',
  'bads_evitacion_rumia',
  'bads_afectacion_trabajo',
  'bads_afectacion_social',
  'eros_total',
]);

const RANGOS_REFERENCIA_17 = Object.freeze([
  [0, 19],
  [0, 26],
  [0, 21],
  [0, 12],
  [0, 15],
  [0, 35],
  [0, 44],
  [15, 63],
  [10, 40],
  [0, 85],
  [0, 35],
  [0, 21],
  [0, 42],
  [0, 48],
  [0, 30],
  [0, 30],
  [0, 40],
]);

const cachedStateByRoot = new Map();

/**
 * Calcula el hash SHA-256 en minúsculas de un archivo en disco.
 * @param {string} filePath
 * @returns {string}
 */
export function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex').toLowerCase();
}

/**
 * Función de activación SELU exacta de Keras/TensorFlow.
 * @param {number} x
 * @returns {number}
 */
export function seluKeras(x) {
  return x > 0 ? SELU_SCALE * x : SELU_SCALE * SELU_ALPHA * (Math.exp(x) - 1.0);
}

/**
 * Carga y verifica mediante SHA-256 el registro oficial de modelos y los parámetros de preprocesamiento.
 * @param {string} [engineRootDir]
 * @returns {{ engineRoot: string, registry: object, refParams: object, integrityReport: object }}
 */
export function loadVerifiedRegistryAndArtifacts(engineRootDir = DEFAULT_ENGINE_ROOT) {
  const resolvedRoot = path.resolve(engineRootDir || DEFAULT_ENGINE_ROOT);
  if (cachedStateByRoot.has(resolvedRoot)) {
    return cachedStateByRoot.get(resolvedRoot);
  }

  const registryPath = path.join(resolvedRoot, 'models', 'model_registry.json');
  if (!fs.existsSync(registryPath)) {
    throw new Error(`[CAPA 5 ERROR] No se encontró model_registry.json en: ${registryPath}`);
  }
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  const hashesObserved = {};
  for (const [relPath, expectedSha] of Object.entries(registry.artifacts_sha256 || {})) {
    const absPath = path.join(resolvedRoot, relPath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`[CAPA 5 ERROR DE INTEGRIDAD D-07] Artefacto ausente: ${relPath}`);
    }
    const observed = sha256File(absPath);
    if (observed !== String(expectedSha).toLowerCase()) {
      throw new Error(
        `[CAPA 5 ERROR DE INTEGRIDAD D-07] SHA-256 inválido en ${relPath}: esperado ${expectedSha}, observado ${observed}.`
      );
    }
    hashesObserved[relPath] = observed;
  }

  const refPath = path.join(resolvedRoot, 'preprocessing', 'parametros_referencia_completos.json');
  const refParams = JSON.parse(fs.readFileSync(refPath, 'utf8'));

  const bundle = {
    engineRoot: resolvedRoot,
    registry,
    refParams,
    integrityReport: {
      verified: true,
      verified_artifacts_count: Object.keys(hashesObserved).length,
      hashes_observed: hashesObserved,
    },
    modelsCache: new Map(),
  };

  cachedStateByRoot.set(resolvedRoot, bundle);
  return bundle;
}

/**
 * Carga un modelo verificado (pesos Encoder + Decoder completos) desde JSON.
 * @param {'encoder_22_checkpoint_fase2'|'encoder_24_deployed'|'ae_tus_17to12_m3k12'} [modelId]
 * @param {string} [engineRootDir]
 * @returns {object}
 */
export function loadAutoencoderModel(modelId = 'encoder_22_checkpoint_fase2', engineRootDir = DEFAULT_ENGINE_ROOT) {
  const bundle = loadVerifiedRegistryAndArtifacts(engineRootDir);
  if (bundle.modelsCache.has(modelId)) {
    return bundle.modelsCache.get(modelId);
  }
  const meta = bundle.registry.models?.[modelId];
  if (!meta) {
    throw new Error(`[CAPA 5 ERROR] Modelo no registrado en model_registry.json: ${modelId}`);
  }
  const weightsAbs = path.join(bundle.engineRoot, meta.weights_file);
  if (!fs.existsSync(weightsAbs)) {
    throw new Error(`[CAPA 5 ERROR] Archivo de pesos no encontrado: ${weightsAbs}`);
  }
  const weights = JSON.parse(fs.readFileSync(weightsAbs, 'utf8'));
  const modelObj = {
    modelId,
    meta,
    weights,
    weightsJsonSha256: bundle.integrityReport.hashes_observed[meta.weights_file] || sha256File(weightsAbs),
  };
  bundle.modelsCache.set(modelId, modelObj);
  return modelObj;
}

function sumByOneBasedIndices(arr, oneBasedIndices) {
  let acc = 0;
  for (const idx of oneBasedIndices) {
    acc += arr[idx - 1];
  }
  return acc;
}

function validateScalarNumber(val, fieldName, minV, maxV, addIncident, required = true) {
  if (val === undefined || val === null || val === '' || (typeof val === 'number' && Number.isNaN(val))) {
    if (required) {
      addIncident(fieldName, 'MISSING_REQUIRED_FIELD', `El campo obligatorio '${fieldName}' está ausente.`);
    }
    return null;
  }
  if (typeof val === 'boolean' || Array.isArray(val) || typeof val === 'object') {
    addIncident(fieldName, 'UNINTERPRETABLE_VALUE', `El campo '${fieldName}' debe ser un escalar numérico.`);
    return null;
  }
  const num = Number(val);
  if (!Number.isFinite(num)) {
    addIncident(fieldName, 'UNINTERPRETABLE_VALUE', `El campo '${fieldName}' ('${String(val)}') no es finito.`);
    return null;
  }
  if (num < minV || num > maxV) {
    addIncident(
      fieldName,
      'OUT_OF_RANGE_VALUE',
      `El campo '${fieldName}' = ${num.toFixed(2)} está fuera del rango admisible [${minV}, ${maxV}].`
    );
  }
  return num;
}

function validateItemsArray(items, scaleName, expectedCount, minVal, maxVal) {
  const incidents = [];
  const addInc = (tipo, detalle) => {
    incidents.push({ escala: scaleName, categoria_d06: tipo, mensaje: detalle });
  };

  if (items === undefined || items === null) {
    addInc('MISSING_REQUIRED_FIELD', `No se proporcionó el vector de respuestas para ${scaleName}.`);
    return { valido: false, items_num: null, incidents };
  }
  if (!Array.isArray(items) || items.length !== expectedCount) {
    const got = Array.isArray(items) ? items.length : 'no-array';
    addInc('UNINTERPRETABLE_VALUE', `${scaleName} requiere exactamente ${expectedCount} ítems, pero recibió ${got}.`);
    return { valido: false, items_num: null, incidents };
  }

  const parsed = new Array(expectedCount);
  const missingIdx = [];
  const badIdx = [];
  const outOfRangeIdx = [];
  const outOfRangeVals = [];

  for (let i = 0; i < expectedCount; i++) {
    const rawVal = items[i];
    if (rawVal === undefined || rawVal === null || (typeof rawVal === 'string' && rawVal.trim() === '')) {
      missingIdx.push(i + 1);
      parsed[i] = null;
      continue;
    }
    if (typeof rawVal === 'boolean' || typeof rawVal === 'object') {
      badIdx.push(i + 1);
      parsed[i] = null;
      continue;
    }
    const num = Number(rawVal);
    if (!Number.isFinite(num)) {
      badIdx.push(i + 1);
      parsed[i] = null;
      continue;
    }
    parsed[i] = num;
    if (num < minVal || num > maxVal) {
      outOfRangeIdx.push(i + 1);
      outOfRangeVals.push(num);
    }
  }

  if (badIdx.length > 0) {
    addInc(
      'UNINTERPRETABLE_VALUE',
      `${scaleName} contiene valores no interpretables en los ítems: ${badIdx.join(', ')}.`
    );
  }
  if (missingIdx.length > 0) {
    addInc(
      'MISSING_ITEM_RESPONSE',
      `${scaleName} presenta ${missingIdx.length} respuesta(s) de ítem ausente(s) en posiciones: ${missingIdx.join(', ')}.`
    );
  }
  if (outOfRangeIdx.length > 0) {
    addInc(
      'OUT_OF_RANGE_VALUE',
      `${scaleName} presenta valores fuera del rango [${minVal}, ${maxVal}] en ítems ${outOfRangeIdx.join(', ')} (valores: ${outOfRangeVals.join(', ')}).`
    );
  }

  return {
    valido: incidents.length === 0,
    items_num: parsed,
    n_esperado: expectedCount,
    n_ausentes: missingIdx.length,
    n_fuera_rango: outOfRangeIdx.length,
    incidents,
  };
}

/**
 * Capa 1 & 1B: Validación D-06 estricta sin imputación silenciosa.
 * @param {object} payload
 * @param {string} [defaultMode='excel_canonico']
 * @returns {object}
 */
export function validateInputLayer1B(payload, defaultMode = 'excel_canonico') {
  if (!payload || typeof payload !== 'object') {
    return {
      capa: 'CAPA_1B_VALIDACION_ESQUEMA',
      valido: false,
      n_incidencias: 1,
      incidencias: [{ campo: 'payload', categoria_d06: 'MISSING_REQUIRED_FIELD', mensaje: 'Payload inválido o vacío.' }],
    };
  }

  const incidents = [];
  const addScalarIncident = (campo, tipo, mensaje) => {
    incidents.push({ campo, categoria_d06: tipo, mensaje });
  };

  const edadV = validateScalarNumber(payload.edad, 'edad', 12, 100, addScalarIncident, true);
  const tcV = validateScalarNumber(payload.tiempo_consumo, 'tiempo_consumo', 0, 80, addScalarIncident, true);
  validateScalarNumber(payload.trat_previos, 'trat_previos', 0, 50, addScalarIncident, true);

  if (edadV !== null && tcV !== null && tcV > edadV) {
    addScalarIncident(
      'tiempo_consumo',
      'OUT_OF_RANGE_VALUE',
      `Inconsistencia temporal: tiempo_consumo (${tcV.toFixed(1)} años) excede edad (${edadV.toFixed(1)} años).`
    );
  }

  const specs = {
    bis11: { n_items: 30, min_estandar: 1, max_estandar: 4, min_excel: 0, max_excel: 4 },
    bads: { n_items: 25, min_val: 0, max_val: 6 },
    eros: { n_items: 10, min_estandar: 1, max_estandar: 4, min_excel: 0, max_excel: 4 },
    gad7: { n_items: 7, min_val: 0, max_val: 3 },
    staxi2: { n_items: 49, min_val: 1, max_val: 4 },
    bsl23: { n_items: 23, n_conductuales: 11, min_val: 0, max_val: 4 },
  };

  const details = {};
  for (const [esc, spec] of Object.entries(specs)) {
    const bloque = payload[esc];
    if (!bloque || typeof bloque !== 'object') {
      addScalarIncident(esc, 'MISSING_REQUIRED_FIELD', `Falta el bloque del instrumento '${esc}'.`);
      continue;
    }

    if (bloque.respuestas !== undefined && bloque.respuestas !== null) {
      const modo = bloque.modo_captura || defaultMode || 'items_crudos';
      const minR = spec.min_val !== undefined ? spec.min_val : modo === 'excel_canonico' ? spec.min_excel : spec.min_estandar;
      const maxR = spec.max_val !== undefined ? spec.max_val : modo === 'excel_canonico' ? spec.max_excel : spec.max_estandar;
      const resV = validateItemsArray(bloque.respuestas, esc, spec.n_items, minR, maxR);
      details[esc] = resV;
      if (!resV.valido) {
        incidents.push(...resV.incidents);
      }
      if (esc === 'bsl23') {
        if (bloque.respuestas_conductuales !== undefined && bloque.respuestas_conductuales !== null) {
          const resBeh = validateItemsArray(bloque.respuestas_conductuales, 'bsl23_conductual', spec.n_conductuales, 0, 4);
          if (!resBeh.valido) incidents.push(...resBeh.incidents);
        } else {
          addScalarIncident(
            'bsl23.respuestas_conductuales',
            'MISSING_REQUIRED_FIELD',
            "BSL-23 requiere los 11 ítems conductuales para calcular 'Total Integrado' del pipeline canónico."
          );
        }
        validateScalarNumber(bloque.general_score_0_1, 'bsl23.general_score_0_1', 0.0, 1.0, addScalarIncident, true);
      }
    } else if (bloque.subescalas_precalculadas && typeof bloque.subescalas_precalculadas === 'object') {
      details[esc] = { valido: true, modo: 'subescalas_precalculadas' };
    } else {
      addScalarIncident(
        esc,
        'MISSING_REQUIRED_FIELD',
        `El instrumento '${esc}' no contiene 'respuestas' ni 'subescalas_precalculadas'.`
      );
    }
  }

  return {
    capa: 'CAPA_1B_VALIDACION_ESQUEMA',
    valido: incidents.length === 0,
    n_incidencias: incidents.length,
    incidencias: incidents,
    detalles_escalas: details,
  };
}

/**
 * Capa 2: Puntuación psicométrica de los 6 instrumentos preservando ítems crudos, invertidos y subescalas.
 * @param {object} payload
 * @param {'excel_canonico'|'manual_estandar'} [modoScoring='excel_canonico']
 * @returns {object}
 */
export function scoreInstrumentsLayer2(payload, modoScoring = 'excel_canonico') {
  // 1. BIS-11
  let resBis;
  if (payload.bis11?.subescalas_precalculadas) {
    const sp = payload.bis11.subescalas_precalculadas;
    resBis = {
      instrumento: 'BIS-11',
      modo_aplicado: 'precalculado_excel',
      items_raw: payload.bis11.respuestas || null,
      subescalas_primer_orden: {
        attention: Number(sp.Atencion),
        cognitive_instability: Number(sp.Inestabilidad_Cognitiva),
        motor: Number(sp.Motor),
        perseverance: Number(sp.Perseverancia),
        self_control: Number(sp.Autocontrol),
        self_control_inverted_nonplanning: 21.0 - Number(sp.Autocontrol),
        cognitive_complexity: Number(sp.Complejidad_Cognitiva),
      },
      subescalas_segundo_orden: {
        motor_impulsivity: Number(sp.Impulsividad_Motora),
        nonplanning_factor: Number(sp.Impulsividad_no_planeada),
      },
      totales: { total_bruto_30_items: Number(sp.Total) },
    };
  } else {
    const raw = payload.bis11.respuestas.map(Number);
    const reversePatton = new Set([1, 7, 8, 9, 10, 12, 13, 15, 20, 29, 30]);
    const scored = raw.map((v, i) => (modoScoring === 'manual_estandar' && reversePatton.has(i + 1) ? 5 - v : v));
    const idxAtencion = modoScoring === 'manual_estandar' ? [5, 9, 11, 20, 28] : [6, 9, 11, 20, 28];

    const subAtencion = sumByOneBasedIndices(scored, idxAtencion);
    const subCi = sumByOneBasedIndices(scored, [6, 24, 26]);
    const subMotor = sumByOneBasedIndices(scored, [2, 3, 4, 17, 19, 22, 25]);
    const subPer = sumByOneBasedIndices(scored, [16, 21, 23, 30]);
    const subAuto = sumByOneBasedIndices(scored, [1, 7, 8, 12, 13, 14]);
    const subCc = sumByOneBasedIndices(scored, [10, 15, 18, 27, 29]);
    const subAutoInv = 21.0 - subAuto;

    const subImpCog = sumByOneBasedIndices(scored, [4, 7, 10, 13, 16, 19, 24, 27]);
    const subImpMot = sumByOneBasedIndices(scored, [2, 6, 9, 12, 15, 18, 21, 23, 26, 29]);
    const subImpNp = sumByOneBasedIndices(scored, [1, 3, 5, 8, 11, 14, 17, 20, 22, 25, 28, 30]);

    resBis = {
      instrumento: 'BIS-11',
      modo_aplicado: modoScoring,
      items_raw: raw,
      items_scored: scored,
      subescalas_primer_orden: {
        attention: subAtencion,
        cognitive_instability: subCi,
        motor: subMotor,
        perseverance: subPer,
        self_control: subAuto,
        self_control_inverted_nonplanning: subAutoInv,
        cognitive_complexity: subCc,
      },
      subescalas_segundo_orden: {
        impulsividad_cognitiva: subImpCog,
        motor_impulsivity: subImpMot,
        nonplanning_factor: subImpNp,
      },
      totales: { total_bruto_30_items: subImpCog + subImpMot + subImpNp },
    };
  }

  // 2. BADS
  let resBads;
  if (payload.bads?.subescalas_precalculadas) {
    const sp = payload.bads.subescalas_precalculadas;
    const act = Number(sp.Activacion);
    const av = Number(sp.Evitacion_Rumia);
    const wk = Number(sp.Afectacion_trabajo);
    const soc = Number(sp.Afectacion_social);
    resBads = {
      instrumento: 'BADS',
      modo_aplicado: 'precalculado_excel',
      items_raw: payload.bads.respuestas || null,
      subescalas: { activation: act, avoidance: av, work: wk, social: soc },
      totales: { suma_directa_subescalas: act + av + wk + soc },
    };
  } else {
    const raw = payload.bads.respuestas.map(Number);
    const revTotal = new Set([1, 2, 6, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25]);
    const scoredTotal = raw.map((v, i) => (revTotal.has(i + 1) ? 6 - v : v));
    const act = sumByOneBasedIndices(raw, [3, 4, 5, 7, 11, 12, 23]);
    const av = sumByOneBasedIndices(raw, [8, 9, 10, 13, 14, 15, 24, 25]);
    const wk = sumByOneBasedIndices(raw, [1, 2, 6, 21, 22]);
    const soc = sumByOneBasedIndices(raw, [16, 17, 18, 19, 20]);
    resBads = {
      instrumento: 'BADS',
      items_raw: raw,
      items_scored_para_total: scoredTotal,
      subescalas: { activation: act, avoidance: av, work: wk, social: soc },
      totales: {
        total_bads_invertido: scoredTotal.reduce((a, b) => a + b, 0),
        suma_directa_subescalas: act + av + wk + soc,
      },
    };
  }

  // 3. EROS
  let resEros;
  if (payload.eros?.subescalas_precalculadas) {
    const sp = payload.eros.subescalas_precalculadas;
    const tot = Number(sp.EROS_Total);
    resEros = {
      instrumento: 'EROS',
      modo_aplicado: 'precalculado_excel',
      items_raw: payload.eros.respuestas || null,
      totales: { eros_total_activo: tot, eros_total_suma_directa_excel: tot },
    };
  } else {
    const raw = payload.eros.respuestas.map(Number);
    const revBarraca = new Set([2, 5, 6, 7, 9]);
    const invManual = raw.map((v, i) => (revBarraca.has(i + 1) ? 5 - v : v));
    const directSum = raw.reduce((a, b) => a + b, 0);
    const manualSum = invManual.reduce((a, b) => a + b, 0);
    resEros = {
      instrumento: 'EROS',
      modo_aplicado: modoScoring,
      items_raw: raw,
      items_scored: modoScoring === 'excel_canonico' ? raw : invManual,
      items_scored_manual_barraca: invManual,
      totales: {
        eros_total_activo: modoScoring === 'excel_canonico' ? directSum : manualSum,
        eros_total_suma_directa_excel: directSum,
        eros_total_manual_invertido: manualSum,
      },
    };
  }

  // 4. GAD-7
  let resGad;
  if (payload.gad7?.subescalas_precalculadas) {
    const gadTot = Number(payload.gad7.subescalas_precalculadas.GAD_Total);
    resGad = {
      instrumento: 'GAD-7',
      modo_aplicado: 'precalculado_excel',
      items_raw: payload.gad7.respuestas || null,
      totales: {
        gad_total_bruto: gadTot,
        severidad_clinica: gadTot <= 4 ? 'minima' : gadTot <= 9 ? 'leve' : gadTot <= 14 ? 'moderada' : 'severa',
      },
    };
  } else {
    const raw = payload.gad7.respuestas.map(Number);
    const gadTot = raw.reduce((a, b) => a + b, 0);
    resGad = {
      instrumento: 'GAD-7',
      items_raw: raw,
      items_scored: raw,
      totales: {
        gad_total_bruto: gadTot,
        severidad_clinica: gadTot <= 4 ? 'minima' : gadTot <= 9 ? 'leve' : gadTot <= 14 ? 'moderada' : 'severa',
      },
    };
  }

  // 5. STAXI-2
  let resStaxi;
  if (payload.staxi2?.subescalas_precalculadas) {
    const sp = payload.staxi2.subescalas_precalculadas;
    resStaxi = {
      instrumento: 'STAXI-2',
      modo_aplicado: 'precalculado_excel',
      items_raw: payload.staxi2.respuestas || null,
      subescalas: { temperamento: Number(sp.TEMP), sentimiento: Number(sp.SENT) },
      totales: { state_total: Number(sp.TOTAL_ESTADO), trait_total: Number(sp.TOTAL_RASGO) },
    };
  } else {
    const raw = payload.staxi2.respuestas.map(Number);
    const sent = sumByOneBasedIndices(raw, [1, 2, 3, 5, 7]);
    const expf = sumByOneBasedIndices(raw, [4, 8, 11, 13, 14]);
    const expv = sumByOneBasedIndices(raw, [6, 9, 10, 12, 15]);
    const temp = sumByOneBasedIndices(raw, [16, 17, 18, 20, 23]);
    const reacc = sumByOneBasedIndices(raw, [19, 21, 22, 24, 25]);
    const eext = sumByOneBasedIndices(raw, [27, 29, 31, 34, 38, 40]);
    const eint = sumByOneBasedIndices(raw, [28, 32, 35, 37, 39, 42]);
    const cext = sumByOneBasedIndices(raw, [26, 30, 33, 36, 41, 43]);
    const cint = sumByOneBasedIndices(raw, [44, 45, 46, 47, 48, 49]);
    resStaxi = {
      instrumento: 'STAXI-2',
      items_raw: raw,
      items_scored: raw,
      subescalas: {
        sentimiento: sent,
        expresion_fisica: expf,
        expresion_verbal: expv,
        temperamento: temp,
        reaccion: reacc,
        expresion_externa: eext,
        expresion_interna: eint,
        control_externo: cext,
        control_interno: cint,
      },
      totales: {
        state_total: sent + expf + expv,
        trait_total: temp + reacc,
        indice_expresion_ira_iei: eext + eint - (cext + cint) + 36,
      },
    };
  }

  // 6. BSL-23
  let resBsl;
  if (payload.bsl23?.subescalas_precalculadas) {
    const sp = payload.bsl23.subescalas_precalculadas;
    resBsl = {
      instrumento: 'BSL-23',
      modo_aplicado: 'precalculado_excel',
      items_raw_nucleo: payload.bsl23.respuestas || null,
      subescalas: {
        bsl_general_col_AA: Number(sp.GENERAL),
        bsl_conductual_11_items: Number(sp.BSL_23_Conductual),
      },
      totales: {
        bsl_23_total: Number(sp.BSL_23_Total),
        bsl_total_integrado: Number(sp.Total_Integrado),
      },
    };
  } else {
    const rawNuc = payload.bsl23.respuestas.map(Number);
    const rawBeh = payload.bsl23.respuestas_conductuales.map(Number);
    const genVal = Number(payload.bsl23.general_score_0_1);
    const bsl23Total = rawNuc.reduce((a, b) => a + b, 0);
    const bslBehTotal = rawBeh.reduce((a, b) => a + b, 0);
    resBsl = {
      instrumento: 'BSL-23',
      items_raw_nucleo: rawNuc,
      items_raw_conductuales: rawBeh,
      subescalas: {
        bsl_general_col_AA: genVal,
        bsl_media_23_items: bsl23Total / 23.0,
        bsl_conductual_11_items: bslBehTotal,
      },
      totales: {
        bsl_23_total: bsl23Total,
        bsl_total_integrado: bsl23Total + bslBehTotal,
      },
    };
  }

  return {
    capa: 'CAPA_2_PUNTUACION_INSTRUMENTOS',
    id_registro: payload.id_registro ? String(payload.id_registro) : 'ANON_UNSPECIFIED',
    puntuaciones: {
      bis11: resBis,
      bads: resBads,
      eros: resEros,
      gad7: resGad,
      staxi2: resStaxi,
      bsl23: resBsl,
    },
  };
}

/**
 * Capa 3: Cálculo de compuestos Nivel 2B y separación explícita EROS / tiempo_consumo.
 * @param {object} payload
 * @param {object} capa2
 * @param {object} refParams
 * @returns {object}
 */
export function computeDerivedVariablesLayer3(payload, capa2, refParams) {
  const p2 = capa2.puntuaciones;
  const edadRaw = Number(payload.edad);
  const tiempoConsumoRaw = Number(payload.tiempo_consumo);
  const tratPreviosRaw = Number(payload.trat_previos);
  const erosRaw = Number(p2.eros.totales.eros_total_activo);

  const sustRaw = String(payload.sustancia_principal || 'Desconocida').trim().toLowerCase();
  const dummyCannabis = sustRaw === 'cannabis' ? 1.0 : 0.0;

  const erosTiempoConsumo =
    payload.tiempo_consumo_hoja_eros !== undefined && payload.tiempo_consumo_hoja_eros !== null
      ? Number(payload.tiempo_consumo_hoja_eros)
      : tiempoConsumoRaw;
  const erosTratPrevios =
    payload.trat_previos_hoja_eros !== undefined && payload.trat_previos_hoja_eros !== null
      ? Number(payload.trat_previos_hoja_eros)
      : tratPreviosRaw;

  const bisP = refParams.bis_total_calculado_z_params.parametros_cohorte_166;
  const bisAtt = p2.bis11.subescalas_primer_orden.attention;
  const bisMot = p2.bis11.subescalas_primer_orden.motor;
  const bisNon = p2.bis11.subescalas_primer_orden.self_control_inverted_nonplanning;
  const bisCi = p2.bis11.subescalas_primer_orden.cognitive_instability;
  const bisPer = p2.bis11.subescalas_primer_orden.perseverance;
  const bisMi = p2.bis11.subescalas_segundo_orden.motor_impulsivity;

  const zAtt = (bisAtt - bisP.Atencion.mean) / bisP.Atencion.sd;
  const zMot = (bisMot - bisP.Motor.mean) / bisP.Motor.sd;
  const zNon = (bisNon - bisP.bis_nonplanning.mean) / bisP.bis_nonplanning.sd;
  const bisTotalCalculado = zAtt + zMot + zNon;

  const cbP = refParams.compuestos_nivel_2B_z_params.compuesto_bis;
  const compuestoBis =
    ((bisMot - cbP['BIS.11_bis_motor'].mean) / cbP['BIS.11_bis_motor'].sd +
      (bisNon - cbP['BIS.11_bis_nonplanning'].mean) / cbP['BIS.11_bis_nonplanning'].sd +
      (bisCi - cbP['BIS.11_bis_cognitive_instability'].mean) / cbP['BIS.11_bis_cognitive_instability'].sd +
      (bisPer - cbP['BIS.11_bis_perseverance'].mean) / cbP['BIS.11_bis_perseverance'].sd +
      (bisMi - cbP['BIS.11_bis_motor_impulsivity'].mean) / cbP['BIS.11_bis_motor_impulsivity'].sd +
      (bisTotalCalculado - cbP['BIS.11_bis_total_calculado'].mean) / cbP['BIS.11_bis_total_calculado'].sd +
      (dummyCannabis - cbP.sustancia_sustanciaCannabis.mean) / cbP.sustancia_sustanciaCannabis.sd) /
    7.0;

  const staxiState = p2.staxi2.totales.state_total;
  const staxiTrait = p2.staxi2.totales.trait_total;
  const staxiTemp = p2.staxi2.subescalas.temperamento;
  const csP = refParams.compuestos_nivel_2B_z_params.compuesto_staxi;
  const compuestoStaxi =
    ((staxiState - csP['STAXI.2_staxi_state'].mean) / csP['STAXI.2_staxi_state'].sd +
      (staxiTrait - csP['STAXI.2_staxi_trait'].mean) / csP['STAXI.2_staxi_trait'].sd +
      (staxiTemp - csP['STAXI.2_staxi_temperamento'].mean) / csP['STAXI.2_staxi_temperamento'].sd) /
    3.0;

  const bslGen = p2.bsl23.subescalas.bsl_general_col_AA;
  const bslTi = p2.bsl23.totales.bsl_total_integrado;
  const cbslP = refParams.compuestos_nivel_2B_z_params.compuesto_bsl;
  const compuestoBsl =
    ((bslGen - cbslP['BSL.23_bsl_general'].mean) / cbslP['BSL.23_bsl_general'].sd +
      (bslTi - cbslP['BSL.23_bsl_total_integrado'].mean) / cbslP['BSL.23_bsl_total_integrado'].sd) /
    2.0;

  const gadTot = p2.gad7.totales.gad_total_bruto;
  const gadP = refParams.gad7_zscore_excel_params;
  const gadZscoreExcel = (gadTot - gadP.mean_X1_ref) / gadP.sd_Y1_ref;

  const vectorPreNormalizacion24 = {
    BIS_11BIS_motor: bisMot,
    BIS_11BIS_nonplanning: bisNon,
    BIS_11BIS_cognitive_instability: bisCi,
    BIS_11BIS_perseverance: bisPer,
    BIS_11BIS_motor_impulsivity: bisMi,
    BIS_11BIS_total_calculado: bisTotalCalculado,
    compuesto_bis: compuestoBis,
    STAXI_2STAXI_state: staxiState,
    STAXI_2STAXI_trait: staxiTrait,
    STAXI_2STAXI_temperamento: staxiTemp,
    compuesto_staxi: compuestoStaxi,
    BSL_23BSL_general: bslGen,
    BSL_23BSL_total_integrado: bslTi,
    compuesto_bsl: compuestoBsl,
    GAD_7GAD_zscore: gadZscoreExcel,
    BADS_bads_activation: p2.bads.subescalas.activation,
    BADS_bads_avoidance: p2.bads.subescalas.avoidance,
    BADS_bads_work: p2.bads.subescalas.work,
    BADS_bads_social: p2.bads.subescalas.social,
    edad: edadRaw,
    tiempo_consumo: tiempoConsumoRaw,
    trat_previos: tratPreviosRaw,
    tiempo_consumoEROS: erosTiempoConsumo,
    trat_previosEROS: erosTratPrevios,
  };

  return {
    capa: 'CAPA_3_VARIABLES_DERIVADAS',
    id_registro: capa2.id_registro,
    separacion_eros_tiempo_consumo: {
      EROS_raw: erosRaw,
      tiempo_consumo_raw: tiempoConsumoRaw,
      edad_raw: edadRaw,
      EROS_tiempo_consumo_derivado: erosTiempoConsumo,
      EROS_trat_previos_derivado: erosTratPrevios,
    },
    variables_derivadas: {
      BIS_11BIS_total_calculado: bisTotalCalculado,
      compuesto_bis: compuestoBis,
      compuesto_staxi: compuestoStaxi,
      compuesto_bsl: compuestoBsl,
      GAD_7GAD_zscore_intermedio: gadZscoreExcel,
      sustancia_sustanciaCannabis: dummyCannabis,
    },
    vector_pre_normalizacion_24: vectorPreNormalizacion24,
  };
}

/**
 * Capa 4: Selección por contrato, Winsorización [q01, q99] y Z-score único con parámetros fijos N=166.
 * @param {object} capa3
 * @param {object} refParams
 * @param {boolean} [applyWinsor=true]
 * @returns {object}
 */
export function preprocessLayer4(capa3, refParams, applyWinsor = true) {
  const vecBruto = capa3.vector_pre_normalizacion_24;
  const normDict = refParams.normalizacion_final_24;

  const winsorized24 = {};
  const zscore24 = {};
  const vector24Ordered = [];

  for (const v of ORDEN_CANONICO_24) {
    const rawVal = vecBruto[v];
    if (typeof rawVal !== 'number' || !Number.isFinite(rawVal)) {
      throw new Error(`[CAPA 4 VALIDACIÓN D-06 ERROR] Valor ausente o no finito en '${v}'.`);
    }
    const p = normDict[v];
    if (!p) {
      throw new Error(`[CAPA 4 ERROR] Faltan parámetros de referencia para '${v}'.`);
    }
    const wVal = applyWinsor ? Math.min(Math.max(rawVal, p.winsorize_q01_ref), p.winsorize_q99_ref) : rawVal;
    const zVal = (wVal - p.media_post_winsor_ref) / p.sd_post_winsor_ref;
    winsorized24[v] = wVal;
    zscore24[v] = zVal;
    vector24Ordered.push(zVal);
  }

  const vector22Ordered = ORDEN_CANONICO_22.map((v) => zscore24[v]);

  return {
    capa: 'CAPA_4_PREPROCESAMIENTO_ENCODER',
    id_registro: capa3.id_registro,
    vector_winsorizado_24: winsorized24,
    vector_preprocesado_24: zscore24,
    vector_entrada_24: vector24Ordered,
    vector_entrada_22: vector22Ordered,
    separacion_eros_tiempo_consumo_preproc: {
      EROS_raw: capa3.separacion_eros_tiempo_consumo.EROS_raw,
      EROS_preprocesado: null,
      tiempo_consumo_raw: capa3.separacion_eros_tiempo_consumo.tiempo_consumo_raw,
      tiempo_consumo_preprocesado: zscore24.tiempo_consumo,
      tiempo_consumoEROS_preprocesado: zscore24.tiempo_consumoEROS,
      edad_raw: capa3.separacion_eros_tiempo_consumo.edad_raw,
      edad_preprocesada: zscore24.edad,
    },
  };
}

/**
 * Multiplicación densa: out[j] = bias[j] + sum_i (vec[i] * kernel[i][j]) con activación opcional.
 * @param {number[]} vec
 * @param {number[][]} kernel2d Matriz [n_in][n_out]
 * @param {number[]} bias
 * @param {'selu'|'linear'} activation
 * @returns {number[]}
 */
export function forwardDense(vec, kernel2d, bias, activation) {
  const nIn = kernel2d.length;
  const nOut = bias.length;
  if (vec.length !== nIn) {
    throw new Error(`[CAPA 5 ERROR] Dimensionalidad inválida en capa densa: esperado ${nIn}, recibido ${vec.length}.`);
  }
  const out = new Array(nOut);
  for (let j = 0; j < nOut; j++) {
    let acc = bias[j];
    for (let i = 0; i < nIn; i++) {
      acc += vec[i] * kernel2d[i][j];
    }
    out[j] = activation === 'selu' ? seluKeras(acc) : acc;
  }
  return out;
}

/**
 * Capa 5: Pase hacia adelante completo Encoder (22/24 -> 32 -> 24 -> 12) + Decoder (12 -> 24 -> 32 -> 22/24).
 * @param {number[]} inputVecZ
 * @param {string[]} variableNames
 * @param {object} modelObj
 * @returns {object}
 */
export function runAutoencoderForwardPass(inputVecZ, variableNames, modelObj) {
  const w = modelObj.weights;
  if (inputVecZ.length !== w.n_input || variableNames.length !== w.n_input) {
    throw new Error(`[CAPA 5 ERROR] Se esperaban ${w.n_input} entradas para ${modelObj.modelId}.`);
  }
  if (!inputVecZ.every((v) => typeof v === 'number' && Number.isFinite(v))) {
    throw new Error('[CAPA 5 ERROR] El vector preprocesado contiene valores no finitos.');
  }

  // Encoder
  const h1 = forwardDense(inputVecZ, w.encoder_1_kernel, w.encoder_1_bias, 'selu');
  const h2 = forwardDense(h1, w.encoder_2_kernel, w.encoder_2_bias, 'selu');
  const zLatent = forwardDense(h2, w.bottleneck_kernel, w.bottleneck_bias, 'linear');

  // Decoder
  const d1 = forwardDense(zLatent, w.decoder_1_kernel, w.decoder_1_bias, 'selu');
  const d2 = forwardDense(d1, w.decoder_2_kernel, w.decoder_2_bias, 'selu');
  const xHatZ = forwardDense(d2, w.output_kernel, w.output_bias, 'linear');

  if (!zLatent.every(Number.isFinite) || !xHatZ.every(Number.isFinite)) {
    throw new Error('[CAPA 5 ERROR] Salida no finita detectada tras forward pass.');
  }

  const latentNamed = {};
  for (let i = 0; i < zLatent.length; i++) {
    latentNamed[`latent_${String(i + 1).padStart(2, '0')}`] = zLatent[i];
  }

  let sqSum = 0;
  let absSum = 0;
  const perVariable = variableNames.map((varName, idx) => {
    const err = inputVecZ[idx] - xHatZ[idx];
    const sqErr = err * err;
    sqSum += sqErr;
    absSum += Math.abs(err);
    return {
      variable: varName,
      input_z: inputVecZ[idx],
      reconstructed_z: xHatZ[idx],
      error_z: err,
      squared_error: sqErr,
    };
  });

  const mseZ = sqSum / variableNames.length;
  const maeZ = absSum / variableNames.length;

  return {
    model_id: modelObj.modelId,
    n_input: w.n_input,
    n_latent: zLatent.length,
    latent_vector: zLatent,
    dimensions: latentNamed,
    reconstruction: {
      reconstructed_z_vector: xHatZ,
      mse_z: mseZ,
      mae_z: maeZ,
      rmse_z: Math.sqrt(mseZ),
      per_variable: perVariable,
    },
  };
}

/**
 * Ejecuta el pipeline end-to-end (Capas 1..5 + análisis de espacio latente) para un registro de SISAP.
 * @param {object} payload
 * @param {{ modelId?: 'encoder_22_checkpoint_fase2'|'encoder_24_deployed', modoScoring?: 'excel_canonico'|'manual_estandar', engineRootDir?: string }} [options]
 * @returns {object}
 */
export function runFullPipelineSisap(payload, options = {}) {
  const modelId = options.modelId || 'encoder_22_checkpoint_fase2';
  const modoScoring = options.modoScoring || 'excel_canonico';
  const engineRootDir = options.engineRootDir || DEFAULT_ENGINE_ROOT;

  if (modelId !== 'encoder_22_checkpoint_fase2' && modelId !== 'encoder_24_deployed') {
    throw new Error(`[PIPELINE ERROR] Use inferCandidate17v() para el modelo confirmatorio '${modelId}'.`);
  }

  const v1 = validateInputLayer1B(payload, modoScoring);
  const registroId = payload?.id_registro ? String(payload.id_registro) : 'ANON_UNSPECIFIED';
  if (!v1.valido) {
    const nullDims = {};
    for (let i = 1; i <= 12; i++) {
      nullDims[`latent_${String(i).padStart(2, '0')}`] = null;
    }
    return {
      status: 'failed',
      stage_failed: 'CAPA_1_VALIDACION_ESQUEMA',
      registro_id: registroId,
      timestamp_utc: new Date().toISOString(),
      validation_summary: v1,
      dimensions: nullDims,
    };
  }

  const bundle = loadVerifiedRegistryAndArtifacts(engineRootDir);
  const modelObj = loadAutoencoderModel(modelId, engineRootDir);
  const c2 = scoreInstrumentsLayer2(payload, modoScoring);
  const c3 = computeDerivedVariablesLayer3(payload, c2, bundle.refParams);
  const c4 = preprocessLayer4(c3, bundle.refParams, true);

  const is24 = modelId === 'encoder_24_deployed';
  const inputVec = is24 ? c4.vector_entrada_24 : c4.vector_entrada_22;
  const varNames = is24 ? ORDEN_CANONICO_24 : ORDEN_CANONICO_22;
  const c5 = runAutoencoderForwardPass(inputVec, varNames, modelObj);
  const latentAnalysis = analyzeLatentProfile(c5.latent_vector, c5.reconstruction, engineRootDir);

  return {
    status: 'completed',
    registro_id: registroId,
    timestamp_utc: new Date().toISOString(),
    model_metadata: {
      model_id: modelId,
      validation_state: modelObj.meta.validation_state,
      n_input: modelObj.meta.n_input,
      n_latent: modelObj.meta.n_latent,
      architecture: modelObj.meta.architecture,
      source_h5_sha256: modelObj.meta.source_encoder_h5_sha256,
      weights_json_sha256: modelObj.weightsJsonSha256,
      modo_scoring: modoScoring,
    },
    validation_summary: v1,
    scoring_capa2: c2.puntuaciones,
    variables_derivadas_capa3: c3,
    preprocesamiento_capa4: {
      vector_winsorizado_24: c4.vector_winsorizado_24,
      vector_preprocesado_24: c4.vector_preprocesado_24,
      vector_entrada_modelo: inputVec,
      orden_variables_modelo: varNames,
      separacion_eros_tiempo_consumo_preproc: c4.separacion_eros_tiempo_consumo_preproc,
    },
    dimensions: c5.dimensions,
    latent_vector: c5.latent_vector,
    reconstruction: c5.reconstruction,
    latent_analysis: latentAnalysis,
  };
}

/**
 * Ejecuta inferencia sobre el candidato confirmatorio aislado ae_tus_17to12_m3k12 (17 -> 24 -> 12 -> 24 -> 17).
 * @param {Record<string, number>} subscalesObj Objeto con exactamente las 17 variables canónicas de ORDEN_CANDIDATO_17
 * @param {string} [engineRootDir]
 * @returns {object}
 */
export function inferCandidate17v(subscalesObj, engineRootDir = DEFAULT_ENGINE_ROOT) {
  if (!subscalesObj || typeof subscalesObj !== 'object') {
    return { status: 'REJECTED', errores: ['Entrada nula o no estructurada.'], advertencias: [], z: null };
  }

  const errores = [];
  const advertencias = [];
  const keys = Object.keys(subscalesObj);
  const missing = ORDEN_CANDIDATO_17.filter((k) => !keys.includes(k));
  if (missing.length > 0) {
    errores.push(`Faltan variables del contrato de 17 dimensiones: ${missing.join(', ')}`);
  }

  const rawVec = [];
  for (let i = 0; i < ORDEN_CANDIDATO_17.length; i++) {
    const vName = ORDEN_CANDIDATO_17[i];
    const val = subscalesObj[vName];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      errores.push(`Variable '${vName}' ausente o no finita (no se imputa).`);
      continue;
    }
    rawVec.push(val);
    const [minObs, maxObs] = RANGOS_REFERENCIA_17[i];
    if (val < minObs || val > maxObs) {
      advertencias.push(`${vName}=${val} fuera del rango observado [${minObs}, ${maxObs}]`);
    }
  }

  if (errores.length > 0) {
    return { status: 'REJECTED', errores, advertencias, z: null };
  }

  const modelObj = loadAutoencoderModel('ae_tus_17to12_m3k12', engineRootDir);
  const w = modelObj.weights;
  const { centro, escala, log1p_vars: log1pVars } = w.preprocessing;

  const xTransformed = rawVec.map((val, idx) => {
    const vName = ORDEN_CANDIDATO_17[idx];
    if (Array.isArray(log1pVars) && log1pVars.includes(vName)) {
      return Math.log1p(Math.max(val, 0));
    }
    return val;
  });

  const xScaled = xTransformed.map((val, idx) => (val - centro[idx]) / escala[idx]);

  // Encoder 17 -> 24 (selu) -> 12 (linear)
  const h1 = forwardDense(xScaled, w.encoder_1_kernel, w.encoder_1_bias, 'selu');
  const z = forwardDense(h1, w.bottleneck_kernel, w.bottleneck_bias, 'linear');

  // Decoder 12 -> 24 (selu) -> 17 (linear)
  const d1 = forwardDense(z, w.decoder_1_kernel, w.decoder_1_bias, 'selu');
  const rScaled = forwardDense(d1, w.output_kernel, w.output_bias, 'linear');

  const rOrig = rScaled.map((rVal, idx) => {
    const vName = ORDEN_CANDIDATO_17[idx];
    const restored = rVal * escala[idx] + centro[idx];
    if (Array.isArray(log1pVars) && log1pVars.includes(vName)) {
      return Math.expm1(restored);
    }
    return restored;
  });

  let sqOrig = 0;
  let absOrig = 0;
  for (let i = 0; i < rawVec.length; i++) {
    const diff = rawVec[i] - rOrig[i];
    sqOrig += diff * diff;
    absOrig += Math.abs(diff);
  }

  return {
    status: advertencias.length > 0 ? 'ACCEPTED_WITH_WARNING' : 'ACCEPTED',
    model_id: 'ae_tus_17to12_m3k12',
    validation_status: w.validation_status || 'PROTOTIPO_CONFIRMATORIO_SIN_VALIDACION_CLINICA',
    z,
    z_named: Object.fromEntries(z.map((v, i) => [`Z${String(i + 1).padStart(2, '0')}`, v])),
    reconstruccion_escala_original: Object.fromEntries(ORDEN_CANDIDATO_17.map((k, i) => [k, rOrig[i]])),
    mse_reconstruccion_orig: sqOrig / rawVec.length,
    mae_reconstruccion_orig: absOrig / rawVec.length,
    advertencias,
    errores: [],
  };
}
