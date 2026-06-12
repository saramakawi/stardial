interface Props {
  phaseAngle: number;  // 0 – 360 degrees from your getMoonPhase
  size?: number;
}

/*
 * Draws the moon's illuminated fraction as a glyph.
 * phaseAngle: 0 = new, 90 = first quarter, 180 = full, 270 = last quarter.
 */
export default function MoonGlyph({ phaseAngle, size = 36 }: Props) {
  const r = size / 2;
  const cx = r;
  const cy = r;

  // Fraction illuminated (0–1) and which side is lit
  const illum = (1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2;
  const waxing = phaseAngle <= 180; // lit on the right while waxing

  // The terminator is an ellipse whose horizontal radius shrinks/grows.
  // At new/full it's a half-ellipse; we compute its x-radius from illumination.
  const termRx = Math.abs(Math.cos((phaseAngle * Math.PI) / 180)) * r;
  const gibbous = illum > 0.5;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      role="img" aria-label="Moon phase">
      {/* dark disc outline */}
      <circle cx={cx} cy={cy} r={r - 0.5}
        fill="var(--paper-edge)" stroke="var(--ink)" strokeWidth="0.75" />

      {/* lit portion, clipped to the disc */}
      <clipPath id={`moon-${phaseAngle.toFixed(0)}`}>
        <circle cx={cx} cy={cy} r={r - 0.5} />
      </clipPath>
      <g clipPath={`url(#moon-${phaseAngle.toFixed(0)})`}>
        {illum > 0.01 && (
          <path
            d={
              waxing
                ? `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} ` +
                  `A ${termRx} ${r} 0 0 ${gibbous ? 1 : 0} ${cx} ${cy - r} Z`
                : `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} ` +
                  `A ${termRx} ${r} 0 0 ${gibbous ? 0 : 1} ${cx} ${cy - r} Z`
            }
            fill="var(--gold-leaf)"
          />
        )}
      </g>
    </svg>
  );
}