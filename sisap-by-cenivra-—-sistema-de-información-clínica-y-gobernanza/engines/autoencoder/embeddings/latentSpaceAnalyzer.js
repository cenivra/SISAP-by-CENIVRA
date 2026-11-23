/**
 * @module latentSpaceAnalyzer
 * @description Analizador geométrico y normativo del espacio latente de 12 dimensiones.
 * Compara representaciones latentes contra la distribución empírica de referencia (N = 166)
 * manteniendo opacidad semántica estricta (MOD-03 / ONT-11: las dimensiones latent_01..12
 * NO se etiquetan con constructos clínicos sin validación externa).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ENGINE_ROOT = path.resolve(__dirname, '..');

const cachedPercentilesByRoot = new Map();

/**
 * Carga la tabla de percentiles empíricos de la cohorte canónica (N = 166) desde JSON.
 * @param {string} [engineRootDir] Directorio raíz de engines/autoencoder
 * @returns {Array<object>} Arreglo de 12 objetos de referencia (Dim1..Dim12)
 */
export function loadReferencePercentiles12d(engineRootDir = DEFAULT_ENGINE_ROOT) {
  const resolvedRoot = path.resolve(engineRootDir || DEFAULT_ENGINE_ROOT);
  if (cachedPercentilesByRoot.has(resolvedRoot)) {
    return cachedPercentilesByRoot.get(resolvedRoot);
  }
  const filePath = path.join(resolvedRoot, 'models', 'percentiles_referencia_12d.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`[LATENT ANALYZER ERROR] No se encontró el archivo de percentiles: ${filePath}`);
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(data) || data.length !== 12) {
    throw new Error('[LATENT ANALYZER ERROR] El archivo percentiles_referencia_12d.json debe contener exactamente 12 dimensiones.');
  }
  cachedPercentilesByRoot.set(resolvedRoot, data);
  return data;
}

/**
 * Estima el percentil empírico (0..100) mediante interpolación lineal por tramos sobre cuantiles observados.
 * @param {number} val
 * @param {object} ref
 * @returns {number}
 */
