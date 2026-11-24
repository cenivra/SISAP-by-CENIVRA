import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  GitCompare,
  Radar,
} from 'lucide-react';
import {
  InitialEvaluationData,
  PatientClinico,
  PsychometricEvaluationBundle,
} from '../../types/clinical';
import {
  ACTIVE_INSTRUMENT_IDS,
  ActiveInstrumentId,
} from '../../psychometrics/instrumentCatalog';
import {
  assemble24Vector,
  computeBads,
  computeBis11,
  computeBsl23,
  computeEros,
  computeGad7,
  computeStaxi2,
  ScoringMode,
} from '../../services/scalesEngine';
import {
  AutoencoderEngine,
  AutoencoderInferenceResult,
} from '../../services/autoencoderEngine';

export type EvaluationMomentId = 'ingreso_basal' | 'mitad_tratamiento' | 'egreso_alta';

export interface EvaluationMomentMeta {
  id: EvaluationMomentId;
  shortLabel: string;
  label: string;
  description: string;
}

export const EVALUATION_MOMENTS: EvaluationMomentMeta[] = [
  {
    id: 'ingreso_basal',
    shortLabel: 'Inicial',
    label: 'Evaluación Inicial (Basal)',
    description: 'Línea base al ingreso del tratamiento.',
  },
  {
    id: 'mitad_tratamiento',
    shortLabel: 'Mitad de tratamiento',
    label: 'Evaluación Intermedia (Mitad de tratamiento)',
    description: 'Reaplicación completa para valorar cambio funcional intermedio.',
  },
  {
    id: 'egreso_alta',
    shortLabel: 'Final',
    label: 'Evaluación Final (Egreso / Cierre)',
    description: 'Valoración completa de cierre y comparación longitudinal.',
  },
];

export function normalizeMomentId(sessionContext?: string | null): EvaluationMomentId {
  if (sessionContext === 'mitad_tratamiento' || sessionContext === 'seguimiento_longitudinal') {
    return 'mitad_tratamiento';
  }
  if (sessionContext === 'egreso_alta') {
    return 'egreso_alta';
  }
  return 'ingreso_basal';
}

interface MomentComputedProfile {
  moment: EvaluationMomentMeta;
  completedInstruments: Set<ActiveInstrumentId>;
  missingInstruments: ActiveInstrumentId[];
  ready: boolean;
  inference: AutoencoderInferenceResult | null;
  sourceNote: string;
}

interface PsychometricAutoencoderChartsProps {
  pseudonym: string;
  patientClinico?: PatientClinico;
  bundles: PsychometricEvaluationBundle[];
  legacyEvaluations?: InitialEvaluationData[];
  activeMoment: EvaluationMomentId;
  onSelectMoment?: (moment: EvaluationMomentId) => void;
  onStartInstrument?: (instId: ActiveInstrumentId, moment: EvaluationMomentId) => void;
}

function extractOrderedItems(bundle: PsychometricEvaluationBundle, expectedCount: number): number[] | null {
  const sorted = [...bundle.responses]
    .filter((r) => r.item_number >= 1 && r.item_number <= expectedCount && r.numeric_code !== null && Number.isFinite(r.numeric_code))
    .sort((a, b) => a.item_number - b.item_number);
  if (sorted.length < expectedCount) return null;
  const out: number[] = [];
  for (let i = 1; i <= expectedCount; i++) {
    const found = sorted.find((r) => r.item_number === i);
    if (!found || found.numeric_code === null || !Number.isFinite(found.numeric_code)) return null;
    out.push(Number(found.numeric_code));
  }
  return out;
}

function parseLegacyRaw(raw: string | undefined, expected: number): number[] | null {
  if (!raw || !raw.trim()) return null;
  const nums = raw
    .split(/[\s,;]+/)
    .map((x) => Number(x.trim()))
    .filter((n) => Number.isFinite(n));
  if (nums.length < expected) return null;
  return nums.slice(0, expected);
}

