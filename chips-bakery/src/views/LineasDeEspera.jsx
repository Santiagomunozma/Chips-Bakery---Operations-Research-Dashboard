import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, FileDown, Users } from 'lucide-react';
import { useLab } from '../state/LabContext';
import { mmc, poissonPmf } from '../model/engine.js';
import { QUEUE_SAMPLE } from '../model/params.js';
import { openQueueReport } from '../model/queueReport.js';

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

function Channels({ count, inService }) {
  const full = Math.floor(inService);
  const fraction = inService - full;
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }, (_, i) => {
        let fill = 0;
        if (i < full) fill = 1;
        else if (i === full) fill = fraction;
        return (
          <div key={i} className="w-24 rounded-lg border border-brand-pink bg-brand-rose/40 p-2">
            <p className="text-[11px] text-brand-muted mb-1">Canal {i + 1}</p>
            <div className="h-2 rounded-full bg-brand-pink overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, fill * 100)}%` }} />
            </div>
            <p className="text-[11px] text-brand-ink mt-1">{fill >= 0.995 ? 'Ocupado' : fill > 0.05 ? 'En parte' : 'Libre'}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function LineasDeEspera() {
  const { queue, setQueue } = useLab();
  const [exportNote, setExportNote] = useState('');
  const servers = queue.c ?? 2;
  const model = useMemo(() => mmc(queue.lambda, queue.mu, servers), [queue.lambda, queue.mu, servers]);
  const single = useMemo(() => mmc(queue.lambda, queue.mu, 1), [queue.lambda, queue.mu]);
  const arrival = poissonPmf(queue.lambda, queue.x);
  const pn = model.pn(queue.n);
  const pAtLeast = model.pAtLeast(queue.n);
  const service = model.serviceCdf(queue.t);
  const perHour = queue.lambda * 60;
  const servicePerHour = queue.mu * 60;
  const waitingDots = model.stable ? Math.round(model.lq) : 0;
  const sampleLambda = QUEUE_SAMPLE.arrivals / QUEUE_SAMPLE.minutes;

  const comparison = (() => {
    if (servers <= 1) {
      return 'Con un canal, Pw coincide con ρ. El segundo canal es el que baja la espera en el caso de clase.';
    }
    if (!model.stable) return '';
    if (!single.stable) {
      return `Con un canal esta afluencia no tiene espera finita. Con ${servers} canales, Wq es ${fmt(model.wq, 2)} min.`;
    }
    return `Con los mismos λ y μ, un canal espera ${fmt(single.wq, 2)} min y ${servers} canales esperan ${fmt(model.wq, 2)} min.`;
  })();

  const exportPdf = async () => {
    const opened = await openQueueReport({ ...queue, c: servers });
    setExportNote(opened ? '' : 'El navegador bloqueó la ventana del informe. Permite ventanas emergentes y vuelve a intentar.');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-brand-pink pb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-ink">Líneas de espera</h2>
          <p className="text-brand-muted text-sm mt-1">
            Ventanilla de Chips Bakery como cola M/M/c. El caso de clase es c = 2, λ = 0.75 y μ = 1 cliente por minuto y canal.
          </p>
        </div>
        <button
          type="button"
          onClick={exportPdf}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-brand-tan text-brand-ink hover:bg-brand-tan hover:text-white"
        >
          <FileDown size={16} />
          Exportar PDF
        </button>
      </div>
      {exportNote && <p className="text-sm text-amber-700">{exportNote}</p>}

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink space-y-3">
        <h3 className="text-xl font-semibold text-brand-ink">Qué está modelando</h3>
        <p className="text-sm text-brand-ink leading-relaxed">
          Hay una sola fila. Quien llega pasa al primer canal libre. Los canales son idénticos: la misma tasa μ en cada uno.
          Las llegadas son Poisson con tasa λ y el servicio es exponencial. La población se trata como infinita, la fila no tiene tope y la disciplina es FIFO.
          En notación de Kendall eso es <span className="font-semibold">M/M/c</span>, con c canales. Si c = 1, el modelo es el de un solo empleado.
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">
          λ = {fmt(sampleLambda, 2)} sale de 180 llegadas en 240 minutos de dos sábados de octubre, y μ = 1 de un servicio medio de un minuto.
          Con un solo mostrador esa afluencia dejaba unos 3 minutos de espera, así que se abrió un segundo canal. La tabla y el desarrollo están en Exportar PDF.
        </p>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink space-y-5">
        <div className="flex items-center gap-2">
          <Clock className="text-brand-tan" size={20} />
          <h3 className="text-xl font-semibold text-brand-ink">Tasas y canales</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Slider
            label="λ llegadas por minuto"
            value={queue.lambda}
            min={0}
            max={4}
            step={0.01}
            display={`${fmt(queue.lambda, 2)} / min · ${fmt(perHour, 1)} / h`}
            onChange={(lambda) => setQueue({ lambda })}
          />
          <Slider
            label="μ servicios por minuto y canal"
            value={queue.mu}
            min={0.05}
            max={2}
            step={0.01}
            display={`${fmt(queue.mu, 2)} / min · ${fmt(servicePerHour, 1)} / h`}
            onChange={(mu) => setQueue({ mu })}
          />
          <Slider
            label="c canales"
            value={servers}
            min={1}
            max={5}
            step={1}
            display={String(servers)}
            onChange={(c) => setQueue({ c })}
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-brand-muted mb-1">
            <span>Utilización ρ = λ / (cμ)</span>
            <span className="font-semibold text-brand-ink" data-metric="rho">{model.stable || queue.mu > 0 ? fmt(model.rho, 3) : '—'}</span>
          </div>
          <div className="h-3 rounded-full bg-brand-rose border border-brand-pink overflow-hidden">
            <div
              className={`h-full ${model.stable ? 'bg-brand-tan' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, model.rho * 100))}%` }}
            />
          </div>
          <p className="text-xs text-brand-muted mt-2">
            Para que la fila no crezca sin límite hace falta ρ &lt; 1, es decir λ &lt; cμ. Si ρ se acerca a 1, la espera se dispara.
          </p>
        </div>

        {!model.stable && (
          <div className="p-4 rounded-lg border border-amber-500/50 bg-amber-900/20 text-sm text-brand-ink flex gap-2" data-metric="unstable">
            <AlertTriangle className="text-amber-600 shrink-0" size={18} />
            <p>
              Con λ = {fmt(queue.lambda, 2)}, μ = {fmt(queue.mu, 2)} y c = {servers} el sistema no está en estado estable.
              La capacidad conjunta no supera a la llegada, así que la cola tiende a infinito y no hay promedios P0, Lq, L, Wq ni W.
            </p>
          </div>
        )}
        {comparison && <p className="text-sm text-brand-ink">{comparison}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Metric testId="p0" label="P0 · sistema vacío" value={fmt(model.p0, 4)} hint="probabilidad de cero clientes" />
        <Metric testId="lq" label="Lq · en la fila" value={fmt(model.lq, 4)} hint="no incluye a quien está en un canal" />
        <Metric testId="l" label="L · en el sistema" value={fmt(model.l, 4)} hint="Lq + λ/μ" />
        <Metric testId="wq" label="Wq · espera" value={model.wq == null ? '—' : `${fmt(model.wq, 4)} min`} hint="Lq / λ" />
        <Metric testId="w" label="W · tiempo total" value={model.w == null ? '—' : `${fmt(model.w, 4)} min`} hint="Wq + 1/μ" />
        <Metric testId="pw" label="Pw · probabilidad de esperar" value={fmt(model.pw, 4)} hint="todos los canales ocupados" />
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink space-y-4">
        <div className="flex items-center gap-2">
          <Users className="text-brand-tan" size={20} />
          <h3 className="text-xl font-semibold text-brand-ink">Una fila, varios canales</h3>
        </div>
        <p className="text-sm text-brand-muted">
          Los puntos de la fila redondean Lq. Cada barra es un canal: el verde es la parte ocupada del promedio λ/μ, repartido entre los c mostradores.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-brand-pink bg-brand-rose/40">
            <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">En espera · Lq = {fmt(model.lq, 2)}</p>
            {model.stable ? <Dots count={waitingDots} tone="wait" /> : <p className="text-sm text-brand-ink">Sin largo estable.</p>}
          </div>
          <div className="p-4 rounded-lg border border-brand-pink bg-brand-rose/40">
            <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">En servicio · λ/μ = {fmt(model.r, 2)}</p>
            {model.stable ? <Channels count={servers} inService={model.r} /> : <p className="text-sm text-brand-ink">Los canales no dan abasto.</p>}
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
          <p className="text-2xl font-black text-brand-ink" data-metric="pn">{fmt(pn, 4)}</p>
          <p className="text-xs text-brand-muted" data-metric="pn-tail">P(N ≥ {queue.n}) = {fmt(pAtLeast, 4)}</p>
          <p className="text-xs font-mono text-brand-muted leading-relaxed">
            {queue.n <= servers
              ? 'n ≤ c: Pn = P0 · (λ/μ)^n / n!'
              : 'n > c: Pn = P0 · (λ/μ)^n / (c! · c^(n−c))'}
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
          El objetivo es equilibrar el costo de abrir otro canal con el costo de hacer esperar.
          Con pocos canales se gasta poco en personal y mucho en fila. Con muchos, pasa al revés.
          El mínimo del costo total suele quedar en un punto intermedio.
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">
          Subir c reparte la misma llegada entre más mostradores. Subir μ acelera cada canal. Las medidas de arriba son de estado estable: el arranque del día no entra en estos promedios.
        </p>
      </div>
    </div>
  );
}
