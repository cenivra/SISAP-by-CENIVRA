/**
 * Motor determinista de puntuación psicométrica (Capas 1B, 2 y 3) con paridad exacta
 * respecto a `engines/autoencoder/inference/R/02..04`.
 * Cumple D-06 (cero imputación silenciosa) y separación estricta EROS vs tiempo_consumo.
 */

import { COHORT_DERIVED_PARAMS } from '../data/autoencoderData';

export type ScoringMode = 'excel_canonico' | 'manual_estandar';

export interface D06ValidationIncident {
  campo: string;
  categoria_d06:
    | 'MISSING_REQUIRED_FIELD'
    | 'MISSING_ITEM_RESPONSE'
    | 'OUT_OF_RANGE_VALUE'
    | 'UNINTERPRETABLE_VALUE'
    | 'UNCALCULABLE_DERIVED';
  mensaje: string;
}

export interface D06ValidationResult {
  valido: boolean;
  n_incidencias: number;
  incidencias: D06ValidationIncident[];
}

function sumByOneBased(arr: number[], oneBased: number[]): number {
  let acc = 0;
  for (const idx of oneBased) {
    acc += arr[idx - 1] ?? 0;
  }
  return acc;
}

/**
 * Parsea cadenas separadas por espacio o coma sin rellenar valores ausentes si strict=true.
 */
export function parseRawNumbersStrict(
  input: string,
  expectedCount: number,
  minVal: number,
  maxVal: number,
  fieldName: string
): { valid: boolean; items: number[]; count: number; incidents: D06ValidationIncident[] } {
  const incidents: D06ValidationIncident[] = [];
  const trimmed = String(input || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      items: [],
      count: 0,
      incidents: [
        {
          campo: fieldName,
          categoria_d06: 'MISSING_REQUIRED_FIELD',
          mensaje: `El instrumento ${fieldName} no tiene respuestas capturadas.`,
        },
      ],
    };
  }

  const tokens = trimmed.split(/[\s,;]+/).filter(Boolean);
  const parsed: number[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.toUpperCase() === 'NA' || t === '-') {
      incidents.push({
        campo: `${fieldName}.P${i + 1}`,
        categoria_d06: 'MISSING_ITEM_RESPONSE',
        mensaje: `${fieldName} presenta respuesta ausente en la posición ${i + 1}.`,
      });
      continue;
    }
    const n = Number(t);
    if (!Number.isFinite(n)) {
      incidents.push({
        campo: `${fieldName}.P${i + 1}`,
        categoria_d06: 'UNINTERPRETABLE_VALUE',
        mensaje: `${fieldName} contiene valor no interpretable '${t}' en posición ${i + 1}.`,
      });
      continue;
    }
    if (n < minVal || n > maxVal) {
      incidents.push({
        campo: `${fieldName}.P${i + 1}`,
        categoria_d06: 'OUT_OF_RANGE_VALUE',
        mensaje: `${fieldName} P${i + 1}=${n} está fuera de [${minVal}, ${maxVal}].`,
      });
    }
    parsed.push(n);
  }

  if (tokens.length !== expectedCount) {
    incidents.push({
      campo: fieldName,
      categoria_d06: tokens.length < expectedCount ? 'MISSING_ITEM_RESPONSE' : 'UNINTERPRETABLE_VALUE',
      mensaje: `${fieldName} requiere exactamente ${expectedCount} reactivos, pero recibió ${tokens.length}.`,
    });
  }

  return {
    valid: incidents.length === 0 && parsed.length === expectedCount,
    items: parsed,
    count: tokens.length,
    incidents,
  };
}

/**
 * Helper de previsualización en tiempo real compatible con formularios interactivos.
 * No debe usarse para ejecutar inferencia definitiva sin pasar antes por validateCompleteEvaluationD06().
 */
export function parseRawNumbers(input: string, expectedCount: number, defaultVal = 1): number[] {
  const parts = String(input || '')
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map((x) => Number(x));
  const res = new Array(expectedCount).fill(defaultVal);
  for (let i = 0; i < Math.min(parts.length, expectedCount); i++) {
    if (Number.isFinite(parts[i])) res[i] = parts[i];
  }
  return res;
}

