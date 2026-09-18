import React, { useState } from 'react';
import { RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useLab } from '../state/LabContext';
import { PRESETS } from '../model/params.js';

function RangeField({ label, value, min, max, step, onChange, display }) {
  return (
    <label className="block space-y-1.5 min-w-0">
      <span className="flex items-center justify-between text-xs text-brand-muted gap-2">
        <span className="truncate">{label}</span>
        <span className="font-semibold text-brand-tan shrink-0">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-brand-pink rounded-lg appearance-none cursor-pointer accent-brand-tan"
      />
    </label>
  );
}

function NumberField({ label, value, min, step, onChange }) {
  return (
    <label className="block space-y-1 min-w-0">
      <span className="text-xs text-brand-muted">{label}</span>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-900 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-brand-tan"
      />
    </label>
  );
}

export default function LabPanel() {
  const { params, patchParams, setPS1, applyPreset, reset, result } = useLab();
  const [open, setOpen] = useState(true);
  const pPct = Math.round(params.pS1 * 100);

  return (
    <section className="bg-brand-cream rounded-xl border border-brand-pink mb-6">
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-pink">
        <div className="flex items-center gap-3 min-w-0">
          <SlidersHorizontal size={16} className="text-brand-tan shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-brand-tan">Laboratorio</h2>
            <p className="text-[11px] text-brand-muted truncate">
              {result.bestId.toUpperCase()} · VE ${result.bestEv.toFixed(0)}k · IVEM ${result.bayes.ivem.toFixed(0)}k
              {result.sensitivity.critical != null ? ` · cruce ${(result.sensitivity.critical * 100).toFixed(0)}%` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-md border border-brand-pink text-brand-ink hover:border-brand-tan"
          >
            <RotateCcw size={12} /> Caso base
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 rounded-md text-brand-ink hover:bg-brand-rose"
            aria-expanded={open}
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-3 space-y-3">
            <div className="flex gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`flex-1 text-[11px] px-2 py-1.5 rounded-md border transition-colors ${
                    Math.abs(params.pS1 - preset.params.pS1) < 1e-9
                      ? 'bg-brand-tan border-brand-tan text-white'
                      : 'bg-slate-900 border-slate-600 text-slate-300 hover:border-brand-tan'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <RangeField
              label="P(demanda baja)"
              value={pPct}
              min={0}
              max={100}
              step={1}
              display={`${pPct}% / alta ${100 - pPct}%`}
              onChange={(v) => setPS1(v / 100)}
            />
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <NumberField label="Precio venta" value={params.price} min={0} step={0.5} onChange={(v) => patchParams({ price: v })} />
            <NumberField label="Costo unitario" value={params.cost} min={0} step={0.5} onChange={(v) => patchParams({ cost: v })} />
            <NumberField label="d1" value={params.d1} min={0} step={10} onChange={(v) => patchParams({ d1: v })} />
            <NumberField label="d2" value={params.d2} min={0} step={10} onChange={(v) => patchParams({ d2: v })} />
            <NumberField label="d3" value={params.d3} min={0} step={10} onChange={(v) => patchParams({ d3: v })} />
            <NumberField label="S1 baja" value={params.s1} min={0} step={10} onChange={(v) => patchParams({ s1: v })} />
            <NumberField label="S2 alta" value={params.s2} min={0} step={10} onChange={(v) => patchParams({ s2: v })} />
            <p className="text-[11px] text-brand-muted self-end pb-1">Margen ${result.margin} / galleta</p>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-semibold text-brand-ink">Verosimilitudes del estudio</p>
            <RangeField
              label="P(F | S1 baja)"
              value={Math.round(params.pFGivenS1 * 100)}
              min={0}
              max={100}
              step={1}
              display={`${Math.round(params.pFGivenS1 * 100)}%`}
              onChange={(v) => patchParams({ pFGivenS1: v / 100 })}
            />
            <RangeField
              label="P(F | S2 alta)"
              value={Math.round(params.pFGivenS2 * 100)}
              min={0}
              max={100}
              step={1}
              display={`${Math.round(params.pFGivenS2 * 100)}%`}
              onChange={(v) => patchParams({ pFGivenS2: v / 100 })}
            />
          </div>
        </div>
      )}
    </section>
  );
}
