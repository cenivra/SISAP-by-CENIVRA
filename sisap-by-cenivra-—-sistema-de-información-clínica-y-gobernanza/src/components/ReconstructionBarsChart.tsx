import React from 'react';
import { VariableReconstructionItem } from '../services/autoencoderEngine';

interface ReconstructionBarsChartProps {
  items: VariableReconstructionItem[];
  maxBars?: number;
}

/**
 * Gráfico de barras horizontales ordenadas por error cuadrático de reconstrucción (X_z - Xhat_z)^2.
 * Mantiene escala base en cero y etiquetado directo sin leyenda redundante.
 */
export const ReconstructionBarsChart: React.FC<ReconstructionBarsChartProps> = ({
  items,
  maxBars = 10,
}) => {
  if (!items || items.length === 0) return null;

  const sorted = [...items]
    .sort((a, b) => b.squared_error - a.squared_error)
    .slice(0, maxBars);
  const maxErr = Math.max(...sorted.map((s) => s.squared_error), 0.05);

  return (
    <div className="sisap-tarjeta space-y-2">
      <div className="pb-2 border-b border-[var(--sep-claro)]">
        <h4 className="text-xs font-bold text-[var(--texto)]">
          Variables con mayor residuo de reconstrucción (Top {sorted.length} · Decoder SELU)
        </h4>
        <p className="text-[11px] text-[var(--texto-tenue)]">
          Error cuadrático en espacio estandarizado Z: (X_z − X̂_z)². Señala discrepancia geométrica respecto al manifold.
        </p>
      </div>

      <div className="space-y-1.5 text-xs tabular-nums">
        {sorted.map((item) => {
          const pct = Math.min((item.squared_error / maxErr) * 100, 100);
          return (
            <div key={item.variable} className="grid grid-cols-12 items-center gap-2 py-0.5">
              <div
                className="col-span-5 font-mono text-[10.5px] text-[var(--texto)] truncate"
                title={item.variable}
              >
                {item.variable}
              </div>
              <div className="col-span-4 h-2.5 bg-[var(--campo)] rounded overflow-hidden border border-[var(--sep-claro)]">
                <div
                  className="h-full bg-[#0F766E] transition-all"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <div className="col-span-3 text-right font-mono text-[10.5px] text-[var(--texto-sec)]">
                {item.squared_error.toFixed(4)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
