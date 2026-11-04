import React, { useMemo, useRef, useState } from 'react';
import {
  calculateGraphicalGameAnalysis,
  GRAPHICAL_GAME_DEFAULTS,
} from '../model/graphicalGameAnalysis.js';

const LINE_COLORS = ['#F7B8C9', '#e2e8f0', '#C48A4A', '#60a5fa'];
const GRAPH = {
  width: 760,
  height: 500,
  left: 100,
  right: 650,
  top: 42,
  bottom: 368,
  minPayoff: -0.5,
  maxPayoff: 0.8,
};
const probabilityFormatter = new Intl.NumberFormat('es-CO', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const decimalFormatter = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

function formatDecimal(value) {
  return decimalFormatter.format(Math.abs(value) < 0.0005 ? 0 : value);
}

function PayoffInput({ scenarioId, lineKey, endpoint, value, onChange, scenarioLabel, lineLabel }) {
  const inputId = `${scenarioId}-${lineKey}-${endpoint}`;
  return (
    <label htmlFor={inputId} className="flex items-center justify-between gap-2 text-xs text-brand-muted">
      <span>{lineLabel} · p={endpoint === 'atZero' ? '0' : '1'}</span>
      <input
        id={inputId}
        type="number"
        min={GRAPH.minPayoff}
        max={GRAPH.maxPayoff}
        step="0.01"
        value={value}
        aria-label={`${scenarioLabel}, ${lineLabel}, pago en p igual a ${endpoint === 'atZero' ? '0' : '1'}`}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber;
          if (Number.isFinite(nextValue) && nextValue >= GRAPH.minPayoff && nextValue <= GRAPH.maxPayoff) {
            onChange(nextValue);
          }
        }}
        className="w-24 rounded-md border border-brand-pink bg-slate-900 px-2 py-1.5 text-right font-mono text-sm text-brand-ink focus:border-brand-tan focus:outline-none"
      />
    </label>
  );
}

function payoffY(value) {
  const range = GRAPH.maxPayoff - GRAPH.minPayoff;
  return GRAPH.bottom - ((value - GRAPH.minPayoff) / range) * (GRAPH.bottom - GRAPH.top);
}

function probabilityX(value) {
  return GRAPH.left + value * (GRAPH.right - GRAPH.left);
}

function GraphTooltip({ line, probability, x, y, color }) {
  if (!line) return null;
  const tooltipX = Math.min(Math.max(x + 12, GRAPH.left + 8), GRAPH.right - 210);
  const tooltipY = Math.min(Math.max(y - 58, GRAPH.top + 4), GRAPH.bottom - 58);
  return (
    <g pointerEvents="none">
      <rect x={tooltipX} y={tooltipY} width={202} height={48} rx={6} fill="#0f172a" stroke={color} />
      <text x={tooltipX + 10} y={tooltipY + 17} fill={color} fontSize={11} fontWeight={700}>
        {line.scenarioLabel} · {line.label}
      </text>
      <text x={tooltipX + 10} y={tooltipY + 35} fill="#e2e8f0" fontSize={10}>
        p {probabilityFormatter.format(probability)} · pago {formatDecimal(line.valueAt(probability))}
      </text>
    </g>
  );
}

