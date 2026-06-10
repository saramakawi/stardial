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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(196, 160, 232, 0.1)" />
        <XAxis
          dataKey="date"
          stroke="rgba(196, 160, 232, 0.3)"
          tick={{ fill: 'rgba(196, 160, 232, 0.6)', fontSize: 12 }}
        />
        <YAxis
          domain={[0, 360]}
          stroke="rgba(196, 160, 232, 0.3)"
          tick={{ fill: 'rgba(196, 160, 232, 0.6)', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: '#0a0718',
            border: '1px solid rgba(196, 160, 232, 0.3)',
            borderRadius: 8,
            color: '#ede8ff',
          }}
        />
        <Line type="monotone" dataKey="longitude" stroke="var(--accent, #c4a0e8)" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
} 