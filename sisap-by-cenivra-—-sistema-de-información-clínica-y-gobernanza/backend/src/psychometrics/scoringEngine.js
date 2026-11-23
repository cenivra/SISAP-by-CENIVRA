/**
 * Motor Automático de Puntuación Psicométrica (Backend ESM).
 * Mantiene paridad exacta 1:1 con `src/psychometrics/scoringEngine.ts` y `engines/autoencoder/`.
 */
import {
  getOptionsForItem,
  isInstrumentExcluded,
  resolveInstrumentConfig,
} from './instrumentCatalog.js';
import { loadVerifiedRegistryAndArtifacts } from '../../../engines/autoencoder/inference/autoencoderInferenceEngine.js';

let _cachedCohortParams = null;
function getCohortParams() {
  if (!_cachedCohortParams) {
    _cachedCohortParams = loadVerifiedRegistryAndArtifacts().refParams;
  }
  return _cachedCohortParams;
}

function round4(v) {
  return Number(v.toFixed(4));
}

function round6(v) {
  return Number(v.toFixed(6));
}

function sumNums(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

function sumByOneBased(arr, oneBased) {
  let acc = 0;
  for (const idx of oneBased) {
    acc += arr[idx - 1] ?? 0;
  }
  return acc;
}

function computeBis11Core(rawItems, mode = 'manual_estandar') {
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

  const COHORT_PARAMS = getCohortParams();
  const p = COHORT_PARAMS.bis_total_calculado_z_params.parametros_cohorte_166;
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
    total_calculado_zsum: round6(total_calculado_zsum),
  };
}

function computeGad7Core(rawItems) {
  const total = sumNums(rawItems);
  const { mean_X1_ref, sd_Y1_ref } = getCohortParams().gad7_zscore_excel_params;
  const zscore = round6((total - mean_X1_ref) / sd_Y1_ref);
  const severidad = total <= 4 ? 'Mínima' : total <= 9 ? 'Leve' : total <= 14 ? 'Moderada' : 'Severa';
  return { total, zscore, severidad };
}

