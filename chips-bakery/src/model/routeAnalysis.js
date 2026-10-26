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
  { id: 1, sequence: ['C', 'E', 'H', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'] },
  { id: 2, sequence: ['C', 'D', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'] },
  { id: 3, sequence: ['B', 'E', 'H', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'] },
  { id: 4, sequence: ['A', 'E', 'H', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'] },
  { id: 5, sequence: ['C', 'D', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'] },
  { id: 6, sequence: ['C', 'D', 'G', 'N', 'O', 'P', 'Q', 'R', 'S'] },
];

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
    const latestFinish = successors.get(activity.id).length
      ? Math.min(...successors.get(activity.id).map((successor) => times.get(successor).latestStart))
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
  const criticalActivities = calculatedActivities
    .filter((activity) => Math.abs(activity.slack) < 1e-9)
    .map((activity) => activity.id);
  const calculatedPaths = paths.map((path) => ({
    ...path,
    duration: path.sequence.reduce((total, id) => total + byId.get(id).duration, 0),
  }));

  return {
    activities: calculatedActivities,
    paths: calculatedPaths,
    projectDuration,
    criticalActivities,
  };
}

export const ROUTE_ANALYSIS = calculateRouteAnalysis();
