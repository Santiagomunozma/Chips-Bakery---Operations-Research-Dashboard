import React, { useState } from 'react';
import { Clock3, GitBranch, Route } from 'lucide-react';
import { ROUTE_ANALYSIS } from '../model/routeAnalysis.js';
import RouteNetwork from '../components/RouteNetwork.jsx';

function Metric({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-brand-pink bg-brand-rose/60 p-4">
      <p className="text-xs text-brand-muted">{label}</p>
      <p className="mt-1 text-2xl font-black text-brand-ink">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-brand-muted">{hint}</p>}
    </div>
  );
}

function ActivityTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-brand-pink">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-brand-rose text-xs uppercase tracking-wide text-brand-ink">
          <tr>
            <th className="p-3">Código</th>
            <th className="min-w-64 p-3">Actividad</th>
            <th className="p-3">Precedencias</th>
            <th className="p-3 text-right">t (min)</th>
            <th className="p-3 text-right">IP</th>
            <th className="p-3 text-right">TP</th>
            <th className="p-3 text-right">IL</th>
            <th className="p-3 text-right">TL</th>
            <th className="p-3 text-right">H</th>
          </tr>
        </thead>
        <tbody>
          {ROUTE_ANALYSIS.activities.map((activity) => {
            const critical = activity.slack === 0;
            return (
              <tr
                key={activity.id}
                className={`border-t border-brand-pink text-brand-ink ${critical ? 'bg-emerald-900/20' : ''}`}
              >
                <td className={`p-3 font-bold ${critical ? 'text-emerald-400' : ''}`}>{activity.id}</td>
                <td className="p-3">{activity.name}</td>
                <td className="p-3">{activity.predecessors.join(', ') || 'Ninguna'}</td>
                <td className="p-3 text-right">{activity.duration}</td>
                <td className="p-3 text-right">{activity.earliestStart}</td>
                <td className="p-3 text-right">{activity.earliestFinish}</td>
                <td className="p-3 text-right">{activity.latestStart}</td>
                <td className="p-3 text-right">{activity.latestFinish}</td>
                <td className={`p-3 text-right font-bold ${critical ? 'text-emerald-400' : ''}`}>{activity.slack}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RouteTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-brand-pink">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-brand-rose text-xs uppercase tracking-wide text-brand-ink">
          <tr>
            <th className="p-3">Ruta</th>
            <th className="p-3">Secuencia</th>
            <th className="p-3 text-right">Duración (min)</th>
          </tr>
        </thead>
        <tbody>
          {ROUTE_ANALYSIS.paths.map((path) => {
            const critical = path.id === 1;
            return (
              <tr
                key={path.id}
                className={`border-t border-brand-pink text-brand-ink ${critical ? 'bg-emerald-900/30' : ''}`}
              >
                <td className={`p-3 font-bold ${critical ? 'text-emerald-400' : ''}`}>
                  {critical ? 'Ruta crítica' : `Ruta ${path.id}`}
                </td>
                <td className="p-3 font-mono text-xs md:text-sm">{path.sequence.join(' → ')}</td>
                <td className={`p-3 text-right font-bold ${critical ? 'text-emerald-400' : ''}`}>{path.duration}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NodeDetails({ selectedId, onSelect }) {
  const activity = ROUTE_ANALYSIS.activities.find(({ id }) => id === selectedId);

  return (
    <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold text-brand-ink">
            <GitBranch className="text-brand-tan" size={20} /> Detalle de actividad
          </h3>
          <p className="mt-1 text-sm text-brand-muted">Selecciona un nodo para consultar sus tiempos de red y holgura.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-ink">
          <span>Actividad</span>
          <select
            value={selectedId}
            onChange={(event) => onSelect(event.target.value)}
            className="rounded-md border border-brand-pink bg-brand-rose px-3 py-2 text-brand-ink"
          >
            {ROUTE_ANALYSIS.activities.map(({ id }) => <option key={id} value={id}>{id}</option>)}
          </select>
        </label>
      </div>
      <div className="rounded-lg border border-brand-pink bg-brand-rose/50 p-4">
        <p className="font-semibold text-brand-ink">{activity.id} · {activity.name}</p>
        <p className="mt-1 text-xs text-brand-muted">
          Precedencias: {activity.predecessors.join(', ') || 'Ninguna'} · Sucesoras: {activity.successors.join(', ') || 'Ninguna'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Inicio próximo · IP" value={activity.earliestStart} />
        <Metric label="Terminación próxima · TP" value={activity.earliestFinish} />
        <Metric label="Inicio lejano · IL" value={activity.latestStart} />
        <Metric label="Terminación lejana · TL" value={activity.latestFinish} />
        <Metric label="Duración · t" value={`${activity.duration} min`} />
        <Metric label="Holgura · H" value={`${activity.slack} min`} hint={activity.slack === 0 ? 'Actividad crítica' : 'Puede retrasarse sin mover el proyecto'} />
      </div>
    </section>
  );
}

export default function AnalisisRuta() {
  const [selectedId, setSelectedId] = useState('C');
  const [selectedRouteId, setSelectedRouteId] = useState(1);
  const selectedRoute = ROUTE_ANALYSIS.paths.find(({ id }) => id === selectedRouteId);
  const criticalSequence = ROUTE_ANALYSIS.criticalActivities.join(' → ');

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-brand-pink pb-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">Análisis de Ruta</h2>
          <p className="mt-1 text-sm text-brand-muted">Programación de actividades mediante CPM/PERT · Chips Bakery</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-brand-tan px-3 py-2 text-sm font-semibold text-brand-tan">
          <Clock3 size={16} /> Duración del proyecto: {ROUTE_ANALYSIS.projectDuration} min
        </div>
      </div>

      <section className="space-y-4 rounded-xl border border-emerald-700/60 bg-brand-cream p-5 md:p-6">
        <div className="flex items-center gap-2">
          <Route className="text-emerald-400" size={20} />
          <h3 className="text-xl font-semibold text-brand-ink">Ruta Crítica oficial</h3>
        </div>
        <p className="text-sm leading-relaxed text-brand-ink">
          La ruta de mayor duración determina el tiempo mínimo del proyecto. Sus actividades tienen holgura cero; cualquier retraso que no se recupere en otra actividad crítica retrasa la entrega.
        </p>
        <div className="rounded-lg border border-emerald-700/60 bg-emerald-900/30 p-4">
          <p className="font-mono text-sm font-bold leading-relaxed text-emerald-300">{criticalSequence}</p>
          <p className="mt-2 text-2xl font-black text-emerald-300">{ROUTE_ANALYSIS.projectDuration} minutos</p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Actividades y tiempos de red</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Recorrido hacia adelante: IP = máximo de los TP de precedencias y TP = IP + t. Recorrido hacia atrás: TL = mínimo de los IL de sucesoras e IL = TL − t. Holgura H = IL − IP = TL − TP.
          </p>
        </div>
        <ActivityTable />
        <p className="text-xs text-brand-muted">
          Las actividades críticas se resaltan en verde. IP: inicio próximo · TP: terminación próxima · IL: inicio lejano · TL: terminación lejana · H: holgura total.
        </p>
      </section>

      <RouteNetwork
        selectedId={selectedId}
        onSelect={setSelectedId}
        selectedRoute={selectedRoute}
        onRouteChange={setSelectedRouteId}
      />
      <NodeDetails selectedId={selectedId} onSelect={setSelectedId} />

      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Rutas posibles</h3>
          <p className="mt-1 text-sm text-brand-muted">Los seis caminos completos documentados en el informe y su duración acumulada.</p>
        </div>
        <RouteTable />
      </section>

    </div>
  );
}
