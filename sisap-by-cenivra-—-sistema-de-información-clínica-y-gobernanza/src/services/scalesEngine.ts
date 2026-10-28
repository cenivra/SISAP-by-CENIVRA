export function parseRawNumbers(input: string, expectedCount: number, defaultVal = 1): number[] {
  if (!input || !input.trim()) {
    return Array(expectedCount).fill(defaultVal);
  }
  // Try comma, space, semicolon, tab or dash separated
  const parts = input
    .trim()
    .replace(/[,;\t\-]/g, ' ')
    .split(/\s+/)
    .map((s) => parseFloat(s))
    .filter((n) => !isNaN(n));

  const result: number[] = [];
  for (let i = 0; i < expectedCount; i++) {
    result.push(i < parts.length ? parts[i] : defaultVal);
  }
  return result;
}

export interface Bis11Result {
  motor: number;
  nonplanning: number;
  cognitive_instability: number;
  perseverance: number;
  motor_impulsivity: number;
  total: number;
}

export function computeBis11(rawItems: number[]): Bis11Result {
  // Normalize items to 30 items
  const items = [...rawItems];
  while (items.length < 30) items.push(2);

  // Inverted items in standard BIS-11 (1-indexed: 1, 7, 8, 9, 10, 12, 13, 15, 20, 29, 30)
  const invertedIndices = [1, 7, 8, 9, 10, 12, 13, 15, 20, 29, 30];
  const scored = items.slice(0, 30).map((val, idx) => {
    const itemNum = idx + 1;
    const clamped = Math.min(4, Math.max(1, Math.round(val)));
    return invertedIndices.includes(itemNum) ? 5 - clamped : clamped;
  });

  // Zero-based index helpers
  const sumIdx = (indices: number[]) => indices.reduce((acc, i) => acc + (scored[i - 1] || 0), 0);

  const motor = sumIdx([2, 3, 4, 16, 17, 19, 21, 22, 23, 25]);
  const nonplanning = sumIdx([1, 7, 8, 10, 12, 13, 14, 15, 18, 27, 29]);
  const cognitive_instability = sumIdx([5, 6, 9, 11, 20, 24, 26, 28]);
  const perseverance = sumIdx([16, 21, 23, 30]);
  const motor_impulsivity = Math.round((motor + perseverance) / 1.5);
  const total = scored.reduce((a, b) => a + b, 0);

  return {
    motor,
    nonplanning,
    cognitive_instability,
    perseverance,
    motor_impulsivity,
    total,
  };
}

export interface Bsl23Result {
  general: number;
  total_integrado: number;
}

export function computeBsl23(rawItems: number[]): Bsl23Result {
  const items = [...rawItems];
  while (items.length < 23) items.push(1);

  const scored = items.slice(0, 23).map((v) => Math.min(4, Math.max(0, v)));
  const total = scored.reduce((a, b) => a + b, 0);
  const general = parseFloat((total / 23).toFixed(2));

  return {
    general,
    total_integrado: total,
  };
}

export interface Gad7Result {
  total: number;
  zscore: number;
  severidad: 'Mínima' | 'Leve' | 'Moderada' | 'Severa';
}

export function computeGad7(rawItems: number[]): Gad7Result {
  const items = [...rawItems];
  while (items.length < 7) items.push(1);

  const scored = items.slice(0, 7).map((v) => Math.min(3, Math.max(0, Math.round(v))));
  const total = scored.reduce((a, b) => a + b, 0);

  // Mean=6.2, SD=4.8 based on Mexican normative clinical studies
  const zscore = parseFloat(((total - 6.2) / 4.8).toFixed(3));

  let severidad: 'Mínima' | 'Leve' | 'Moderada' | 'Severa' = 'Mínima';
  if (total >= 15) severidad = 'Severa';
  else if (total >= 10) severidad = 'Moderada';
  else if (total >= 5) severidad = 'Leve';

  return { total, zscore, severidad };
}

