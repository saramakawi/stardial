// This component renders a zodiac wheel with planetary positions and aspects.

import type { PlanetPosition, Aspect } from '../lib/astronomy';
import { ZODIAC_SYMBOLS } from '../lib/astronomy';

interface Props {
  positions: PlanetPosition[];
  aspects?: Aspect[];
  size?: number;
}

export default function ZodiacWheel({ positions, aspects = [], size = 500 }: Props) {
  const center = size / 2;
  const outerRadius = size / 2 - 12;
  const hatchOuter = outerRadius;
  const hatchInner = outerRadius - 14;       // thin hatched band at the rim
  const signRadius = outerRadius - 14;        // ring the sign glyphs sit on
  const signInner = signRadius - 40;          // inner edge of the sign band
  const planetRadius = signInner - 46;        // where planets are placed
  const aspectRadius = planetRadius - 24;     // aspect lines end here

  const pointAt = (longitude: number, radius: number) => {
    const angle = ((-longitude - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Aspect line color by family, in antique tones
  const aspectColor = (type: string) => {
    if (type === 'Trine' || type === 'Sextile') return 'var(--teal-ink)';   // harmonious
    if (type === 'Square' || type === 'Opposition') return 'var(--rust)';   // tense
    return 'var(--sepia)';                                                  // conjunction
  };

  const longitudeOf = (name: string) =>
    positions.find((p) => p.name === name)!.longitude;

  // The 12 sign-division angles
  const divisions = Array.from({ length: 12 }, (_, i) => i * 30);

  // Hatching ticks around the rim (engraving texture) — one every 2°
  const hatchTicks = Array.from({ length: 180 }, (_, i) => i * 2);


  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-xl mx-auto"
      role="img"
      aria-label="Engraved zodiac wheel showing planetary positions"
    >
      <title>Zodiac wheel</title>
      <desc>An antique-style engraving of the zodiac with planets at their computed positions.</desc>

      {/* ---- Concentric rings ---- */}
      <circle cx={center} cy={center} r={outerRadius}
        fill="none" stroke="var(--sepia)" strokeWidth="1" />
      <circle cx={center} cy={center} r={hatchInner}
        fill="none" stroke="var(--sepia)" strokeWidth="0.5" />
      <circle cx={center} cy={center} r={signInner}
        fill="none" stroke="var(--sepia)" strokeWidth="0.75" />
      <circle cx={center} cy={center} r={planetRadius + 18}
        fill="none" stroke="var(--sepia-faint)" strokeWidth="0.5" />
      <circle cx={center} cy={center} r={aspectRadius}
        fill="none" stroke="var(--sepia-faint)" strokeWidth="0.5" />

      {/* ---- Rim hatching (fine engraving ticks) ---- */}
      {hatchTicks.map((deg, i) => {
        const a = pointAt(deg, hatchOuter);
        const b = pointAt(deg, hatchInner);
        return (
          <line key={`h${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="var(--sepia)" strokeWidth="0.4" opacity="0.55" />
        );
      })}

      {/* ---- 12 sign divisions + serif glyphs ---- */}
      {divisions.map((deg, i) => {
        const outer = pointAt(deg, outerRadius);
        const inner = pointAt(deg, signInner);
        const labelPos = pointAt(deg + 15, (signRadius + signInner) / 2);
        return (
          <g key={`d${i}`}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="var(--sepia)" strokeWidth="0.75" />
            <text x={labelPos.x} y={labelPos.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="22" fill="var(--ink)"
              style={{ fontFamily: 'var(--font-display)' }}>
              {ZODIAC_SYMBOLS[i]}
            </text>
          </g>
        );
      })}

      {/* ---- Aspect lines across the chart (drawn before planets) ---- */}
      {aspects.map((asp, i) => {
        const a = pointAt(longitudeOf(asp.planetA), aspectRadius);
        const b = pointAt(longitudeOf(asp.planetB), aspectRadius);
        const tense = asp.type === 'Square' || asp.type === 'Opposition';
        return (
          <line key={`a${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={aspectColor(asp.type)} strokeWidth="0.75"
            opacity="0.7"
            strokeDasharray={tense ? '3 3' : undefined} />
        );
      })}

      {/* ---- Planets as ink-on-paper marks ---- */}
      {positions.map((planet) => {
        const pos = pointAt(planet.longitude, planetRadius);
        return (
          <g key={planet.name}>
            {/* small tick from the sign ring to the planet*/}
            <text x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="20" fill="var(--ink)"
              style={{ fontFamily: 'var(--font-display)' }}>
              {planet.symbol}
            </text>
            {/* retrograde mark */}
            {planet.retrograde && (
              <text x={pos.x + 13} y={pos.y - 11}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fill="var(--rust)"
                style={{ fontFamily: 'var(--font-display)' }}>
                ℞
              </text>
            )}
          </g>
        );
      })}

      {/* ---- Center ornament ---- */}
      <circle cx={center} cy={center} r="3" fill="var(--sepia)" />
      <circle cx={center} cy={center} r="7"
        fill="none" stroke="var(--sepia)" strokeWidth="0.5" />
    </svg>
  );
}
