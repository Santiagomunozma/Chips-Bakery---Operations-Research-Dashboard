export const DEFAULT_PARAMS = {
  price: 5,
  cost: 3,
  d1: 100,
  d2: 250,
  d3: 400,
  s1: 100,
  s2: 400,
  pS1: 0.3,
  pFGivenS1: 0.2,
  pFGivenS2: 0.8,
};

export const DEFAULT_HISTORY = [
  { month: 1, di: 100, demand: 100 },
  { month: 2, di: 250, demand: 250 },
  { month: 3, di: 400, demand: 400 },
  { month: 4, di: 250, demand: 100 },
  { month: 5, di: 400, demand: 400 },
  { month: 6, di: 400, demand: 100 },
  { month: 7, di: 250, demand: 250 },
  { month: 8, di: 400, demand: 400 },
  { month: 9, di: 250, demand: 250 },
  { month: 10, di: 400, demand: 400 },
];

/** Escenario extremo Gambit (d2 vs d3), no sale de la matriz de producción. */
export const DEFAULT_MIXED_MATRIX = [
  [300, 100],
  [-100, 600],
];

export const PRESETS = {
  base: {
    label: 'Caso base 30/70',
    params: { pS1: 0.3 },
  },
  vias: {
    label: 'Baja afluencia (obras frente al local)',
    params: { pS1: 0.7 },
  },
};

/** Caso de clase 8: M/M/2, λ = 0.75 clientes/min, μ = 1 por canal. */
export const DEFAULT_QUEUE = {
  lambda: 0.75,
  mu: 1,
  c: 2,
  n: 5,
  x: 0,
  t: 1,
};

/**
 * Muestra fija de la ventanilla. 180 llegadas en 240 minutos → λ = 0.75.
 * La media de los tiempos de servicio es 1 minuto → μ = 1 por canal.
 */
export const QUEUE_SAMPLE = {
  minutes: 240,
  arrivals: 180,
  windows: [
    { day: 'Sábado 4 oct', slot: '10:00–10:30', minutes: 30, arrivals: 22 },
    { day: 'Sábado 4 oct', slot: '10:30–11:00', minutes: 30, arrivals: 24 },
    { day: 'Sábado 4 oct', slot: '11:00–11:30', minutes: 30, arrivals: 21 },
    { day: 'Sábado 4 oct', slot: '11:30–12:00', minutes: 30, arrivals: 23 },
    { day: 'Sábado 11 oct', slot: '10:00–10:30', minutes: 30, arrivals: 20 },
    { day: 'Sábado 11 oct', slot: '10:30–11:00', minutes: 30, arrivals: 25 },
    { day: 'Sábado 11 oct', slot: '11:00–11:30', minutes: 30, arrivals: 23 },
    { day: 'Sábado 11 oct', slot: '11:30–12:00', minutes: 30, arrivals: 22 },
  ],
  serviceTimes: [0.4, 0.6, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 0.7, 1.5, 0.5, 1.3, 0.8, 1.0, 1.6, 0.9, 1.1, 0.6, 1.2, 1.4],
};

export const DECISION_META = [
  { id: 'd1', key: 'd1', label: 'd1: Producir 100', short: 'd1', qtyKey: 'd1' },
  { id: 'd2', key: 'd2', label: 'd2: Producir 250', short: 'd2', qtyKey: 'd2' },
  { id: 'd3', key: 'd3', label: 'd3: Producir 400', short: 'd3', qtyKey: 'd3' },
];
