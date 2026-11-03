import React from 'react';
import RouteActivityNode from './RouteActivityNode.jsx';

const NODE_WIDTH = 116;
const NODE_HEIGHT = 92;
const CANVAS_WIDTH = 1750;
const CANVAS_HEIGHT = 650;

const NODE_POSITIONS = {
  A: { x: 20, y: 45 },
  B: { x: 20, y: 165 },
  C: { x: 20, y: 365 },
  D: { x: 165, y: 485 },
  E: { x: 165, y: 265 },
  F: { x: 165, y: 135 },
  G: { x: 310, y: 535 },
  H: { x: 310, y: 255 },
  I: { x: 310, y: 135 },
  J: { x: 455, y: 245 },
  K: { x: 600, y: 245 },
  L: { x: 455, y: 485 },
  M: { x: 745, y: 295 },
  N: { x: 890, y: 295 },
  O: { x: 1035, y: 295 },
  P: { x: 1180, y: 295 },
  Q: { x: 1325, y: 295 },
  R: { x: 1470, y: 295 },
  S: { x: 1615, y: 295 },
};

function edgesOf(sequences) {
  return new Set(sequences.flatMap((sequence) => (
    sequence.slice(1).map((id, index) => `${sequence[index]}-${id}`)
  )));
}

function edgePath(from, to) {
  const startX = from.x + NODE_WIDTH;
  const startY = from.y + NODE_HEIGHT / 2;
  const endX = to.x;
  const endY = to.y + NODE_HEIGHT / 2;
  const middleX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${middleX} ${startY}, ${middleX} ${endY}, ${endX} ${endY}`;
}

function formatTime(value) {
  return Number.isInteger(value) ? value : value.toFixed(2);
}

export default function RouteNetwork({
  analysis,
  selectedId,
  onSelect,
  selectedRouteId,
  onRouteChange,
  durationLabel = 't',
  heading = 'Red de precedencias · CPM',
}) {
  const { activities, paths, criticalPaths, criticalActivities, projectDuration } = analysis;
  const selectedRoute = paths.find(({ id }) => id === selectedRouteId) ?? paths[0];
  const criticalEdges = edgesOf(criticalPaths.map(({ sequence }) => sequence));
  const selectedRouteEdges = edgesOf([selectedRoute.sequence]);
  const secondaryRouteEdges = new Set(
    [...selectedRouteEdges].filter((edge) => !criticalEdges.has(edge)),
  );
  const routeActivityIds = new Set(selectedRoute.sequence);
  const criticalPathSummary = criticalPaths.map(({ sequence }) => sequence.join(' → ')).join(' · ');
  const criticalRoute = selectedRoute && criticalPaths.some(({ id }) => id === selectedRoute.id);

  return (
    <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-brand-ink">{heading}</h3>
            <p className="mt-1 text-sm text-brand-muted">
              Selecciona un nodo para consultar sus tiempos y holgura. Desplázate horizontalmente para recorrer la red.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-ink">
            <span>Ruta a resaltar</span>
            <select
              value={selectedRoute.id}
              onChange={(event) => onRouteChange(Number(event.target.value))}
              className="max-w-full rounded-md border border-brand-pink bg-brand-rose px-3 py-2 text-brand-ink"
            >
              {paths.map((path) => (
                <option key={path.id} value={path.id}>
                  Ruta {path.id}{criticalPaths.some(({ id }) => id === path.id) ? ' · Crítica' : ''} ({formatTime(path.duration)} min)
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className={`rounded-lg border p-4 ${criticalRoute ? 'border-rose-700/60 bg-rose-950/30' : 'border-amber-600/60 bg-amber-950/20'}`}>
            <p className={`text-xs font-semibold ${criticalRoute ? 'text-rose-300' : 'text-amber-300'}`}>
              Ruta {selectedRoute.id}{criticalRoute ? ' · Ruta crítica' : ' · Ruta seleccionada'}
            </p>
            <p className={`mt-1 text-2xl font-black ${criticalRoute ? 'text-rose-300' : 'text-amber-300'}`}>
              {formatTime(selectedRoute.duration)} minutos
            </p>
            <p className="mt-1 font-mono text-xs text-brand-muted">{selectedRoute.sequence.join(' → ')}</p>
          </div>
          <div className="rounded-lg border border-brand-pink bg-brand-rose/60 p-4">
            <p className="text-xs font-semibold text-brand-muted">Duración del escenario</p>
            <p className="mt-1 text-2xl font-black text-brand-ink">{formatTime(projectDuration)} minutos</p>
            <p className="mt-1 text-xs text-brand-muted">
              {criticalPaths.length > 1 ? `${criticalPaths.length} rutas críticas simultáneas` : `Holgura cero: ${criticalActivities.join(', ')}`}
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-brand-pink bg-slate-950/50">
        <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          <svg
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={`Red de precedencias con duración de ${formatTime(projectDuration)} minutos`}
          >
            <defs>
              <marker id="route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker id="critical-route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
              </marker>
              <marker id="selected-route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
              </marker>
            </defs>
            {activities.flatMap((activity) => activity.predecessors.map((predecessor) => (
              <path
                key={`${predecessor}-${activity.id}`}
                d={edgePath(NODE_POSITIONS[predecessor], NODE_POSITIONS[activity.id])}
                fill="none"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="6 5"
                markerEnd="url(#route-arrow)"
                opacity={0.78}
              />
            )))}
            {activities.flatMap((activity) => activity.predecessors
              .filter((predecessor) => criticalEdges.has(`${predecessor}-${activity.id}`))
              .map((predecessor) => (
                <path
                  key={`critical-${predecessor}-${activity.id}`}
                  d={edgePath(NODE_POSITIONS[predecessor], NODE_POSITIONS[activity.id])}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth={4}
                  markerEnd="url(#critical-route-arrow)"
                />
              )))}
            {activities.flatMap((activity) => activity.predecessors
              .filter((predecessor) => secondaryRouteEdges.has(`${predecessor}-${activity.id}`))
              .map((predecessor) => (
                <path
                  key={`selected-${predecessor}-${activity.id}`}
                  d={edgePath(NODE_POSITIONS[predecessor], NODE_POSITIONS[activity.id])}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={4}
                  markerEnd="url(#selected-route-arrow)"
                />
              )))}
          </svg>

          {activities.map((activity) => (
            <div
              key={activity.id}
              className="absolute z-10"
              style={{ left: NODE_POSITIONS[activity.id].x, top: NODE_POSITIONS[activity.id].y }}
            >
              <RouteActivityNode
                activity={activity}
                critical={activity.slack < 1e-8}
                onRoute={routeActivityIds.has(activity.id)}
                selected={selectedId === activity.id}
                onSelect={onSelect}
                durationLabel={durationLabel}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-brand-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-1 w-6 rounded bg-rose-500" /> Ruta crítica
        </span>
        {!criticalRoute && (
          <span className="inline-flex items-center gap-2">
            <span className="h-1 w-6 rounded bg-amber-400" /> Ruta {selectedRoute.id} seleccionada
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-6 border-t-2 border-dashed border-slate-400" /> Precedencia no crítica
        </span>
        <span>Nodo: IP | {durationLabel} | TP · IL | H | TL</span>
      </div>
      <p className="rounded-lg border border-rose-700/50 bg-rose-950/30 p-3 text-sm font-semibold text-rose-300">
        {criticalPathSummary} · {formatTime(projectDuration)} minutos
      </p>
    </section>
  );
}
