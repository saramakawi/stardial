import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getPlanetPositions, type PlanetName } from '../lib/astronomy';

export default function TransitTimeline({ planet, days = 90 }: { planet: PlanetName; days?: number }) {
  const data = useMemo(() => {
    const points: { date: string; longitude: number }[] = [];
    const start = new Date();
    for (let i = 0; i < days; i += 3) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const pos = getPlanetPositions(d).find((p) => p.name === planet)!;
      points.push({ date: d.toISOString().slice(5, 10), longitude: Number(pos.longitude.toFixed(1)) });
    }
    return points;
  }, [planet, days]);

  // Pull theme colors at render time so the chart matches the atlas palette.
  const ink = 'var(--ink)';
  const inkSoft = 'var(--ink-soft)';
  const sepiaFaint = 'var(--sepia-faint)';

  // Recharts needs concrete color strings for some props (SVG attrs accept
  // CSS vars, but tick fills are inline styles that resolve fine via var()).
  const labelStyle = {
    fontFamily: 'var(--font-body)',
    fill: inkSoft,
    fontSize: 12,
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
        {/* hairline grid, faint sepia, no vertical clutter */}
        <CartesianGrid
          stroke={sepiaFaint}
          strokeWidth={0.5}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          stroke={inkSoft}
          strokeWidth={0.75}
          tick={labelStyle}
          tickLine={{ stroke: sepiaFaint }}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          domain={[0, 360]}
          ticks={[0, 90, 180, 270, 360]}
          stroke={inkSoft}
          strokeWidth={0.75}
          tick={labelStyle}
          tickLine={{ stroke: sepiaFaint }}
        />
        <Tooltip
          cursor={{ stroke: sepiaFaint, strokeWidth: 1 }}
          contentStyle={{
            background: 'var(--paper)',
            border: '1px solid var(--sepia)',
            borderRadius: 2,
            fontFamily: 'var(--font-body)',
            color: 'var(--ink)',
            boxShadow: 'none',
          }}
          labelStyle={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-display)' }}
          formatter={(value) => [`${Number(value)}°`, 'Longitude']}
        />
        <Line
          type="monotone"
          dataKey="longitude"
          stroke={ink}
          strokeWidth={1.25}
          dot={false}
          activeDot={{
            r: 3.5,
            fill: 'var(--paper)',
            stroke: 'var(--ink)',
            strokeWidth: 1,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 