export interface Bis11Result {
  attention: number;
  motor: number;
  nonplanning: number;
  self_control: number;
  cognitive_instability: number;
  perseverance: number;
  cognitive_complexity: number;
  motor_impulsivity: number;
  nonplanning_factor: number;
  total: number;
  total_calculado_zsum: number;
}

export function computeBis11(rawItems: number[], mode: ScoringMode = 'excel_canonico'): Bis11Result {
  const reversePatton = new Set([1, 7, 8, 9, 10, 12, 13, 15, 20, 29, 30]);
  const scored = rawItems.map((v, i) => (mode === 'manual_estandar' && reversePatton.has(i + 1) ? 5 - v : v));
  const idxAtencion = mode === 'manual_estandar' ? [5, 9, 11, 20, 28] : [6, 9, 11, 20, 28];

  const attention = sumByOneBased(scored, idxAtencion);
  const cognitive_instability = sumByOneBased(scored, [6, 24, 26]);
  const motor = sumByOneBased(scored, [2, 3, 4, 17, 19, 22, 25]);
  const perseverance = sumByOneBased(scored, [16, 21, 23, 30]);
  const self_control = sumByOneBased(scored, [1, 7, 8, 12, 13, 14]);
  const cognitive_complexity = sumByOneBased(scored, [10, 15, 18, 27, 29]);
  const nonplanning = 21.0 - self_control;

  const impCognitiva = sumByOneBased(scored, [4, 7, 10, 13, 16, 19, 24, 27]);
  const motor_impulsivity = sumByOneBased(scored, [2, 6, 9, 12, 15, 18, 21, 23, 26, 29]);
  const nonplanning_factor = sumByOneBased(scored, [1, 3, 5, 8, 11, 14, 17, 20, 22, 25, 28, 30]);

  const p = COHORT_DERIVED_PARAMS.bis_total_calculado_z_params.parametros_cohorte_166;
  const total_calculado_zsum =
    (attention - p.Atencion.mean) / p.Atencion.sd +
    (motor - p.Motor.mean) / p.Motor.sd +
    (nonplanning - p.bis_nonplanning.mean) / p.bis_nonplanning.sd;

  return {
    attention,
    motor,
    nonplanning,
    self_control,
    cognitive_instability,
    perseverance,
    cognitive_complexity,
    motor_impulsivity,
    nonplanning_factor,
    total: impCognitiva + motor_impulsivity + nonplanning_factor,
    total_calculado_zsum: Number(total_calculado_zsum.toFixed(6)),
  };
}

export interface Bsl23Result {
  general: number;
  media_23: number;
  conductual_11: number;
  total_23: number;
  total_integrado: number;
  is_verified_complete: boolean;
}

export function computeBsl23(
  rawCoreItems: number[],
  rawBehavioralItems?: number[],
  generalScore01?: number
): Bsl23Result {
  const total23 = rawCoreItems.reduce((a, b) => a + b, 0);
  const media23 = Number((total23 / 23).toFixed(4));
  const hasBeh = Array.isArray(rawBehavioralItems) && rawBehavioralItems.length === 11;
  const behSum = hasBeh ? rawBehavioralItems.reduce((a, b) => a + b, 0) : 0;
  const hasGen = typeof generalScore01 === 'number' && Number.isFinite(generalScore01);
  const general = hasGen ? generalScore01 : Number((total23 / (23 * 4)).toFixed(2));

  return {
    general: Number(general.toFixed(4)),
    media_23: media23,
    conductual_11: behSum,
    total_23: total23,
    total_integrado: total23 + behSum,
    is_verified_complete: hasBeh && hasGen,
  };
}

export interface Gad7Result {
  total: number;
  zscore: number;
  severidad: 'Mínima' | 'Leve' | 'Moderada' | 'Severa';
}

