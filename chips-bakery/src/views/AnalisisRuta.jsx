import React, { useState } from 'react';
import {
  BarChart3,
  Calculator,
  Clock3,
  GitBranch,
  Route,
  Wallet,
} from 'lucide-react';
import RouteNetwork from '../components/RouteNetwork.jsx';
import RouteProbabilityChart from '../components/RouteProbabilityChart.jsx';
import {
  COST_ESTIMATES_BY_ID,
  CRASH_PROGRAMS,
  NORMAL_DIRECT_COST,
  PERT_ANALYSIS,
  PERT_CRITICAL_VARIANCE,
  PERT_ESTIMATES,
  PERT_STANDARD_DEVIATION,
  ROUTE_ANALYSIS,
} from '../model/routeAnalysis.js';

const SECTIONS = [
  { id: 'cpm', label: 'CPM normal', icon: Route },
  { id: 'pert', label: 'Actualización PERT', icon: BarChart3 },
  { id: 'costos', label: 'Tiempo–costo', icon: Wallet },
  { id: 'probabilidad', label: 'Probabilidad', icon: Clock3 },
  { id: 'metodologia', label: 'Anexo metodológico', icon: Calculator },
];

const formatMinutes = (value, decimals = 2) => (
  Number.isInteger(value) ? String(value) : value.toFixed(decimals).replace('.', ',')
);
const formatCost = (value) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
}).format(value);

