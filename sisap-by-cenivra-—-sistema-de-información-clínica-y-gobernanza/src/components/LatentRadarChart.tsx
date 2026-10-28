import React from 'react';
import { LatentDimensionScore } from '../services/autoencoderEngine';

interface LatentRadarChartProps {
  dimensions: LatentDimensionScore[];
  size?: number;
}

export const LatentRadarChart: React.FC<LatentRadarChartProps> = ({ dimensions, size = 320 }) => {
  const center = size / 2;
  const radius = size * 0.38;
  const numPoints = dimensions.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Grid levels (e.g. z = -2, -1, 0, +1, +2)
  const levels = [-2, -1, 0, 1, 2];

  // Map z-score (-3 to +3) to radius (0 to radius)
  const zToRadius = (z: number) => {
    const clampedZ = Math.max(-2.5, Math.min(2.5, z));
    // -2.5 -> 0.1 * radius, 0 -> 0.5 * radius, +2.5 -> 1.0 * radius
    return ((clampedZ + 2.5) / 5) * radius;
  };

  // Generate patient polygon points
  const points = dimensions.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = zToRadius(d.zScore);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  });

  const polygonPath = points.join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric reference circles */}
        {levels.map((lvl) => {
          const r = zToRadius(lvl);
          const isBaseline = lvl === 0;
          return (
            <g key={lvl}>
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={isBaseline ? 'var(--sep-claro)' : 'var(--sep)'}
                strokeWidth={isBaseline ? 1.5 : 0.8}
                strokeDasharray={isBaseline ? undefined : '3,3'}
              />
              <text
                x={center + 4}
                y={center - r - 2}
                fontSize="8"
                fill="var(--texto-tenue)"
                fontFamily="var(--mono)"
              >
                {lvl > 0 ? `+${lvl}σ` : lvl === 0 ? 'Media (0)' : `${lvl}σ`}
              </text>
            </g>
          );
        })}

        {/* Axis radial spokes */}
        {dimensions.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);

          // Label coordinates
          const labelDist = radius + 20;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <g key={d.dimId}>
              <line
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="var(--sep)"
                strokeWidth="1"
              />
              <text
                x={lx}
                y={ly + 3}
                fontSize="9"
                fontWeight="600"
                fontFamily="var(--mono)"
                textAnchor="middle"
                fill={Math.abs(d.zScore) >= 1.5 ? 'var(--riesgo)' : 'var(--texto-sec)'}
              >
                {d.dimId}
              </text>
            </g>
          );
        })}

        {/* Patient Latent Polygon */}
        <polygon
          points={polygonPath}
          fill="rgba(120, 169, 255, 0.22)"
          stroke="var(--accion)"
          strokeWidth="2"
        />

        {/* Data points */}
        {dimensions.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const r = zToRadius(d.zScore);
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);

          const isElevated = Math.abs(d.zScore) >= 1.5;

          return (
            <circle
              key={`pt-${d.dimId}`}
              cx={x}
              cy={y}
              r={isElevated ? 4.5 : 3.5}
              fill={isElevated ? 'var(--riesgo)' : 'var(--accion)'}
              stroke="var(--fondo)"
              strokeWidth="1.5"
            >
              <title>{`${d.dimId}: ${d.label} (z=${d.zScore}, valor=${d.rawValue})`}</title>
            </circle>
          );
        })}
      </svg>

      <div className="flex items-center gap-4 text-[10.5px] text-[var(--texto-tenue)] font-mono mt-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accion)] inline-block"></span>
          <span>Perfil del Paciente</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--riesgo)] inline-block"></span>
          <span>Desviación Significativa (≥1.5σ)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 border-t border-dashed border-[var(--sep-claro)] inline-block"></span>
          <span>Línea Base Normativa</span>
        </span>
      </div>
    </div>
  );
};