function computeStaxi2Core(rawItems) {
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

function computeBads25Core(rawItems) {
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

function applyInversion(value, config, reverseItem) {
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

export function scorePsychometricEvaluation({
  instrumentId,
  instrumentVersion,
  responses,
  optionalComplements = {},
  scoringMode = 'manual_estandar',
  nowIso,
}) {
  if (isInstrumentExcluded(instrumentId)) {
    throw new Error(`Instrumento ${instrumentId} excluido del catálogo activo.`);
  }

  const config = resolveInstrumentConfig(instrumentId, instrumentVersion);
  const calculatedAt = nowIso || new Date().toISOString();

  const inputByItemId = new Map();
  if (Array.isArray(responses)) {
    for (const r of responses) {
      if (r && r.itemId) {
        inputByItemId.set(r.itemId, r);
      }
    }
  } else if (responses && typeof responses === 'object') {
    for (const [k, v] of Object.entries(responses)) {
      inputByItemId.set(k, {
        itemId: k,
        numericCode: v === null || v === undefined ? null : Number(v),
      });
    }
  }

  const warnings = [];
  const criticalSafetyAlerts = [];

  const rawResponses = config.items.map((item) => {
    const allowedOptions = getOptionsForItem(config, item);
    const allowedValues = new Set(allowedOptions.map((o) => o.value));
    const entry = inputByItemId.get(item.itemId);
    const num = entry?.numericCode;
    const isPresent = num !== null && num !== undefined && Number.isFinite(num);

    if (isPresent && !allowedValues.has(num)) {
      const minOpt = Math.min(...allowedOptions.map((o) => o.value));
      const maxOpt = Math.max(...allowedOptions.map((o) => o.value));
      throw new Error(
        `${config.id} (${config.version}) reactivo ${item.displayNumber} (${item.canonicalCode}): valor ${num} fuera de opciones válidas [${minOpt}..${maxOpt}].`
      );
    }

    const matchedOption = isPresent ? allowedOptions.find((o) => o.value === num) : undefined;
    const rawNumeric = isPresent ? num : null;

    if (isPresent && item.clinicalAlertFlag && rawNumeric >= 1) {
      criticalSafetyAlerts.push({
        itemId: item.itemId,
        displayNumber: item.displayNumber,
        flag: item.clinicalAlertFlag,
        rawValue: rawNumeric,
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

  const recodedResponses = config.items.map((item, idx) => {
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

  const authorizedItems = rawResponses.filter((r) => !r.pendingAuthorizedText);
  const missingAll = rawResponses.filter((r) => r.isMissing);
  const missingAuthorized = authorizedItems.filter((r) => r.isMissing);
  const answeredCount = rawResponses.length - missingAll.length;
  const answeredAuthorizedCount = authorizedItems.length - missingAuthorized.length;

  const isComplete = missingAll.length === 0;
  const isAuthorizedComplete = missingAuthorized.length === 0;

  const rawById = new Map();
  const recodedById = new Map();
  const rawByDisplay = new Map();
  const recodedByDisplay = new Map();
  for (let i = 0; i < config.items.length; i++) {
    const it = config.items[i];
    rawById.set(it.itemId, rawResponses[i].numericCode);
    recodedById.set(it.itemId, recodedResponses[i].recodedValue);
    rawByDisplay.set(it.displayNumber, rawResponses[i].numericCode);
    recodedByDisplay.set(it.displayNumber, recodedResponses[i].recodedValue);
  }

  const subscales = [];
  const subscaleMap = {};

  for (const sub of config.subscales) {
    if (sub.itemIds && sub.itemIds.length > 0) {
      const vals = [];
      let miss = 0;
      for (const id of sub.itemIds) {
        const v = sub.useRecoded ? recodedById.get(id) : rawById.get(id);
        if (v === null || v === undefined) miss++;
        else vals.push(v);
      }
      const complete = miss === 0;
      const sc = complete ? sumNums(vals) : null;
      const mean = complete && sub.itemIds.length > 0 ? round4(sc / sub.itemIds.length) : null;
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

      const vals = [];
      let miss = 0;
      for (const dn of useNums) {
        const v = useRecodedFlag ? recodedByDisplay.get(dn) : rawByDisplay.get(dn);
        if (v === null || v === undefined) miss++;
        else vals.push(v);
      }
      const complete = miss === 0;
      const sc = complete ? sumNums(vals) : null;
      const mean = complete && useNums.length > 0 ? round4(sc / useNums.length) : null;
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
      const childResults = sub.subscaleRefs.map((refId) => subscales.find((s) => s.id === refId)).filter(Boolean);
      const allComplete = childResults.length === sub.subscaleRefs.length && childResults.every((c) => c.isComplete && c.score !== null);
      const expectedCount = childResults.reduce((a, b) => a + b.expectedCount, 0);
      const answeredSub = childResults.reduce((a, b) => a + b.answeredCount, 0);
      const missingSub = expectedCount - answeredSub;
      const sc = allComplete ? sumNums(childResults.map((c) => c.score)) : null;
      const mean = allComplete && expectedCount > 0 ? round4(sc / expectedCount) : null;
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
      const ieiVal = validIei ? eext + eint - (cext + cint) + 36 : null;
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

  let isValidForScoring = isAuthorizedComplete;
  let totalScore = null;
  let technicalReferenceTotal = null;
  let meanScore = null;
  const alternateScoringModes = {};
  const cohortZScores = {};
  const autoencoderCovered = [];
  let autoencoderCompatible = false;
  let autoencoderNote = '';

  const numericArray = rawResponses.map((r) => r.numericCode);

  if (!isAuthorizedComplete) {
    warnings.push(
      `Faltan ${missingAuthorized.length} reactivo(s) requerido(s) sin responder; las puntuaciones totales no se calculan por imputación silenciosa.`
    );
  }

  if (config.id === 'BIS-11' && isAuthorizedComplete) {
    const man = computeBis11Core(numericArray, 'manual_estandar');
    const can = computeBis11Core(numericArray, 'excel_canonico');
    const sumManualRecoded = sumNums(recodedResponses.map((r) => r.recodedValue));
    totalScore = scoringMode === 'excel_canonico' ? can.total : sumManualRecoded;
    technicalReferenceTotal = sumManualRecoded;
    meanScore = round4(sumManualRecoded / 30);
    alternateScoringModes.manual_estandar = { ...man, total_patton_invertido: sumManualRecoded };
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
    const total23 = sumNums(numericArray);
    const media23 = round4(total23 / 23);
    const behRaw = optionalComplements?.bslBehavioral11;
    const validBeh = Array.isArray(behRaw) && behRaw.length === 11 && behRaw.every((v) => v !== null && v !== undefined && Number.isFinite(v));
    const behSum = validBeh ? sumNums(behRaw) : 0;
    const genVal =
      typeof optionalComplements?.bslGeneral01 === 'number' && Number.isFinite(optionalComplements.bslGeneral01)
        ? optionalComplements.bslGeneral01
        : round4(total23 / (23 * 4));
    totalScore = total23;
    technicalReferenceTotal = total23 + behSum;
    meanScore = media23;
    alternateScoringModes.bsl23_estandar_y_suplemento = {
      general: genVal,
      media_23: media23,
      conductual_11: behSum,
      total_23: total23,
      total_integrado: total23 + behSum,
      total_integrado_normalizado_136: validBeh ? round4((total23 + behSum) / 136) : round4(total23 / 92),
      is_verified_complete: Boolean(validBeh && optionalComplements?.bslGeneral01 !== undefined),
    };
    autoencoderCompatible = Boolean(validBeh && optionalComplements?.bslGeneral01 !== undefined);
    autoencoderCovered.push('BSL_23BSL_general', 'BSL_23BSL_total_integrado', 'compuesto_bsl');
    autoencoderNote = autoencoderCompatible ? 'Incluye 23 centrales + suplemento conductual + GENERAL.' : 'BSL-23 central completo (23 ítems).';
  } else if (config.id === 'GAD-7' && isAuthorizedComplete) {
    const gad = computeGad7Core(numericArray);
    totalScore = gad.total;
    meanScore = round4(gad.total / 7);
    cohortZScores.gad_zscore_piloto_n10 = gad.zscore;
    cohortZScores.gad_zscore_cohorte_166 = round6((gad.total - 8.0843) / 5.9027);
    alternateScoringModes.spitzer_2006 = gad;
    autoencoderCompatible = true;
    autoencoderCovered.push('GAD_7GAD_zscore');
    autoencoderNote = 'Cobertura directa exacta de GAD_7GAD_zscore.';
  } else if (config.id === 'GAD-7' && !isAuthorizedComplete) {
    if (answeredAuthorizedCount < 6) {
      warnings.push('Menos de 6 respuestas válidas en GAD-7 (criterio scoring_gad7.r).');
    }
  } else if (config.id === 'EROS' && isAuthorizedComplete) {
    const rev = new Set([2, 5, 6, 7, 9]);
    const totalInvertido = numericArray.reduce((acc, v, i) => acc + (rev.has(i + 1) ? 5 - v : v), 0);
    const totalDirectoCanonico = sumNums(numericArray);
    const zRef = round6((totalInvertido - 26.23) / 6.495);
    totalScore = totalInvertido;
    technicalReferenceTotal = totalDirectoCanonico;
    meanScore = round4(totalInvertido / 10);
    cohortZScores.eros_z_barraca2010 = zRef;
    cohortZScores.eros_t_barraca2010 = round4(50 + 10 * zRef);
    alternateScoringModes.manual_barraca_10 = { total_10: totalInvertido, media: meanScore, inversos_aplicados: [2, 5, 6, 7, 9] };
    alternateScoringModes.validacion_proyecto_9items = {
      factor_1_agrado_5: subscaleMap['eros_f1_agrado_5'],
      factor_2_ausencia_disforia_4: subscaleMap['eros_f2_disforia_4_inv'],
      factor_2_disforia_bruta_4: subscaleMap['eros_f2_disforia_4_raw'],
      total_9items_recodificado: subscaleMap['eros_validado_9'],
      item_excluido: 'EROS7',
    };
    alternateScoringModes.excel_canonico_directo = { total_directo_10: totalDirectoCanonico };
    autoencoderCompatible = true;
    autoencoderNote = 'EROS completo (10 ítems); calcula 10 ítems Barraca y modelo validado 9 ítems.';
  } else if (config.id === 'BADS' && isAuthorizedComplete) {
    if (config.version === 'v25.0-barraca2011' && numericArray.length === 25) {
      const bads25 = computeBads25Core(numericArray);
      totalScore = null;
      technicalReferenceTotal = bads25.total_bads_invertido;
      meanScore = round4(bads25.total / 25);
      alternateScoringModes.bads_25_barraca = bads25;
      autoencoderCompatible = true;
      autoencoderCovered.push('BADS_bads_activation', 'BADS_bads_avoidance', 'BADS_bads_work', 'BADS_bads_social');
      autoencoderNote = 'BADS-25 completo compatible directamente con Autoencoder 24v/22v.';
    } else {
      const act = subscaleMap['bads_activation'];
      const avoid = subscaleMap['bads_avoidance'];
      const work = subscaleMap['bads_work'];
      const social = subscaleMap['bads_social'];
      const dysTotal = avoid + work + social;
      const techTotal22 = act + (96 - dysTotal);
      totalScore = null;
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
      };
      autoencoderCompatible = false;
      autoencoderCovered.push('BADS_bads_work');
      autoencoderNote = 'Versión validada BADS-22 (sin P4, P10, P16).';
    }
  } else if (config.id === 'STAXI-2') {
    const omittedOver49 = rawResponses.slice(0, 49).filter((r) => r.isMissing).length;
    if (omittedOver49 === 0) {
      const nums49 = rawResponses.slice(0, 49).map((r) => r.numericCode);
      const st = computeStaxi2Core(nums49);
      totalScore = null;
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
          'Protocolo 57 reactivos: los reactivos 1–49 TEA Ediciones están completos; las posiciones 50–57 corresponden al protocolo extendido pendiente de texto autorizado.'
        );
      }
    } else {
      isValidForScoring = false;
      warnings.push(
        omittedOver49 >= 10
          ? `Protocolo STAXI-2 inválido según regla TEA Ediciones (p. 17): ${omittedOver49} reactivos omitidos.`
          : `Faltan ${omittedOver49} reactivo(s) dentro de los 49 reactivos TEA Ediciones.`
      );
    }
  }

  let level = 'Evaluación incompleta / pendiente de cierre';
  let summary = 'La aplicación contiene reactivos pendientes necesarios para el cálculo normativo.';
  const descriptiveNotes = [];

  if (isValidForScoring) {
    if (config.id === 'BADS') {
      level = 'Perfil Conductual Multidimensional (Activación vs. Disfunción)';
      summary = `Activación = ${subscaleMap['bads_activation']}; Evitación/Rumia = ${subscaleMap['bads_avoidance']}; Laboral = ${subscaleMap['bads_work']}; Social = ${subscaleMap['bads_social']} (Disfunción/Evitación Total = ${subscaleMap['bads_dysfunction_avoidance_total']}).`;
      descriptiveNotes.push(config.interpretationRules.bands[0].description);
    } else if (config.id === 'STAXI-2') {
      level = 'Perfil Multidimensional de Ira Estado-Rasgo-Expresión';
      summary = `Estado = ${subscaleMap['staxi_state_total']}/60 · Rasgo = ${subscaleMap['staxi_trait_total']}/40 · IEI = ${subscaleMap['staxi_iei']}/72.`;
      descriptiveNotes.push(config.interpretationRules.bands[0].description);
    } else {
      const targetVal = config.id === 'BSL-23' ? meanScore : totalScore;
      const band = config.interpretationRules.bands.find((b) => targetVal !== null && targetVal >= b.min && targetVal <= b.max);
      level = band ? band.level : 'Puntuación calculada';
      summary = band ? band.description : `Puntuación calculada: ${totalScore ?? 'N/A'}.`;
    }
  }

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
        authorizedCompletionPct: authorizedItems.length > 0 ? round4((answeredAuthorizedCount / authorizedItems.length) * 100) : 100,
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
      numericSequence: rawResponses.map((r) => (r.numericCode === null ? 'NA' : String(r.numericCode))).join(' '),
      numericArray,
    },
    interpretations: {
      level,
      summary,
      descriptiveNotes,
      nonDiagnosticNotice: config.interpretationRules.clinicalDisclaimer,
    },
  };
}

export function numericSequenceToDigitalResponses(instrumentId, sequenceInput, instrumentVersion) {
  const config = resolveInstrumentConfig(instrumentId, instrumentVersion);
  const tokens = Array.isArray(sequenceInput)
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
    throw new Error(`La secuencia numérica para ${config.id} (${config.version}) requiere ${config.itemCount} valores y recibió ${tokens.length}.`);
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

export function digitalResponsesToNumericSequence(instrumentId, responses, instrumentVersion) {
  const config = resolveInstrumentConfig(instrumentId, instrumentVersion);
  const map = new Map();
  if (Array.isArray(responses)) {
    for (const r of responses) map.set(r.itemId, r.numericCode);
  } else {
    for (const [k, v] of Object.entries(responses || {})) map.set(k, v);
  }
  const values = config.items.map((it) => (map.get(it.itemId) === undefined ? null : map.get(it.itemId)));
  return {
    sequence: values.map((v) => (v === null ? 'NA' : String(v))).join(' '),
    values,
  };
}

export function verifyCaptureEquivalence(instrumentId, responses, instrumentVersion, scoringMode = 'manual_estandar') {
  const digitalResult = scorePsychometricEvaluation({ instrumentId, instrumentVersion, responses, scoringMode });
  const converted = numericSequenceToDigitalResponses(instrumentId, digitalResult.derivedIndicators.numericSequence, instrumentVersion);
  const legacyResult = scorePsychometricEvaluation({ instrumentId, instrumentVersion, responses: converted, scoringMode });

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