function Metric({ label, value, hint, accent = false }) {
  return (
    <div className="rounded-lg border border-brand-pink bg-brand-rose/60 p-4">
      <p className="text-xs text-brand-muted">{label}</p>
      <p className={`mt-1 text-2xl font-black ${accent ? 'text-rose-300' : 'text-brand-ink'}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-brand-muted">{hint}</p>}
    </div>
  );
}

function DataTable({ columns, rows, rowKey }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-brand-pink">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-brand-rose text-xs uppercase tracking-wide text-brand-ink">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`whitespace-nowrap p-3 ${column.align === 'right' ? 'text-right' : ''}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-brand-pink text-brand-ink">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`p-3 ${column.align === 'right' ? 'text-right tabular-nums' : ''} ${column.className ?? ''}`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityTable({ analysis = ROUTE_ANALYSIS, durationLabel = 't' }) {
  const critical = new Set(analysis.criticalActivities);
  const columns = [
    { key: 'id', label: 'Código', className: 'font-bold' },
    { key: 'name', label: 'Actividad' },
    { key: 'predecessors', label: 'Predecesoras', render: ({ predecessors }) => predecessors.join(', ') || 'Ninguna' },
    { key: 'duration', label: `${durationLabel} (min)`, align: 'right', render: ({ duration }) => formatMinutes(duration) },
    { key: 'earliestStart', label: 'IP', align: 'right', render: ({ earliestStart }) => formatMinutes(earliestStart) },
    { key: 'earliestFinish', label: 'TP', align: 'right', render: ({ earliestFinish }) => formatMinutes(earliestFinish) },
    { key: 'latestStart', label: 'IL', align: 'right', render: ({ latestStart }) => formatMinutes(latestStart) },
    { key: 'latestFinish', label: 'TL', align: 'right', render: ({ latestFinish }) => formatMinutes(latestFinish) },
    {
      key: 'slack',
      label: 'H',
      align: 'right',
      render: (activity) => (
        <span className={critical.has(activity.id) ? 'font-bold text-rose-300' : ''}>
          {formatMinutes(activity.slack)}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} rows={analysis.activities} rowKey={({ id }) => id} />;
}

function ActivityDetails({ analysis, selectedId, onSelect, durationLabel }) {
  const activity = analysis.activities.find(({ id }) => id === selectedId) ?? analysis.activities[0];
  const critical = analysis.criticalActivities.includes(activity.id);
  return (
    <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold text-brand-ink">
            <GitBranch className="text-brand-tan" size={20} /> Detalle de actividad
          </h3>
          <p className="mt-1 text-sm text-brand-muted">Los valores corresponden al escenario activo.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-ink">
          <span>Actividad</span>
          <select
            value={activity.id}
            onChange={(event) => onSelect(event.target.value)}
            className="rounded-md border border-brand-pink bg-brand-rose px-3 py-2 text-brand-ink"
          >
            {analysis.activities.map(({ id }) => <option key={id} value={id}>{id}</option>)}
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
        <Metric label="Inicio próximo · IP" value={formatMinutes(activity.earliestStart)} />
        <Metric label="Terminación próxima · TP" value={formatMinutes(activity.earliestFinish)} />
        <Metric label="Inicio lejano · IL" value={formatMinutes(activity.latestStart)} />
        <Metric label="Terminación lejana · TL" value={formatMinutes(activity.latestFinish)} />
        <Metric label={`Duración · ${durationLabel}`} value={`${formatMinutes(activity.duration)} min`} />
        <Metric
          label="Holgura · H"
          value={`${formatMinutes(activity.slack)} min`}
          hint={critical ? 'Actividad crítica' : 'Puede retrasarse sin mover el proyecto'}
          accent={critical}
        />
      </div>
    </section>
  );
}

function SectionTabs({ activeSection, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-brand-pink pb-2" role="tablist" aria-label="Secciones del análisis de ruta">
      {SECTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeSection === id}
          onClick={() => onSelect(id)}
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeSection === id
              ? 'bg-brand-tan text-slate-950'
              : 'border border-brand-pink text-brand-muted hover:text-brand-ink'
          }`}
        >
          <Icon size={16} /> {label}
        </button>
      ))}
    </div>
  );
}

function CpmSection({ selectedId, onSelect, selectedRouteId, onRouteChange }) {
  const criticalSequence = ROUTE_ANALYSIS.criticalPaths[0].sequence.join(' → ');
  const routeColumns = [
    { key: 'id', label: 'Ruta' },
    { key: 'sequence', label: 'Secuencia desde inicio hasta fin', render: ({ sequence }) => <span className="font-mono text-xs">{sequence.join(' → ')}</span> },
    { key: 'duration', label: 'Duración (min)', align: 'right' },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-rose-700/60 bg-brand-cream p-5 md:p-6">
        <div className="flex items-center gap-2">
          <Route className="text-rose-400" size={20} />
          <h3 className="text-xl font-semibold text-brand-ink">Red CPM y ruta crítica normal</h3>
        </div>
        <p className="text-sm leading-relaxed text-brand-muted">
          La duración mínima del proyecto la determina la ruta de mayor duración. Las actividades críticas y sus conexiones se resaltan en rojo.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Duración normal" value={`${ROUTE_ANALYSIS.projectDuration} min`} accent />
          <Metric label="Costo directo normal" value={formatCost(NORMAL_DIRECT_COST)} hint="Supuesto académico por lote" />
        </div>
        <div className="rounded-lg border border-rose-700/60 bg-rose-950/30 p-4">
          <p className="font-mono text-sm font-bold leading-relaxed text-rose-300">{criticalSequence}</p>
          <p className="mt-2 text-2xl font-black text-rose-300">{ROUTE_ANALYSIS.projectDuration} minutos</p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Identificación de actividades y precedencias</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Las 19 tareas A–S y sus tiempos normales, con IP, TP, IL, TL y holgura calculados desde las precedencias.
          </p>
        </div>
        <ActivityTable />
        <p className="text-xs text-brand-muted">
          IP: inicio próximo · TP: terminación próxima · IL: inicio lejano · TL: terminación lejana · H: holgura total.
        </p>
      </section>

      <RouteNetwork
        analysis={ROUTE_ANALYSIS}
        selectedId={selectedId}
        onSelect={onSelect}
        selectedRouteId={selectedRouteId}
        onRouteChange={onRouteChange}
      />
      <ActivityDetails
        analysis={ROUTE_ANALYSIS}
        selectedId={selectedId}
        onSelect={onSelect}
        durationLabel="t"
      />

      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <h3 className="text-xl font-semibold text-brand-ink">Rutas posibles</h3>
        <DataTable
          columns={routeColumns}
          rows={ROUTE_ANALYSIS.paths.map((path) => ({
            ...path,
            id: ROUTE_ANALYSIS.criticalPaths.some(({ id }) => id === path.id) ? `Ruta ${path.id} · Crítica` : `Ruta ${path.id}`,
          }))}
          rowKey={({ sequence }) => sequence.join('-')}
        />
      </section>
    </div>
  );
}

function PertSection({ selectedId, onSelect, selectedRouteId, onRouteChange }) {
  const estimateById = new Map(PERT_ESTIMATES.map((estimate) => [estimate.id, estimate]));
  const rows = PERT_ANALYSIS.activities.map((activity) => ({
    ...activity,
    ...estimateById.get(activity.id),
  }));
  const columns = [
    { key: 'id', label: 'Act.' },
    { key: 'optimistic', label: 'a', align: 'right' },
    { key: 'mostLikely', label: 'm', align: 'right' },
    { key: 'pessimistic', label: 'b', align: 'right' },
    { key: 'duration', label: 'tₑ (min)', align: 'right', render: ({ duration }) => formatMinutes(duration) },
    { key: 'variance', label: 'σ² (min²)', align: 'right', render: ({ variance }) => variance.toFixed(4).replace('.', ',') },
    { key: 'slack', label: 'H (min)', align: 'right', render: ({ slack }) => formatMinutes(slack) },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Actualización PERT</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Los tiempos esperados tₑ sustituyen a los tiempos normales en la misma red; la ruta crítica se vuelve a calcular.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Duración esperada" value={`${formatMinutes(PERT_ANALYSIS.projectDuration)} min`} />
          <Metric label="Varianza de la ruta crítica" value={`${PERT_CRITICAL_VARIANCE.toFixed(4).replace('.', ',')} min²`} />
          <Metric label="Desviación estándar" value={`${formatMinutes(PERT_STANDARD_DEVIATION)} min`} />
        </div>
        <DataTable columns={columns} rows={rows} rowKey={({ id }) => id} />
      </section>
      <RouteNetwork
        analysis={PERT_ANALYSIS}
        selectedId={selectedId}
        onSelect={onSelect}
        selectedRouteId={selectedRouteId}
        onRouteChange={onRouteChange}
        durationLabel="tₑ"
        heading="Red PERT · tiempos esperados"
      />
      <ActivityDetails analysis={PERT_ANALYSIS} selectedId={selectedId} onSelect={onSelect} durationLabel="tₑ" />
    </div>
  );
}

function CostSection({ selectedId, onSelect, selectedProgramId, onProgramChange, selectedRouteId, onRouteChange }) {
  const program = CRASH_PROGRAMS.find(({ id }) => id === selectedProgramId) ?? CRASH_PROGRAMS[0];
  const crashTargets = [98, 97, 94, 93, 90, 88];
  const costRows = ROUTE_ANALYSIS.activities.map((activity) => ({
    ...activity,
    ...COST_ESTIMATES_BY_ID.get(activity.id),
  }));
  const costColumns = [
    { key: 'id', label: 'Act.' },
    { key: 'duration', label: 'Tn', align: 'right' },
    { key: 'normalCost', label: 'Cn (COP)', align: 'right', render: ({ normalCost }) => formatCost(normalCost) },
    { key: 'crashDuration', label: 'Tc', align: 'right' },
    { key: 'crashCost', label: 'Cc (COP)', align: 'right', render: ({ crashCost }) => formatCost(crashCost) },
    { key: 'reductionLimit', label: 'TR (min)', align: 'right' },
    { key: 'slope', label: 'S (COP/min)', align: 'right', render: ({ slope }) => slope === null ? '—' : formatCost(slope) },
  ];
  const programColumns = [
    { key: 'id', label: 'Prog.' },
    { key: 'time', label: 'Tiempo (min)', align: 'right' },
    { key: 'cost', label: 'Costo total', align: 'right', render: ({ cost }) => formatCost(cost) },
    { key: 'change', label: 'Cambio', render: ({ change }) => change === 'Ninguno' ? change : `${change} min` },
    {
      key: 'critical',
      label: 'Rutas críticas',
      render: ({ analysis }) => analysis.criticalPaths
        .map(({ sequence }) => sequence.join('–'))
        .join(' · '),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Intercambio tiempo–costo</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Pendiente S = (Cc − Cn) / (Tn − Tc). Cada programa acumula reducciones en actividades críticas y recalcula la red.
          </p>
        </div>
        <DataTable columns={costColumns} rows={costRows} rowKey={({ id }) => id} />
        <p className="text-xs text-brand-muted">
          Los costos unitarios y pendientes son supuestos académicos simulados por lote. El costo normal suma $38.800 COP y la reducción máxima propuesta llega a 88 minutos / $45.300 COP.
        </p>
      </section>

      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Programas factibles de reducción</h3>
          <p className="mt-1 text-sm text-brand-muted">Se muestran las alternativas de menor costo indicadas en el análisis.</p>
        </div>
        <DataTable columns={programColumns} rows={CRASH_PROGRAMS} rowKey={({ id }) => id} />
      </section>

      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Redes de programas relevantes</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Selecciona un escenario para consultar su red, tiempos nodales y rutas críticas actualizadas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Seleccionar programa para visualizar">
          {crashTargets.map((time) => {
            const option = CRASH_PROGRAMS.find(({ time: programTime }) => programTime === time);
            return (
              <button
                key={time}
                type="button"
                aria-pressed={option.id === program.id}
                onClick={() => onProgramChange(option.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  option.id === program.id
                    ? 'border-rose-500 bg-rose-700 text-white'
                    : 'border-brand-pink bg-brand-rose text-brand-muted hover:text-brand-ink'
                }`}
              >
                {time} min
              </button>
            );
          })}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Programa" value={`${program.time} min`} accent />
          <Metric label="Costo directo" value={formatCost(program.cost)} />
          <Metric label="Cambio aplicado" value={program.change} />
        </div>
        <RouteNetwork
          analysis={program.analysis}
          selectedId={selectedId}
          onSelect={onSelect}
          selectedRouteId={selectedRouteId}
          onRouteChange={onRouteChange}
          heading={`Red CPM · programa de ${program.time} minutos`}
        />
      </section>
    </div>
  );
}

