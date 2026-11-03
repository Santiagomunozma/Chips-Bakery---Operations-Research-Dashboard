export const ROUTE_ACTIVITIES = [
  { id: 'A', name: 'Definir receta y cantidad del lote', predecessors: [], duration: 5 },
  { id: 'B', name: 'Verificar disponibilidad de ingredientes', predecessors: [], duration: 6 },
  { id: 'C', name: 'Limpiar y desinfectar estación', predecessors: [], duration: 8 },
  { id: 'D', name: 'Alistar equipos y utensilios', predecessors: ['C'], duration: 5 },
  { id: 'E', name: 'Pesar ingredientes secos', predecessors: ['A', 'B', 'C'], duration: 7 },
  { id: 'F', name: 'Pesar ingredientes húmedos', predecessors: ['A', 'B', 'C'], duration: 5 },
  { id: 'G', name: 'Precalentar el horno', predecessors: ['D'], duration: 12 },
  { id: 'H', name: 'Mezclar ingredientes secos', predecessors: ['E'], duration: 4 },
  { id: 'I', name: 'Batir ingredientes húmedos', predecessors: ['D', 'F'], duration: 5 },
  { id: 'J', name: 'Integrar ingredientes y formar la masa', predecessors: ['H', 'I'], duration: 7 },
  { id: 'K', name: 'Reposar la masa', predecessors: ['J'], duration: 10 },
  { id: 'L', name: 'Preparar bandejas', predecessors: ['D'], duration: 6 },
  { id: 'M', name: 'Porcionar y moldear las galletas', predecessors: ['K', 'L'], duration: 12 },
  { id: 'N', name: 'Hornear las galletas', predecessors: ['M', 'G'], duration: 15 },
  { id: 'O', name: 'Enfriar las galletas', predecessors: ['N'], duration: 12 },
  { id: 'P', name: 'Inspeccionar calidad', predecessors: ['O'], duration: 5 },
  { id: 'Q', name: 'Empacar las galletas', predecessors: ['P'], duration: 9 },
  { id: 'R', name: 'Etiquetar los paquetes', predecessors: ['Q'], duration: 4 },
  { id: 'S', name: 'Entregar el lote a despacho', predecessors: ['R'], duration: 5 },
];