function DoubleAxisGraph({ analysis, probability, hoveredLine, onLineHover }) {
  const svgRef = useRef(null);
  const ticks = Array.from({ length: 14 }, (_, index) => (index - 5) / 10);
  const validIntersections = analysis.intersections.filter(
    ({ p, withinProbabilityRange }) => p != null && withinProbabilityRange,
  );
  const readPointerPosition = (event) => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(matrix.inverse());
  };
  const showTooltip = (event, line) => {
    const position = readPointerPosition(event);
    if (!position) return;
    const x = Math.min(GRAPH.right, Math.max(GRAPH.left, position.x));
    const p = (x - GRAPH.left) / (GRAPH.right - GRAPH.left);
    onLineHover({ line, probability: p, x, y: position.y });
  };

  return (
    <div className="min-w-0 rounded-lg border border-brand-pink bg-slate-950/40 p-2 md:p-4">
      <div className="w-full" style={{ aspectRatio: '760 / 500' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="img"
          aria-label="Gráfica con dos ejes verticales de pago esperado desde menos cero coma cinco hasta cero coma ocho. Las líneas conectan pagos en p igual a cero y p igual a uno."
        >
          <text x={GRAPH.left} y="22" textAnchor="middle" fill="#cbd5e1" fontSize="11">Eje izquierdo · p = 0</text>
          <text x={GRAPH.right} y="22" textAnchor="middle" fill="#cbd5e1" fontSize="11">Eje derecho · p = 1</text>

          {ticks.map((tick) => {
            const y = payoffY(tick);
            return (
              <g key={tick}>
                <line
                  x1={GRAPH.left}
                  y1={y}
                  x2={GRAPH.right}
                  y2={y}
                  stroke={Math.abs(tick) < 1e-8 ? '#64748b' : '#334155'}
                  strokeDasharray={Math.abs(tick) < 1e-8 ? undefined : '3 5'}
                />
                <line x1={GRAPH.left - 5} y1={y} x2={GRAPH.left} y2={y} stroke="#cbd5e1" />
                <line x1={GRAPH.right} y1={y} x2={GRAPH.right + 5} y2={y} stroke="#cbd5e1" />
                <text x={GRAPH.left - 10} y={y + 4} textAnchor="end" fill="#cbd5e1" fontSize="10">
                  {formatDecimal(tick)}
                </text>
                <text x={GRAPH.right + 10} y={y + 4} textAnchor="start" fill="#cbd5e1" fontSize="10">
                  {formatDecimal(tick)}
                </text>
              </g>
            );
          })}

          <line x1={GRAPH.left} y1={GRAPH.top} x2={GRAPH.left} y2={GRAPH.bottom} stroke="#e2e8f0" strokeWidth="2" />
          <line x1={GRAPH.right} y1={GRAPH.top} x2={GRAPH.right} y2={GRAPH.bottom} stroke="#e2e8f0" strokeWidth="2" />

          <line
            x1={probabilityX(probability)}
            y1={GRAPH.top}
            x2={probabilityX(probability)}
            y2={GRAPH.bottom}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 5"
          />
          <text
            x={Math.min(Math.max(probabilityX(probability), GRAPH.left + 35), GRAPH.right - 35)}
            y={GRAPH.top + 13}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="9"
          >
            p {probabilityFormatter.format(probability)}
          </text>

          {analysis.lines.map((line, index) => {
            const color = LINE_COLORS[index];
            const startY = payoffY(line.atZero);
            const endY = payoffY(line.atOne);
            return (
              <g key={line.id}>
                <line
                  x1={GRAPH.left}
                  y1={startY}
                  x2={GRAPH.right}
                  y2={endY}
                  stroke="transparent"
                  strokeWidth="14"
                  pointerEvents="stroke"
                  className="cursor-crosshair"
                  onMouseMove={(event) => showTooltip(event, line)}
                  onMouseLeave={() => onLineHover(null)}
                  onFocus={(event) => showTooltip(event, line)}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`${line.scenarioLabel}, ${line.label}. Pago inicial ${formatDecimal(line.atZero)}, pago final ${formatDecimal(line.atOne)}, pendiente ${formatDecimal(line.slope)}`}
                />
                <line
                  x1={GRAPH.left}
                  y1={startY}
                  x2={GRAPH.right}
                  y2={endY}
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  pointerEvents="none"
                />
                <circle cx={GRAPH.left} cy={startY} r="3.5" fill={color} pointerEvents="none" />
                <circle cx={GRAPH.right} cy={endY} r="3.5" fill={color} pointerEvents="none" />
              </g>
            );
          })}

          {validIntersections.map((intersection, index) => {
            const x = probabilityX(intersection.p);
            const y = payoffY(intersection.value);
            const lineColor = LINE_COLORS[index * 2];
            const coordinate = `(${Math.round(intersection.q * 100)}, ${Math.round(intersection.p * 100)})`;
            const labelY = GRAPH.bottom + (index === 0 ? 22 : 43);
            return (
              <g key={intersection.id} aria-label={`${intersection.label}, punto (q, p) ${coordinate}`}>
                <line x1={x} y1={y} x2={x} y2={GRAPH.bottom} stroke={lineColor} strokeDasharray="5 5" />
                <circle cx={x} cy={y} r="5" fill={lineColor} stroke="#0f172a" strokeWidth="2" />
                <text x={x} y={labelY} textAnchor="middle" fill={lineColor} fontSize="11" fontWeight="700">
                  {coordinate}
                </text>
              </g>
            );
          })}

          {hoveredLine && (
            <GraphTooltip
              line={hoveredLine.line}
              probability={hoveredLine.probability}
              x={hoveredLine.x}
              y={hoveredLine.y}
              color={LINE_COLORS[analysis.lines.indexOf(hoveredLine.line)]}
            />
          )}
          <text
            x={(GRAPH.left + GRAPH.right) / 2}
            y={GRAPH.height - 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
          >
            (q, p) · coordenadas de equilibrio en porcentaje
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function GraphicalGameAnalysis() {
  const [scenarios, setScenarios] = useState(GRAPHICAL_GAME_DEFAULTS);
  const [probability, setProbability] = useState(0.5);
  const [hoveredLine, setHoveredLine] = useState(null);
  const analysis = useMemo(() => calculateGraphicalGameAnalysis(scenarios), [scenarios]);

  const updatePayoff = (scenarioId, lineKey, endpoint, value) => {
    setScenarios((current) => current.map((scenario) => (
      scenario.id !== scenarioId
        ? scenario
        : {
          ...scenario,
          [lineKey]: { ...scenario[lineKey], [endpoint]: value },
        }
    )));
  };

  return (
    <section className="space-y-5 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
      <div>
        <h3 className="text-xl font-semibold text-brand-ink">Análisis gráfico inicial</h3>
        <p className="mt-1 text-sm leading-relaxed text-brand-muted">
          Rectas de pago esperado reconstruidas del boceto. Cambia los pagos en los extremos para recalcular pendientes,
          cruces y valores; pasa el cursor por la gráfica para consultar cada recta.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {scenarios.map((scenario) => (
          <fieldset key={scenario.id} className="space-y-3 rounded-lg border border-brand-pink bg-brand-rose/50 p-4">
            <legend className="px-2 text-sm font-bold text-brand-tan">{scenario.label} · pagos en los extremos</legend>
            <p className="text-xs text-brand-muted">Valores en p = 0 y p = 1; la recta se interpola entre ambos.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {['firstLine', 'secondLine'].map((lineKey) => (
                <div key={lineKey} className="space-y-2 rounded-md border border-brand-pink/60 p-3">
                  <p className="text-sm font-semibold text-brand-ink">{scenario[lineKey].label}</p>
                  {['atZero', 'atOne'].map((endpoint) => (
                    <PayoffInput
                      key={endpoint}
                      scenarioId={scenario.id}
                      lineKey={lineKey}
                      endpoint={endpoint}
                      value={scenario[lineKey][endpoint]}
                      onChange={(value) => updatePayoff(scenario.id, lineKey, endpoint, value)}
                      scenarioLabel={scenario.label}
                      lineLabel={scenario[lineKey].label}
                    />
                  ))}
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(260px,1fr)]">
        <DoubleAxisGraph
          analysis={analysis}
          probability={probability}
          hoveredLine={hoveredLine}
          onLineHover={setHoveredLine}
        />

        <aside className="space-y-4">
          <div className="rounded-lg border border-brand-pink bg-brand-rose/50 p-4">
            <h4 className="font-semibold text-brand-ink">Control de probabilidad</h4>
            <label htmlFor="graphical-probability" className="mt-3 block text-sm text-brand-muted">
              p = {probabilityFormatter.format(probability)} · q = {probabilityFormatter.format(1 - probability)}
            </label>
            <input
              id="graphical-probability"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={probability}
              onChange={(event) => setProbability(Number(event.target.value))}
              className="mt-2 w-full accent-brand-tan"
            />
            <div className="mt-3 space-y-2 text-xs">
              {analysis.lines.map((line) => (
                <p key={line.id} style={{ color: LINE_COLORS[analysis.lines.indexOf(line)] }}>
                  {line.scenarioLabel} · {line.label}: E = {formatDecimal(line.valueAt(probability))}
                </p>
              ))}
            </div>
            {hoveredLine && (
              <div className="mt-3 rounded-md border border-brand-pink bg-slate-950/50 p-2 text-xs">
                <p className="font-semibold" style={{ color: LINE_COLORS[analysis.lines.indexOf(hoveredLine.line)] }}>
                  {hoveredLine.line.scenarioLabel} · {hoveredLine.line.label}
                </p>
                <p className="mt-1 text-brand-ink">
                  p = {probabilityFormatter.format(hoveredLine.probability)} · E = {formatDecimal(hoveredLine.line.valueAt(hoveredLine.probability))}
                </p>
              </div>
            )}
          </div>

        </aside>
      </div>
    </section>
  );
}
