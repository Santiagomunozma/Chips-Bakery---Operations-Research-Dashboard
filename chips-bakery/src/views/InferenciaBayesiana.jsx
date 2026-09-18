import React from 'react';
import { Target, Scale, Shield, AlertTriangle } from 'lucide-react';
import { useLab } from '../state/LabContext';
import DecisionTree from '../components/DecisionTree';
import { formatK, formatPct } from '../model/format.js';
import { DECISION_META } from '../model/params.js';

export default function InferenciaBayesiana() {
  const { params, result } = useLab();
  const { criteria, bayes, decisions } = result;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-brand-pink pb-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-ink">Inferencia Bayesiana</h2>
          <p className="text-brand-muted text-sm mt-1">Mismos números que el Excel y que el árbol de SilverDecisions; aquí se pueden mover con el laboratorio</p>
        </div>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
        <h3 className="text-xl font-semibold text-brand-tan mb-4 flex items-center gap-2">
          <Target className="text-brand-tan" /> Alternativas de Producción
        </h3>
        <ul className="list-disc pl-6 space-y-2 text-brand-muted text-sm">
          {decisions.map((d) => (
            <li key={d.id}>
              <strong className="text-brand-ink">{d.label} galletas.</strong>{' '}
              Payoff baja {formatK(d.payoffs[0])} · alta {formatK(d.payoffs[1])} · VE {formatK(d.ev)}.
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-brand-ink mb-3">Criterios sin probabilidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink">
            <p className="text-xs text-brand-muted flex items-center gap-2"><Scale size={14} /> Optimista (maximax)</p>
            <p className="text-2xl font-bold text-brand-ink mt-1">{criteria.optimistic.id}</p>
            <p className="text-sm text-brand-muted mt-1">Mejor de lo mejor: {formatK(criteria.optimistic.value)}</p>
          </div>
          <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink">
            <p className="text-xs text-brand-muted flex items-center gap-2"><Shield size={14} /> Conservador (maximin)</p>
            <p className="text-2xl font-bold text-brand-ink mt-1">{criteria.conservative.id}</p>
            <p className="text-sm text-brand-muted mt-1">Mejor de lo peor: {formatK(criteria.conservative.value)}</p>
          </div>
          <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink">
            <p className="text-xs text-brand-muted flex items-center gap-2"><AlertTriangle size={14} /> Arrepentimiento</p>
            <p className="text-2xl font-bold text-brand-ink mt-1">{criteria.regret.id}</p>
            <p className="text-sm text-brand-muted mt-1">Minimax regret: {formatK(criteria.regret.value)}</p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-brand-pink">
          <table className="w-full text-sm text-center">
            <thead className="bg-brand-rose text-brand-ink">
              <tr>
                <th className="p-3 text-left">Regret</th>
                <th className="p-3">S1</th>
                <th className="p-3">S2</th>
                <th className="p-3">Máximo fila</th>
              </tr>
            </thead>
            <tbody>
              {criteria.regret.table.map((row, i) => (
                <tr key={DECISION_META[i].id} className={`border-t border-brand-pink ${i === criteria.regret.index ? 'bg-amber-900/20' : ''}`}>
                  <td className="p-3 text-left text-brand-ink">{DECISION_META[i].id}</td>
                  <td className="p-3 text-brand-ink">{formatK(row[0])}</td>
                  <td className="p-3 text-brand-ink">{formatK(row[1])}</td>
                  <td className="p-3 font-semibold text-brand-ink">{formatK(criteria.regret.rowMax[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink">
          <p className="text-brand-muted text-sm font-semibold">VE sin estudio</p>
          <p className="text-3xl font-bold text-brand-ink mt-1">{formatK(bayes.ve)}</p>
          <p className="text-xs text-brand-muted mt-2">Mejor a priori: {bayes.noStudyId}</p>
        </div>
        <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink">
          <p className="text-brand-muted text-sm font-semibold">VEIP (info perfecta)</p>
          <p className="text-3xl font-bold text-brand-ink mt-1">{formatK(bayes.veip)}</p>
          <p className="text-xs text-brand-muted mt-2">Vale {formatK(bayes.veipDelta)} más que el VE</p>
        </div>
        <div className="bg-brand-cream p-5 rounded-xl border border-brand-pink">
          <p className="text-brand-muted text-sm font-semibold">VEOD (estudio / muestral)</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{formatK(bayes.veod)}</p>
          <p className="text-xs text-brand-muted mt-2">No es información perfecta</p>
        </div>
        <div className="bg-brand-cream p-5 rounded-xl border-l-4 border-l-brand-tan">
          <p className="text-brand-tan text-sm font-semibold">IVEM</p>
          <p className="text-3xl font-black text-brand-tan mt-1">{formatK(bayes.ivem)}</p>
          <p className="text-xs text-brand-muted mt-2">Máximo a pagar por el estudio. Eficiencia {formatPct(bayes.efficiency, 1)}</p>
        </div>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
        <h3 className="text-lg font-semibold text-brand-ink mb-2">Teorema de Bayes</h3>
        <p className="text-xs text-brand-muted mb-4">
          Caso base Excel: P(F|S1)=20%, P(F|S2)=80%. Priors P(S1)={formatPct(params.pS1, 0)}, P(S2)={formatPct(1 - params.pS1, 0)}.
        </p>
        <div className="overflow-x-auto rounded-lg border border-brand-pink">
          <table className="w-full text-sm">
            <thead className="bg-brand-rose text-brand-ink">
              <tr>
                <th className="p-3 text-left">Cantidad</th>
                <th className="p-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="text-brand-ink">
              {[
                ['P(F | S1)', formatPct(bayes.pF_S1)],
                ['P(U | S1)', formatPct(bayes.pU_S1)],
                ['P(F | S2)', formatPct(bayes.pF_S2)],
                ['P(U | S2)', formatPct(bayes.pU_S2)],
                ['P(Favorable)', formatPct(bayes.pF)],
                ['P(Desfavorable)', formatPct(bayes.pU)],
                ['P(S1 | F)', formatPct(bayes.pS1_F, 2)],
                ['P(S2 | F)', formatPct(bayes.pS2_F, 2)],
                ['P(S1 | U)', formatPct(bayes.pS1_U, 2)],
                ['P(S2 | U)', formatPct(bayes.pS2_U, 2)],
              ].map(([k, v]) => (
                <tr key={k} className="border-t border-brand-pink">
                  <td className="p-3">{k}</td>
                  <td className="p-3 text-right font-semibold text-brand-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-brand-rose rounded-lg border border-brand-pink text-sm text-brand-ink">
            Favorable → {bayes.fId} ({formatK(bayes.evF[bayes.fIdx])})
            <div className="text-xs text-brand-muted mt-1">
              {DECISION_META.map((m, i) => `${m.id} ${formatK(bayes.evF[i])}`).join(' · ')}
            </div>
          </div>
          <div className="p-4 bg-brand-rose rounded-lg border border-brand-pink text-sm text-brand-ink">
            Desfavorable → {bayes.uId} ({formatK(bayes.evU[bayes.uIdx])})
            <div className="text-xs text-brand-muted mt-1">
              {DECISION_META.map((m, i) => `${m.id} ${formatK(bayes.evU[i])}`).join(' · ')}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
        <h3 className="text-xl font-semibold text-brand-ink mb-1">Árbol de Decisión</h3>
        <p className="text-xs text-brand-muted mb-4">
          En el trabajo se armó en SilverDecisions. Aquí es el mismo árbol, recalculado: favorable → {bayes.fId}, desfavorable → {bayes.uId}, sin estudio → {bayes.noStudyId}.
        </p>
        <DecisionTree bayes={bayes} />
      </div>
    </div>
  );
}