export function computeGad7(rawItems: number[]): Gad7Result {
  const total = rawItems.reduce((a, b) => a + b, 0);
  const { mean_X1_ref, sd_Y1_ref } = COHORT_DERIVED_PARAMS.gad7_zscore_excel_params;
  const zscore = Number(((total - mean_X1_ref) / sd_Y1_ref).toFixed(6));
  const severidad: Gad7Result['severidad'] =
    total <= 4 ? 'Mínima' : total <= 9 ? 'Leve' : total <= 14 ? 'Moderada' : 'Severa';
  return { total, zscore, severidad };
}

export interface Staxi2Result {
  sentimiento: number;
  expresion_fisica: number;
  expresion_verbal: number;
  temperamento: number;
  reaccion: number;
  expresion_externa: number;
  expresion_interna: number;
  control_externo: number;
  control_interno: number;
  state: number;
  trait: number;
  iei: number;
  is_verified_49_items: boolean;
}

export function computeStaxi2(rawItems: number[]): Staxi2Result {
  const isFull49 = rawItems.length >= 49;
  const sent = sumByOneBased(rawItems, [1, 2, 3, 5, 7]);
  const expf = sumByOneBased(rawItems, [4, 8, 11, 13, 14]);
  const expv = sumByOneBased(rawItems, [6, 9, 10, 12, 15]);
  const temp = sumByOneBased(rawItems, [16, 17, 18, 20, 23]);
  const reacc = sumByOneBased(rawItems, [19, 21, 22, 24, 25]);
  const eext = isFull49 ? sumByOneBased(rawItems, [27, 29, 31, 34, 38, 40]) : 0;
  const eint = isFull49 ? sumByOneBased(rawItems, [28, 32, 35, 37, 39, 42]) : 0;
  const cext = isFull49 ? sumByOneBased(rawItems, [26, 30, 33, 36, 41, 43]) : 0;
  const cint = isFull49 ? sumByOneBased(rawItems, [44, 45, 46, 47, 48, 49]) : 0;

  return {
    sentimiento: sent,
    expresion_fisica: expf,
    expresion_verbal: expv,
    temperamento: temp,
    reaccion: reacc,
    expresion_externa: eext,
    expresion_interna: eint,
    control_externo: cext,
    control_interno: cint,
    state: sent + expf + expv,
    trait: temp + reacc,
    iei: eext + eint - (cext + cint) + 36,
    is_verified_49_items: isFull49,
  };
}

export interface BadsResult {
  activation: number;
  avoidance: number;
  work: number;
  social: number;
  total: number;
  total_bads_invertido: number;
}

export function computeBads(rawItems: number[]): BadsResult {
  const revTotal = new Set([1, 2, 6, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 25]);
  const activation = sumByOneBased(rawItems, [3, 4, 5, 7, 11, 12, 23]);
  const avoidance = sumByOneBased(rawItems, [8, 9, 10, 13, 14, 15, 24, 25]);
  const work = sumByOneBased(rawItems, [1, 2, 6, 21, 22]);
  const social = sumByOneBased(rawItems, [16, 17, 18, 19, 20]);
  const totalInvertido = rawItems.reduce((acc, v, i) => acc + (revTotal.has(i + 1) ? 6 - v : v), 0);

  return {
    activation,
    avoidance,
    work,
    social,
    total: activation + avoidance + work + social,
    total_bads_invertido: totalInvertido,
  };
}

export function computeEros(rawItems: number[], mode: ScoringMode = 'excel_canonico'): number {
  const revBarraca = new Set([2, 5, 6, 7, 9]);
  if (mode === 'manual_estandar') {
    return rawItems.reduce((acc, v, i) => acc + (revBarraca.has(i + 1) ? 5 - v : v), 0);
  }
  return rawItems.reduce((acc, v) => acc + v, 0);
}