function errorFunction(value) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const t = 1 / (1 + 0.3275911 * x);
  const polynomial = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
  return sign * (1 - polynomial * Math.exp(-x * x));
}

function normalCdf(z) {
  const roundedZ = Number(z.toFixed(2));
  return (1 + errorFunction(roundedZ / Math.sqrt(2))) / 2;
}

function ProbabilitySection({ deadline, onDeadlineChange }) {
  const deadlineValue = Number(deadline);
  const isValidDeadline = deadline !== '' && Number.isFinite(deadlineValue) && deadlineValue > 0;
  const z = isValidDeadline ? (deadlineValue - PERT_ANALYSIS.projectDuration) / PERT_STANDARD_DEVIATION : 0;
  const probability = isValidDeadline ? normalCdf(z) : 0;
  const chartDeadline = isValidDeadline
    ? deadlineValue
    : PERT_ANALYSIS.projectDuration + 3 * PERT_STANDARD_DEVIATION;

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-brand-pink bg-brand-cream p-5 md:p-6">
        <div>
          <h3 className="text-xl font-semibold text-brand-ink">Probabilidad de cumplimiento</h3>
          <p className="mt-1 text-sm text-brand-muted">
            Aproximación normal sobre la duración esperada y la varianza acumulada de las actividades críticas PERT.
          </p>
        </div>
        <label className="flex flex-wrap items-center gap-3 text-sm text-brand-ink">
          <span className="font-semibold">Plazo objetivo (minutos)</span>
          <input
            type="number"
            min="1"
            step="1"
            value={deadline}
            onChange={(event) => onDeadlineChange(event.target.value)}
            className="w-32 rounded-md border border-brand-pink bg-brand-rose px-3 py-2 text-brand-ink"
          />
        </label>
        {!isValidDeadline && (
          <p className="text-sm text-rose-300">Ingresa un plazo mayor que cero para calcular la probabilidad.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Duración esperada · μ" value={`${formatMinutes(PERT_ANALYSIS.projectDuration)} min`} />
          <Metric label="Varianza · σ²" value={`${PERT_CRITICAL_VARIANCE.toFixed(4).replace('.', ',')} min²`} />
          <Metric label="Desviación estándar · σ" value={`${formatMinutes(PERT_STANDARD_DEVIATION)} min`} />
          <Metric label="Probabilidad de cumplir" value={isValidDeadline ? `${(probability * 100).toFixed(2).replace('.', ',')} %` : '—'} accent />
        </div>
        <Metric
          label="Valor estandarizado"
          value={isValidDeadline ? `Z = ${z.toFixed(2).replace('.', ',')}` : '—'}
          hint={isValidDeadline ? `P(T ≤ ${formatMinutes(deadlineValue)} min) · ${((1 - probability) * 100).toFixed(2).replace('.', ',')} % de exceder el plazo` : undefined}
        />
        <RouteProbabilityChart
          mean={PERT_ANALYSIS.projectDuration}
          standardDeviation={PERT_STANDARD_DEVIATION}
          deadline={chartDeadline}
        />
        <div className="flex flex-wrap gap-4 text-xs text-brand-muted">
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-rose-500/70" /> Cumplimiento estimado</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-slate-500/60" /> Fuera del plazo</span>
          <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 bg-amber-400" /> Distribución normal</span>
        </div>
      </section>
      <aside className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-4 text-sm leading-relaxed text-amber-100">
        Para un plazo de 105 minutos, el documento estima Z ≈ 1,65 y una probabilidad de cumplimiento de 95,05 %. Es una aproximación académica basada en independencia entre duraciones; no es una garantía de producción.
      </aside>
    </div>
  );
}

const METHOD_SECTIONS = [
  {
    title: 'Cálculo de la red y holguras',
    description: 'Se realiza un recorrido hacia adelante para obtener los inicios y terminaciones próximos y uno hacia atrás para los tiempos lejanos.',
    formulas: [
      'IPᵢ = máx(TP de las predecesoras de i); para tareas iniciales, IP = 0.',
      'TPᵢ = IPᵢ + tᵢ',
      'TLᵢ = mín(IL de las sucesoras de i); para las terminales, TL = duración del proyecto.',
      'ILᵢ = TLᵢ − tᵢ',
      'Hᵢ = ILᵢ − IPᵢ = TLᵢ − TPᵢ',
    ],
  },
  {
    title: 'Estimaciones PERT',
    description: 'a es el tiempo optimista, m el más probable y b el pesimista.',
    formulas: [
      'tₑ = (a + 4m + b) / 6',
      'σ² = [(b − a) / 6]²',
      'σ = √σ²',
    ],
  },
  {
    title: 'Varianza y probabilidad de cumplimiento',
    description: 'La varianza aproximada del proyecto suma las varianzas de las actividades de la ruta crítica PERT.',
    formulas: [
      'σ² proyecto ≈ Σ σ²ᵢ para las actividades críticas',
      'Z = (T límite − μ) / σ',
      'P(T ≤ plazo) = Φ(Z)',
    ],
  },
  {
    title: 'Intercambio tiempo–costo',
    description: 'Tc es el tiempo mínimo propuesto con recursos adicionales; Cc es su costo asociado.',
    formulas: [
      'TR = Tn − Tc',
      'S = (Cc − Cn) / (Tn − Tc), cuando Tn > Tc',
      'Costo del programa = Σ costos normales + Σ costos incrementales de reducción',
    ],
  },
];

function MethodologySection() {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-brand-ink">Anexo metodológico y fórmulas</h3>
        <p className="mt-1 text-sm text-brand-muted">
          Definiciones y reglas empleadas para construir las redes CPM/PERT y los programas de reducción.
        </p>
      </div>
      {METHOD_SECTIONS.map(({ title, description, formulas }) => (
        <details key={title} className="group rounded-xl border border-brand-pink bg-brand-cream p-5">
          <summary className="cursor-pointer list-none text-lg font-semibold text-brand-ink marker:hidden">
            <span className="mr-2 text-brand-tan">+</span>{title}
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-brand-muted">{description}</p>
          <ul className="mt-3 space-y-2">
            {formulas.map((formula) => (
              <li key={formula} className="rounded-lg border border-brand-pink bg-brand-rose/60 px-3 py-2 font-mono text-sm text-brand-ink">
                {formula}
              </li>
            ))}
          </ul>
        </details>
      ))}
      <p className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-4 text-sm leading-relaxed text-amber-100">
        Las estimaciones PERT y los costos de aceleración son supuestos académicos. El modelo normal aproxima el cumplimiento con independencia entre tiempos y puede no reflejar rutas alternativas casi críticas. Valida costos y tiempos con datos reales antes de tomar decisiones operativas.
      </p>
    </section>
  );
}

