// This component displays information about today's sky, 
// including the Sun's position, the Moon's phase and position.

import { useMemo } from 'react';
import { getPlanetPositions, getMoonPhase } from '../lib/astronomy';
import MoonGlyph from './moon-glyph';

export default function TodaysSky() {
  const today = useMemo(() => new Date(), []);
  const positions = useMemo(() => getPlanetPositions(today), [today]);
  const moon = useMemo(() => getMoonPhase(today), [today]);

  const sun = positions.find((p) => p.name === 'Sun')!;
  const moonPos = positions.find((p) => p.name === 'Moon')!;

  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="plate plate-inset p-8 md:p-10 text-center">
      <p className="text-soft text-sm tracking-widest uppercase mb-2">Today's Sky</p>
      <h2 className="font-display text-2xl md:text-3xl mb-8" style={{ fontWeight: 300 }}>
        {dateLabel}
      </h2>

      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {/* Sun */}
        <div className="flex flex-col items-center">
          <span className="glyph text-4xl mb-2" style={{ color: 'var(--sepia)' }}>☉</span>
          <span className="text-md">Sun in</span>
          <span className="font-display text-md">{sun.sign}</span>
          <span className="text-sm oldstyle-nums">{sun.degreeInSign.toFixed(0)}°</span>
        </div>

        {/* Moon phase */}
        <div className="flex flex-col items-center">
          <div className="glyph mb-2 flex justify-center">
            <MoonGlyph phaseAngle={moon.phaseAngle} size={40} />
          </div>
          <span className="font-display text-md">{moon.name}</span>
          <span className="font-display text-sm">{Math.round(moon.illumination * 100)}% lit</span>
        </div>

        {/* Moon sign */}
        <div className="flex flex-col items-center">
          <span className="glyph text-4xl mb-2" style={{ color: 'var(--sepia)' }}>☽</span>
          <span className="text-md">Moon in</span>
          <span className="font-display text-md">{moonPos.sign}</span>
          <span className="text-sm oldstyle-nums">{moonPos.degreeInSign.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
}