export function assemble24Vector(params: {
  bis: Bis11Result;
  staxi: Staxi2Result;
  bsl: Bsl23Result;
  gad: Gad7Result;
  bads: BadsResult;
  erosTotal?: number;
  edad: number;
  tiempoConsumo?: number;
  tiempoConsumoAnios?: number;
  tratPrevios?: number;
  tratamientosPrevios?: number;
  sustanciaPrincipal?: string;
}): Record<string, number> {
  const { bis, staxi, bsl, gad, bads, edad, sustanciaPrincipal } = params;
  const tiempoConsumo = params.tiempoConsumo ?? params.tiempoConsumoAnios ?? 0;
  const tratPrevios = params.tratPrevios ?? params.tratamientosPrevios ?? 0;
  const dummyCannabis = String(sustanciaPrincipal || '').trim().toLowerCase() === 'cannabis' ? 1.0 : 0.0;

  const cbP = COHORT_DERIVED_PARAMS.compuestos_nivel_2B_z_params.compuesto_bis;
  const compuestoBis =
    ((bis.motor - cbP['BIS.11_bis_motor'].mean) / cbP['BIS.11_bis_motor'].sd +
      (bis.nonplanning - cbP['BIS.11_bis_nonplanning'].mean) / cbP['BIS.11_bis_nonplanning'].sd +
      (bis.cognitive_instability - cbP['BIS.11_bis_cognitive_instability'].mean) /
        cbP['BIS.11_bis_cognitive_instability'].sd +
      (bis.perseverance - cbP['BIS.11_bis_perseverance'].mean) / cbP['BIS.11_bis_perseverance'].sd +
      (bis.motor_impulsivity - cbP['BIS.11_bis_motor_impulsivity'].mean) / cbP['BIS.11_bis_motor_impulsivity'].sd +
      (bis.total_calculado_zsum - cbP['BIS.11_bis_total_calculado'].mean) / cbP['BIS.11_bis_total_calculado'].sd +
      (dummyCannabis - cbP.sustancia_sustanciaCannabis.mean) / cbP.sustancia_sustanciaCannabis.sd) /
    7.0;

  const csP = COHORT_DERIVED_PARAMS.compuestos_nivel_2B_z_params.compuesto_staxi;
  const compuestoStaxi =
    ((staxi.state - csP['STAXI.2_staxi_state'].mean) / csP['STAXI.2_staxi_state'].sd +
      (staxi.trait - csP['STAXI.2_staxi_trait'].mean) / csP['STAXI.2_staxi_trait'].sd +
      (staxi.temperamento - csP['STAXI.2_staxi_temperamento'].mean) / csP['STAXI.2_staxi_temperamento'].sd) /
    3.0;

  const cbslP = COHORT_DERIVED_PARAMS.compuestos_nivel_2B_z_params.compuesto_bsl;
  const compuestoBsl =
    ((bsl.general - cbslP['BSL.23_bsl_general'].mean) / cbslP['BSL.23_bsl_general'].sd +
      (bsl.total_integrado - cbslP['BSL.23_bsl_total_integrado'].mean) /
        cbslP['BSL.23_bsl_total_integrado'].sd) /
    2.0;

  // Nota Sección 5: tiempo_consumoEROS y trat_previosEROS NO son productos con EROS_total;
  // en registros SISAP clonan determinísticamente tiempo_consumo y trat_previos, preservando EROS_total independiente.
  return {
    BIS_11BIS_motor: bis.motor,
    BIS_11BIS_nonplanning: bis.nonplanning,
    BIS_11BIS_cognitive_instability: bis.cognitive_instability,
    BIS_11BIS_perseverance: bis.perseverance,
    BIS_11BIS_motor_impulsivity: bis.motor_impulsivity,
    BIS_11BIS_total_calculado: bis.total_calculado_zsum,
    compuesto_bis: Number(compuestoBis.toFixed(6)),
    STAXI_2STAXI_state: staxi.state,
    STAXI_2STAXI_trait: staxi.trait,
    STAXI_2STAXI_temperamento: staxi.temperamento,
    compuesto_staxi: Number(compuestoStaxi.toFixed(6)),
    BSL_23BSL_general: bsl.general,
    BSL_23BSL_total_integrado: bsl.total_integrado,
    compuesto_bsl: Number(compuestoBsl.toFixed(6)),
    GAD_7GAD_zscore: gad.zscore,
    BADS_bads_activation: bads.activation,
    BADS_bads_avoidance: bads.avoidance,
    BADS_bads_work: bads.work,
    BADS_bads_social: bads.social,
    edad,
    tiempo_consumo: tiempoConsumo,
    trat_previos: tratPrevios,
    tiempo_consumoEROS: tiempoConsumo,
    trat_previosEROS: tratPrevios,
  };
}