export interface Staxi2Result {
  state: number;
  trait: number;
  temperamento: number;
}

export function computeStaxi2(rawItems: number[]): Staxi2Result {
  const items = [...rawItems];
  while (items.length < 44) items.push(2);

  const scored = items.slice(0, 44).map((v) => Math.min(4, Math.max(1, Math.round(v))));
  // State: first 15 items
  const state = scored.slice(0, 15).reduce((a, b) => a + b, 0);
  // Trait: next 10 items
  const trait = scored.slice(15, 25).reduce((a, b) => a + b, 0);
  // Temperamento: items 15-18
  const temperamento = scored.slice(15, 19).reduce((a, b) => a + b, 0);

  return { state, trait, temperamento };
}

export interface BadsResult {
  activation: number;
  avoidance: number;
  work: number;
  social: number;
}

export function computeBads(rawItems: number[]): BadsResult {
  const items = [...rawItems];
  while (items.length < 25) items.push(3);

  const scored = items.slice(0, 25).map((v) => Math.min(6, Math.max(0, Math.round(v))));
  // Subscales
  const activation = scored.slice(0, 7).reduce((a, b) => a + b, 0);
  const avoidance = scored.slice(7, 15).reduce((a, b) => a + b, 0);
  const work = scored.slice(15, 20).reduce((a, b) => a + b, 0);
  const social = scored.slice(20, 25).reduce((a, b) => a + b, 0);

  return { activation, avoidance, work, social };
}

export function computeEros(rawItems: number[]): number {
  const items = [...rawItems];
  while (items.length < 10) items.push(4);
  const scored = items.slice(0, 10).map((v) => Math.min(7, Math.max(1, Math.round(v))));
  return scored.reduce((a, b) => a + b, 0);
}

export function assemble24Vector(params: {
  bis: Bis11Result;
  staxi: Staxi2Result;
  bsl: Bsl23Result;
  gad: Gad7Result;
  bads: BadsResult;
  edad: number;
  tiempoConsumoAnios: number;
  tratamientosPrevios: number;
}): Record<string, number> {
  const { bis, staxi, bsl, gad, bads, edad, tiempoConsumoAnios, tratamientosPrevios } = params;

  const compuesto_bis = parseFloat(((bis.motor + bis.nonplanning + bis.cognitive_instability) / 3).toFixed(2));
  const compuesto_staxi = parseFloat(((staxi.state + staxi.trait + staxi.temperamento) / 3).toFixed(2));
  const compuesto_bsl = parseFloat((bsl.general * 10).toFixed(2));

  return {
    BIS_11BIS_motor: bis.motor,
    BIS_11BIS_nonplanning: bis.nonplanning,
    BIS_11BIS_cognitive_instability: bis.cognitive_instability,
    BIS_11BIS_perseverance: bis.perseverance,
    BIS_11BIS_motor_impulsivity: bis.motor_impulsivity,
    BIS_11BIS_total_calculado: bis.total,
    compuesto_bis,
    STAXI_2STAXI_state: staxi.state,
    STAXI_2STAXI_trait: staxi.trait,
    STAXI_2STAXI_temperamento: staxi.temperamento,
    compuesto_staxi,
    BSL_23BSL_general: bsl.general,
    BSL_23BSL_total_integrado: bsl.total_integrado,
    compuesto_bsl,
    GAD_7GAD_zscore: gad.zscore,
    BADS_bads_activation: bads.activation,
    BADS_bads_avoidance: bads.avoidance,
    BADS_bads_work: bads.work,
    BADS_bads_social: bads.social,
    edad: edad || 35,
    tiempo_consumo: tiempoConsumoAnios || 5,
    trat_previos: tratamientosPrevios || 1,
    tiempo_consumoEROS: tiempoConsumoAnios || 5,
    trat_previosEROS: tratamientosPrevios || 1,
  };
}