export const ROUTE_PATHS = [
  ['C', 'E', 'H', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
  ['C', 'D', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
  ['C', 'F', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
  ['B', 'E', 'H', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
  ['A', 'E', 'H', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
  ['B', 'F', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
  ['A', 'F', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
  ['C', 'D', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
  ['C', 'D', 'G', 'N', 'O', 'P', 'Q', 'R', 'S'],
].map((sequence, index) => ({ id: index + 1, sequence }));

export const PERT_ESTIMATES = [
  { id: 'A', optimistic: 4, mostLikely: 5, pessimistic: 8 },
  { id: 'B', optimistic: 4, mostLikely: 6, pessimistic: 9 },
  { id: 'C', optimistic: 6, mostLikely: 8, pessimistic: 11 },
  { id: 'D', optimistic: 4, mostLikely: 5, pessimistic: 7 },
  { id: 'E', optimistic: 5, mostLikely: 7, pessimistic: 10 },
  { id: 'F', optimistic: 4, mostLikely: 5, pessimistic: 8 },
  { id: 'G', optimistic: 10, mostLikely: 12, pessimistic: 16 },
  { id: 'H', optimistic: 3, mostLikely: 4, pessimistic: 6 },
  { id: 'I', optimistic: 4, mostLikely: 5, pessimistic: 7 },
  { id: 'J', optimistic: 6, mostLikely: 7, pessimistic: 10 },
  { id: 'K', optimistic: 9, mostLikely: 10, pessimistic: 13 },
  { id: 'L', optimistic: 4, mostLikely: 6, pessimistic: 8 },
  { id: 'M', optimistic: 10, mostLikely: 12, pessimistic: 16 },
  { id: 'N', optimistic: 14, mostLikely: 15, pessimistic: 19 },
  { id: 'O', optimistic: 10, mostLikely: 12, pessimistic: 15 },
  { id: 'P', optimistic: 4, mostLikely: 5, pessimistic: 7 },
  { id: 'Q', optimistic: 7, mostLikely: 9, pessimistic: 12 },
  { id: 'R', optimistic: 3, mostLikely: 4, pessimistic: 6 },
  { id: 'S', optimistic: 4, mostLikely: 5, pessimistic: 7 },
];

const COST_ESTIMATES = [
  ['A', 1200, 5, 1200],
  ['B', 1800, 6, 1800],
  ['C', 2500, 7, 3300],
  ['D', 1300, 5, 1300],
  ['E', 2100, 6, 2700],
  ['F', 1500, 5, 1500],
  ['G', 2400, 12, 2400],
  ['H', 1400, 3, 1900],
  ['I', 1800, 5, 1800],
  ['J', 2600, 6, 3300],
  ['K', 1200, 10, 1200],
  ['L', 1500, 5, 2000],
  ['M', 4300, 10, 6100],
  ['N', 5500, 15, 5500],
  ['O', 1000, 12, 1000],
  ['P', 1300, 4, 1800],
  ['Q', 3300, 7, 4700],
  ['R', 900, 3, 1300],
  ['S', 1200, 4, 1600],
];

export const COST_ESTIMATES_BY_ID = new Map(
  COST_ESTIMATES.map(([id, normalCost, crashDuration, crashCost]) => {
    const activity = ROUTE_ACTIVITIES.find((item) => item.id === id);
    const reductionLimit = activity.duration - crashDuration;
    return [id, {
      normalCost,
      crashDuration,
      crashCost,
      reductionLimit,
      slope: reductionLimit ? (crashCost - normalCost) / reductionLimit : null,
    }];
  }),
);

export const NORMAL_DIRECT_COST = ROUTE_ACTIVITIES.reduce(
  (total, activity) => total + COST_ESTIMATES_BY_ID.get(activity.id).normalCost,
  0,
);

export function calculateRouteAnalysis(activities = ROUTE_ACTIVITIES, paths = ROUTE_PATHS) {
  const byId = new Map(activities.map((activity) => [activity.id, activity]));
  const successors = new Map(activities.map(({ id }) => [id, []]));
  const times = new Map();

  activities.forEach((activity) => {
    activity.predecessors.forEach((predecessor) => {
      successors.get(predecessor)?.push(activity.id);
    });
    const earliestStart = activity.predecessors.reduce(
      (latest, predecessor) => Math.max(latest, times.get(predecessor)?.earliestFinish ?? 0),
      0,
    );
    times.set(activity.id, {
      earliestStart,
      earliestFinish: earliestStart + activity.duration,
    });
  });

  const projectDuration = Math.max(...[...times.values()].map(({ earliestFinish }) => earliestFinish));

  [...activities].reverse().forEach((activity) => {
    const activitySuccessors = successors.get(activity.id);
    const latestFinish = activitySuccessors.length
      ? Math.min(...activitySuccessors.map((successor) => times.get(successor).latestStart))
      : projectDuration;
    const latestStart = latestFinish - activity.duration;
    const current = times.get(activity.id);
    times.set(activity.id, {
      ...current,
      latestStart,
      latestFinish,
      slack: latestStart - current.earliestStart,
    });
  });

  const calculatedActivities = activities.map((activity) => ({
    ...activity,
    successors: successors.get(activity.id),
    ...times.get(activity.id),
  }));
  const calculatedPaths = paths.map((path) => ({
    ...path,
    duration: path.sequence.reduce((total, id) => total + byId.get(id).duration, 0),
  }));
  const criticalPaths = calculatedPaths.filter(({ duration }) => Math.abs(duration - projectDuration) < 1e-8);
  const criticalActivities = [...new Set(criticalPaths.flatMap(({ sequence }) => sequence))];

  return {
    activities: calculatedActivities,
    paths: calculatedPaths,
    criticalPaths,
    projectDuration,
    criticalActivities,
  };
}

export const ROUTE_ANALYSIS = calculateRouteAnalysis();

const PERT_ACTIVITIES = ROUTE_ACTIVITIES.map((activity) => {
  const estimate = PERT_ESTIMATES.find(({ id }) => id === activity.id);
  const expectedDuration = (estimate.optimistic + 4 * estimate.mostLikely + estimate.pessimistic) / 6;
  const variance = ((estimate.pessimistic - estimate.optimistic) / 6) ** 2;
  return { ...activity, duration: expectedDuration, ...estimate, variance };
});

export const PERT_ANALYSIS = calculateRouteAnalysis(PERT_ACTIVITIES);
export const PERT_CRITICAL_VARIANCE = PERT_ANALYSIS.criticalActivities.reduce(
  (total, id) => total + PERT_ACTIVITIES.find((activity) => activity.id === id).variance,
  0,
);
export const PERT_STANDARD_DEVIATION = Math.sqrt(PERT_CRITICAL_VARIANCE);

const CRASH_STEPS = [
  { activityId: 'S', from: 5, to: 4 },
  { activityId: 'R', from: 4, to: 3 },
  { activityId: 'P', from: 5, to: 4 },
  { activityId: 'H', from: 4, to: 3 },
  { activityId: 'Q', from: 9, to: 8 },
  { activityId: 'Q', from: 8, to: 7 },
  { activityId: 'J', from: 7, to: 6 },
  { activityId: 'C', from: 8, to: 7 },
  { activityId: 'M', from: 12, to: 11 },
  { activityId: 'M', from: 11, to: 10 },
];

export const CRASH_PROGRAMS = (() => {
  const programs = [];
  const reducedByActivity = new Map();
  let totalCost = NORMAL_DIRECT_COST;
  let previousChange = 'Ninguno';

  for (let index = 0; index <= CRASH_STEPS.length; index += 1) {
    const activities = ROUTE_ACTIVITIES.map((activity) => ({
      ...activity,
      duration: activity.duration - (reducedByActivity.get(activity.id) ?? 0),
    }));
    const analysis = calculateRouteAnalysis(activities);
    programs.push({
      id: index + 1,
      time: analysis.projectDuration,
      cost: totalCost,
      change: previousChange,
      analysis,
      activities,
    });

    const step = CRASH_STEPS[index];
    if (step) {
      const { slope } = COST_ESTIMATES_BY_ID.get(step.activityId);
      reducedByActivity.set(step.activityId, (reducedByActivity.get(step.activityId) ?? 0) + 1);
      totalCost += slope;
      previousChange = `${step.activityId} (${step.from}→${step.to})`;
    }
  }

  return programs;
})();
