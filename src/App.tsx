import { useState, useMemo } from 'react';
import { getPlanetPositions, getAspects } from './lib/astronomy';
import type { PlanetName } from './lib/astronomy';
import Divider from './components/divider';
import ZodiacWheel from './components/zodiac-wheel';
import TransitTimeline from './components/transit-timeline';
import TodaysSky from './components/todays-sky';

function App() {
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<PlanetName>('Mars');

  const [mode, setMode] = useState<'explore' | 'birth'>('explore');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [birthTime, setBirthTime] = useState('12:00');

  const activeDate = useMemo(() => {
  if (mode === 'birth') {
    return new Date(`${birthDate}T${birthTime}:00`);
  }
  return new Date(dateStr);
}, [mode, birthDate, birthTime, dateStr]);

  const positions = useMemo(
    () => getPlanetPositions(activeDate),
    [activeDate]
  );

  const aspects = useMemo(() => getAspects(positions), [positions]);

  return (
    <div className="min-h-screen">
      <header className="text-center pt-24 px-6">
        <h1 className="font-display text-6xl md:text-7xl font-bold mb-4 mystic-title">
          Stardial
        </h1>
        <p className="text-soft text-lg mb-10 tracking-wide italic">
          turn the dial through the stars and see what you find
        </p>
      </header>

      <Divider symbol="✦" />

      <main className="max-w-5xl mx-auto px-24 pb-16 space-y-16">
        <TodaysSky />

        <Divider symbol="✦" />

        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setMode('explore')}
            data-active={mode === 'explore'}
            className="atlas-button"
          >
            Explore the Sky
          </button>
          <button
            onClick={() => setMode('birth')}
            data-active={mode === 'birth'}
            className="atlas-button"
          >
            Birth Chart
          </button>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
          <div className="p-8">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 pb-4"
                style={{ borderBottom: '1px solid var(--sepia-faint)' }}>
              {mode === 'explore' ? (
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="atlas-input text-sm"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="atlas-input text-sm"
                  />
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="atlas-input text-sm"
                  />
                </div>
              )}
            </div>
            <ZodiacWheel positions={positions} aspects={aspects} />
          </div>

          <div className="plate p-10">
            <h2 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--sepia)' }}>
              Planetary Positions
            </h2>
            <div>
              {positions.map((p) => (
                <div
                  key={p.name}
                  className="planet-row flex justify-between items-center py-2.5 border-b border-soft last:border-0"
                >
                  <span className="flex items-center gap-3">
                    <span className="glyph text-xl leading-none" style={{ color: 'var(--sepia)' }}>
                      {p.symbol}
                    </span>
                    <span className="text-sm">
                      {p.name}
                      {p.retrograde && (
                        <span className="ml-1.5 text-xs" style={{ color: 'var(--rust)' }} title="Retrograde">℞</span>
                      )}
                    </span>
                  </span>
                  <span className="text-sm font-mono" style={{ color: 'var(--rust)' }}>
                    {p.degreeInSign.toFixed(1)}° {p.sign}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="plate p-6">
          <h2 className="font-display text-lg mb-4" style={{ color: 'var(--sepia)' }}>Aspects</h2>
          <div className="space-y-1.5">
            {aspects.map((asp, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{asp.planetA} {asp.symbol} {asp.planetB}</span>
                <span className="text-soft">{asp.type} · {asp.orb}° orb</span>
              </div>
            ))}
          </div>
        </div>

        <Divider symbol="✦" />

        <div className="plate p-10">
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
