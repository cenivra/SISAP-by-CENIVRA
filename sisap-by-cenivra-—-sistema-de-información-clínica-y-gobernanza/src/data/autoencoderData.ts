/**
 * Parámetros canónicos, pesos verificados (Encoder + Decoder) y distribución normativa
 * del Autoencoder TUS importados directamente desde `engines/autoencoder/` (sin rutas
 * absolutas ni matrices sintéticas).
 *
 * Restricciones epistemológicas (MOD-03 / D-03 / D-06):
 * - Las dimensiones latentes latent_01..latent_12 son estrictamente opacas.
 * - No se incluye clustering ni etiquetas diagnósticas automáticas.
 */

import registryJson from '../../engines/autoencoder/models/model_registry.json';
import refParamsJson from '../../engines/autoencoder/preprocessing/parametros_referencia_completos.json';
import weights22Json from '../../engines/autoencoder/models/pesos_autoencoder_22_completo.json';
import weights24Json from '../../engines/autoencoder/models/pesos_autoencoder_24_completo.json';
import percentiles12dJson from '../../engines/autoencoder/models/percentiles_referencia_12d.json';

export const CANONICAL_VARIABLES_24: string[] = [
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
];

export const CANONICAL_VARIABLES_22: string[] = CANONICAL_VARIABLES_24.filter(
  (v) => v !== 'STAXI_2STAXI_temperamento' && v !== 'compuesto_staxi'
);

export interface NormalizationParam {
  winsor_q01: number;
  winsor_q99: number;
  mean: number;
  media: number;
  sd: number;
  median_ref: number;
  instrument?: string;
  descripcion?: string;
}

export interface FullAutoencoderWeights {
  model_id: string;
  n_input: number;
  architecture: number[];
  encoder_architecture: number[];
  decoder_architecture: number[];
  activations: string[];
  sha256: string;
  sha256_full_h5: string;
  encoder_1_kernel: number[][];
  encoder_1_bias: number[];
  encoder_2_kernel: number[][];
  encoder_2_bias: number[];
  bottleneck_kernel: number[][];
  bottleneck_bias: number[];
  decoder_1_kernel: number[][];
  decoder_1_bias: number[];
  decoder_2_kernel: number[][];
  decoder_2_bias: number[];
  output_kernel: number[][];
  output_bias: number[];
}

export interface LatentDimensionPercentileRef {
  dimension: string;
  mean: number;
  sd: number;
  min: number;
  max: number;
  p05: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

export interface LatentDimensionMetadata {
  id: string;
  latentKey: string;
  label: string;
  domain: string;
  clinicalMeaning: string;
  color: string;
  cohortRef: LatentDimensionPercentileRef;
}

const rawNorm24 = refParamsJson.normalizacion_final_24 as Record<
  string,
  {
    winsorize_q01_ref: number;
    winsorize_q99_ref: number;
    media_post_winsor_ref: number;
    sd_post_winsor_ref: number;
    mediana_imputacion_ref: number;
    instrumento: string;
    descripcion: string;
  }
>;

export const NORMALIZATION_PARAMS: Record<string, NormalizationParam> = Object.fromEntries(
  CANONICAL_VARIABLES_24.map((varName) => {
    const p = rawNorm24[varName];
    return [
      varName,
      {
        winsor_q01: p.winsorize_q01_ref,
        winsor_q99: p.winsorize_q99_ref,
        mean: p.media_post_winsor_ref,
        media: p.media_post_winsor_ref,
        sd: p.sd_post_winsor_ref,
        median_ref: p.mediana_imputacion_ref,
        instrument: p.instrumento,
        descripcion: p.descripcion,
      },
    ];
  })
);

export const COHORT_DERIVED_PARAMS = refParamsJson;
export const VERIFIED_MODELS_REGISTRY = registryJson;
export const VERIFIED_AUTOENCODER_22 = weights22Json as FullAutoencoderWeights;
export const VERIFIED_AUTOENCODER_24 = weights24Json as FullAutoencoderWeights;
export const PERCENTILES_REFERENCIA_12D = percentiles12dJson as LatentDimensionPercentileRef[];

/**
 * Vista matricial de compatibilidad (fila = variable 24, col = 12 dimensiones del cuello de botella)
 * calculada como composición lineal informativa únicamente para inspección tabular;
 * la inferencia real ejecuta las 3 capas SELU del Encoder verificadas.
 */
export const ENCODER_PROJECTION_WEIGHTS: number[][] = (() => {
  const w1 = VERIFIED_AUTOENCODER_24.encoder_1_kernel; // 24x32
  const w2 = VERIFIED_AUTOENCODER_24.encoder_2_kernel; // 32x24
  const wb = VERIFIED_AUTOENCODER_24.bottleneck_kernel; // 24x12
  return Array.from({ length: 24 }, (_, i) =>
    Array.from({ length: 12 }, (_, k) => {
      let acc = 0;
      for (let j = 0; j < 24; j++) {
        let h = 0;
        for (let m = 0; m < 32; m++) {
          h += w1[i][m] * w2[m][j];
        }
        acc += h * wb[j][k];
      }
      return Number(acc.toFixed(6));
    })
  );
})();

// Paleta sobria monocromática + acento único (MOD-03: etiquetas estrictamente opacas)
export const LATENT_DIMENSIONS_METADATA: LatentDimensionMetadata[] = PERCENTILES_REFERENCIA_12D.map(
  (ref, idx) => {
    const dimNum = String(idx + 1).padStart(2, '0');
    return {
      id: ref.dimension,
      latentKey: `latent_${dimNum}`,
      label: `Dimensión latente ${ref.dimension}`,
      domain: 'Espacio latente continuo (MOD-03)',
      clinicalMeaning:
        'Dimensión latente matemática opaca sin etiqueta nosológica asignada. Interpretación restringida a posición relativa frente a cuantiles empíricos de la cohorte canónica (N = 166).',
      color: idx % 2 === 0 ? '#0F766E' : '#334155',
      cohortRef: ref,
    };
  }
);