export const PsychometricAutoencoderCharts: React.FC<PsychometricAutoencoderChartsProps> = ({
  pseudonym,
  patientClinico,
  bundles,
  legacyEvaluations = [],
  activeMoment,
  onSelectMoment,
  onStartInstrument,
}) => {
  const [selectedChartMoment, setSelectedChartMoment] = useState<EvaluationMomentId>(activeMoment);

  const profilesByMoment = useMemo<Record<EvaluationMomentId, MomentComputedProfile>>(() => {
    const edad = 32;
    const tiempoConsumo = 6;
    const tratPrevios = 1;
    const sustancia = patientClinico?.droga_impacto || 'Cannabis';
    const latestLegacy = legacyEvaluations[0] || null;

    const result = {} as Record<EvaluationMomentId, MomentComputedProfile>;

    for (const m of EVALUATION_MOMENTS) {
      const momentBundles = bundles.filter(
        (b) =>
          b.evaluation.application_status === 'completed' &&
          normalizeMomentId(b.evaluation.session_context) === m.id
      );

      const latestByInst = new Map<ActiveInstrumentId, PsychometricEvaluationBundle>();
      for (const b of momentBundles) {
        const inst = b.evaluation.instrument_id as ActiveInstrumentId;
        if (!latestByInst.has(inst)) {
          latestByInst.set(inst, b);
        }
      }

      const completedSet = new Set<ActiveInstrumentId>(latestByInst.keys());

      // Compatibilidad con registros basales previos guardados en formato antiguo
      let usedLegacyFallback = false;
      const legacyBis = m.id === 'ingreso_basal' ? parseLegacyRaw(latestLegacy?.raw_bis_11, 30) : null;
      const legacyBsl = m.id === 'ingreso_basal' ? parseLegacyRaw(latestLegacy?.raw_bsl_23, 23) : null;
      const legacyGad = m.id === 'ingreso_basal' ? parseLegacyRaw(latestLegacy?.raw_gad_7, 7) : null;
      const legacyStaxi = m.id === 'ingreso_basal' ? parseLegacyRaw(latestLegacy?.raw_staxi_2, 49) : null;
      const legacyBads = m.id === 'ingreso_basal' ? parseLegacyRaw(latestLegacy?.raw_bads, 25) : null;
      const legacyEros = m.id === 'ingreso_basal' ? parseLegacyRaw(latestLegacy?.raw_eros, 10) : null;

      if (m.id === 'ingreso_basal' && latestLegacy) {
        if (!completedSet.has('BIS-11') && legacyBis) { completedSet.add('BIS-11'); usedLegacyFallback = true; }
        if (!completedSet.has('BSL-23') && legacyBsl) { completedSet.add('BSL-23'); usedLegacyFallback = true; }
        if (!completedSet.has('GAD-7') && legacyGad) { completedSet.add('GAD-7'); usedLegacyFallback = true; }
        if (!completedSet.has('STAXI-2') && legacyStaxi) { completedSet.add('STAXI-2'); usedLegacyFallback = true; }
        if (!completedSet.has('BADS') && legacyBads) { completedSet.add('BADS'); usedLegacyFallback = true; }
        if (!completedSet.has('EROS') && legacyEros) { completedSet.add('EROS'); usedLegacyFallback = true; }
      }

      const missing = ACTIVE_INSTRUMENT_IDS.filter((id) => !completedSet.has(id));
      let inference: AutoencoderInferenceResult | null = null;

      if (missing.length === 0) {
        try {
          const bisBundle = latestByInst.get('BIS-11');
          const bslBundle = latestByInst.get('BSL-23');
          const gadBundle = latestByInst.get('GAD-7');
          const staxiBundle = latestByInst.get('STAXI-2');
          const badsBundle = latestByInst.get('BADS');
          const erosBundle = latestByInst.get('EROS');

          const bisItems = bisBundle ? extractOrderedItems(bisBundle, 30) : legacyBis;
          const bslItems = bslBundle ? extractOrderedItems(bslBundle, 23) : legacyBsl;
          const gadItems = gadBundle ? extractOrderedItems(gadBundle, 7) : legacyGad;
          const staxiItems = staxiBundle ? extractOrderedItems(staxiBundle, 49) : legacyStaxi;
          const badsItems = badsBundle ? extractOrderedItems(badsBundle, 25) : legacyBads;
          const erosItems = erosBundle ? extractOrderedItems(erosBundle, 10) : legacyEros;

          if (bisItems && bslItems && gadItems && staxiItems && badsItems && erosItems) {
            const bisMode: ScoringMode =
              (bisBundle?.evaluation.scoring_mode as ScoringMode) || 'manual_estandar';
            const erosMode: ScoringMode =
              (erosBundle?.evaluation.scoring_mode as ScoringMode) || 'manual_estandar';
            const bslGen =
              latestLegacy?.bsl_general_0_1 ??
              latestLegacy?.calculados?.bsl_general ??
              0;

            const v24 = assemble24Vector({
              bis: computeBis11(bisItems, bisMode),
              staxi: computeStaxi2(staxiItems),
              bsl: computeBsl23(bslItems, [], bslGen),
              gad: computeGad7(gadItems),
              bads: computeBads(badsItems),
              erosTotal: computeEros(erosItems, erosMode),
              edad: latestLegacy?.edad ?? edad,
              tiempoConsumo: latestLegacy?.tiempo_consumo_anios ?? tiempoConsumo,
              tratPrevios: latestLegacy?.tratamientos_previos_cuenta ?? tratPrevios,
              sustanciaPrincipal: latestLegacy?.sustancia_principal ?? sustancia,
            });
            inference = AutoencoderEngine.runVerifiedInference(v24, 'encoder_22_checkpoint_fase2');
          }
        } catch {
          inference = null;
        }
      }

      result[m.id] = {
        moment: m,
        completedInstruments: completedSet,
        missingInstruments: missing,
        ready: Boolean(inference),
        inference,
        sourceNote: usedLegacyFallback
          ? 'Integrado desde capturas del Centro Psicométrico y registro basal previo.'
          : 'Calculado directamente con los 6 instrumentos del Centro Psicométrico.',
      };
    }

    return result;
  }, [bundles, legacyEvaluations, patientClinico]);

  const activeProfile = profilesByMoment[selectedChartMoment];
  const readyMoments = EVALUATION_MOMENTS.filter((m) => profilesByMoment[m.id].ready);

  // Geometría Radar SVG (300x300, centro 150,150, radio máximo 102)
  const radarData = useMemo(() => {
    if (!activeProfile.inference) return null;
    const dims = activeProfile.inference.latentDimensions;
    const cx = 150;
    const cy = 150;
    const maxR = 102;
    const mapZToR = (z: number) => {
      const clamped = Math.max(-2.5, Math.min(2.5, z));
      return ((clamped + 2.5) / 5) * maxR;
    };
    const zeroR = mapZToR(0);
    const points = dims.map((d, idx) => {
      const angle = (Math.PI * 2 * idx) / dims.length - Math.PI / 2;
      const r = mapZToR(d.zScore);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const lx = cx + Math.cos(angle) * (maxR + 18);
      const ly = cy + Math.sin(angle) * (maxR + 18);
      const ax = cx + Math.cos(angle) * maxR;
      const ay = cy + Math.sin(angle) * maxR;
      const extreme = d.bracket === '<p05' || d.bracket === '>p95' || Math.abs(d.zScore) >= 1.5;
      return { d, x, y, lx, ly, ax, ay, extreme };
    });
    const polygon = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return { cx, cy, maxR, zeroR, points, polygon };
  }, [activeProfile]);

  return (
    <div className="space-y-4">
      {/* Selector de Corte Temporal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {EVALUATION_MOMENTS.map((m) => {
          const prof = profilesByMoment[m.id];
          const isSelected = selectedChartMoment === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedChartMoment(m.id);
                onSelectMoment?.(m.id);
              }}
              className={`text-left p-3 rounded-[var(--r)] border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[var(--panel)] border-[var(--accion)] ring-1 ring-[var(--accion)]/30'
                  : 'bg-[var(--panel)] border-[var(--borde)] hover:border-[var(--sep-claro)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-[var(--texto)]">{m.label}</span>
                <span className={prof.ready ? 'est-ok' : 'est-warn'}>
                  {prof.completedInstruments.size}/6
                </span>
              </div>
              <p className="text-[11px] text-[var(--texto-sec)]">{m.description}</p>
            </button>
          );
        })}
      </div>

      {/* Estado de corte incompleto (D-06) */}
      {!activeProfile.ready || !activeProfile.inference ? (
        <div className="wb-surface p-4 border-l-4 border-l-[var(--advertencia)] space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[var(--advertencia)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-[var(--texto)]">
                Gráficas del Autoencoder no disponibles para {activeProfile.moment.shortLabel} ({pseudonym})
              </div>
              <p className="text-xs text-[var(--texto-sec)]">
                Bajo la compuerta clínica D-06 (sin imputación silenciosa), se requieren los 6 instrumentos completos en este corte para generar las 12 dimensiones latentes y sus gráficas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeProfile.missingInstruments.map((instId) => (
              <button
                key={instId}
                type="button"
                onClick={() => onStartInstrument?.(instId, activeProfile.moment.id)}
                className="sisap-btn-sec text-xs py-1 px-2.5"
              >
                Aplicar {instId} en {activeProfile.moment.shortLabel}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Resumen numérico del perfil 12D del corte */}
          <div className="wb-surface p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--normal)]" />
              <div>
                <div className="text-xs font-bold text-[var(--texto)]">
                  Perfil Autoencoder 12D · {activeProfile.moment.label}
                </div>
                <div className="text-[11px] text-[var(--texto-sec)]">{activeProfile.sourceNote}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
              <div>
                <span className="text-[var(--texto-tenue)] mr-1">MSE_z:</span>
                <span className="font-bold text-[var(--texto)]">
                  {activeProfile.inference.verifiedMetrics.mse_z.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[var(--texto-tenue)] mr-1">Dist. p50:</span>
                <span className="font-bold text-[var(--accion)]">
                  {activeProfile.inference.verifiedMetrics.distance_to_cohort_median_p50.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[var(--texto-tenue)] mr-1">Norma L2:</span>
                <span className="font-bold text-[var(--texto)]">
                  {activeProfile.inference.verifiedMetrics.l2_norm.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-[var(--texto-tenue)] mr-1">Fuera IQR:</span>
                <span className="font-bold text-[var(--advertencia)]">
                  {activeProfile.inference.verifiedMetrics.n_outside_iqr}/12
                </span>
              </div>
            </div>
          </div>

          {/* Grid de 3+ Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* GRÁFICA 1: Radar Latente 12D */}
            <div className="wb-surface p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Radar className="w-4 h-4 text-[var(--accion)]" />
                  <h3 className="text-xs font-bold text-[var(--texto)]">
                    Gráfica 1 · Perfil Radar de las 12 Dimensiones Latentes
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--texto-tenue)]">Espacio Z robusto</span>
              </div>
              <p className="text-[11px] text-[var(--texto-sec)]">
                Proyección radial centrada en la mediana de cohorte (círculo punteado = 0). Puntos ámbar indican desviación periférica (&lt;p05, &gt;p95 o |z| ≥ 1.5).
              </p>

              {radarData && (
                <div className="flex flex-col items-center">
                  <svg viewBox="0 0 300 300" className="w-full max-w-[320px] h-auto">
                    {/* Anillos concéntricos */}
                    {[0.25, 0.5, 0.75, 1].map((frac) => (
                      <circle
                        key={frac}
                        cx={radarData.cx}
                        cy={radarData.cy}
                        r={radarData.maxR * frac}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={0.14}
                      />
                    ))}
                    <circle
                      cx={radarData.cx}
                      cy={radarData.cy}
                      r={radarData.zeroR}
                      fill="none"
                      stroke="var(--texto-tenue)"
                      strokeDasharray="3 3"
                      strokeOpacity={0.6}
                    />
                    {/* Ejes */}
                    {radarData.points.map((p) => (
                      <g key={p.d.dimId}>
                        <line
                          x1={radarData.cx}
                          y1={radarData.cy}
                          x2={p.ax}
                          y2={p.ay}
                          stroke="currentColor"
                          strokeOpacity={0.14}
                        />
                        <text
                          x={p.lx}
                          y={p.ly}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="9"
                          className="fill-[var(--texto-sec)] font-mono"
                        >
                          {p.d.dimId}
                        </text>
                      </g>
                    ))}
                    {/* Polígono del paciente */}
                    <polygon
                      points={radarData.polygon}
                      fill="var(--accion)"
                      fillOpacity={0.2}
                      stroke="var(--accion)"
                      strokeWidth={2}
                    />
                    {/* Puntos */}
                    {radarData.points.map((p) => (
                      <circle
                        key={`pt-${p.d.dimId}`}
                        cx={p.x}
                        cy={p.y}
                        r={3.5}
                        fill={p.extreme ? 'var(--advertencia)' : 'var(--accion)'}
                        stroke="var(--fondo)"
                        strokeWidth={1}
                      >
                        <title>{`${p.d.dimId}: z=${p.d.zScore.toFixed(2)} (P${p.d.percentile.toFixed(0)})`}</title>
                      </circle>
                    ))}
                  </svg>
                </div>
              )}
            </div>

            {/* GRÁFICA 2: Bandas de Cohorte Empírica p05-p95 e IQR */}
            <div className="wb-surface p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--normal)]" />
                  <h3 className="text-xs font-bold text-[var(--texto)]">
                    Gráfica 2 · Posición 12D frente a Cohorte Empírica (N = 166)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--texto-tenue)]">p05–p95 · IQR p25–p75</span>
              </div>
              <p className="text-[11px] text-[var(--texto-sec)]">
                Cada fila compara el valor latente del paciente contra la distribución normativa de la cohorte.
              </p>

              <div className="space-y-1.5 pt-1">
                {activeProfile.inference.latentDimensions.map((d) => {
                  const minV = -0.45;
                  const maxV = 0.45;
                  const toPct = (v: number) =>
                    Math.max(2, Math.min(98, ((v - minV) / (maxV - minV)) * 100));
                  const p05 = toPct(d.cohortP05);
                  const p25 = toPct(d.cohortP25);
                  const p50 = toPct(d.cohortP50);
                  const p75 = toPct(d.cohortP75);
                  const p95 = toPct(d.cohortP95);
                  const val = toPct(d.rawValue);
                  const isOutlier = d.bracket === '<p05' || d.bracket === '>p95';
                  return (
                    <div key={d.dimId} className="grid grid-cols-12 items-center gap-2 text-[10.5px]">
                      <span className="col-span-2 font-mono font-semibold text-[var(--texto)]">
                        {d.dimId}
                      </span>
                      <div className="col-span-7 relative h-3.5 bg-[var(--campo)] rounded">
                        <div
                          className="absolute top-1.5 h-0.5 bg-[var(--texto-tenue)]/45"
                          style={{ left: `${p05}%`, width: `${Math.max(2, p95 - p05)}%` }}
                        />
                        <div
                          className="absolute top-0.5 h-2.5 bg-[var(--accion)]/25 border border-[var(--accion)]/40 rounded-xs"
                          style={{ left: `${p25}%`, width: `${Math.max(2, p75 - p25)}%` }}
                        />
                        <div
                          className="absolute top-0 h-3.5 w-0.5 bg-[var(--texto-sec)]"
                          style={{ left: `${p50}%` }}
                        />
                        <div
                          className={`absolute top-0.5 w-2.5 h-2.5 rounded-full border border-[var(--fondo)] -translate-x-1/2 ${
                            isOutlier ? 'bg-[var(--advertencia)]' : 'bg-[var(--normal)]'
                          }`}
                          style={{ left: `${val}%` }}
                          title={`${d.dimId}: ${d.rawValue.toFixed(3)} · P${d.percentile.toFixed(0)}`}
                        />
                      </div>
                      <span className="col-span-3 text-right font-mono tabular-nums text-[var(--texto-sec)]">
                        {d.zScore >= 0 ? '+' : ''}
                        {d.zScore.toFixed(2)} · P{d.percentile.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GRÁFICA 3: Residuos de Reconstrucción (Top 10 variables) */}
            <div className="wb-surface p-4 space-y-2 lg:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[var(--accion)]" />
                  <h3 className="text-xs font-bold text-[var(--texto)]">
                    Gráfica 3 · Perfil de Residuos de Reconstrucción del Autoencoder (Top 10 Variables)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--texto-tenue)]">
                  Error cuadrático (X_z − X̂_z)²
                </span>
              </div>
              <p className="text-[11px] text-[var(--texto-sec)]">
                Variables clínicas con mayor discrepancia geométrica respecto a la reconstrucción esperada por el modelo en este corte.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-1">
                {(() => {
                  const topVars = [...activeProfile.inference.perVariableReconstruction]
                    .sort((a, b) => b.squared_error - a.squared_error)
                    .slice(0, 10);
                  const maxErr = Math.max(0.01, ...topVars.map((v) => v.squared_error));
                  return topVars.map((item) => {
                    const widthPct = Math.max(3, (item.squared_error / maxErr) * 100);
                    return (
                      <div key={item.variable} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[var(--texto)] truncate pr-2">
                            {item.variable}
                          </span>
                          <span className="font-mono tabular-nums text-[var(--texto-sec)] shrink-0">
                            {item.squared_error.toFixed(4)}
                          </span>
                        </div>
                        <div className="h-2 rounded bg-[var(--campo)] overflow-hidden">
                          <div
                            className="h-full rounded bg-[var(--accion)]"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* GRÁFICA 4: Comparativa Longitudinal de Cortes (Inicial -> Mitad -> Final) */}
            <div className="wb-surface p-4 space-y-3 lg:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-[var(--normal)]" />
                  <h3 className="text-xs font-bold text-[var(--texto)]">
                    Gráfica 4 · Evolución del Perfil Autoencoder entre Cortes (Inicial → Mitad → Final)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--texto-tenue)]">
                  {readyMoments.length} / 3 cortes completos
                </span>
              </div>

              {readyMoments.length < 2 ? (
                <p className="text-xs text-[var(--texto-sec)]">
                  Actualmente hay {readyMoments.length} corte completo ({readyMoments.map((m) => m.shortLabel).join(', ')}). Al completar las 6 escalas en <b>Mitad de tratamiento</b> o <b>Evaluación Final</b>, esta gráfica mostrará automáticamente la trayectoria comparativa entre momentos.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {EVALUATION_MOMENTS.map((m) => {
                    const prof = profilesByMoment[m.id];
                    if (!prof.ready || !prof.inference) {
                      return (
                        <div key={m.id} className="p-3 rounded bg-[var(--campo)] border border-[var(--sep)] text-xs text-[var(--texto-tenue)]">
                          <div className="font-semibold text-[var(--texto)] mb-1">{m.shortLabel}</div>
                          <div>Sin corte completo ({prof.completedInstruments.size}/6).</div>
                        </div>
                      );
                    }
                    const met = prof.inference.verifiedMetrics;
                    return (
                      <div key={m.id} className="p-3 rounded bg-[var(--campo)] border border-[var(--sep)] space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--texto)]">{m.shortLabel}</span>
                          <span className="est-ok">6/6 Completo</span>
                        </div>
                        <div className="space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-[var(--texto-sec)]">Dist. p50:</span>
                            <span className="font-bold text-[var(--accion)]">{met.distance_to_cohort_median_p50.toFixed(4)}</span>
                          </div>
                          <div className="h-1.5 rounded bg-[var(--panel)] overflow-hidden">
                            <div
                              className="h-full bg-[var(--accion)]"
                              style={{ width: `${Math.min(100, (met.distance_to_cohort_median_p50 / 1.2) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-[var(--texto-sec)]">MSE_z:</span>
                            <span className="font-bold">{met.mse_z.toFixed(4)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--texto-sec)]">Fuera IQR:</span>
                            <span>{met.n_outside_iqr}/12</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
