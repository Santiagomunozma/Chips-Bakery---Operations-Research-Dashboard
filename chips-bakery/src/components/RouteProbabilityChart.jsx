import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function normalDensity(value, mean, standardDeviation) {
  const z = (value - mean) / standardDeviation;
  return Math.exp(-0.5 * z * z) / (standardDeviation * Math.sqrt(2 * Math.PI));
}

export default function RouteProbabilityChart({ mean, standardDeviation, deadline }) {
  const data = Array.from({ length: 121 }, (_, index) => {
    const time = mean - 3.5 * standardDeviation + (index / 120) * 7 * standardDeviation;
    const density = normalDensity(time, mean, standardDeviation);
    return {
      time,
      density,
      beforeDeadline: time <= deadline ? density : 0,
      afterDeadline: time > deadline ? density : 0,
    };
  });

  return (
    <div className="h-72 w-full" role="img" aria-label="Distribución normal estimada del tiempo de finalización">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(value) => value.toFixed(0)}
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            label={{ value: 'Duración (min)', position: 'insideBottom', offset: -4, fill: '#94a3b8', fontSize: 11 }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => value.toFixed(2)}
            width={44}
          />
          <Tooltip
            labelFormatter={(value) => `${Number(value).toFixed(2)} min`}
            formatter={(value, name) => [
              Number(value).toFixed(4),
              name === 'density' ? 'Densidad' : name === 'beforeDeadline' ? 'Cumplimiento' : 'Fuera del plazo',
            ]}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', borderRadius: 8 }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Area dataKey="beforeDeadline" type="monotone" stroke="none" fill="#f43f5e" fillOpacity={0.38} />
          <Area dataKey="afterDeadline" type="monotone" stroke="none" fill="#64748b" fillOpacity={0.22} />
          <Line dataKey="density" type="monotone" stroke="#fbbf24" strokeWidth={2} dot={false} />
          <ReferenceLine x={deadline} stroke="#fb7185" strokeDasharray="5 4" label={{ value: 'Plazo', fill: '#fda4af', fontSize: 11 }} />
          <ReferenceLine x={mean} stroke="#e2e8f0" strokeDasharray="3 5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