function interpolateEmpiricalPercentile(val, ref) {
  const knots = [
    [ref.min, 0],
    [ref.p05, 5],
    [ref.p10, 10],
    [ref.p25, 25],
    [ref.p50, 50],
    [ref.p75, 75],
    [ref.p90, 90],
    [ref.p95, 95],
    [ref.max, 100],
  ];
  if (val <= knots[0][0]) return 0;
  if (val >= knots[knots.length - 1][0]) return 100;
  for (let i = 0; i < knots.length - 1; i++) {
    const [x0, y0] = knots[i];
    const [x1, y1] = knots[i + 1];
    if (val >= x0 && val <= x1) {
      if (Math.abs(x1 - x0) < 1e-12) return (y0 + y1) / 2;
      return y0 + ((val - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return 50;
}

/**
 * Determina la banda empírica del valor frente a los cuantiles de la cohorte canónica.
 * @param {number} val
 * @param {object} ref
 * @returns {string}
 */
function classifyPercentileBracket(val, ref) {
  if (val < ref.p05) return '<p05';
  if (val < ref.p25) return 'p05-p25';
  if (val <= ref.p75) return 'p25-p75';
  if (val <= ref.p95) return 'p75-p95';
  return '>p95';
}

/**
 * Ordena las variables con mayor discrepancia cuadrática entre entrada Z y reconstrucción Decoder Xhat_z.
 * @param {Array<object>|Record<string, object>} perVariableErrors
 * @param {number} [topK=5]
 * @returns {Array<object>}
 */
export function identifyTopReconstructionDiscrepancies(perVariableErrors, topK = 5) {
  if (!perVariableErrors) return [];
  const entries = Array.isArray(perVariableErrors)
    ? perVariableErrors
    : Object.entries(perVariableErrors).map(([variable, item]) => ({ variable, ...item }));
  return [...entries]
    .filter((e) => Number.isFinite(e.squared_error))
    .sort((a, b) => b.squared_error - a.squared_error)
    .slice(0, topK);
}

/**
 * Analiza un vector latente de 12 dimensiones contra la cohorte de referencia (N = 166) y el error de reconstrucción.
 * @param {number[]} latentVector12
 * @param {object|null} [reconstructionInfo=null]
 * @param {string|null} [engineRootDir=null]
 * @returns {object}
 */
export function analyzeLatentProfile(latentVector12, reconstructionInfo = null, engineRootDir = null) {
  if (!Array.isArray(latentVector12) || latentVector12.length !== 12) {
    throw new Error('[LATENT ANALYZER ERROR] Se requiere un vector latente de exactamente 12 dimensiones finitas.');
  }
  if (!latentVector12.every((v) => typeof v === 'number' && Number.isFinite(v))) {
    throw new Error('[LATENT ANALYZER ERROR] El vector latente contiene valores no finitos o no numéricos.');
  }

  const refs = loadReferencePercentiles12d(engineRootDir || DEFAULT_ENGINE_ROOT);
  let sumSqNorm = 0;
  let sumSqDistP50 = 0;
  let sumSqDistMean = 0;
  let outsideP05P95Count = 0;
  let outsideIqrCount = 0;

  const dimensionsProfile = latentVector12.map((val, idx) => {
    const ref = refs[idx];
    const iqr = ref.p75 - ref.p25;
    const robustScale = iqr > 1e-9 ? iqr / 1.3489795 : ref.sd;
    const zIqr = robustScale > 1e-9 ? (val - ref.p50) / robustScale : 0;
    const zCohort = ref.sd > 1e-9 ? (val - ref.mean) / ref.sd : 0;
    const bracket = classifyPercentileBracket(val, ref);
    const estPct = interpolateEmpiricalPercentile(val, ref);
    const isOutlier = val < ref.p05 || val > ref.p95;
    const isOutsideIqr = val < ref.p25 || val > ref.p75;

    sumSqNorm += val * val;
    sumSqDistP50 += (val - ref.p50) ** 2;
    sumSqDistMean += (val - ref.mean) ** 2;
    if (isOutlier) outsideP05P95Count += 1;
    if (isOutsideIqr) outsideIqrCount += 1;

    return {
      dimension_index: idx + 1,
      dimension_id: `Dim${idx + 1}`,
      latent_key: `latent_${String(idx + 1).padStart(2, '0')}`,
      value: val,
      cohort_p05: ref.p05,
      cohort_p25: ref.p25,
      cohort_p50: ref.p50,
      cohort_p75: ref.p75,
      cohort_p95: ref.p95,
      cohort_mean: ref.mean,
      cohort_sd: ref.sd,
      bracket,
      estimated_percentile: Number(estPct.toFixed(1)),
      z_iqr_from_p50: Number(zIqr.toFixed(4)),
      z_cohort_mean: Number(zCohort.toFixed(4)),
      is_outside_iqr: isOutsideIqr,
      is_outside_p05_p95: isOutlier,
    };
  });

  const topDeviantDimensions = [...dimensionsProfile]
    .sort((a, b) => Math.abs(b.z_iqr_from_p50) - Math.abs(a.z_iqr_from_p50))
    .slice(0, 4)
    .map((d) => ({
      dimension_id: d.dimension_id,
      latent_key: d.latent_key,
      value: d.value,
      cohort_p50: d.cohort_p50,
      bracket: d.bracket,
      estimated_percentile: d.estimated_percentile,
      z_iqr_from_p50: d.z_iqr_from_p50,
    }));

  const reconstructionSummary = reconstructionInfo
    ? {
        mse_z: reconstructionInfo.mse_z,
        mae_z: reconstructionInfo.mae_z,
        rmse_z: Number(Math.sqrt(reconstructionInfo.mse_z).toFixed(6)),
        top_discrepancy_variables: identifyTopReconstructionDiscrepancies(reconstructionInfo.per_variable, 5),
      }
    : null;

  return {
    cohort_reference_n: 166,
    percentile_method: 'piecewise_linear_cohort_quantiles_N166',
    geometry: {
      l2_norm: Number(Math.sqrt(sumSqNorm).toFixed(6)),
      distance_to_cohort_median_p50: Number(Math.sqrt(sumSqDistP50).toFixed(6)),
      distance_to_cohort_mean: Number(Math.sqrt(sumSqDistMean).toFixed(6)),
      n_outside_iqr: outsideIqrCount,
      n_outside_p05_p95: outsideP05P95Count,
    },
    top_deviant_dimensions: topDeviantDimensions,
    dimensions: dimensionsProfile,
    reconstruction: reconstructionSummary,
    epistemological_guardrail: {
      mod_03_opaque_dimensions: true,
      semantic_interpretation_status: 'NO_ETIQUETABLE_SIN_VALIDACION_EXTERNA',
      clinical_diagnosis_allowed: false,
    },
  };
}

/**
 * Calcula métricas de similitud y desplazamiento entre dos representaciones latentes de 12 dimensiones.
 * @param {number[]} vecA12
 * @param {number[]} vecB12
 * @returns {object}
 */
export function compareLatentVectors(vecA12, vecB12) {
  if (!Array.isArray(vecA12) || vecA12.length !== 12 || !Array.isArray(vecB12) || vecB12.length !== 12) {
    throw new Error('[LATENT ANALYZER ERROR] Ambos vectores latentes deben tener exactamente 12 dimensiones.');
  }
  let sumSq = 0;
  let sumAbs = 0;
  let dot = 0;
  let normSqA = 0;
  let normSqB = 0;
  const perDimensionDelta = [];

  for (let i = 0; i < 12; i++) {
    const a = vecA12[i];
    const b = vecB12[i];
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      throw new Error('[LATENT ANALYZER ERROR] Los vectores latentes comparados deben contener solo valores finitos.');
    }
    const delta = b - a;
    sumSq += delta * delta;
    sumAbs += Math.abs(delta);
    dot += a * b;
    normSqA += a * a;
    normSqB += b * b;
    perDimensionDelta.push({
      dimension_id: `Dim${i + 1}`,
      latent_key: `latent_${String(i + 1).padStart(2, '0')}`,
      baseline: a,
      comparison: b,
      delta,
      abs_delta: Math.abs(delta),
    });
  }

  const denom = Math.sqrt(normSqA) * Math.sqrt(normSqB);
  const cosineSimilarity = denom > 1e-12 ? dot / denom : null;

  return {
    euclidean_distance_l2: Number(Math.sqrt(sumSq).toFixed(6)),
    manhattan_distance_l1: Number(sumAbs.toFixed(6)),
    cosine_similarity: cosineSimilarity === null ? null : Number(cosineSimilarity.toFixed(6)),
    per_dimension_delta: perDimensionDelta,
    max_shifted_dimension: [...perDimensionDelta].sort((a, b) => b.abs_delta - a.abs_delta)[0],
  };
}
