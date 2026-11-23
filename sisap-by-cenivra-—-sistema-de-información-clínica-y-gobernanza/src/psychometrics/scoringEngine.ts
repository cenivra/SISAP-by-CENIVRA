/**
 * Motor Automático de Puntuación Psicométrica (Frontend).
 * Totalmente guiado por la configuración versionada de `instrumentCatalog.ts`.
 * Separa explícitamente:
 *   1. rawResponses (respuestas originales seleccionadas)
 *   2. recodedResponses (valores tras reglas de inversión documentadas)
 *   3. calculatedScores (totales, medias y subescalas)
 *   4. derivedIndicators (completitud, Z-scores, preparación Autoencoder)
 *   5. interpretations (bandas descriptivas normativas; nunca diagnósticos clínicos)
 */

import {
  ActiveInstrumentId,
  ResolvedInstrumentConfig,
  getOptionsForItem,
  isInstrumentExcluded,
  resolveInstrumentConfig,
} from './instrumentCatalog';
import {
  computeBads,
  computeBis11,
  computeBsl23,
  computeEros,
  computeGad7,
  computeStaxi2,
  ScoringMode,
} from '../services/scalesEngine';

export interface DigitalItemResponseInput {
  itemId: string;
  numericCode: number | null;
  selectedOptionLabel?: string | null;
  modifiedAt?: string;
}

export interface PsychometricOptionalComplements {
  bslGeneral01?: number | null;
  bslBehavioral11?: Array<number | null> | null;
}

export interface RawItemResponseLayer {
  itemId: string;
  displayNumber: number;
  canonicalCode: string;
  section: string;
  selectedOptionLabel: string | null;
  numericCode: number | null;
  isMissing: boolean;
  pendingAuthorizedText: boolean;
  modifiedAt: string | null;
}

export interface RecodedItemResponseLayer {
  itemId: string;
  displayNumber: number;
  canonicalCode: string;
  rawValue: number | null;
  recodedValue: number | null;
  wasInverted: boolean;
  inversionFormulaApplied: string | null;
}

export interface SubscaleScoreResult {
  id: string;
  name: string;
  order: string;
  score: number | null;
  mean: number | null;
  range: [number, number];
  answeredCount: number;
  expectedCount: number;
  missingCount: number;
  isComplete: boolean;
  reliabilityOmega?: number;
}

export interface StructuredPsychometricScoreResult {
  instrumentId: ActiveInstrumentId;
  instrumentName: string;
  instrumentVersion: string;
  language: string;
  algorithmVersion: string;
  scoringMode: ScoringMode;
  calculatedAt: string;
  rawResponses: RawItemResponseLayer[];
  recodedResponses: RecodedItemResponseLayer[];
  calculatedScores: {
    totalScore: number | null;
    technicalReferenceTotal: number | null;
    meanScore: number | null;
    subscales: SubscaleScoreResult[];
    subscaleMap: Record<string, number | null>;
    alternateScoringModes: Record<string, any>;
  };
  derivedIndicators: {
    completeness: {
      expectedItems: number;
      requiredAuthorizedItems: number;
      answeredItems: number;
      answeredAuthorizedItems: number;
      missingItems: number;
      missingAuthorizedItems: number;
      missingItemIds: string[];
      missingDisplayNumbers: number[];
      completionPct: number;
      authorizedCompletionPct: number;
      isComplete: boolean;
      isAuthorizedComplete: boolean;
      isValidForScoring: boolean;
      warnings: string[];
      criticalSafetyAlerts: Array<{ itemId: string; displayNumber: number; flag: string; rawValue: number }>;
    };
    cohortZScores: Record<string, number | null>;
    autoencoderReadiness: {
      compatible24v: boolean;
      modeNote: string;
      coveredVariables: string[];
    };
    numericSequence: string;
    numericArray: Array<number | null>;
  };
  interpretations: {
    level: string;
    summary: string;
    descriptiveNotes: string[];
    nonDiagnosticNotice: string;
  };
}

function round4(v: number): number {
  return Number(v.toFixed(4));
}

function round6(v: number): number {
  return Number(v.toFixed(6));
}

