import React, { useMemo } from 'react';
import { AlertTriangle, Clock, Users } from 'lucide-react';
import { useLab } from '../state/LabContext';
import { mm1, poissonPmf } from '../model/engine.js';

function fmt(n, digits = 3) {
  if (n == null || Number.isNaN(n) || !Number.isFinite(n)) return '—';
  const rounded = Number(n.toFixed(digits));
  return String(rounded);
}

function Slider({ label, value, min, max, step, display, onChange }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-xs text-brand-muted gap-2">
        <span>{label}</span>
        <span className="font-semibold text-brand-tan">{display}</span>
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

function Metric({ label, value, hint, testId }) {
  return (
    <div className="bg-brand-rose/60 rounded-lg border border-brand-pink p-4" data-metric={testId}>
      <p className="text-xs text-brand-muted">{label}</p>
      <p className="text-2xl font-black text-brand-ink mt-1">{value}</p>
      {hint && <p className="text-[11px] text-brand-muted mt-1">{hint}</p>}
    </div>
  );
}

function Dots({ count, tone }) {
  const shown = Math.min(16, Math.max(0, count));
  const extra = count - shown;
  const color = tone === 'wait' ? 'bg-brand-tan' : 'bg-emerald-500';
  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-8">
      {shown === 0 && <span className="text-xs text-brand-muted">Nadie</span>}
      {Array.from({ length: shown }, (_, i) => (
        <span key={i} className={`inline-block w-3.5 h-3.5 rounded-full ${color}`} />
      ))}
      {extra > 0 && <span className="text-xs text-brand-muted">+{extra}</span>}
    </div>
  );
}

