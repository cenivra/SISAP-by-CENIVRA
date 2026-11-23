import React from 'react';
import { LatentDimensionScore } from '../services/autoencoderEngine';

interface LatentIntervalChartProps {
  dimensions: LatentDimensionScore[];
  title?: string;
}

/**
 * Gráfico de puntos e intervalos (Cleveland-McGill) sobre escala común alineada.
 * Muestra para cada dimensión latente opaca (latent_01..latent_12):
 *   - Banda externa [p05, p95] de la cohorte canónica (N=166)
 *   - Caja intercuartílica [p25, p75]
 *   - Mediana de referencia p50
 *   - Posición observada del expediente
 * Sin relleno arcoíris, sin ejes rotados y con tabular-nums.
 */
export const LatentIntervalChart: React.FC<LatentIntervalChartProps> = ({
  dimensions,
  title = 'Posición latente 12D frente a distribución empírica de cohorte (N = 166)',
}) => {
  if (!dimensions || dimensions.length === 0) return null;

  const allValues = dimensions.flatMap((d) => [d.cohortP05, d.cohortP95, d.rawValue]);
  const rawMin = Math.min(...allValues, -0.45);
  const rawMax = Math.max(...allValues, 0.45);
  const pad = Math.max((rawMax - rawMin) * 0.08, 0.05);
  const domainMin = rawMin - pad;
  const domainMax = rawMax + pad;

  const width = 680;
  const rowHeight = 28;
  const marginTop = 26;
  const marginBottom = 26;
  const leftLabelWidth = 104;
  const rightValueWidth = 132;
  const plotWidth = width - leftLabelWidth - rightValueWidth;
  const height = marginTop + dimensions.length * rowHeight + marginBottom;

  const scaleX = (v: number) =>
    leftLabelWidth + ((v - domainMin) / (domainMax - domainMin || 1)) * plotWidth;

  const ticks = [-0.4, -0.2, 0, 0.2, 0.4].filter((t) => t >= domainMin && t <= domainMax);

  return (
    <div className="sisap-tarjeta space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--sep-claro)]">
        <div>
          <h4 className="text-xs font-bold text-[var(--texto)]">{title}</h4>
          <p className="text-[11px] text-[var(--texto-tenue)]">
            Línea fina: intervalo p05–p95 · Barra central: IQR (p25–p75) · Marca vertical: mediana p50 · Punto: valor observado
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10.5px] font-mono text-[var(--texto-sec)]">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E] inline-block" /> En rango p05–p95
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B45309] inline-block" /> Cola extrema (&lt;p05 o &gt;p95)
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[560px]"
          role="img"
          aria-label="Posición de dimensiones latentes respecto a percentiles de cohorte"
        >
          {/* Rejilla de referencia vertical sobria */}
          {ticks.map((t) => {
            const x = scaleX(t);
            const isZero = Math.abs(t) < 1e-6;
            return (
              <g key={t}>
                <line
                  x1={x}
                  y1={marginTop - 6}
                  x2={x}
                  y2={height - marginBottom}
                  stroke="currentColor"
                  className={isZero ? 'text-[var(--texto-tenue)] opacity-45' : 'text-[var(--sep-claro)] opacity-60'}
                  strokeDasharray={isZero ? '3 3' : undefined}
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-[var(--texto-tenue)] font-mono text-[10px]"
                >
                  {t.toFixed(1)}
                </text>
              </g>
            );
          })}

          {dimensions.map((d, idx) => {
            const cy = marginTop + idx * rowHeight + rowHeight / 2;
            const xP05 = scaleX(d.cohortP05);
            const xP25 = scaleX(d.cohortP25);
            const xP50 = scaleX(d.cohortP50);
            const xP75 = scaleX(d.cohortP75);
            const xP95 = scaleX(d.cohortP95);
            const xObs = scaleX(d.rawValue);
            const isOutlier = d.bracket === '<p05' || d.bracket === '>p95';
            const dotColor = isOutlier ? '#B45309' : '#0F766E';

            return (
              <g key={d.dimId}>
                {/* Fila alternada sutil */}
                {idx % 2 === 0 && (
                  <rect
                    x={leftLabelWidth}
                    y={marginTop + idx * rowHeight}
                    width={plotWidth}
                    height={rowHeight}
                    fill="currentColor"
                    className="text-[var(--panel)] opacity-45"
                  />
                )}

                {/* Etiqueta izquierda opaca MOD-03 */}
                <text
                  x={leftLabelWidth - 10}
                  y={cy + 3.5}
                  textAnchor="end"
                  className="fill-[var(--texto)] font-mono text-[11px] font-semibold"
                >
                  {d.latentKey}
                </text>

                {/* Intervalo externo p05-p95 */}
                <line
                  x1={xP05}
                  y1={cy}
                  x2={xP95}
                  y2={cy}
                  stroke="#94A3B8"
                  strokeWidth={2}
                />

                {/* Caja IQR p25-p75 */}
                <rect
                  x={Math.min(xP25, xP75)}
                  y={cy - 5}
                  width={Math.max(Math.abs(xP75 - xP25), 2)}
                  height={10}
                  rx={2}
                  fill="#64748B"
                  fillOpacity={0.32}
                />

                {/* Marca de mediana p50 */}
                <line
                  x1={xP50}
                  y1={cy - 7}
                  x2={xP50}
                  y2={cy + 7}
                  stroke="#334155"
                  strokeWidth={1.75}
                />

                {/* Punto observado */}
                <circle
                  cx={xObs}
                  cy={cy}
                  r={4.8}
                  fill={dotColor}
                  stroke="#FFFFFF"
                  strokeWidth={1.25}
                />

                {/* Etiqueta directa numérica derecha (tabular-nums equivalente en SVG mono) */}
                <text
                  x={leftLabelWidth + plotWidth + 10}
                  y={cy + 3.5}
                  textAnchor="start"
                  className="font-mono text-[10.5px]"
                  fill={isOutlier ? '#B45309' : 'currentColor'}
                >
                  {`${d.rawValue >= 0 ? '+' : ''}${d.rawValue.toFixed(3)} · P${d.percentile.toFixed(0)}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
