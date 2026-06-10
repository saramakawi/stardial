import { useState, useMemo } from 'react';
import { getPlanetPositions } from './lib/astronomy';
import type { PlanetName } from './lib/astronomy';
import ZodiacWheel from './components/zodiac-wheel';
import TransitTimeline from './components/transit-timeline';
import TodaysSky from './components/todays-sky';
import Divider from './components/divider';

function App() {
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<PlanetName>('Mars');

  const positions = useMemo(
    () => getPlanetPositions(new Date(dateStr)),
    [dateStr]
  );

  return (
    <div className="min-h-screen">
      <div className="celestial-bg" />
      <div className="fixed inset-0 z-[-15] theme-overlay" />
      <div className="grain-overlay" />
      <div className="stars-bg" />

      <header className="text-center pt-32 pb-24 px-6">
        <h1 className="font-display text-6xl md:text-7xl font-bold mb-4 mystic-title">
          Stardial
        </h1>
        <p className="text-soft text-lg mb-10 tracking-wide italic">
          Real planetary positions for any date
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-24 pb-16 space-y-16">
        <TodaysSky />

        <Divider symbol="✦" />

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
          <div className="p-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg" style={{ color: 'var(--accent)' }}>
                Explore the Sky
              </h2>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="mystic-input text-sm"
              />
            </div>
            <ZodiacWheel positions={positions} />
          </div>

          <div className="glass-panel p-10">
            <h2 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--accent)' }}>
              Planetary Positions
            </h2>
            <div>
              {positions.map((p) => (
                <div
                  key={p.name}
                  className="planet-row flex justify-between items-center py-2.5 border-b border-soft last:border-0"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl leading-none" style={{ color: 'var(--accent)' }}>
                      {p.symbol}
                    </span>
                    <span className="text-sm">{p.name}</span>
                  </span>
                  <span className="text-sm font-mono" style={{ color: 'var(--text-soft)' }}>
                    {p.degreeInSign.toFixed(1)}° {p.sign}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider symbol="✦" />

        <div className="glass-panel p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl font-bold">Transit Timeline</h2>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value as PlanetName)}
              className="mystic-input text-sm"
            >
              {positions.map((p) => (
                <option key={p.name} value={p.name}>{p.symbol} {p.name}</option>
              ))}
            </select>
          </div>
          <TransitTimeline planet={selected} />
        </div>
      </main>
    </div>
  );
}

export default App;
