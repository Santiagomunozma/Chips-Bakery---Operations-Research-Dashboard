import React, { useState } from 'react';
import { Gamepad2, TrendingUp, AlertTriangle, Copy, Check, RefreshCw } from 'lucide-react';
import { useLab } from '../state/LabContext';
import { formatK, formatPct } from '../model/format.js';
import { DECISION_META } from '../model/params.js';

function CellInput({ value, onChange, highlight, label }) {
  return (
    <td className={`p-2 relative ${highlight ? 'bg-emerald-900/40 border-2 border-emerald-500' : ''}`}>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-24 bg-transparent text-center text-brand-ink font-medium focus:outline-none"
      />
      {highlight && (
        <span className="absolute top-0.5 right-1 text-[9px] text-emerald-300 uppercase tracking-widest font-black">{label}</span>
      )}
    </td>
  );
}

function NfgBlock({ title, text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="bg-brand-rose rounded-lg border border-brand-pink p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-brand-ink">{title}</h4>
        <button onClick={copy} className="text-xs flex items-center gap-1 text-brand-muted hover:text-brand-tan">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar .nfg'}
        </button>
      </div>
      <pre className="text-[11px] text-brand-muted whitespace-pre-wrap font-mono leading-relaxed">{text}</pre>
    </div>
  );
}

