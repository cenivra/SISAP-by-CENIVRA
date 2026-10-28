/**
 * SISAP by CENIVRA — Datos de Normalización y Matriz de Proyección Sintética (DEMO)
 *
 * Módulo de soporte para el simulador y verificación técnica de interfaz.
 *
 * ============================================================================
 * CLÁUSULA DE SEGURIDAD, GOBERNANZA Y PROPIEDAD INTELECTUAL (SYNTHETIC_DEMO)
 * ============================================================================
 * 1. Este archivo NO contiene pesos entrenados de autoencoders clínicos auténticos,
 *    parámetros propietarios de CENIVRA ni vectores latentes derivados de personas.
 * 2. La matriz ENCODER_PROJECTION_WEIGHTS ha sido generada determinísticamente
 *    desde cero mediante la función base ortonormal discreta DCT-II (24 x 12).
 * 3. Su única función es verificar la integridad de la interfaz, el renderizado del
 *    gráfico de radar y el flujo de navegación sin atribuir validez clínica alguna.
 * 4. La inferencia clínica real permanece estrictamente desacoplada del repositorio
 *    público conforme a las directrices de gobernanza de software médico.
 */

export const CANONICAL_VARIABLES_24 = [
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
] as const;

export interface NormalizationParam {
  media: number;
  sd: number;
}

export const NORMALIZATION_PARAMS: Record<string, NormalizationParam> = {
  tiempo_consumo: { media: 6.8, sd: 5.2 },
  trat_previos: { media: 1.8, sd: 1.6 },
  BIS_11BIS_motor: { media: 23.4, sd: 6.1 },
  BIS_11BIS_nonplanning: { media: 26.8, sd: 6.7 },
  BIS_11BIS_cognitive_instability: { media: 18.2, sd: 5.4 },
  BIS_11BIS_perseverance: { media: 9.6, sd: 2.8 },
  BIS_11BIS_motor_impulsivity: { media: 22.1, sd: 5.3 },
  BIS_11BIS_total_calculado: { media: 68.4, sd: 14.8 },
  compuesto_bis: { media: 22.8, sd: 4.9 },
  STAXI_2STAXI_state: { media: 24.5, sd: 8.6 },
  STAXI_2STAXI_trait: { media: 21.3, sd: 6.4 },
  STAXI_2STAXI_temperamento: { media: 8.9, sd: 3.1 },
  compuesto_staxi: { media: 18.2, sd: 5.2 },
  BSL_23BSL_general: { media: 1.85, sd: 0.88 },
  BSL_23BSL_total_integrado: { media: 42.6, sd: 20.3 },
  compuesto_bsl: { media: 18.5, sd: 8.8 },
  GAD_7GAD_zscore: { media: 0.0, sd: 1.0 },
  BADS_bads_activation: { media: 18.4, sd: 8.2 },
  BADS_bads_avoidance: { media: 22.1, sd: 9.4 },
  BADS_bads_work: { media: 14.2, sd: 6.8 },
  BADS_bads_social: { media: 15.6, sd: 7.1 },
  edad: { media: 36.2, sd: 11.4 },
  tiempo_consumoEROS: { media: 6.8, sd: 5.2 },
  trat_previosEROS: { media: 1.8, sd: 1.6 },
};

/**
 * Matriz de Proyección Sintética Demostrativa (24 entradas x 12 dimensiones latentes)
 * Generada determinísticamente mediante la transformación base DCT-II.
 * Identificador: SYNTHETIC_DEMO_DCT2_v1
 */