/**
 * Validación D-06 estricta para habilitar el pipeline verificado de 5 capas en evaluación inicial.
 */
export function validateCompleteEvaluationD06(input: {
  edad: number;
  tiempo_consumo: number;
  trat_previos: number;
  raw_bis_11: string;
  raw_bsl_23: string;
  raw_bsl_23_conductual: string;
  bsl_general_0_1: number;
  raw_gad_7: string;
  raw_staxi_2: string;
  raw_bads: string;
  raw_eros: string;
  modo_scoring: ScoringMode;
}): D06ValidationResult {
  const incidents: D06ValidationIncident[] = [];
  if (!Number.isFinite(input.edad) || input.edad < 12 || input.edad > 100) {
    incidents.push({ campo: 'edad', categoria_d06: 'OUT_OF_RANGE_VALUE', mensaje: 'Edad debe estar en [12, 100].' });
  }
  if (!Number.isFinite(input.tiempo_consumo) || input.tiempo_consumo < 0 || input.tiempo_consumo > 80) {
    incidents.push({
      campo: 'tiempo_consumo',
      categoria_d06: 'OUT_OF_RANGE_VALUE',
      mensaje: 'Tiempo de consumo debe estar en [0, 80].',
    });
  }
  if (Number.isFinite(input.edad) && Number.isFinite(input.tiempo_consumo) && input.tiempo_consumo > input.edad) {
    incidents.push({
      campo: 'tiempo_consumo',
      categoria_d06: 'OUT_OF_RANGE_VALUE',
      mensaje: 'Tiempo de consumo excede la edad actual.',
    });
  }
  if (!Number.isFinite(input.trat_previos) || input.trat_previos < 0 || input.trat_previos > 50) {
    incidents.push({
      campo: 'trat_previos',
      categoria_d06: 'OUT_OF_RANGE_VALUE',
      mensaje: 'Tratamientos previos debe estar en [0, 50].',
    });
  }
  if (!Number.isFinite(input.bsl_general_0_1) || input.bsl_general_0_1 < 0 || input.bsl_general_0_1 > 1) {
    incidents.push({
      campo: 'bsl_general_0_1',
      categoria_d06: 'OUT_OF_RANGE_VALUE',
      mensaje: 'BSL-23 GENERAL debe estar en [0.0, 1.0].',
    });
  }

  const bisMin = input.modo_scoring === 'excel_canonico' ? 0 : 1;
  const erosMin = input.modo_scoring === 'excel_canonico' ? 0 : 1;

  const checks = [
    parseRawNumbersStrict(input.raw_bis_11, 30, bisMin, 4, 'BIS-11'),
    parseRawNumbersStrict(input.raw_bsl_23, 23, 0, 4, 'BSL-23'),
    parseRawNumbersStrict(input.raw_bsl_23_conductual, 11, 0, 4, 'BSL-23 Conductual'),
    parseRawNumbersStrict(input.raw_gad_7, 7, 0, 3, 'GAD-7'),
    parseRawNumbersStrict(input.raw_staxi_2, 49, 1, 4, 'STAXI-2'),
    parseRawNumbersStrict(input.raw_bads, 25, 0, 6, 'BADS'),
    parseRawNumbersStrict(input.raw_eros, 10, erosMin, 4, 'EROS'),
  ];

  for (const c of checks) {
    incidents.push(...c.incidents);
  }

  return {
    valido: incidents.length === 0,
    n_incidencias: incidents.length,
    incidencias: incidents,
  };
}
