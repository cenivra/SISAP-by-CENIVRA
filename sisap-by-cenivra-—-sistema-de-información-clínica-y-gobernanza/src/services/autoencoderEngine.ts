/**
 * Motor frontend del Autoencoder TUS (Paridad exacta con R y Node.js).
 * - Ejecuta inferencia verificada de 5 capas (Encoder + Decoder SELU) con los pesos
 *   de `encoder_22_checkpoint_fase2` (definitivo) y `encoder_24_deployed`.
 * - Posiciona las 12 dimensiones opacas frente a los percentiles empíricos (N = 166).
 * - Cumple MOD-03 (sin etiquetas clínicas inventadas), D-03 (sin clustering GMM)
 *   y D-07 (pesos verificados inmutables; sin alteración silenciosa vía localStorage).
 */

import {
  CANONICAL_VARIABLES_22,
  CANONICAL_VARIABLES_24,
  ENCODER_PROJECTION_WEIGHTS,
  FullAutoencoderWeights,
  LATENT_DIMENSIONS_METADATA,
  LatentDimensionPercentileRef,
  NORMALIZATION_PARAMS,
  NormalizationParam,
  PERCENTILES_REFERENCIA_12D,
  VERIFIED_AUTOENCODER_22,
  VERIFIED_AUTOENCODER_24,
  VERIFIED_MODELS_REGISTRY,
} from '../data/autoencoderData';
import {
  EvolutionNote,
  InitialEvaluationData,
  WeeklyNarrative,
} from '../types/clinical';

export type VerifiedModelId = 'encoder_22_checkpoint_fase2' | 'encoder_24_deployed';

export const SELU_ALPHA = 1.6732632423543772848170429916717;
export const SELU_SCALE = 1.0507009873554804934193349852946;

export interface LatentDimensionScore {
  dimId: string;
  latentKey: string;
  label: string;
  domain: string;
  rawValue: number;
  zScore: number; // Desviación robusta (en unidades IQR respecto a p50 de la cohorte N=166)
  percentile: number;
  bracket: '<p05' | 'p05-p25' | 'p25-p75' | 'p75-p95' | '>p95';
  cohortP05: number;
  cohortP25: number;
  cohortP50: number;
  cohortP75: number;
  cohortP95: number;
  interpretation: string;
  bipolar: string;
  color: string;
}

export interface VariableReconstructionItem {
  variable: string;
  input_z: number;
  reconstructed_z: number;
  error_z: number;
  squared_error: number;
}

export interface AutoencoderInferenceResult {
  modelId: VerifiedModelId;
  validationState: string;
  timestamp: string;
  normalizedInput: Record<string, number>;
  latentDimensions: LatentDimensionScore[];
  reconstructionError: number; // MSE global en espacio Z
  verifiedMetrics: {
    mse_z: number;
    mae_z: number;
    rmse_z: number;
    l2_norm: number;
    distance_to_cohort_median_p50: number;
    n_outside_iqr: number;
    n_outside_p05_p95: number;
    architecture_str: string;
    model_sha256_prefix: string;
  };
  perVariableReconstruction: VariableReconstructionItem[];
  summaryIndices: {
    severidad_multidominio: number; // Mapeado a RMSE de reconstrucción (espacio Z)
    desregulacion_emocional_impulsiva: number; // Mapeado a distancia L2 al centro mediano p50
    compuesto_total: number; // Norma L2 latente
    clase_latente_3b: string; // D-03: Estratificación GMM excluida
    probabilidad_clase_3b: number;
    incertidumbre_clase_3b: number; // Proporción de dimensiones fuera de p05-p95
  };
  recommendations?: string[];
}

function seluKeras(x: number): number {
  return x > 0 ? SELU_SCALE * x : SELU_SCALE * SELU_ALPHA * (Math.exp(x) - 1.0);
}

function forwardDense(
  vec: number[],
  kernel2d: number[][],
  bias: number[],
  activation: 'selu' | 'linear'
): number[] {
  const nIn = kernel2d.length;
  const nOut = bias.length;
  const out = new Array<number>(nOut);
  for (let j = 0; j < nOut; j++) {
    let acc = bias[j];
    for (let i = 0; i < nIn; i++) {
      acc += (vec[i] ?? 0) * kernel2d[i][j];
    }
    out[j] = activation === 'selu' ? seluKeras(acc) : acc;
  }
  return out;
}

