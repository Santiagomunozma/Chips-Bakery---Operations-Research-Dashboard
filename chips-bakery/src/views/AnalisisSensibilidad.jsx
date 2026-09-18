import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { useLab } from '../state/LabContext';
import { PRESETS } from '../model/params.js';
import { formatK, formatPct } from '../model/format.js';

function eqText(id, eq) {
  const intercept = eq.intercept;
  const slope = eq.slope;
  const slopeAbs = Math.abs(slope);
  const sign = slope >= 0 ? '+' : '−';
  if (Math.abs(slope) < 1e-9) return `${id}: y = ${intercept.toFixed(0)}`;
  return `${id}: y = ${intercept.toFixed(0)} ${sign} ${slopeAbs.toFixed(0)}p`;
}

export default function AnalisisSensibilidad() {
  const { params, setPS1, applyPreset, result } = useLab();
  const { sensitivity, decisions } = result;
  const pBajaPercent = Math.round(params.pS1 * 100);
  const criticalPct = sensitivity.critical != null ? sensitivity.critical * 100 : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-brand-pink pb-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-ink">Análisis de Sensibilidad</h2>
          <p className="text-brand-muted text-sm mt-1">El cruce se deriva de los payoffs. El segundo preset es el caso del Excel: obras frente al local, menos clientes, P(baja)=70%</p>
        </div>
      </div>

      {criticalPct != null && pBajaPercent >= criticalPct && (
        <div className="bg-brand-rose border border-brand-tan p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-brand-tan shrink-0 mt-0.5" />
          <div>
            <h4 className="text-brand-tan font-semibold">Punto crítico cruzado</h4>
            <p className="text-brand-ink text-sm mt-1">
              A partir de P(Baja) = {formatPct(sensitivity.critical, 0)}, la decisión óptima deja de ser la más agresiva.
              Ahora gana <strong>{sensitivity.bestId}</strong> con VE {formatK(sensitivity.bestValue, 2)}.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className="text-xs px-3 py-1.5 rounded-md border border-brand-pink bg-brand-cream text-brand-ink hover:border-brand-tan"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
        <label className="block text-brand-ink text-sm font-semibold mb-4">
          Probabilidad de Demanda Baja (P): <span className="text-brand-tan text-lg">{pBajaPercent}%</span> ({params.pS1.toFixed(2)})
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={pBajaPercent}
          onChange={(e) => setPS1(Number(e.target.value) / 100)}
          className="w-full h-2 bg-brand-pink rounded-lg appearance-none cursor-pointer accent-brand-tan"
        />
        <div className="flex justify-between text-xs text-brand-muted mt-2">
          <span>0%</span>
          <span>{criticalPct != null ? `${criticalPct.toFixed(0)}% (cruce)` : 'sin cruce'}</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {decisions.map((d, i) => {
          const isBest = i === sensitivity.bestIdx;
          return (
            <div key={d.id} className={`p-4 rounded-xl border ${isBest ? 'bg-emerald-900/20 border-emerald-500' : 'bg-brand-cream border-brand-pink'}`}>
              <p className="text-brand-muted text-sm font-semibold">VE {d.short} ({d.qty} galletas)</p>
              <p className={`text-2xl font-bold ${isBest ? 'text-emerald-400' : 'text-brand-ink'}`}>
                {formatK(d.ev, 2)}
              </p>
              <p className="text-[11px] text-brand-muted mt-1">{eqText(d.short, sensitivity.equations[i])}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink h-96">
        <h3 className="text-brand-ink font-semibold mb-4 text-sm">Valor Esperado vs Probabilidad de Demanda Baja</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sensitivity.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="probabilidad"
              stroke="#94a3b8"
              label={{ value: 'Probabilidad P(Baja)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis
              stroke="#94a3b8"
              label={{ value: 'Valor Esperado ($k)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#e2e8f0' }}
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend verticalAlign="top" height={36} />
            {criticalPct != null && (
              <ReferenceLine x={Number(sensitivity.critical.toFixed(2))} stroke="#F7B8C9" strokeDasharray="3 3" label={{ value: `Cruce (${sensitivity.critical.toFixed(2)})`, fill: '#F7B8C9', position: 'insideTopLeft' }} />
            )}
            <ReferenceLine x={Number(params.pS1.toFixed(2))} stroke="#C48A4A" strokeWidth={2} />
            <Line type="monotone" dataKey="d1" name={eqText('d1', sensitivity.equations[0])} stroke="#34d399" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="d2" name={eqText('d2', sensitivity.equations[1])} stroke="#C48A4A" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="d3" name={eqText('d3', sensitivity.equations[2])} stroke="#F7B8C9" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