export default function AnalisisRuta() {
  const [activeSection, setActiveSection] = useState('cpm');
  const [selectedId, setSelectedId] = useState('C');
  const [cpmRouteId, setCpmRouteId] = useState(1);
  const [pertRouteId, setPertRouteId] = useState(1);
  const [selectedProgramId, setSelectedProgramId] = useState(1);
  const [programRouteId, setProgramRouteId] = useState(1);
  const [deadline, setDeadline] = useState('105');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-brand-pink pb-4">
        <div>
          <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">Análisis de Ruta</h2>
          <p className="mt-1 text-sm text-brand-muted">Programación de actividades mediante CPM/PERT · Chips Bakery</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-brand-tan px-3 py-2 text-sm font-semibold text-brand-tan">
          <Clock3 size={16} /> Duración CPM normal: {ROUTE_ANALYSIS.projectDuration} min
        </div>
      </div>

      <SectionTabs activeSection={activeSection} onSelect={setActiveSection} />
      <div role="tabpanel">
        {activeSection === 'cpm' && (
          <CpmSection
            selectedId={selectedId}
            onSelect={setSelectedId}
            selectedRouteId={cpmRouteId}
            onRouteChange={setCpmRouteId}
          />
        )}
        {activeSection === 'pert' && (
          <PertSection
            selectedId={selectedId}
            onSelect={setSelectedId}
            selectedRouteId={pertRouteId}
            onRouteChange={setPertRouteId}
          />
        )}
        {activeSection === 'costos' && (
          <CostSection
            selectedId={selectedId}
            onSelect={setSelectedId}
            selectedProgramId={selectedProgramId}
            onProgramChange={setSelectedProgramId}
            selectedRouteId={programRouteId}
            onRouteChange={setProgramRouteId}
          />
        )}
        {activeSection === 'probabilidad' && (
          <ProbabilitySection deadline={deadline} onDeadlineChange={setDeadline} />
        )}
        {activeSection === 'metodologia' && <MethodologySection />}
      </div>
    </div>
  );
}
