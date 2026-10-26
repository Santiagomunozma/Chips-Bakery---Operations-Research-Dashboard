import React from 'react';

const nodeFields = [
  { key: 'earliestStart', label: 'IP', position: 'col-start-1 row-start-1' },
  { key: 'duration', label: 't', position: 'col-start-2 row-start-1' },
  { key: 'earliestFinish', label: 'TP', position: 'col-start-3 row-start-1' },
  { key: 'latestStart', label: 'IL', position: 'col-start-1 row-start-3' },
  { key: 'slack', label: 'H', position: 'col-start-2 row-start-3' },
  { key: 'latestFinish', label: 'TL', position: 'col-start-3 row-start-3' },
];

export default function RouteActivityNode({ activity, critical, onRoute, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(activity.id)}
      aria-pressed={selected}
      aria-label={`Actividad ${activity.id}: ${activity.name}. IP ${activity.earliestStart}, TP ${activity.earliestFinish}, IL ${activity.latestStart}, TL ${activity.latestFinish}, duración ${activity.duration}, holgura ${activity.slack}`}
      title={`${activity.name}${critical ? ' · Ruta crítica' : ''}`}
      className={`grid h-[92px] w-[116px] grid-cols-3 grid-rows-[22px_1fr_22px] overflow-hidden rounded-xl border-2 text-center shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-tan ${
        selected
          ? 'border-brand-tan ring-2 ring-brand-tan/40'
          : critical
            ? 'border-rose-500'
            : onRoute
              ? 'border-amber-400'
              : 'border-slate-500'
      }`}
    >
      {nodeFields.slice(0, 3).map((field) => (
        <span
          key={field.key}
          className={`${field.position} flex items-center justify-center border-b border-slate-500/70 bg-slate-900 px-1 text-[10px] leading-none text-slate-300`}
        >
          <span className="mr-0.5 font-semibold text-slate-400">{field.label}</span>{activity[field.key]}
        </span>
      ))}
      <span className={`col-span-3 row-start-2 flex items-center justify-center border-b border-slate-500/70 text-xl font-black ${
        critical ? 'bg-rose-700 text-white' : onRoute ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-100'
      }`}>
        {activity.id}
      </span>
      {nodeFields.slice(3).map((field) => (
        <span
          key={field.key}
          className={`${field.position} flex items-center justify-center bg-slate-900 px-1 text-[10px] leading-none text-slate-300`}
        >
          <span className="mr-0.5 font-semibold text-slate-400">{field.label}</span>{activity[field.key]}
        </span>
      ))}
    </button>
  );
}