function sumNums(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

/**
 * Invierte un valor según la regla pivot (ej. pivot=5 en Likert 1..4 => 5 - x).
 */
function applyInversion(value: number, config: ResolvedInstrumentConfig, reverseItem: boolean): {
  recoded: number;
  wasInverted: boolean;
  formula: string | null;
} {
  if (!reverseItem) {
    return { recoded: value, wasInverted: false, formula: null };
  }
  const pivot = Number(config.inversionRules?.pivot);
  if (!Number.isFinite(pivot) || config.inversionRules?.formula === 'none') {
    return { recoded: value, wasInverted: false, formula: null };
  }
  return {
    recoded: pivot - value,
    wasInverted: true,
    formula: `${pivot} - x`,
  };
}

/**
 * Motor puro y determinista de puntuación automática.
 */
export function scorePsychometricEvaluation(params: {
  instrumentId: string;
  instrumentVersion?: string;
  responses: DigitalItemResponseInput[] | Record<string, number | null>;
  optionalComplements?: PsychometricOptionalComplements;
  scoringMode?: ScoringMode;
  nowIso?: string;
}): StructuredPsychometricScoreResult {
  if (isInstrumentExcluded(params.instrumentId)) {
    throw new Error(`Instrumento ${params.instrumentId} excluido del catálogo activo.`);
  }

  const config = resolveInstrumentConfig(params.instrumentId, params.instrumentVersion);
  const scoringMode: ScoringMode = params.scoringMode || 'manual_estandar';
  const calculatedAt = params.nowIso || new Date().toISOString();

  // Normalizar mapa de respuestas por itemId o displayNumber
  const inputByItemId = new Map<string, DigitalItemResponseInput>();
  if (Array.isArray(params.responses)) {
    for (const r of params.responses) {
      if (r && r.itemId) {
        inputByItemId.set(r.itemId, r);
      }
    }
  } else if (params.responses && typeof params.responses === 'object') {
    for (const [k, v] of Object.entries(params.responses)) {
      inputByItemId.set(k, {
        itemId: k,
        numericCode: v === null || v === undefined ? null : Number(v),
      });
    }
  }

  const warnings: string[] = [];
  const criticalSafetyAlerts: Array<{ itemId: string; displayNumber: number; flag: string; rawValue: number }> = [];

  // Capa 1: Raw Responses + validación contra opciones permitidas de la versión
  const rawResponses: RawItemResponseLayer[] = config.items.map((item) => {
    const allowedOptions = getOptionsForItem(config, item);
    const allowedValues = new Set(allowedOptions.map((o) => o.value));
    const entry = inputByItemId.get(item.itemId);
    const num = entry?.numericCode;
    const isPresent = num !== null && num !== undefined && Number.isFinite(num);

    if (isPresent && !allowedValues.has(num as number)) {
      const minOpt = Math.min(...allowedOptions.map((o) => o.value));
      const maxOpt = Math.max(...allowedOptions.map((o) => o.value));
      throw new Error(
        `${config.id} (${config.version}) reactivo ${item.displayNumber} (${item.canonicalCode}): valor ${num} fuera de opciones válidas [${minOpt}..${maxOpt}].`
      );
    }

    const matchedOption = isPresent ? allowedOptions.find((o) => o.value === num) : undefined;
    const rawNumeric = isPresent ? (num as number) : null;

    if (isPresent && item.clinicalAlertFlag && (rawNumeric as number) >= 1) {
      criticalSafetyAlerts.push({
        itemId: item.itemId,
        displayNumber: item.displayNumber,
        flag: item.clinicalAlertFlag,
        rawValue: rawNumeric as number,
      });
    }

    return {
      itemId: item.itemId,
      displayNumber: item.displayNumber,
      canonicalCode: item.canonicalCode,
      section: item.section,
      selectedOptionLabel: isPresent ? (entry?.selectedOptionLabel || matchedOption?.label || String(rawNumeric)) : null,
      numericCode: rawNumeric,
      isMissing: !isPresent,
      pendingAuthorizedText: Boolean(item.pendingAuthorizedText),
      modifiedAt: entry?.modifiedAt || null,
    };
  });

  // Capa 2: Recoded Responses (aplicando inversión solo cuando procede en ítems)
  const recodedResponses: RecodedItemResponseLayer[] = config.items.map((item, idx) => {
    const rawRow = rawResponses[idx];
    if (rawRow.isMissing || rawRow.numericCode === null) {
      return {
        itemId: item.itemId,
        displayNumber: item.displayNumber,
        canonicalCode: item.canonicalCode,
        rawValue: null,
        recodedValue: null,
        wasInverted: false,
        inversionFormulaApplied: null,
      };
    }

    // En BIS-11 excel_canonico histórico no invertía en la suma directa, mientras manual_estandar sí invierte.
    // Para el motor psicométrico oficial, las reglas de inversión se aplican según configuración; si scoringMode === 'excel_canonico' en BIS-11/EROS conservamos ambos resultados en alternateScoringModes.
    const shouldInvertItem = item.reverse === true && !(config.id === 'BIS-11' && scoringMode === 'excel_canonico');
    const inv = applyInversion(rawRow.numericCode, config, shouldInvertItem);

    return {
      itemId: item.itemId,
      displayNumber: item.displayNumber,
      canonicalCode: item.canonicalCode,
      rawValue: rawRow.numericCode,
      recodedValue: inv.recoded,
      wasInverted: inv.wasInverted,
      inversionFormulaApplied: inv.formula,
    };
  });

  // Indicadores de completitud
  const authorizedItems = rawResponses.filter((r) => !r.pendingAuthorizedText);
  const missingAll = rawResponses.filter((r) => r.isMissing);
  const missingAuthorized = authorizedItems.filter((r) => r.isMissing);
  const answeredCount = rawResponses.length - missingAll.length;
  const answeredAuthorizedCount = authorizedItems.length - missingAuthorized.length;

  const isComplete = missingAll.length === 0;
  const isAuthorizedComplete = missingAuthorized.length === 0;

  // Mapas auxiliares por itemId y displayNumber
  const rawById = new Map<string, number | null>();
  const recodedById = new Map<string, number | null>();
  const rawByDisplay = new Map<number, number | null>();
  const recodedByDisplay = new Map<number, number | null>();
  for (let i = 0; i < config.items.length; i++) {
    const it = config.items[i];
    rawById.set(it.itemId, rawResponses[i].numericCode);
    recodedById.set(it.itemId, recodedResponses[i].recodedValue);
    rawByDisplay.set(it.displayNumber, rawResponses[i].numericCode);
    recodedByDisplay.set(it.displayNumber, recodedResponses[i].recodedValue);
  }

  // Capa 3: Subescalas basadas en configuración
  const subscales: SubscaleScoreResult[] = [];
  const subscaleMap: Record<string, number | null> = {};

  for (const sub of config.subscales) {
    if (sub.itemIds && sub.itemIds.length > 0) {
      const vals: number[] = [];
      let miss = 0;
      for (const id of sub.itemIds) {
        const v = sub.useRecoded ? recodedById.get(id) : rawById.get(id);
        if (v === null || v === undefined) miss++;
        else vals.push(v);
      }
      const complete = miss === 0;
      const sc = complete ? sumNums(vals) : null;
      const mean = complete && sub.itemIds.length > 0 ? round4((sc as number) / sub.itemIds.length) : null;
      subscaleMap[sub.id] = sc;
      subscales.push({
        id: sub.id,
        name: sub.name,
        order: sub.order,
        score: sc,
        mean,
        range: sub.range,
        answeredCount: sub.itemIds.length - miss,
        expectedCount: sub.itemIds.length,
        missingCount: miss,
        isComplete: complete,
        reliabilityOmega: sub.reliabilityOmega,
      });
    } else if (sub.displayNumbers && sub.displayNumbers.length > 0) {
      const useNums =
        config.id === 'BIS-11' && scoringMode === 'excel_canonico' && sub.canonicalAlternateDisplayNumbers
          ? sub.canonicalAlternateDisplayNumbers
          : sub.displayNumbers;
      const useRecodedFlag =
        sub.useRecoded !== undefined
          ? sub.useRecoded
          : config.id === 'BIS-11' || config.id === 'EROS';

      const vals: number[] = [];
      let miss = 0;
      for (const dn of useNums) {
        const v = useRecodedFlag ? recodedByDisplay.get(dn) : rawByDisplay.get(dn);
        if (v === null || v === undefined) miss++;
        else vals.push(v);
      }
      const complete = miss === 0;
      const sc = complete ? sumNums(vals) : null;
      const mean = complete && useNums.length > 0 ? round4((sc as number) / useNums.length) : null;
      subscaleMap[sub.id] = sc;
      subscales.push({
        id: sub.id,
        name: sub.name,
        order: sub.order,
        score: sc,
        mean,
        range: sub.range,
        answeredCount: useNums.length - miss,
        expectedCount: useNums.length,
        missingCount: miss,
        isComplete: complete,
        reliabilityOmega: sub.reliabilityOmega,
      });
    } else if (sub.subscaleRefs && sub.subscaleRefs.length > 0) {
      const childResults = sub.subscaleRefs.map((refId) => subscales.find((s) => s.id === refId)).filter(Boolean) as SubscaleScoreResult[];
      const allComplete = childResults.length === sub.subscaleRefs.length && childResults.every((c) => c.isComplete && c.score !== null);
      const expectedCount = childResults.reduce((a, b) => a + b.expectedCount, 0);
      const answeredSub = childResults.reduce((a, b) => a + b.answeredCount, 0);
      const missingSub = expectedCount - answeredSub;
      const sc = allComplete ? sumNums(childResults.map((c) => c.score as number)) : null;
      const mean = allComplete && expectedCount > 0 ? round4((sc as number) / expectedCount) : null;
      subscaleMap[sub.id] = sc;
      subscales.push({
        id: sub.id,
        name: sub.name,
        order: sub.order,
        score: sc,
        mean,
        range: sub.range,
        answeredCount: answeredSub,
        expectedCount,
        missingCount: missingSub,
        isComplete: allComplete,
        reliabilityOmega: sub.reliabilityOmega,
      });
    } else if (sub.id === 'staxi_iei') {
      const eext = subscaleMap['staxi_expresion_externa'];
      const eint = subscaleMap['staxi_expresion_interna'];
      const cext = subscaleMap['staxi_control_externo'];
      const cint = subscaleMap['staxi_control_interno'];
      const validIei = eext !== null && eint !== null && cext !== null && cint !== null;
      const ieiVal = validIei ? (eext as number) + (eint as number) - ((cext as number) + (cint as number)) + 36 : null;
      subscaleMap[sub.id] = ieiVal;
      subscales.push({
        id: sub.id,
        name: sub.name,
        order: sub.order,
        score: ieiVal,
        mean: null,
        range: sub.range,
        answeredCount: validIei ? 24 : 0,
        expectedCount: 24,
        missingCount: validIei ? 0 : 24 - Math.min(24, rawResponses.slice(25, 49).filter((r) => !r.isMissing).length),
        isComplete: validIei,
      });
    }
  }

  // Validez por instrumento + Totales + Modos alternativos (paridad exacta con R / Autoencoder)
  let isValidForScoring = isAuthorizedComplete;
  let totalScore: number | null = null;
  let technicalReferenceTotal: number | null = null;
  let meanScore: number | null = null;
  const alternateScoringModes: Record<string, any> = {};
  const cohortZScores: Record<string, number | null> = {};
  const autoencoderCovered: string[] = [];
  let autoencoderCompatible = false;
  let autoencoderNote = '';

  const numericArray = rawResponses.map((r) => r.numericCode);
  const authorizedNumeric = authorizedItems.map((r) => r.numericCode);

  if (!isAuthorizedComplete) {
    warnings.push(
      `Faltan ${missingAuthorized.length} reactivo(s) requerido(s) sin responder; las puntuaciones totales no se calculan por interpolación ni imputación silenciosa.`
    );
  }

  if (config.id === 'BIS-11' && isAuthorizedComplete) {
    const nums = numericArray as number[];
    const man = computeBis11(nums, 'manual_estandar');
    const can = computeBis11(nums, 'excel_canonico');
    const sumManualRecoded = sumNums(recodedResponses.map((r) => r.recodedValue as number));
    totalScore = scoringMode === 'excel_canonico' ? can.total : sumManualRecoded;
    technicalReferenceTotal = sumManualRecoded;
    meanScore = round4(sumManualRecoded / 30);
    alternateScoringModes.manual_estandar = {
      ...man,
      total_patton_invertido: sumManualRecoded,
    };
    alternateScoringModes.excel_canonico = can;
    cohortZScores.bis_total_calculado_zsum = can.total_calculado_zsum;
    autoencoderCompatible = true;
    autoencoderCovered.push(
      'BIS_11BIS_motor',
      'BIS_11BIS_nonplanning',
      'BIS_11BIS_cognitive_instability',
      'BIS_11BIS_perseverance',
      'BIS_11BIS_motor_impulsivity',
      'BIS_11BIS_total_calculado',
      'compuesto_bis'
    );
    autoencoderNote = 'Cobertura completa del bloque BIS-11 para Autoencoder 24v/22v.';
  } else if (config.id === 'BSL-23' && isAuthorizedComplete) {
    const nums = numericArray as number[];
    const behRaw = params.optionalComplements?.bslBehavioral11;
    const validBeh =
      Array.isArray(behRaw) &&
      behRaw.length === 11 &&
      behRaw.every((v) => v !== null && v !== undefined && Number.isFinite(v))
        ? (behRaw as number[])
        : undefined;
    const genVal =
      typeof params.optionalComplements?.bslGeneral01 === 'number' &&
      Number.isFinite(params.optionalComplements.bslGeneral01)
        ? params.optionalComplements.bslGeneral01
        : undefined;
    const bsl = computeBsl23(nums, validBeh, genVal);
    totalScore = bsl.total_23;
    technicalReferenceTotal = bsl.total_integrado;
    meanScore = bsl.media_23;
    alternateScoringModes.bsl23_estandar_y_suplemento = {
      ...bsl,
      total_integrado_normalizado_136: validBeh ? round4(bsl.total_integrado / 136) : round4(bsl.total_23 / 92),
    };
    if (!validBeh || genVal === undefined) {
      warnings.push(
        'BSL-23 central (23 ítems) completo. Para el pipeline transversal 24v del Autoencoder se recomienda registrar además la valoración global (0–1) y los 11 ítems del suplemento conductual.'
      );
    }
    autoencoderCompatible = Boolean(validBeh && genVal !== undefined);
    autoencoderCovered.push('BSL_23BSL_general', 'BSL_23BSL_total_integrado', 'compuesto_bsl');
    autoencoderNote = autoencoderCompatible
      ? 'Incluye los 23 ítems centrales, el suplemento conductual (11) y GENERAL (0–1).'
      : 'BSL-23 central completo (23 ítems); faltan complementos opcionales para paridad exacta de total_integrado.';
  } else if (config.id === 'GAD-7' && isAuthorizedComplete) {
    const nums = numericArray as number[];
    const gad = computeGad7(nums);
    const zCohorte166 = round6((gad.total - 8.0843) / 5.9027);
    totalScore = gad.total;
    meanScore = round4(gad.total / 7);
    cohortZScores.gad_zscore_piloto_n10 = gad.zscore;
    cohortZScores.gad_zscore_cohorte_166 = zCohorte166;
    alternateScoringModes.spitzer_2006 = gad;
    autoencoderCompatible = true;
    autoencoderCovered.push('GAD_7GAD_zscore');
    autoencoderNote = 'Cobertura directa exacta de GAD_7GAD_zscore.';
  } else if (config.id === 'GAD-7' && !isAuthorizedComplete) {
    if (answeredAuthorizedCount < 6) {
      warnings.push('Menos de 6 respuestas válidas en GAD-7 (criterio scoring_gad7.r).');
    }
  } else if (config.id === 'EROS' && isAuthorizedComplete) {
    const nums = numericArray as number[];
    const totalInvertido = computeEros(nums, 'manual_estandar');
    const totalDirectoCanonico = computeEros(nums, 'excel_canonico');
    const zRef = round6((totalInvertido - 26.23) / 6.495);
    totalScore = totalInvertido;
    technicalReferenceTotal = totalDirectoCanonico;
    meanScore = round4(totalInvertido / 10);
    cohortZScores.eros_z_barraca2010 = zRef;
    cohortZScores.eros_t_barraca2010 = round4(50 + 10 * zRef);
    alternateScoringModes.manual_barraca_10 = {
      total_10: totalInvertido,
      media: meanScore,
      inversos_aplicados: [2, 5, 6, 7, 9],
    };
    alternateScoringModes.validacion_proyecto_9items = {
      factor_1_agrado_5: subscaleMap['eros_f1_agrado_5'],
      factor_2_ausencia_disforia_4: subscaleMap['eros_f2_disforia_4_inv'],
      factor_2_disforia_bruta_4: subscaleMap['eros_f2_disforia_4_raw'],
      total_9items_recodificado: subscaleMap['eros_validado_9'],
      item_excluido: 'EROS7',
    };
    alternateScoringModes.excel_canonico_directo = {
      total_directo_10: totalDirectoCanonico,
    };
    autoencoderCompatible = true;
    autoencoderNote = 'EROS completo (10 ítems); calcula simultáneamente 10 ítems Barraca y modelo validado 9 ítems.';
  } else if (config.id === 'BADS' && isAuthorizedComplete) {
    const nums = numericArray as number[];
    if (config.version === 'v25.0-barraca2011' && nums.length === 25) {
      const bads25 = computeBads(nums);
      totalScore = null; // Perfil conductual recomendado (conserva technicalReferenceTotal)
      technicalReferenceTotal = bads25.total_bads_invertido;
      meanScore = round4(bads25.total / 25);
      alternateScoringModes.bads_25_barraca = bads25;
      autoencoderCompatible = true;
      autoencoderCovered.push('BADS_bads_activation', 'BADS_bads_avoidance', 'BADS_bads_work', 'BADS_bads_social');
      autoencoderNote = 'BADS-25 completo compatible directamente con Autoencoder 24v/22v.';
    } else {
      const act = subscaleMap['bads_activation'] as number;
      const avoid = subscaleMap['bads_avoidance'] as number;
      const work = subscaleMap['bads_work'] as number;
      const social = subscaleMap['bads_social'] as number;
      const dysTotal = avoid + work + social;
      const techTotal22 = act + (96 - dysTotal);
      totalScore = null; // Regla INFORME_REVISION_FACTORIAL_BADS.md: no usar total unidimensional como diagnóstico único
      technicalReferenceTotal = techTotal22;
      meanScore = round4((act + dysTotal) / 22);
      alternateScoringModes.bads_22_validado_tus = {
        activacion_6: act,
        activacion_autonoma_3: subscaleMap['bads_activation_autonomous'],
        activacion_forzada_3: subscaleMap['bads_activation_regulated'],
        evitacion_rumia_7: avoid,
        deterioro_laboral_5: work,
        deterioro_social_4: social,
        deterioro_funcional_integrado_9: subscaleMap['bads_functional_impairment'],
        disfuncion_evitacion_total_16: dysTotal,
        total_tecnico_referencial_22: techTotal22,
        proyeccion_referencial_escala_25: {
          nota: 'Referencia orientativa proporcional por omisión de P4, P10, P16; no sustituye aplicación de 25 reactivos para Autoencoder estricto.',
          activation_eq_25: round4(act * (7 / 6)),
          avoidance_eq_25: round4(avoid * (8 / 7)),
          work_eq_25: work,
          social_eq_25: round4(social * (5 / 4)),
        },
      };
      autoencoderCompatible = false;
      autoencoderCovered.push('BADS_bads_work');
      autoencoderNote =
        'Versión validada BADS-22 (sin P4, P10, P16). Para inferencia Autoencoder transversal estricta N=166 sin reescalado, puede aplicar BADS-25.';
    }
  } else if (config.id === 'STAXI-2') {
    const omittedOver49 = rawResponses.slice(0, 49).filter((r) => r.isMissing).length;
    const missSent = [1, 2, 3, 5, 7].filter((dn) => rawByDisplay.get(dn) === null).length;
    const missExpF = [4, 8, 11, 13, 14].filter((dn) => rawByDisplay.get(dn) === null).length;
    const missExpV = [6, 9, 10, 12, 15].filter((dn) => rawByDisplay.get(dn) === null).length;
    const missTemp = [16, 17, 18, 20, 23].filter((dn) => rawByDisplay.get(dn) === null).length;
    const missReac = [19, 21, 22, 24, 25].filter((dn) => rawByDisplay.get(dn) === null).length;
    const teaProtocolValid =
      omittedOver49 === 0 &&
      missSent <= 1 &&
      missExpF <= 1 &&
      missExpV <= 1 &&
      missTemp <= 1 &&
      missReac <= 1;

    if (omittedOver49 === 0) {
      const nums49 = rawResponses.slice(0, 49).map((r) => r.numericCode as number);
      const st = computeStaxi2(nums49);
      totalScore = null; // STAXI-2 nunca se colapsa en una suma única global
      technicalReferenceTotal = sumNums(nums49);
      meanScore = round4(sumNums(nums49) / 49);
      isValidForScoring = true;
      alternateScoringModes.staxi2_tea49 = st;
      alternateScoringModes.staxi2_items_50_57_pendientes = {
        respondidos_extra_50_57: rawResponses.slice(49, 57).filter((r) => !r.isMissing).length,
        pendientes_texto_autorizado: config.version === 'v57.0-tea49-hybrid' ? 8 : 0,
      };
      autoencoderCompatible = true;
      autoencoderCovered.push('STAXI_2STAXI_state', 'STAXI_2STAXI_trait', 'STAXI_2STAXI_temperamento', 'compuesto_staxi');
      autoencoderNote = '49 reactivos TEA Ediciones completos; cobertura íntegra del bloque STAXI-2 para Autoencoder.';
      if (config.version === 'v57.0-tea49-hybrid') {
        warnings.push(
          'Protocolo 57 reactivos: los reactivos 1–49 TEA Ediciones están completos y validados; las posiciones 50–57 corresponden al protocolo extendido PAR pendiente de texto autorizado.'
        );
      }
    } else {
      isValidForScoring = false;
      if (omittedOver49 >= 10) {
        warnings.push(
          `Protocolo STAXI-2 inválido según regla TEA Ediciones (p. 17): ${omittedOver49} reactivos omitidos en la forma 1–49 (máximo tolerado <10).`
        );
      } else if (!teaProtocolValid) {
        warnings.push(
          `Faltan ${omittedOver49} reactivo(s) dentro de los 49 reactivos TEA Ediciones; complete la batería para evitar sesgo en escalas e IEI.`
        );
      }
    }
  }

  // Capa 5: Interpretación descriptiva normativa (no diagnóstica)
  const interpretation = buildInterpretation(config, {
    totalScore,
    technicalReferenceTotal,
    meanScore,
    subscaleMap,
    isValidForScoring,
    criticalSafetyAlerts,
  });

  const cleanNumericSeq = rawResponses
    .map((r) => (r.numericCode === null ? 'NA' : String(r.numericCode)))
    .join(' ');

  return {
    instrumentId: config.id,
    instrumentName: config.name,
    instrumentVersion: config.version,
    language: config.language,
    algorithmVersion: config.algorithmVersion,
    scoringMode,
    calculatedAt,
    rawResponses,
    recodedResponses,
    calculatedScores: {
      totalScore,
      technicalReferenceTotal,
      meanScore,
      subscales,
      subscaleMap,
      alternateScoringModes,
    },
    derivedIndicators: {
      completeness: {
        expectedItems: config.itemCount,
        requiredAuthorizedItems: authorizedItems.length,
        answeredItems: answeredCount,
        answeredAuthorizedItems: answeredAuthorizedCount,
        missingItems: missingAll.length,
        missingAuthorizedItems: missingAuthorized.length,
        missingItemIds: missingAll.map((m) => m.itemId),
        missingDisplayNumbers: missingAll.map((m) => m.displayNumber),
        completionPct: round4((answeredCount / config.itemCount) * 100),
        authorizedCompletionPct:
          authorizedItems.length > 0 ? round4((answeredAuthorizedCount / authorizedItems.length) * 100) : 100,
        isComplete,
        isAuthorizedComplete,
        isValidForScoring,
        warnings,
        criticalSafetyAlerts,
      },
      cohortZScores,
      autoencoderReadiness: {
        compatible24v: autoencoderCompatible,
        modeNote: autoencoderNote,
        coveredVariables: autoencoderCovered,
      },
      numericSequence: cleanNumericSeq,
      numericArray,
    },
    interpretations: interpretation,
  };
}

function buildInterpretation(
  config: ResolvedInstrumentConfig,
  ctx: {
    totalScore: number | null;
    technicalReferenceTotal: number | null;
    meanScore: number | null;
    subscaleMap: Record<string, number | null>;
    isValidForScoring: boolean;
    criticalSafetyAlerts: Array<{ itemId: string; displayNumber: number; flag: string; rawValue: number }>;
  }
) {
  const descriptiveNotes: string[] = [];
  if (!ctx.isValidForScoring) {
    return {
      level: 'Evaluación incompleta / pendiente de cierre',
      summary: 'La aplicación contiene reactivos pendientes necesarios para el cálculo normativo.',
      descriptiveNotes: ['Complete los reactivos requeridos antes de emitir un perfil cuantitativo definitivo.'],
      nonDiagnosticNotice: config.interpretationRules.clinicalDisclaimer,
    };
  }

  let level = 'Perfil calculado';
  let summary = '';

  if (config.id === 'BADS') {
    const act = ctx.subscaleMap['bads_activation'];
    const avoid = ctx.subscaleMap['bads_avoidance'];
    const work = ctx.subscaleMap['bads_work'];
    const social = ctx.subscaleMap['bads_social'];
    const dys = ctx.subscaleMap['bads_dysfunction_avoidance_total'];
    level = 'Perfil Conductual Multidimensional (Activación vs. Disfunción)';
    summary = `Activación Conductual = ${act} pts; Evitación/Rumia = ${avoid} pts; Deterioro Laboral = ${work} pts; Deterioro Social = ${social} pts (Disfunción/Evitación Total = ${dys} pts).`;
    descriptiveNotes.push(config.interpretationRules.bands[0].description);
  } else if (config.id === 'STAXI-2') {
    const est = ctx.subscaleMap['staxi_state_total'];
    const ras = ctx.subscaleMap['staxi_trait_total'];
    const iei = ctx.subscaleMap['staxi_iei'];
    level = 'Perfil Multidimensional de Ira Estado-Rasgo-Expresión';
    summary = `Estado de Ira = ${est}/60 · Rasgo de Ira = ${ras}/40 · Índice de Expresión de Ira (IEI) = ${iei}/72.`;
    descriptiveNotes.push(config.interpretationRules.bands[0].description);
  } else {
    const targetVal =
      config.id === 'BSL-23' ? ctx.meanScore : ctx.totalScore;
    const band = config.interpretationRules.bands.find(
      (b) => targetVal !== null && targetVal >= b.min && targetVal <= b.max
    );
    level = band ? band.level : 'Puntuación calculada';
    summary = band
      ? band.description
      : `Puntuación calculada: ${ctx.totalScore ?? 'N/A'}.`;

    if (config.id === 'EROS') {
      const f1 = ctx.subscaleMap['eros_f1_agrado_5'];
      const f2 = ctx.subscaleMap['eros_f2_disforia_4_inv'];
      const t9 = ctx.subscaleMap['eros_validado_9'];
      descriptiveNotes.push(
        `Validación interna TUS (9 ítems, excluye EROS7): Agrado = ${f1}/20, Ausencia de Disforia = ${f2}/16, Total 9 ítems = ${t9}/36.`
      );
    }
  }

  if (ctx.criticalSafetyAlerts.length > 0) {
    descriptiveNotes.push(
      `Atención clínica prioritaria: se registraron valores ≥ 1 en ${ctx.criticalSafetyAlerts.length} reactivo(s) sensibles de riesgo (${ctx.criticalSafetyAlerts.map((a) => `#${a.displayNumber}`).join(', ')}).`
    );
  }

  return {
    level,
    summary,
    descriptiveNotes,
    nonDiagnosticNotice: config.interpretationRules.clinicalDisclaimer,
  };
}

/**
 * Adaptador de equivalencia: convierte una secuencia numérica legada ("1 3 2 ...")
 * en respuestas digitales individuales vinculadas a la versión activa del catálogo.
 */
export function numericSequenceToDigitalResponses(
  instrumentId: string,
  sequenceInput: string | number[],
  instrumentVersion?: string
): DigitalItemResponseInput[] {
  const config = resolveInstrumentConfig(instrumentId, instrumentVersion);
  const tokens: Array<number | null> = Array.isArray(sequenceInput)
    ? sequenceInput.map((v) => (v === null || v === undefined || !Number.isFinite(Number(v)) ? null : Number(v)))
    : String(sequenceInput || '')
        .trim()
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map((t) => {
          if (t.toUpperCase() === 'NA' || t === '-') return null;
          const n = Number(t);
          return Number.isFinite(n) ? n : null;
        });

  if (tokens.length !== config.itemCount) {
    throw new Error(
      `La secuencia numérica para ${config.id} (${config.version}) requiere ${config.itemCount} valores y recibió ${tokens.length}.`
    );
  }

  const nowIso = new Date().toISOString();
  return config.items.map((item, idx) => {
    const val = tokens[idx];
    const options = getOptionsForItem(config, item);
    const opt = val !== null ? options.find((o) => o.value === val) : undefined;
    return {
      itemId: item.itemId,
      numericCode: val,
      selectedOptionLabel: opt ? opt.label : val !== null ? String(val) : null,
      modifiedAt: nowIso,
    };
  });
}

/**
 * Convierte respuestas digitales individuales a secuencia numérica ordenada (para compatibilidad legada y Autoencoder).
 */
export function digitalResponsesToNumericSequence(
  instrumentId: string,
  responses: DigitalItemResponseInput[] | Record<string, number | null>,
  instrumentVersion?: string
): { sequence: string; values: Array<number | null> } {
  const config = resolveInstrumentConfig(instrumentId, instrumentVersion);
  const map = new Map<string, number | null>();
  if (Array.isArray(responses)) {
    for (const r of responses) map.set(r.itemId, r.numericCode);
  } else {
    for (const [k, v] of Object.entries(responses)) map.set(k, v);
  }

  const values = config.items.map((it) => {
    const v = map.get(it.itemId);
    return v === undefined ? null : v;
  });

  return {
    sequence: values.map((v) => (v === null ? 'NA' : String(v))).join(' '),
    values,
  };
}

/**
 * Verifica matemáticamente la paridad exacta entre captura digital y captura numérica legada.
 */
export function verifyCaptureEquivalence(
  instrumentId: string,
  responses: DigitalItemResponseInput[],
  instrumentVersion?: string,
  scoringMode: ScoringMode = 'manual_estandar'
): {
  equivalent: boolean;
  digitalTotal: number | null;
  legacyTotal: number | null;
  maxSubscaleDiff: number;
} {
  const digitalResult = scorePsychometricEvaluation({
    instrumentId,
    instrumentVersion,
    responses,
    scoringMode,
  });
  const converted = numericSequenceToDigitalResponses(
    instrumentId,
    digitalResult.derivedIndicators.numericSequence,
    instrumentVersion
  );
  const legacyResult = scorePsychometricEvaluation({
    instrumentId,
    instrumentVersion,
    responses: converted,
    scoringMode,
  });

  let maxSubscaleDiff = 0;
  for (const sub of digitalResult.calculatedScores.subscales) {
    const a = sub.score ?? 0;
    const b = legacyResult.calculatedScores.subscaleMap[sub.id] ?? 0;
    maxSubscaleDiff = Math.max(maxSubscaleDiff, Math.abs(a - b));
  }

  const totEqual =
    digitalResult.calculatedScores.totalScore === legacyResult.calculatedScores.totalScore &&
    digitalResult.calculatedScores.technicalReferenceTotal === legacyResult.calculatedScores.technicalReferenceTotal;

  return {
    equivalent: totEqual && maxSubscaleDiff < 1e-12,
    digitalTotal: digitalResult.calculatedScores.totalScore,
    legacyTotal: legacyResult.calculatedScores.totalScore,
    maxSubscaleDiff,
  };
}