export default function TeoriaJuegos() {
  const [activeSubTab, setActiveSubTab] = useState('pura');
  const { result, setGameCell, syncGameFromLab, gameOverride, mixedMatrix, setMixedCell } = useLab();
  const { gameMatrix, saddle, mixed, nfgPure, nfgMixed, decisions } = result;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-brand-pink pb-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-ink">Teoría de Juegos (Minimax)</h2>
          <p className="text-brand-muted text-sm mt-1">Equilibrios que se resolvieron en Gambit; el dashboard los recalcula y exporta el .nfg</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-brand-pink pb-2">
        <button
          onClick={() => setActiveSubTab('pura')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeSubTab === 'pura' ? 'bg-brand-tan text-white' : 'text-brand-muted hover:text-brand-ink hover:bg-brand-rose'}`}
        >
          Estrategia Pura (Punto de Silla)
        </button>
        <button
          onClick={() => setActiveSubTab('mixta')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeSubTab === 'mixta' ? 'bg-brand-tan text-white' : 'text-brand-muted hover:text-brand-ink hover:bg-brand-rose'}`}
        >
          Estrategia Mixta
        </button>
      </div>

      {activeSubTab === 'pura' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-xl font-semibold text-brand-ink flex items-center gap-2">
                <Gamepad2 className="text-emerald-400" /> Modelo Base (Juego de Suma Cero)
              </h3>
              <button
                onClick={syncGameFromLab}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-md border border-brand-pink text-brand-ink hover:border-brand-tan"
              >
                <RefreshCw size={12} /> Sincronizar desde laboratorio
              </button>
            </div>
            <p className="text-brand-ink text-sm mb-4">
              Payoffs de Chips Bakery en $k. El archivo <span className="text-brand-ink font-medium">chips_bakery.nfg</span> es el que se cargó en Gambit (estrategia pura, silla en d1).
              Edita una celda para ver si el punto de silla se mantiene.
              {gameOverride ? ' Matriz desacoplada del laboratorio.' : ' Ligada a precio/cantidades.'}
            </p>

            <div className="overflow-x-auto rounded-lg border border-brand-pink">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-brand-rose text-brand-ink text-sm uppercase">
                    <th className="p-4 border-b border-brand-pink border-r text-left">Chips Bakery \ Mercado</th>
                    <th className="p-4 border-b border-brand-pink">S1: Baja</th>
                    <th className="p-4 border-b border-brand-pink">S2: Alta</th>
                    <th className="p-4 border-b border-brand-pink text-brand-muted">Mínimo fila (Maximin)</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {decisions.map((d, i) => (
                    <tr key={d.id} className="border-b border-brand-pink">
                      <td className="p-4 border-r border-brand-pink text-left text-brand-ink font-bold">{d.label}</td>
                      <CellInput
                        value={gameMatrix[i][0]}
                        onChange={(v) => setGameCell(i, 0, v)}
                        highlight={saddle.cell && saddle.cell.i === i && saddle.cell.j === 0}
                        label="Punto de Silla"
                      />
                      <CellInput
                        value={gameMatrix[i][1]}
                        onChange={(v) => setGameCell(i, 1, v)}
                        highlight={saddle.cell && saddle.cell.i === i && saddle.cell.j === 1}
                        label="Punto de Silla"
                      />
                      <td className={`p-4 bg-brand-rose/60 ${i === saddle.maximinIdx ? 'text-emerald-400 font-bold' : 'text-brand-muted'}`}>
                        {formatK(saddle.rowMin[i])}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-brand-rose/50 text-brand-muted">
                    <td className="p-3 text-left border-r border-brand-pink">Máximo columna (Minimax)</td>
                    {saddle.colMax.map((v, j) => (
                      <td key={j} className={`p-3 ${j === saddle.minimaxCol ? 'text-emerald-400 font-bold' : ''}`}>{formatK(v)}</td>
                    ))}
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={`mt-6 p-4 rounded-lg border ${saddle.hasSaddle ? 'bg-brand-rose/60 border-brand-pink' : 'bg-amber-900/20 border-amber-500/50'}`}>
              {saddle.hasSaddle ? (
                <>
                  <h4 className="text-emerald-400 font-bold mb-2">Hay punto de silla</h4>
                  <p className="text-brand-ink text-sm leading-relaxed">
                    Maximin = {formatK(saddle.maximin)} y Minimax = {formatK(saddle.minimax)}.
                    Estrategia pura {DECISION_META[saddle.cell?.i ?? 0].id} contra S{ (saddle.cell?.j ?? 0) + 1 }.
                    Valor del juego {formatK(saddle.cell?.value ?? saddle.maximin)}.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-amber-300 font-bold mb-2 flex items-center gap-2"><AlertTriangle size={16} /> No hay punto de silla</h4>
                  <p className="text-brand-ink text-sm leading-relaxed">
                    Maximin ({formatK(saddle.maximin)}) ≠ Minimax ({formatK(saddle.minimax)}).
                    Ninguna estrategia pura es un equilibrio. Pasa a la pestaña de estrategia mixta.
                  </p>
                </>
              )}
            </div>
          </div>
          <NfgBlock title="chips_bakery.nfg (estrategia pura)" text={nfgPure} />
        </div>
      )}

      {activeSubTab === 'mixta' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-brand-cream p-6 rounded-xl border border-brand-pink">
            <h3 className="text-xl font-semibold text-brand-ink mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-600" /> Escenario extremo (d2 vs d3)
            </h3>
            <p className="text-brand-ink text-sm mb-6">
              Subjuego de alta variabilidad que en Gambit es <span className="text-brand-ink font-medium">chips_bakery_mixta.nfg</span> (77.8% d2 / 22.2% d3, valor $211.11k en el caso del informe).
              Edita las celdas: p* y el valor se mueven con la matriz.
            </p>

            <div className="overflow-x-auto rounded-lg border border-brand-pink">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-brand-rose text-brand-ink text-sm uppercase">
                    <th className="p-4 border-b border-brand-pink border-r text-left">Chips Bakery \ Mercado</th>
                    <th className="p-4 border-b border-brand-pink">S1: Baja</th>
                    <th className="p-4 border-b border-brand-pink">S2: Alta</th>
                    <th className="p-4 border-b border-brand-pink text-brand-muted">Mínimo fila</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {['d2: Producir 250', 'd3: Producir 400'].map((label, i) => (
                    <tr key={label} className="border-b border-brand-pink">
                      <td className="p-4 border-r border-brand-pink text-left text-brand-ink font-bold">{label}</td>
                      <CellInput value={mixedMatrix[i][0]} onChange={(v) => setMixedCell(i, 0, v)} />
                      <CellInput value={mixedMatrix[i][1]} onChange={(v) => setMixedCell(i, 1, v)} />
                      <td className="p-4 text-brand-muted bg-brand-rose/60">{formatK(mixed.saddle.rowMin[i])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {mixed.saddle.hasSaddle ? (
              <div className="mt-6 p-4 bg-brand-rose/60 rounded-lg border border-brand-pink text-sm text-brand-ink">
                Este subjuego ahora tiene silla en {formatK(mixed.saddle.maximin)}. No hace falta mixto.
              </div>
            ) : mixed.validMix ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-brand-rose/60 rounded-lg border border-brand-pink">
                  <h4 className="text-brand-tan font-bold mb-2">Perfil de estrategia (Chips Bakery)</h4>
                  <ul className="text-sm text-brand-ink space-y-1">
                    <li><strong>d2 (250 galletas):</strong> {formatPct(mixed.p, 2)} ({mixed.p.toFixed(4)})</li>
                    <li><strong>d3 (400 galletas):</strong> {formatPct(1 - mixed.p, 2)}</li>
                  </ul>
                  <h4 className="text-brand-tan font-bold mb-2 mt-4">Perfil del mercado</h4>
                  <ul className="text-sm text-brand-ink space-y-1">
                    <li><strong>S1 baja:</strong> {formatPct(mixed.q, 2)}</li>
                    <li><strong>S2 alta:</strong> {formatPct(1 - mixed.q, 2)}</li>
                  </ul>
                </div>
                <div className="p-4 bg-brand-rose/60 rounded-lg border border-brand-pink">
                  <h4 className="text-brand-tan font-bold mb-2 flex items-center gap-2">
                    <TrendingUp size={16} /> Valor esperado del juego
                  </h4>
                  <p className="text-3xl font-black text-brand-ink mt-2">{formatK(mixed.value, 2)}</p>
                  <p className="text-xs text-brand-muted mt-1">
                    Maximin {formatK(mixed.saddle.maximin)} ≠ Minimax {formatK(mixed.saddle.minimax)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-brand-rose/60 rounded-lg border border-brand-pink text-sm text-brand-ink">
                Con esta matriz no hay mixto interior (denominador nulo o p* fuera de (0,1)).
              </div>
            )}
          </div>
          <NfgBlock title="chips_bakery_mixta.nfg" text={nfgMixed} />
        </div>
      )}
    </div>
  );
}
