import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLab } from '../state/LabContext';
import { formatK, formatMoney, formatPct } from '../model/format.js';

export default function ContextoEmpresarial() {
  const { params, result, updateHistoryRow } = useLab();
  const { historyRows: rows, frequencies: freq, matrix, decisions } = result;
  const qtyOptions = [...new Set([100, 250, 400, params.d1, params.d2, params.d3, params.s1, params.s2])].sort((a, b) => a - b);

  const chartData = rows.map((row) => ({
    mes: `M${row.month}`,
    ganancia: row.profit,
    sobrantes: row.leftover,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-brand-pink pb-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-ink">Contexto Empresarial</h2>
          <p className="text-brand-muted text-sm mt-1">Fuente: Mes.docx y hoja de datos del Excel</p>
        </div>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
        <h3 className="text-lg font-semibold text-brand-tan mb-3">El problema de decisión</h3>
        <p className="text-brand-ink text-sm leading-relaxed">
          Chips Bakery debe fijar la producción del próximo periodo (100, 250 o 400 galletas) sin conocer la demanda.
          Si produce de más, las unidades sobrantes se descartan por la política <span className="text-brand-ink font-medium">Horneado Hoy, Fresco Hoy</span> (merma total al costo).
          Si produce de menos, deja de vender pero no pierde efectivo extra. El laboratorio de la derecha cambia precio, costo y cantidades; la matriz de pagos se reescribe sola.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
          <h3 className="text-xl font-semibold text-brand-tan mb-3">Misión</h3>
          <p className="text-brand-ink leading-relaxed text-sm">
            Ofrecer galletas artesanales de alta calidad con ingredientes seleccionados, optimizando nuestros procesos de producción para garantizar frescura, minimizar el desperdicio alimentario y brindar momentos únicos de deleite a nuestros consumidores.
          </p>
        </div>
        <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
          <h3 className="text-xl font-semibold text-brand-tan mb-3">Visión</h3>
          <p className="text-brand-ink leading-relaxed text-sm">
            Para el año 2030, consolidarnos como la galletería líder en la región mediante el uso de modelos analíticos e ingeniería de decisiones, manteniendo una operación sostenible, cero desperdicios e innovación constante en recetas y logística.
          </p>
        </div>
        <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink lg:col-span-2">
          <h3 className="text-xl font-semibold text-brand-tan mb-3">Objeto Social</h3>
          <p className="text-brand-ink leading-relaxed text-sm">
            La elaboración, transformación, empaque, distribución y comercialización al por mayor y al detal de productos de panadería y galletería artesanal e industrial, así como la gestión integral de su cadena de suministro, optimización de insumos alimentarios y desarrollo de nuevos formatos de snacks horneados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-cream p-4 rounded-xl border border-brand-pink">
          <p className="text-xs text-brand-muted">Precio de venta</p>
          <p className="text-2xl font-bold text-brand-ink">${params.price}</p>
        </div>
        <div className="bg-brand-cream p-4 rounded-xl border border-brand-pink">
          <p className="text-xs text-brand-muted">Costo unitario</p>
          <p className="text-2xl font-bold text-brand-ink">${params.cost}</p>
        </div>
        <div className="bg-brand-cream p-4 rounded-xl border border-brand-pink">
          <p className="text-xs text-brand-muted">Margen</p>
          <p className="text-2xl font-bold text-emerald-400">${result.margin}</p>
        </div>
        <div className="bg-brand-cream p-4 rounded-xl border border-brand-pink">
          <p className="text-xs text-brand-muted">Unidades de trabajo</p>
          <p className="text-sm font-semibold text-brand-ink mt-1">Miles ($k) en el modelo</p>
        </div>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
        <h3 className="text-lg font-semibold text-brand-ink mb-2">Matriz de pagos (precio × vendidas − costo × producidas)</h3>
        <p className="text-xs text-brand-muted mb-4">Se actualiza con el laboratorio. Los valores coinciden con el Excel en el caso base (200, −250, 500, −700, 800).</p>
        <div className="overflow-x-auto rounded-lg border border-brand-pink">
          <table className="w-full text-center text-sm">
            <thead className="bg-brand-rose text-brand-ink">
              <tr>
                <th className="p-3 text-left">Alternativa</th>
                <th className="p-3">S1 baja ({params.s1})</th>
                <th className="p-3">S2 alta ({params.s2})</th>
                <th className="p-3">VE @ {formatPct(params.pS1, 0)}</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d, i) => (
                <tr key={d.id} className={`border-t border-brand-pink ${i === result.bestIdx ? 'bg-emerald-900/20' : ''}`}>
                  <td className="p-3 text-left font-semibold text-brand-ink">{d.label}</td>
                  <td className="p-3 text-brand-ink">{formatK(matrix[i][0])}</td>
                  <td className="p-3 text-brand-ink">{formatK(matrix[i][1])}</td>
                  <td className={`p-3 font-bold ${i === result.bestIdx ? 'text-emerald-400' : 'text-brand-ink'}`}>{formatK(d.ev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
        <h3 className="text-xl font-semibold text-brand-ink mb-4">Cálculo de Probabilidades (Histórico de 10 Meses)</h3>
        <div className="flex flex-wrap items-center gap-8 mb-4 p-4 bg-brand-rose rounded-lg border border-brand-pink">
          <div>
            <p className="text-brand-muted text-sm font-semibold">Demanda Baja (S1 ≤ {params.s1})</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">
              {formatPct(freq.pS1, 0)} <span className="text-sm font-normal text-brand-muted">({freq.nBaja}/{freq.n} meses)</span>
            </p>
          </div>
          <div className="w-px h-12 bg-brand-pink hidden md:block" />
          <div>
            <p className="text-brand-muted text-sm font-semibold">Demanda Alta (S2 &gt; {params.s1})</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {formatPct(1 - freq.pS1, 0)} <span className="text-sm font-normal text-brand-muted">({freq.nAlta}/{freq.n} meses)</span>
            </p>
          </div>
        </div>
        <p className="text-xs text-brand-muted mb-4">
          Trazabilidad Mes.docx: P(S1) = frecuencia relativa. En el caso base, meses 1, 4 y 6 son baja (3/10 = 30%). Si editas producción o demanda de un mes, el laboratorio actualiza P(S1).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-rose text-brand-ink text-sm uppercase tracking-wider border-b border-brand-pink">
                <th className="p-3 font-medium">Mes</th>
                <th className="p-3 font-medium">Nivel Prod (di)</th>
                <th className="p-3 font-medium">Demanda Real</th>
                <th className="p-3 font-medium">Vendidas</th>
                <th className="p-3 font-medium">Sobrantes</th>
                <th className="p-3 font-medium">Ingreso ($)</th>
                <th className="p-3 font-medium">Costo ($)</th>
                <th className="p-3 font-medium">Ganancia ($)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((row) => (
                <tr
                  key={row.month}
                  className={`border-b border-brand-pink/60 ${row.low ? 'bg-rose-950/30' : ''} ${row.profit < 0 ? 'bg-rose-950/40' : ''}`}
                >
                  <td className="p-3 font-semibold text-brand-ink">{row.month}</td>
                  <td className="p-3">
                    <select
                      value={row.di}
                      onChange={(e) => updateHistoryRow(row.month, { di: Number(e.target.value) })}
                      className="bg-brand-rose border border-brand-pink rounded px-2 py-1 text-brand-ink"
                    >
                      {qtyOptions.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={row.demand}
                      onChange={(e) => updateHistoryRow(row.month, { demand: Number(e.target.value) })}
                      className="bg-brand-rose border border-brand-pink rounded px-2 py-1 text-brand-ink"
                    >
                      {qtyOptions.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-brand-muted">{row.sold}</td>
                  <td className="p-3 text-brand-muted">{row.leftover}</td>
                  <td className="p-3 text-emerald-400">{formatMoney(row.rev)}</td>
                  <td className="p-3 text-rose-400">{formatMoney(row.cost)}</td>
                  <td className={`p-3 font-bold ${row.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatMoney(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink h-80">
        <h3 className="text-brand-ink font-semibold mb-2 text-sm">Ganancia y sobrantes por mes</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="mes" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#e2e8f0' }} />
            <Legend />
            <Bar dataKey="ganancia" name="Ganancia ($)" fill="#34d399" />
            <Bar dataKey="sobrantes" name="Sobrantes (u)" fill="#C48A4A" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