export const ENCODER_PROJECTION_WEIGHTS: number[][] = [
  [ 0.204124,  0.288057,  0.286205,  0.283128,  0.278839,  0.273355,  0.266701,  0.258905,  0.250000,  0.240025,  0.229021,  0.217037],
  [ 0.204124,  0.283128,  0.266701,  0.240025,  0.204124,  0.160379,  0.110471,  0.056318,  0.000000, -0.056318, -0.110471, -0.160379],
  [ 0.204124,  0.273355,  0.229021,  0.160379,  0.074715, -0.018880, -0.110471, -0.190337, -0.250000, -0.283128, -0.286205, -0.258905],
  [ 0.204124,  0.258905,  0.175734,  0.056318, -0.074715, -0.190337, -0.266701, -0.288057, -0.250000, -0.160379, -0.037680,  0.092792],
  [ 0.204124,  0.240025,  0.110471, -0.056318, -0.204124, -0.283128, -0.266701, -0.160379, -0.000000,  0.160379,  0.266701,  0.283128],
  [ 0.204124,  0.217037,  0.037680, -0.160379, -0.278839, -0.258905, -0.110471,  0.092792,  0.250000,  0.283128,  0.175734, -0.018880],
  [ 0.204124,  0.190337, -0.037680, -0.240025, -0.278839, -0.127678,  0.110471,  0.273355,  0.250000,  0.056318, -0.175734, -0.288057],
  [ 0.204124,  0.160379, -0.110471, -0.283128, -0.204124,  0.056318,  0.266701,  0.240025,  0.000000, -0.240025, -0.266701, -0.056318],
  [ 0.204124,  0.127678, -0.175734, -0.283128, -0.074715,  0.217037,  0.266701,  0.018880, -0.250000, -0.240025,  0.037680,  0.273355],
  [ 0.204124,  0.092792, -0.229021, -0.240025,  0.074715,  0.288057,  0.110471, -0.217037, -0.250000,  0.056318,  0.286205,  0.127678],
  [ 0.204124,  0.056318, -0.266701, -0.160379,  0.204124,  0.240025, -0.110471, -0.283128, -0.000000,  0.283128,  0.110471, -0.240025],
  [ 0.204124,  0.018880, -0.286205, -0.056318,  0.278839,  0.092792, -0.266701, -0.127678,  0.250000,  0.160379, -0.229021, -0.190337],
  [ 0.204124, -0.018880, -0.286205,  0.056318,  0.278839, -0.092792, -0.266701,  0.127678,  0.250000, -0.160379, -0.229021,  0.190337],
  [ 0.204124, -0.056318, -0.266701,  0.160379,  0.204124, -0.240025, -0.110471,  0.283128,  0.000000, -0.283128,  0.110471,  0.240025],
  [ 0.204124, -0.092792, -0.229021,  0.240025,  0.074715, -0.288057,  0.110471,  0.217037, -0.250000, -0.056318,  0.286205, -0.127678],
  [ 0.204124, -0.127678, -0.175734,  0.283128, -0.074715, -0.217037,  0.266701, -0.018880, -0.250000,  0.240025,  0.037680, -0.273355],
  [ 0.204124, -0.160379, -0.110471,  0.283128, -0.204124, -0.056318,  0.266701, -0.240025,  0.000000,  0.240025, -0.266701,  0.056318],
  [ 0.204124, -0.190337, -0.037680,  0.240025, -0.278839,  0.127678,  0.110471, -0.273355,  0.250000, -0.056318, -0.175734,  0.288057],
  [ 0.204124, -0.217037,  0.037680,  0.160379, -0.278839,  0.258905, -0.110471, -0.092792,  0.250000, -0.283128,  0.175734,  0.018880],
  [ 0.204124, -0.240025,  0.110471,  0.056318, -0.204124,  0.283128, -0.266701,  0.160379,  0.000000, -0.160379,  0.266701, -0.283128],
  [ 0.204124, -0.258905,  0.175734, -0.056318, -0.074715,  0.190337, -0.266701,  0.288057, -0.250000,  0.160379, -0.037680, -0.092792],
  [ 0.204124, -0.273355,  0.229021, -0.160379,  0.074715,  0.018880, -0.110471,  0.190337, -0.250000,  0.283128, -0.286205,  0.258905],
  [ 0.204124, -0.283128,  0.266701, -0.240025,  0.204124, -0.160379,  0.110471, -0.056318,  0.000000,  0.056318, -0.110471,  0.160379],
  [ 0.204124, -0.288057,  0.286205, -0.283128,  0.278839, -0.273355,  0.266701, -0.258905,  0.250000, -0.240025,  0.229021, -0.217037]
];

export const LATENT_DIMENSIONS_METADATA = [
  { id: 'Dim1', label: 'Severidad Multidominio [DEMO SINTÉTICO]', bipolar: 'Baja reactividad vs Desregulación global' },
  { id: 'Dim2', label: 'Impulsividad Motora [DEMO SINTÉTICO]', bipolar: 'Control inhibitorio vs Urgencia conductual' },
  { id: 'Dim3', label: 'Evitación Experiencial [DEMO SINTÉTICO]', bipolar: 'Afrontamiento activo vs Fusión/Evitación' },
  { id: 'Dim4', label: 'Reactividad Afectiva e Ira [DEMO SINTÉTICO]', bipolar: 'Tolerancia afectiva vs Reactividad hostil' },
  { id: 'Dim5', label: 'Deterioro Ocupacional (BADS) [DEMO SINTÉTICO]', bipolar: 'Activación social vs Deterioro funcional' },
  { id: 'Dim6', label: 'Vulnerabilidad al Craving [DEMO SINTÉTICO]', bipolar: 'Autonomía de refuerzo vs Dependencia hedónica' },
  { id: 'Dim7', label: 'Rigidez Cognitiva [DEMO SINTÉTICO]', bipolar: 'Flexibilidad psicológica vs Perseveración' },
  { id: 'Dim8', label: 'Cronicidad y Resistencia [DEMO SINTÉTICO]', bipolar: 'Debut reciente vs Tratamientos recurrentes' },
  { id: 'Dim9', label: 'Sintomatología Límite (BSL) [DEMO SINTÉTICO]', bipolar: 'Autoimagen estable vs Disforia/Vacío' },
  { id: 'Dim10', label: 'Reserva de Activación [DEMO SINTÉTICO]', bipolar: 'Fatiga anhedónica vs Energía orientada a metas' },
  { id: 'Dim11', label: 'Sensibilidad a Incertidumbre (GAD) [DEMO SINTÉTICO]', bipolar: 'Calma autonómica vs Ansiedad somática' },
  { id: 'Dim12', label: 'Disposición al Cambio [DEMO SINTÉTICO]', bipolar: 'Contemplación activa vs Resistencia rígida' },
];
