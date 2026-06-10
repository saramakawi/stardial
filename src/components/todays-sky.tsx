import { useMemo } from 'react';
import { getPlanetPositions, getMoonPhase } from '../lib/astronomy';

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
    <div className="glass-panel p-8 md:p-10 text-center">
      <p className="text-soft text-sm tracking-widest uppercase mb-2">Today's Sky</p>
      <h2 className="font-display text-2xl md:text-3xl mb-8" style={{ fontWeight: 300 }}>
        {dateLabel}
      </h2>

      <div className="flex flex-wrap justify-center gap-8 md:gap-12">
        {/* Sun */}
        <div className="flex flex-col items-center">
          <span className="text-4xl mb-2" style={{ color: 'var(--accent)' }}>☉</span>
          <span className="text-sm text-soft">Sun in</span>
          <span className="font-display text-lg">{sun.sign}</span>
          <span className="text-xs text-soft">{sun.degreeInSign.toFixed(0)}°</span>
        </div>

        {/* Moon phase */}
        <div className="flex flex-col items-center">
          <span className="text-4xl mb-2">{moon.symbol}</span>
          <span className="text-sm text-soft">{moon.name}</span>
          <span className="font-display text-lg">{Math.round(moon.illumination * 100)}% lit</span>
        </div>

        {/* Moon sign */}
        <div className="flex flex-col items-center">
          <span className="text-4xl mb-2" style={{ color: 'var(--accent)' }}>☽</span>
          <span className="text-sm text-soft">Moon in</span>
          <span className="font-display text-lg">{moonPos.sign}</span>
          <span className="text-xs text-soft">{moonPos.degreeInSign.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
}