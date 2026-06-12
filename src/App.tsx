// This is the main application component for Stardial. It manages the state of the selected date, 
// mode (explore vs birth chart), and birth date/time. It computes planetary positions and aspects 
// for the active date and renders the zodiac wheel, planetary positions list, aspects list, and 
// transit timeline.

import { useState, useMemo } from 'react';
import { usePersistentState } from './hooks/user-persistent-state';
import { getPlanetPositions, getAspects } from './lib/astronomy';
import type { PlanetName } from './lib/astronomy';
import Divider from './components/divider';
import ZodiacWheel from './components/zodiac-wheel';
import TransitTimeline from './components/transit-timeline';
import TodaysSky from './components/todays-sky';

function App() {
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = usePersistentState<PlanetName>('stardial-planet', 'Mars');
  const [mode, setMode] = usePersistentState<'explore' | 'birth'>('stardial-mode', 'explore');
  const [birthDate, setBirthDate] = usePersistentState<string>('stardial-birthdate', '2000-01-01');
  const [birthTime, setBirthTime] = usePersistentState<string>('stardial-birth-time', '12:00');

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
      <div className="paper-texture" />
      <div className="page-vignette" />
      {/* Title and intro text, with a header and subheader, centered and spaced out. */}
      <header className="text-center pt-24 px-6">
        <h1 className="atlas-title">Stardial</h1>
        <p className="text-soft text-lg mb-10 tracking-wide italic">
          Turn the dial through the stars and see what you find
        </p>
      </header>

      <Divider symbol="✦" />

      <main className="max-w-5xl mx-auto px-24 pb-16 space-y-16">
        <TodaysSky />

        <Divider symbol="✦" />

        {/* Mode toggle buttons */}
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

        {/* Date selector and zodiac wheel */}
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
                <div className="flex flex-wrap justify-center gap-2">
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

          {/* Planetary Positions List */}
          <div className="plate p-10">
            <h2 className="font-semibold mb-5 engraved-label" style={{ color: 'var(--sepia)' }}>
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
                  <span className="text-sm oldstyle-nums" style={{ color: 'var(--rust)' }}>
                    {p.degreeInSign.toFixed(1)}° {p.sign}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Aspects List */}
        <div className="plate p-6">
          <h2 className="font-semibold mb-5 engraved-label">Aspects</h2>
          <div className="space-y-1.5">
            {aspects.map((asp, i) => (
              <div key={i} className="planet-row flex text-sm justify-between items-center py-2.5 border-b border-soft last:border-0">
                <span>{asp.planetA} {asp.symbol} {asp.planetB}</span>
                <span className="text-soft">{asp.type} · {asp.orb}° orb</span>
              </div>
            ))}
          </div>
        </div>

        <Divider symbol="✦" />

        {/* Transit timeline for the selected planet */}   
        <div className="plate p-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="font-semibold mb-5 engraved-label">Transit Timeline</h2>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value as PlanetName)}
              className="atlas-input text-sm"
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
