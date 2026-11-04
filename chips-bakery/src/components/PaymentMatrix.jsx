import React from 'react';
import { formatK, formatPct } from '../model/format.js';

export default function PaymentMatrix({ decisions, matrix, params, bestIdx, showExpectedValue = false }) {
  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-brand-ink mb-2">
        Matriz de pagos (precio × vendidas − costo × producidas)
      </h4>
      <p className="text-xs text-brand-muted mb-4">
        Se actualiza con el laboratorio y muestra los pagos por alternativa y estado de demanda.
      </p>
      <div className="overflow-x-auto rounded-lg border border-brand-pink">
        <table className="w-full text-center text-sm">
          <thead className="bg-brand-rose text-brand-ink">
            <tr>
              <th className="p-3 text-left">Alternativa</th>
              <th className="p-3">S1 baja ({params.s1})</th>
              <th className="p-3">S2 alta ({params.s2})</th>
              {showExpectedValue && <th className="p-3">VE @ {formatPct(params.pS1, 0)}</th>}
            </tr>
          </thead>
          <tbody>
            {decisions.map((decision, index) => (
              <tr
                key={decision.id}
                className={`border-t border-brand-pink ${index === bestIdx ? 'bg-emerald-900/20' : ''}`}
              >
                <td className="p-3 text-left font-semibold text-brand-ink">{decision.label}</td>
                <td className="p-3 text-brand-ink">{formatK(matrix[index][0])}</td>
                <td className="p-3 text-brand-ink">{formatK(matrix[index][1])}</td>
                {showExpectedValue && (
                  <td className="p-3 font-bold text-brand-ink">{formatK(decision.ev)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