function interpolatePercentile(val: number, ref: LatentDimensionPercentileRef): number {
  const knots: Array<[number, number]> = [
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

function classifyBracket(val: number, ref: LatentDimensionPercentileRef): LatentDimensionScore['bracket'] {
  if (val < ref.p05) return '<p05';
  if (val < ref.p25) return 'p05-p25';
  if (val <= ref.p75) return 'p25-p75';
  if (val <= ref.p95) return 'p75-p95';
  return '>p95';
}

export const AutoencoderEngine = {
  getRegistryMetadata() {
    return VERIFIED_MODELS_REGISTRY;
  },

  getActiveWeights(): number[][] {
    return ENCODER_PROJECTION_WEIGHTS;
  },

  hasCustomWeights(): boolean {
    return false;
  },

  setCustomWeights(_weights: number[][]): { success: boolean; message: string } {
    return {
      success: false,
      message:
        'Bloqueado por gobernanza D-07: los pesos verificados del Autoencoder (SHA-256) son inmutables en memoria de navegador.',
    };
  },

  resetToDefaultWeights(): void {
    // Los pesos verificados no mutan; método preservado por compatibilidad de interfaz.
  },

  getActiveNormalizationParams(): Record<string, NormalizationParam> {
    return NORMALIZATION_PARAMS;
  },

  normalizeVector(rawVector: Record<string, number>, applyWinsor = true): Record<string, number> {
    const normalized: Record<string, number> = {};
    for (const col of CANONICAL_VARIABLES_24) {
      const p = NORMALIZATION_PARAMS[col];
      const val = rawVector[col];
      if (!p || !Number.isFinite(val)) {
        normalized[col] = 0;
        continue;
      }
      const wVal = applyWinsor ? Math.min(Math.max(val, p.winsor_q01), p.winsor_q99) : val;
      normalized[col] = (wVal - p.mean) / (p.sd || 1);
    }
    return normalized;
  },

  runVerifiedInference(
    rawVector24: Record<string, number>,
    modelId: VerifiedModelId = 'encoder_22_checkpoint_fase2'
  ): AutoencoderInferenceResult {
    const normalizedInput = this.normalizeVector(rawVector24, true);
    const weights: FullAutoencoderWeights =
      modelId === 'encoder_24_deployed' ? VERIFIED_AUTOENCODER_24 : VERIFIED_AUTOENCODER_22;
    const varNames = modelId === 'encoder_24_deployed' ? CANONICAL_VARIABLES_24 : CANONICAL_VARIABLES_22;
    const modelMeta = VERIFIED_MODELS_REGISTRY.models[modelId];

    const xVec = varNames.map((v) => normalizedInput[v] ?? 0);

    // Encoder SELU (3 capas)
    const h1 = forwardDense(xVec, weights.encoder_1_kernel, weights.encoder_1_bias, 'selu');
    const h2 = forwardDense(h1, weights.encoder_2_kernel, weights.encoder_2_bias, 'selu');
    const zLatent = forwardDense(h2, weights.bottleneck_kernel, weights.bottleneck_bias, 'linear');

    // Decoder SELU (3 capas)
    const d1 = forwardDense(zLatent, weights.decoder_1_kernel, weights.decoder_1_bias, 'selu');
    const d2 = forwardDense(d1, weights.decoder_2_kernel, weights.decoder_2_bias, 'selu');
    const xHat = forwardDense(d2, weights.output_kernel, weights.output_bias, 'linear');

    let sqSum = 0;
    let absSum = 0;
    const perVariableReconstruction: VariableReconstructionItem[] = varNames.map((variable, idx) => {
      const input_z = xVec[idx];
      const reconstructed_z = xHat[idx];
      const error_z = input_z - reconstructed_z;
      const squared_error = error_z * error_z;
      sqSum += squared_error;
      absSum += Math.abs(error_z);
      return {
        variable,
        input_z: Number(input_z.toFixed(6)),
        reconstructed_z: Number(reconstructed_z.toFixed(6)),
        error_z: Number(error_z.toFixed(6)),
        squared_error: Number(squared_error.toFixed(6)),
      };
    });

    const mseZ = sqSum / varNames.length;
    const maeZ = absSum / varNames.length;
    const rmseZ = Math.sqrt(mseZ);

    let sumSqNorm = 0;
    let sumSqDistP50 = 0;
    let outsideIqr = 0;
    let outsideP05P95 = 0;

    const latentDimensions: LatentDimensionScore[] = zLatent.map((val, idx) => {
      const meta = LATENT_DIMENSIONS_METADATA[idx];
      const ref: LatentDimensionPercentileRef = PERCENTILES_REFERENCIA_12D[idx];
      const iqr = ref.p75 - ref.p25;
      const robustScale = iqr > 1e-9 ? iqr / 1.3489795 : ref.sd;
      const zIqr = robustScale > 1e-9 ? (val - ref.p50) / robustScale : 0;
      const pct = interpolatePercentile(val, ref);
      const bracket = classifyBracket(val, ref);

      sumSqNorm += val * val;
      sumSqDistP50 += (val - ref.p50) ** 2;
      if (val < ref.p25 || val > ref.p75) outsideIqr += 1;
      if (val < ref.p05 || val > ref.p95) outsideP05P95 += 1;

      const bracketText =
        bracket === 'p25-p75'
          ? 'Dentro de IQR cohorte (p25–p75)'
          : bracket === 'p05-p25' || bracket === 'p75-p95'
          ? `Rango periférico (${bracket})`
          : `Cola empírica extrema (${bracket})`;

      return {
        dimId: meta.id,
        latentKey: meta.latentKey,
        label: meta.label,
        domain: meta.domain,
        rawValue: Number(val.toFixed(6)),
        zScore: Number(zIqr.toFixed(4)),
        percentile: Number(pct.toFixed(1)),
        bracket,
        cohortP05: ref.p05,
        cohortP25: ref.p25,
        cohortP50: ref.p50,
        cohortP75: ref.p75,
        cohortP95: ref.p95,
        interpretation: bracketText,
        bipolar: 'Dimensión matemática opaca (MOD-03)',
        color: meta.color,
      };
    });

    const l2Norm = Math.sqrt(sumSqNorm);
    const distP50 = Math.sqrt(sumSqDistP50);

    return {
      modelId,
      validationState: modelMeta.validation_state,
      timestamp: new Date().toISOString(),
      normalizedInput,
      latentDimensions,
      reconstructionError: Number(mseZ.toFixed(6)),
      verifiedMetrics: {
        mse_z: Number(mseZ.toFixed(6)),
        mae_z: Number(maeZ.toFixed(6)),
        rmse_z: Number(rmseZ.toFixed(6)),
        l2_norm: Number(l2Norm.toFixed(6)),
        distance_to_cohort_median_p50: Number(distP50.toFixed(6)),
        n_outside_iqr: outsideIqr,
        n_outside_p05_p95: outsideP05P95,
        architecture_str: weights.architecture.join('→'),
        model_sha256_prefix: weights.sha256.slice(0, 12),
      },
      perVariableReconstruction,
      summaryIndices: {
        severidad_multidominio: Number(rmseZ.toFixed(4)),
        desregulacion_emocional_impulsiva: Number(distP50.toFixed(4)),
        compuesto_total: Number(l2Norm.toFixed(4)),
        clase_latente_3b: 'Espacio continuo 12D (GMM excluido D-03)',
        probabilidad_clase_3b: 0,
        incertidumbre_clase_3b: Number((outsideP05P95 / 12).toFixed(4)),
      },
      recommendations: [],
    };
  },

  /**
   * Mantiene la firma histórica runTransversalInference() delegando al modelo verificado
   * encoder_22_checkpoint_fase2 por defecto.
   */
  runTransversalInference(
    rawVector24: Record<string, number>,
    modelId: VerifiedModelId = 'encoder_22_checkpoint_fase2'
  ): AutoencoderInferenceResult {
    return this.runVerifiedInference(rawVector24, modelId);
  },

  /**
   * Exporta el corpus longitudinal con métricas reales agregadas desde el historial capturado
   * (cero números estáticos inventados).
   */
  exportLongitudinalTrainingCorpus(
    patientPseudonyms: string[],
    allData: {
      narratives: WeeklyNarrative[];
      evolutions: EvolutionNote[];
      initialEvals?: InitialEvaluationData[];
      evaluations?: InitialEvaluationData[];
    }
  ) {
    const evalList = allData.initialEvals ?? allData.evaluations ?? [];
    const gadTotals: number[] = [];
    const bisTotals: number[] = [];
    const bslTotals: number[] = [];

    for (const ev of evalList) {
      if (ev.calculados) {
        if (Number.isFinite(ev.calculados.gad_total)) gadTotals.push(ev.calculados.gad_total);
        if (Number.isFinite(ev.calculados.bis_total)) bisTotals.push(ev.calculados.bis_total);
        if (Number.isFinite(ev.calculados.bsl_total_integrado)) {
          bslTotals.push(ev.calculados.bsl_total_integrado);
        }
      }
    }

    const avg = (arr: number[]) =>
      arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null;

    const corpus = patientPseudonyms.map((exp) => {
      const pNarratives = allData.narratives.filter((n) => n.expediente === exp);
      const pEvos = allData.evolutions.filter((e) => e.expediente === exp);
      const pEval = evalList.find((ev) => ev.expediente === exp);

      return {
        patient_pseudonym: exp,
        transversal_vector_24: pEval?.vector24 || null,
        longitudinal_timeline: {
          weekly_narratives: pNarratives.map((n) => ({
            week: n.semana,
            date: n.fecha_entrega,
            responses: {
              q1_descripcion: n.q1_descripcion,
              q2_desafios: n.q2_desafios,
              q3_estrategias: n.q3_estrategias,
              q4_emociones: n.q4_emociones,
              q5_progresos: n.q5_progresos,
              q6_reflexiones: n.q6_reflexiones,
              q7_metas: n.q7_metas,
              q8_comentarios: n.q8_comentarios,
            },
          })),
          clinical_session_notes_count: pEvos.length,
        },
      };
    });

    const csvHeader = 'patient_pseudonym,event_type,week_or_session,date,gad_total,bis_total,bsl_total_integrado';
    const csvRows = [csvHeader];
    for (const exp of patientPseudonyms) {
      const pEval = evalList.find((ev) => ev.expediente === exp);
      if (pEval) {
        csvRows.push(
          `${exp},initial_evaluation,0,${pEval.fecha_eval},${pEval.calculados?.gad_total ?? ''},${pEval.calculados?.bis_total ?? ''},${pEval.calculados?.bsl_total_integrado ?? ''}`
        );
      }
      for (const n of allData.narratives.filter((x) => x.expediente === exp)) {
        csvRows.push(`${exp},weekly_narrative,${n.semana},${n.fecha_entrega},,,`);
      }
      for (const e of allData.evolutions.filter((x) => x.expediente === exp)) {
        csvRows.push(`${exp},evolution_note,${e.sesion},${e.fecha},,,`);
      }
    }

    const totalSequences = allData.narratives.length + allData.evolutions.length + evalList.length;
    const payloadObj = {
      metadata: {
        schema_version: 'sisap-longitudinal-corpus-v2.0',
        generated_at: new Date().toISOString(),
        cohort_size: patientPseudonyms.length,
        reference_model_id: 'encoder_22_checkpoint_fase2',
      },
      summary_statistics: {
        initial_evaluations_count: evalList.length,
        total_weekly_narratives: allData.narratives.length,
        total_evolution_notes: allData.evolutions.length,
        mean_gad7_total: avg(gadTotals),
        mean_bis11_total: avg(bisTotals),
        mean_bsl23_integrated: avg(bslTotals),
      },
      corpus,
    };

    return {
      ...payloadObj,
      totalSequences,
      csvCorpus: csvRows.join('\n'),
      jsonCorpus: JSON.stringify(payloadObj, null, 2),
    };
  },
};
