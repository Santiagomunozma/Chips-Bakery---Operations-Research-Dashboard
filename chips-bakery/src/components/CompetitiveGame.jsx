import React from 'react';
import { COMPETITIVE_DOMINANCE, COMPETITIVE_MIXED, COMPETITIVE_PAYOFF_MATRIX, COMPETITIVE_STRATEGIES, CUSTOMER_TRIALS, summarizeCustomerTrials } from '../model/competitiveGame.js';
import { formatPct } from '../model/format.js';
import { DominanceSteps } from './GameWalkthrough.jsx';

function Metric({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-brand-pink bg-brand-rose/60 p-4">
      <p className="text-xs font-semibold text-brand-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-ink">{value}</p>
      {detail && <p className="mt-1 text-xs text-brand-muted">{detail}</p>}
    </div>
  );
}

function PayoffMatrix() {
  return (
    <div className="overflow-x-auto rounded-lg border border-brand-pink">
      <table className="w-full border-collapse text-center text-sm">
        <thead className="bg-brand-rose text-brand-ink">
          <tr>
            <th className="border-b border-r border-brand-pink p-3 text-left">Chips Bakery \ Competencia</th>
            {COMPETITIVE_STRATEGIES.map((strategy) => (
              <th key={strategy} className="border-b border-brand-pink p-3">{strategy}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPETITIVE_PAYOFF_MATRIX.map((row, i) => (
            <tr key={COMPETITIVE_STRATEGIES[i]} className="border-b border-brand-pink last:border-b-0">
              <th className="border-r border-brand-pink p-3 text-left text-brand-ink">{COMPETITIVE_STRATEGIES[i]}</th>
              {row.map((payoff, j) => (
                <td key={`${i}-${j}`} className="p-3 font-semibold text-brand-ink">{payoff}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MixedStrategyResults() {
  const chipsCombo = COMPETITIVE_MIXED.p;
  const competitorDiscount = COMPETITIVE_MIXED.q;

  return (
    <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
      <div>
        <h3 className="text-xl font-semibold text-brand-ink">Mezcla óptima del subjuego</h3>
        <p className="mt-1 text-sm text-brand-muted">
          Probabilidades de elección de estrategia en cada campaña; no representan proporciones de clientes.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Metric
          label="Chips Bakery"
          value={`Combo ${formatPct(chipsCombo, 2)} · Obsequio ${formatPct(1 - chipsCombo, 2)}`}
          detail="P(Combo) = 0,60; P(Obsequio) = 0,40"
        />
        <Metric
          label="Competencia"
          value={`Descuento ${formatPct(competitorDiscount, 2)} · Combo ${formatPct(1 - competitorDiscount, 2)}`}
          detail="P(Descuento) = 0,6667; P(Combo) = 0,3333"
        />
      </div>
      <div className="space-y-3 rounded-lg border border-brand-pink bg-brand-rose/50 p-4 text-sm text-brand-ink">
        <p className="font-semibold">Indiferencia de Chips: se calcula la mezcla de la Competencia.</p>
        <p className="font-mono">0,20r − 0,10(1−r) = −0,05r + 0,40(1−r)</p>
        <p className="font-mono">0,30r − 0,10 = 0,40 − 0,45r → r = 0,50 / 0,75 = 0,6667</p>
        <p className="font-mono">La Competencia mezcla Descuento (66,67%) y Combo (33,33%).</p>
        <p className="mt-3 font-semibold">Indiferencia de la Competencia: se calcula la mezcla de Chips.</p>
        <p className="font-mono">0,20s − 0,05(1−s) = −0,10s + 0,40(1−s)</p>
        <p className="font-mono">0,25s − 0,05 = 0,40 − 0,50s → s = 0,45 / 0,75 = 0,60</p>
        <p className="font-mono">Chips mezcla Combo (60%) y Obsequio (40%).</p>
      </div>
      <p className="text-xs text-brand-muted">
        Probabilidades calculadas a partir de los pagos del subjuego residual; Descuento de Chips y Obsequio de la Competencia se eliminan por dominancia.
      </p>
    </section>
  );
}

function CustomerHistory() {
  const summary = summarizeCustomerTrials();

  return (
    <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
      <div>
        <h3 className="text-xl font-semibold text-brand-ink">Historial de pruebas de clientes</h3>
        <p className="mt-1 text-sm text-brand-muted">
          {summary.count} registros transcritos de las tablas del informe. El promedio estratégico y su cambio son columnas distintas de los clientes observados por prueba.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Clientes observados · Chips" value={summary.averages.chipsCustomers.toFixed(1)} />
        <Metric label="Clientes observados · Competencia" value={summary.averages.competitorCustomers.toFixed(1)} />
        <Metric label="Promedio Chips" value={summary.averages.chipsAverage.toFixed(1)} />
        <Metric label="Promedio Competidora" value={summary.averages.competitorAverage.toFixed(1)} />
        <Metric label="Cambio promedio Chips" value={summary.averages.chipsAverageChange.toFixed(1)} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-brand-pink">
        <table className="w-full border-collapse text-center text-xs">
          <caption className="bg-brand-rose p-3 text-left font-semibold text-brand-ink">
            Promedios observados por combinación de estrategias
          </caption>
          <thead className="bg-brand-rose/60 text-brand-ink">
            <tr>
              <th className="p-2 text-left">Chips</th>
              <th className="p-2 text-left">Competencia</th>
              <th className="p-2">Pruebas</th>
              <th className="p-2">Clientes Chips (prom.)</th>
              <th className="p-2">Clientes competencia (prom.)</th>
            </tr>
          </thead>
          <tbody>
            {summary.byStrategy.map((row) => (
              <tr key={`${row.chipsStrategy}-${row.competitorStrategy}`} className="border-t border-brand-pink text-brand-ink">
                <td className="p-2 text-left">{row.chipsStrategy}</td>
                <td className="p-2 text-left">{row.competitorStrategy}</td>
                <td className="p-2">{row.count}</td>
                <td className="p-2">{row.chipsCustomers == null ? '—' : row.chipsCustomers.toFixed(1)}</td>
                <td className="p-2">{row.competitorCustomers == null ? '—' : row.competitorCustomers.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-h-[32rem] overflow-auto rounded-lg border border-brand-pink">
        <table className="w-full border-collapse text-center text-xs">
          <thead className="sticky top-0 z-10 bg-brand-rose text-brand-ink">
            <tr>
              <th className="p-2">Prueba</th>
              <th className="p-2">Estrategia Chips</th>
              <th className="p-2">Estrategia competidora</th>
              <th className="p-2">Base Chips</th>
              <th className="p-2">Base competidora</th>
              <th className="p-2">Clientes Chips</th>
              <th className="p-2">Clientes competidora</th>
              <th className="p-2">Promedio Chips</th>
              <th className="p-2">Promedio competidora</th>
              <th className="p-2">Cambio promedio Chips</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMER_TRIALS.map((trial) => (
              <tr key={trial.trial} className="border-t border-brand-pink text-brand-ink">
                <td className="p-2">{trial.trial}</td>
                <td className="p-2">{trial.chipsStrategy}</td>
                <td className="p-2">{trial.competitorStrategy}</td>
                <td className="p-2">{trial.chipsBase}</td>
                <td className="p-2">{trial.competitorBase}</td>
                <td className="p-2">{trial.chipsCustomers}</td>
                <td className="p-2">{trial.competitorCustomers}</td>
                <td className="p-2">{trial.chipsAverage}</td>
                <td className="p-2">{trial.competitorAverage}</td>
                <td className="p-2">{trial.chipsAverageChange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function CompetitiveGame() {
  const mixed = COMPETITIVE_MIXED;

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Matriz de pagos: Chips Bakery vs. Competencia</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Cambio de clientes para Chips Bakery. Los pagos son relativos: un valor negativo indica pérdida de clientes.
          </p>
        </div>
        <PayoffMatrix />
        <p className="text-sm text-brand-ink">
          La estrategia Descuento de Chips queda dominada por Combo. Tras eliminarla, Obsequio de la Competencia queda dominada por Combo.
          El subjuego resultante es {COMPETITIVE_DOMINANCE.remaining.rowLabels.join(' / ')} contra {COMPETITIVE_DOMINANCE.remaining.colLabels.join(' / ')}.
        </p>
        <p className="text-xs text-brand-muted">
          Valor de equilibrio esperado: {mixed.validMix ? mixed.value.toFixed(4) : 'sin mezcla interior'} cambios de clientes para Chips.
        </p>
      </section>

      <DominanceSteps dominance={COMPETITIVE_DOMINANCE} />
      <MixedStrategyResults />
      <CustomerHistory />
    </div>
  );
}
