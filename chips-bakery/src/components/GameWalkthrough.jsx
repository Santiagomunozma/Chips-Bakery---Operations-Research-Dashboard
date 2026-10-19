import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { formatK } from '../model/format.js';
import { fmtN } from '../model/engine.js';

const LINE_COLORS = {
  d1: '#34d399',
  d2: '#C48A4A',
  d3: '#60a5fa',
  S1: '#ef4444',
  S2: '#16a34a',
  envelope: '#94a3b8',
};

function colorFor(id, i = 0) {
  if (LINE_COLORS[id]) return LINE_COLORS[id];
  const fallback = ['#34d399', '#C48A4A', '#60a5fa', '#ef4444', '#a78bfa'];
  return fallback[i % fallback.length];
}

export function AlgebraSteps({ steps, heading = 'Análisis algebraico' }) {
  return (
    <div className="bg-brand-cream p-4 md:p-6 rounded-xl border border-brand-pink space-y-4">
      <h3 className="text-xl font-semibold text-brand-ink">{heading}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div key={step.title} className="p-4 rounded-lg border border-brand-pink bg-brand-rose/40">
            <h4 className="text-brand-tan font-bold mb-2 text-sm">{step.title}</h4>
            <ul className="text-sm text-brand-ink space-y-1.5 leading-relaxed">
              {step.lines.map((line) => (
                <li key={line} className="font-mono text-[13px] whitespace-pre-wrap">{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMatrix({ snapshot }) {
  if (!snapshot?.matrix?.length) return null;
  return (
    <div className="overflow-x-auto mt-3">
      <table className="text-xs text-center border-collapse w-full">
        <thead>
          <tr className="text-brand-muted">
            <th className="p-2 border border-brand-pink text-left"> </th>
            {snapshot.colLabels.map((c) => (
              <th key={c} className="p-2 border border-brand-pink">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {snapshot.matrix.map((row, i) => (
            <tr key={snapshot.rowLabels[i]}>
              <td className="p-2 border border-brand-pink text-left font-bold text-brand-ink">{snapshot.rowLabels[i]}</td>
              {row.map((v, j) => (
                <td key={`${i}-${j}`} className="p-2 border border-brand-pink text-brand-ink">{fmtN(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DominanceSteps({ dominance }) {
  return (
    <div className="bg-brand-cream p-4 md:p-6 rounded-xl border border-brand-pink space-y-4">
      <h3 className="text-xl font-semibold text-brand-ink">Método de dominancia</h3>
      <p className="text-sm text-brand-muted">
        Se eliminan filas y columnas dominadas. Una fila domina a otra si paga al menos igual en todas las columnas y más en alguna.
        Una columna domina a otra si es peor o igual para Chips en todas las filas (el mercado minimiza).
      </p>
      <ol className="space-y-4">
        {dominance.steps.map((step, idx) => (
          <li key={`${step.title}-${idx}`} className="p-4 rounded-lg border border-brand-pink bg-brand-rose/40">
            <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Paso {idx + 1}</p>
            <h4 className="text-brand-tan font-bold text-sm mb-2">{step.title}</h4>
            {step.lines.map((line) => (
              <p key={line} className="text-sm text-brand-ink leading-relaxed">{line}</p>
            ))}
            {step.eliminated && (
              <p className="text-xs text-amber-700 mt-2">
                Eliminada: {step.eliminated.label} ({step.eliminated.type})
              </p>
            )}
            <MiniMatrix snapshot={step.snapshot} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function ChartTooltip({ active, payload, label, xName }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-xs text-slate-100">
      <p className="mb-1">{xName} = {Number(label).toFixed(2)}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {formatK(item.value, 2)}
        </p>
      ))}
    </div>
  );
}

export function GameGraph({ graph, title = 'Análisis gráfico (m × 2)' }) {
  const keys = graph.equations.map((eq) => eq.id);
  return (
    <div className="bg-brand-cream p-4 md:p-6 rounded-xl border border-brand-pink space-y-4">
      <h3 className="text-xl font-semibold text-brand-ink">{title}</h3>
      <p className="text-sm text-brand-ink leading-relaxed">{graph.note}</p>
      <ul className="text-sm font-mono text-brand-ink space-y-1">
        {graph.equations.map((eq) => (
          <li key={eq.id} style={{ color: colorFor(eq.id) }}>{eq.text}</li>
        ))}
      </ul>
      <p className="text-sm text-brand-ink">
        Óptimo gráfico: <strong>q* = {fmtN(graph.qStar)}</strong> (P(S1)), valor <strong>{formatK(graph.vStar, 2)}</strong>.
        Filas activas: {graph.activeLabels.join(', ') || '—'}.
      </p>
      <div className="h-72 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graph.chartData} margin={{ top: 12, right: 24, left: 8, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="q"
              type="number"
              domain={[0, 1]}
              stroke="#94a3b8"
              tickFormatter={(v) => v.toFixed(1)}
              label={{ value: 'q = P(S1)    x=0 → S2    x=1 → S1', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis stroke="#94a3b8" label={{ value: 'Pago ($k)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip content={<ChartTooltip xName="q" />} />
            <Legend verticalAlign="top" height={36} />
            <ReferenceLine x={graph.qStar} stroke="#F7B8C9" strokeDasharray="3 3" />
            <ReferenceLine y={graph.vStar} stroke="#34d399" strokeDasharray="4 4" />
            <Line type="linear" dataKey="envelope" name="Envolvente sup." stroke={LINE_COLORS.envelope} strokeDasharray="5 5" strokeWidth={2} dot={false} />
            {keys.map((key, i) => (
              <Line
                key={key}
                type="linear"
                dataKey={key}
                name={graph.equations[i].text}
                stroke={colorFor(key, i)}
                strokeWidth={3}
                dot={false}
              />
            ))}
            <ReferenceDot x={graph.qStar} y={graph.vStar} r={7} fill="#ef4444" stroke="#fff" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MixedGraph({ graph, title = 'Análisis gráfico 2 × 2' }) {
  if (!graph) return null;
  const c0 = graph.colLabels[0];
  const c1 = graph.colLabels[1];
  return (
    <div className="bg-brand-cream p-4 md:p-6 rounded-xl border border-brand-pink space-y-4">
      <h3 className="text-xl font-semibold text-brand-ink">{title}</h3>
      <p className="text-sm text-brand-ink leading-relaxed">{graph.note}</p>
      <ul className="text-sm font-mono text-brand-ink space-y-1">
        {graph.equations.map((eq, i) => (
          <li key={eq.id} style={{ color: colorFor(eq.id, i) }}>{eq.text}</li>
        ))}
      </ul>
      {graph.pStar != null && graph.vStar != null && (
        <p className="text-sm text-brand-ink">
          Cruce: <strong>p* = {fmtN(graph.pStar)}</strong> (P({graph.rowLabels[0]})), valor <strong>{formatK(graph.vStar, 2)}</strong>.
        </p>
      )}
      <div className="h-72 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graph.chartData} margin={{ top: 12, right: 24, left: 8, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="p"
              type="number"
              domain={[0, 1]}
              stroke="#94a3b8"
              tickFormatter={(v) => v.toFixed(1)}
              label={{ value: `p = P(${graph.rowLabels[0]})    x=0 → ${graph.rowLabels[1]}    x=1 → ${graph.rowLabels[0]}`, position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis stroke="#94a3b8" label={{ value: 'Pago ($k)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip content={<ChartTooltip xName="p" />} />
            <Legend verticalAlign="top" height={36} />
            {graph.pStar != null && <ReferenceLine x={graph.pStar} stroke="#64748b" />}
            {graph.vStar != null && <ReferenceLine y={graph.vStar} stroke="#64748b" />}
            <Line type="linear" dataKey={c0} name={graph.equations[0].text} stroke={colorFor(c0, 0)} strokeWidth={3} dot={false} />
            <Line type="linear" dataKey={c1} name={graph.equations[1].text} stroke={colorFor(c1, 1)} strokeWidth={3} dot={false} />
            {graph.pStar != null && graph.vStar != null && (
              <ReferenceDot x={graph.pStar} y={graph.vStar} r={8} fill="#ef4444" stroke="#fff" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