export default function LineasDeEspera() {
  const { queue, setQueue } = useLab();
  const model = useMemo(() => mm1(queue.lambda, queue.mu), [queue.lambda, queue.mu]);
  const arrival = poissonPmf(queue.lambda, queue.x);
  const pn = model.pn(queue.n);
  const service = model.serviceCdf(queue.t);
  const perHour = queue.lambda * 60;
  const servicePerHour = queue.mu * 60;
  const waitingDots = model.stable ? Math.round(model.lq) : 0;
  const inServiceDots = model.stable && model.rho > 0.05 ? 1 : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-brand-pink pb-4">
        <h2 className="text-3xl font-bold text-brand-ink">Líneas de espera</h2>
        <p className="text-brand-muted text-sm mt-1">
          Ventanilla de Chips Bakery como cola M/M/1. El caso de clase es λ = 0.75 y μ = 1 cliente por minuto.
        </p>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink space-y-3">
        <h3 className="text-xl font-semibold text-brand-ink">Qué está modelando</h3>
        <p className="text-sm text-brand-ink leading-relaxed">
          Una cola aparece cuando llegan pedidos más rápido, o de forma más irregular, de lo que el mostrador puede atender.
          Aquí la población es la clientela del local (se trata como infinita). Las llegadas son Poisson con tasa λ.
          Si el empleado está ocupado, la fila no tiene tope y se atiende FIFO. Hay un solo servidor (c = 1) y el tiempo de servicio es exponencial con tasa μ.
          En notación de Kendall eso es <span className="font-semibold">M/M/1</span>.
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">
          Estos números no salen de la matriz de producción (100, 250 o 400 galletas). Describen la ventanilla: en el ejemplo de clase llegan 45 clientes por hora y el empleado puede procesar 60 pedidos por hora.
        </p>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink space-y-5">
        <div className="flex items-center gap-2">
          <Clock className="text-brand-tan" size={20} />
          <h3 className="text-xl font-semibold text-brand-ink">Tasas</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Slider
            label="λ llegadas por minuto"
            value={queue.lambda}
            min={0}
            max={2}
            step={0.01}
            display={`${fmt(queue.lambda, 2)} / min · ${fmt(perHour, 1)} / h`}
            onChange={(lambda) => setQueue({ lambda })}
          />
          <Slider
            label="μ servicios por minuto"
            value={queue.mu}
            min={0.05}
            max={2}
            step={0.01}
            display={`${fmt(queue.mu, 2)} / min · ${fmt(servicePerHour, 1)} / h`}
            onChange={(mu) => setQueue({ mu })}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-brand-muted mb-1">
            <span>Utilización ρ = λ / μ</span>
            <span className="font-semibold text-brand-ink" data-metric="rho">{model.stable || queue.mu > 0 ? fmt(model.rho, 3) : '—'}</span>
          </div>
          <div className="h-3 rounded-full bg-brand-rose border border-brand-pink overflow-hidden">
            <div
              className={`h-full ${model.stable ? 'bg-brand-tan' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, model.rho * 100))}%` }}
            />
          </div>
          <p className="text-xs text-brand-muted mt-2">
            Para que la fila no crezca sin límite hace falta ρ &lt; 1, es decir λ &lt; μ. Si λ se acerca a μ, la espera se dispara.
          </p>
        </div>

        {!model.stable && (
          <div className="p-4 rounded-lg border border-amber-500/50 bg-amber-900/20 text-sm text-brand-ink flex gap-2" data-metric="unstable">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <p>
              Con λ = {fmt(queue.lambda, 2)} y μ = {fmt(queue.mu, 2)} el sistema no está en estado estable.
              La tasa de servicio no supera a la de llegada, así que la cola tiende a infinito y no hay promedios P0, Lq, L, Wq ni W.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Metric testId="p0" label="P0 · sistema vacío" value={fmt(model.p0, 2)} hint="1 − λ/μ" />
        <Metric testId="lq" label="Lq · en la fila" value={fmt(model.lq, 2)} hint="λ² / (μ(μ − λ))" />
        <Metric testId="l" label="L · en el sistema" value={fmt(model.l, 2)} hint="Lq + λ/μ" />
        <Metric testId="wq" label="Wq · espera" value={model.wq == null ? '—' : `${fmt(model.wq, 2)} min`} hint="Lq / λ" />
        <Metric testId="w" label="W · tiempo total" value={model.w == null ? '—' : `${fmt(model.w, 2)} min`} hint="Wq + 1/μ" />
        <Metric testId="pw" label="Pw · probabilidad de esperar" value={fmt(model.pw, 2)} hint="λ / μ" />
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink space-y-4">
        <div className="flex items-center gap-2">
          <Users className="text-brand-tan" size={20} />
          <h3 className="text-xl font-semibold text-brand-ink">Fila en este momento esperado</h3>
        </div>
        <p className="text-sm text-brand-muted">
          Cada punto de la fila es un cliente esperando (redondeo de Lq). El punto verde es quien está en el mostrador cuando ρ &gt; 0.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-brand-pink bg-brand-rose/40">
            <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">En espera · Lq = {fmt(model.lq, 2)}</p>
            {model.stable ? <Dots count={waitingDots} tone="wait" /> : <p className="text-sm text-brand-ink">Sin largo estable.</p>}
          </div>
          <div className="p-4 rounded-lg border border-brand-pink bg-brand-rose/40">
            <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">En servicio · λ/μ = {fmt(model.rho, 2)}</p>
            {model.stable ? <Dots count={inServiceDots} tone="serve" /> : <p className="text-sm text-brand-ink">El servidor no da abasto.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink space-y-3">
          <h3 className="text-sm font-semibold text-brand-ink">Pn · n clientes en el sistema</h3>
          <Slider
            label="n"
            value={queue.n}
            min={0}
            max={12}
            step={1}
            display={String(queue.n)}
            onChange={(n) => setQueue({ n })}
          />
          <p className="text-2xl font-black text-brand-ink" data-metric="pn">{fmt(pn, 3)}</p>
          <p className="text-xs font-mono text-brand-muted leading-relaxed">
            Pn = (λ/μ)^n · P0
          </p>
        </div>

        <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink space-y-3">
          <h3 className="text-sm font-semibold text-brand-ink">Poisson · llegadas en un minuto</h3>
          <Slider
            label="x clientes"
            value={queue.x}
            min={0}
            max={12}
            step={1}
            display={String(queue.x)}
            onChange={(x) => setQueue({ x })}
          />
          <p className="text-2xl font-black text-brand-ink" data-metric="poisson">{fmt(arrival, 3)}</p>
          <p className="text-xs font-mono text-brand-muted leading-relaxed">
            P(X = x) = λ^x · e^(−λ) / x!
          </p>
          <p className="text-xs text-brand-muted">
            {queue.x === 0 ? 'Es la probabilidad de que en ese minuto no llegue nadie.' : `Probabilidad de exactamente ${queue.x} llegadas.`}
          </p>
        </div>

        <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink space-y-3">
          <h3 className="text-sm font-semibold text-brand-ink">Exponencial · tiempo de servicio</h3>
          <Slider
            label="t minutos"
            value={queue.t}
            min={0}
            max={3}
            step={0.1}
            display={fmt(queue.t, 1)}
            onChange={(t) => setQueue({ t })}
          />
          <div className="flex gap-2">
            {[0.5, 1].map((mark) => (
              <button
                key={mark}
                type="button"
                onClick={() => setQueue({ t: mark })}
                className={`text-xs px-2 py-1 rounded-md border ${queue.t === mark ? 'bg-brand-tan text-white border-brand-tan' : 'border-brand-pink text-brand-ink'}`}
              >
                t = {mark}
              </button>
            ))}
          </div>
          <p className="text-2xl font-black text-brand-ink" data-metric="service">{fmt(service, 3)}</p>
          <p className="text-xs font-mono text-brand-muted leading-relaxed">
            P(T ≤ t) = 1 − e^(−μ t)
          </p>
        </div>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink space-y-3">
        <h3 className="text-xl font-semibold text-brand-ink">Para qué sirve el estudio</h3>
        <p className="text-sm text-brand-ink leading-relaxed">
          El objetivo es equilibrar el costo de servir más rápido (más personal, más velocidad) con el costo de hacer esperar
          (clientes que se van, pedidos retrasados). Con pocos servidores la inversión baja y la espera sube. Con muchos, pasa al revés.
          El mínimo del costo total suele quedar en un punto intermedio.
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">
          Esta pestaña deja c = 1 porque las fórmulas de la clase son de un solo servidor. Subir μ en el deslizador es la forma de ver qué pasa si ese empleado atiende más rápido. Las medidas de arriba son de estado estable: el arranque del día, el periodo transitorio, no entra en estos promedios.
        </p>
      </div>
    </div>
  );
}
