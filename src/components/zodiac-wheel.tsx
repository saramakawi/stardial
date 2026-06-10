import type { PlanetPosition } from '../lib/astronomy';
import { ZODIAC_SYMBOLS } from '../lib/astronomy';

interface Props {
  positions: PlanetPosition[];
  size?: number;
}

export default function ZodiacWheel({ positions, size = 500 }: Props) {
  const center = size / 2;
  const outerRadius = size / 2 - 10;
  const signRadius = outerRadius - 30;
  const planetRadius = outerRadius - 80;

  const pointAt = (longitude: number, radius: number) => {
    const angle = ((-longitude - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xl mx-auto">
      <defs>
        <filter id="planet-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ring-glow" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ring with glow */}
      <circle cx={center} cy={center} r={outerRadius}
        fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.45"
        filter="url(#ring-glow)" />
      <circle cx={center} cy={center} r={signRadius}
        fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.2" />

      {/* Inner decorative circle */}
      <circle cx={center} cy={center} r={planetRadius - 28}
        fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.12" />

      {/* 12 sign divisions + glyphs */}
      {ZODIAC_SYMBOLS.map((symbol, i) => {
        const divisionLong = i * 30;
        const edge = pointAt(divisionLong, outerRadius);
        const inner = pointAt(divisionLong, signRadius);
        const labelPos = pointAt(divisionLong + 15, (outerRadius + signRadius) / 2);
        return (
          <g key={i}>
            <line x1={inner.x} y1={inner.y} x2={edge.x} y2={edge.y}
              stroke="var(--accent)" strokeWidth="0.5" opacity="0.25" />
            <text x={labelPos.x} y={labelPos.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="18" fill="var(--accent)" opacity="0.8">
              {symbol}
            </text>
          </g>
        );
      })}

      {/* Planets with glow */}
      {positions.map((planet) => {
        const pos = pointAt(planet.longitude, planetRadius);
        return (
          <g key={planet.name} filter="url(#planet-glow)">
            <circle cx={pos.x} cy={pos.y} r="15"
              fill="rgb(var(--panel) / 0.3)" stroke="var(--accent)" strokeWidth="0.8" opacity="0.9" />
            <text x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="14" fill="var(--accent)">
              {planet.symbol}
            </text>
          </g>
        );
      })}

      {/* Center dot */}
      <circle cx={center} cy={center} r="3"
        fill="var(--accent)" opacity="0.4" />
    </svg>
  );
}
