import { iterativeDominance, mixed2x2 } from './engine.js';

export const COMPETITIVE_STRATEGIES = ['Descuento', 'Combo', 'Obsequio'];

export const COMPETITIVE_PAYOFF_MATRIX = [
  [10, -20, 30],
  [20, -10, 40],
  [-5, 40, 60],
];

export const COMPETITIVE_DOMINANCE = iterativeDominance(
  COMPETITIVE_PAYOFF_MATRIX,
  COMPETITIVE_STRATEGIES,
  COMPETITIVE_STRATEGIES,
);

export const COMPETITIVE_MIXED = mixed2x2(COMPETITIVE_DOMINANCE.remaining.matrix);

const BASE_CUSTOMERS = 100;

// [prueba, estrategia Chips, estrategia competidora, clientes Chips,
//  clientes competidora, promedio Chips, promedio competidora, cambio promedio Chips]
const CUSTOMER_TRIAL_DATA = [
  [1, 'Descuento', 'Descuento', 106, 94, 110, 90, 10],
  [2, 'Descuento', 'Combo', 82, 118, 80, 120, -20],
  [3, 'Descuento', 'Obsequio', 139, 61, 130, 70, 30],
  [4, 'Combo', 'Descuento', 133, 67, 120, 80, 20],
  [5, 'Combo', 'Combo', 81, 119, 90, 110, -10],
  [6, 'Combo', 'Obsequio', 142, 58, 140, 60, 40],
  [7, 'Obsequio', 'Descuento', 86, 114, 95, 105, -5],
  [8, 'Obsequio', 'Combo', 149, 51, 140, 60, 40],
  [9, 'Obsequio', 'Obsequio', 159, 41, 160, 40, 60],
  [10, 'Descuento', 'Obsequio', 129, 71, 130, 70, 30],
  [11, 'Combo', 'Descuento', 108, 92, 120, 80, 20],
  [12, 'Combo', 'Combo', 92, 108, 90, 110, -10],
  [13, 'Combo', 'Obsequio', 133, 67, 140, 60, 40],
  [14, 'Obsequio', 'Descuento', 91, 109, 95, 105, -5],
  [15, 'Obsequio', 'Combo', 136, 64, 140, 60, 40],
  [16, 'Obsequio', 'Obsequio', 153, 47, 160, 40, 60],
  [17, 'Descuento', 'Descuento', 116, 84, 110, 90, 10],
  [18, 'Descuento', 'Combo', 68, 132, 80, 120, -20],
  [19, 'Combo', 'Combo', 99, 101, 90, 110, -10],
  [20, 'Combo', 'Obsequio', 146, 54, 140, 60, 40],
  [21, 'Obsequio', 'Descuento', 101, 99, 95, 105, -5],
  [22, 'Obsequio', 'Combo', 142, 58, 140, 60, 40],
  [23, 'Obsequio', 'Obsequio', 162, 38, 160, 40, 60],
  [24, 'Descuento', 'Descuento', 113, 87, 110, 90, 10],
  [25, 'Descuento', 'Combo', 71, 129, 80, 120, -20],
  [26, 'Descuento', 'Obsequio', 133, 67, 130, 70, 30],
  [27, 'Combo', 'Descuento', 111, 89, 120, 80, 20],
  [28, 'Obsequio', 'Descuento', 94, 106, 95, 105, -5],
  [29, 'Obsequio', 'Combo', 128, 72, 140, 60, 40],
  [30, 'Obsequio', 'Obsequio', 173, 27, 160, 40, 60],
  [31, 'Descuento', 'Descuento', 103, 97, 110, 90, 10],
  [32, 'Descuento', 'Combo', 73, 127, 80, 120, -20],
  [33, 'Descuento', 'Obsequio', 123, 77, 130, 70, 30],
  [34, 'Combo', 'Descuento', 126, 74, 120, 80, 20],
  [35, 'Combo', 'Combo', 86, 114, 90, 110, -10],
  [36, 'Combo', 'Obsequio', 139, 61, 140, 60, 40],
  [37, 'Obsequio', 'Obsequio', 151, 49, 160, 40, 60],
  [38, 'Descuento', 'Descuento', 112, 88, 110, 90, 10],
  [39, 'Descuento', 'Combo', 93, 107, 80, 120, -20],
  [40, 'Descuento', 'Obsequio', 121, 79, 130, 70, 30],
  [41, 'Combo', 'Descuento', 122, 78, 120, 80, 20],
  [42, 'Combo', 'Combo', 89, 111, 90, 110, -10],
  [43, 'Combo', 'Obsequio', 153, 47, 140, 60, 40],
  [44, 'Obsequio', 'Descuento', 98, 102, 95, 105, -5],
  [45, 'Obsequio', 'Combo', 131, 69, 140, 60, 40],
  [46, 'Descuento', 'Combo', 89, 111, 80, 120, -20],
  [47, 'Descuento', 'Obsequio', 118, 82, 130, 70, 30],
  [48, 'Combo', 'Descuento', 113, 87, 120, 80, 20],
  [49, 'Combo', 'Combo', 96, 104, 90, 110, -10],
  [50, 'Combo', 'Obsequio', 128, 72, 140, 60, 40],
  [51, 'Obsequio', 'Descuento', 97, 103, 95, 105, -5],
  [52, 'Obsequio', 'Combo', 146, 54, 140, 60, 40],
  [53, 'Obsequio', 'Obsequio', 169, 31, 160, 40, 60],
  [54, 'Descuento', 'Descuento', 119, 81, 110, 90, 10],
  [55, 'Combo', 'Descuento', 116, 84, 120, 80, 20],
  [56, 'Combo', 'Combo', 93, 107, 90, 110, -10],
  [57, 'Combo', 'Obsequio', 149, 51, 140, 60, 40],
  [58, 'Obsequio', 'Descuento', 108, 92, 95, 105, -5],
  [59, 'Obsequio', 'Combo', 133, 67, 140, 60, 40],
  [60, 'Obsequio', 'Obsequio', 148, 52, 160, 40, 60],
  [61, 'Descuento', 'Descuento', 98, 102, 110, 90, 10],
  [62, 'Descuento', 'Combo', 79, 121, 80, 120, -20],
  [63, 'Descuento', 'Obsequio', 136, 64, 130, 70, 30],
  [64, 'Combo', 'Obsequio', 143, 57, 140, 60, 40],
  [65, 'Obsequio', 'Descuento', 83, 117, 95, 105, -5],
  [66, 'Obsequio', 'Combo', 139, 61, 140, 60, 40],
  [67, 'Obsequio', 'Obsequio', 156, 44, 160, 40, 60],
  [68, 'Descuento', 'Descuento', 123, 77, 110, 90, 10],
  [69, 'Descuento', 'Combo', 76, 124, 80, 120, -20],
  [70, 'Descuento', 'Obsequio', 143, 57, 130, 70, 30],
  [71, 'Combo', 'Descuento', 119, 81, 120, 80, 20],
  [72, 'Combo', 'Combo', 103, 97, 90, 110, -10],
  [73, 'Obsequio', 'Combo', 143, 57, 140, 60, 40],
  [74, 'Obsequio', 'Obsequio', 166, 34, 160, 40, 60],
  [75, 'Descuento', 'Descuento', 101, 99, 110, 90, 10],
  [76, 'Descuento', 'Combo', 83, 117, 80, 120, -20],
  [77, 'Descuento', 'Obsequio', 132, 68, 130, 70, 30],
  [78, 'Combo', 'Descuento', 123, 77, 120, 80, 20],
  [79, 'Combo', 'Combo', 78, 122, 90, 110, -10],
  [80, 'Combo', 'Obsequio', 131, 69, 140, 60, 40],
  [81, 'Obsequio', 'Descuento', 88, 112, 95, 105, -5],
  [82, 'Descuento', 'Descuento', 109, 91, 110, 90, 10],
  [83, 'Descuento', 'Combo', 86, 114, 80, 120, -20],
  [84, 'Descuento', 'Obsequio', 126, 74, 130, 70, 30],
  [85, 'Combo', 'Descuento', 129, 71, 120, 80, 20],
  [86, 'Combo', 'Combo', 83, 117, 90, 110, -10],
  [87, 'Combo', 'Obsequio', 136, 64, 140, 60, 40],
  [88, 'Obsequio', 'Descuento', 104, 96, 95, 105, -5],
  [89, 'Obsequio', 'Combo', 153, 47, 140, 60, 40],
  [90, 'Obsequio', 'Obsequio', 163, 37, 160, 40, 60],
];

export const CUSTOMER_TRIALS = CUSTOMER_TRIAL_DATA.map(([
  trial,
  chipsStrategy,
  competitorStrategy,
  chipsCustomers,
  competitorCustomers,
  chipsAverage,
  competitorAverage,
  chipsAverageChange,
]) => ({
  trial,
  chipsStrategy,
  competitorStrategy,
  chipsBase: BASE_CUSTOMERS,
  competitorBase: BASE_CUSTOMERS,
  chipsCustomers,
  competitorCustomers,
  chipsAverage,
  competitorAverage,
  chipsAverageChange,
}));

function average(records, key) {
  return records.reduce((total, record) => total + record[key], 0) / records.length;
}

export function summarizeCustomerTrials(records = CUSTOMER_TRIALS) {
  const byStrategy = COMPETITIVE_STRATEGIES.flatMap((chipsStrategy) =>
    COMPETITIVE_STRATEGIES.map((competitorStrategy) => {
      const matching = records.filter(
        (record) => record.chipsStrategy === chipsStrategy
          && record.competitorStrategy === competitorStrategy,
      );
      return {
        chipsStrategy,
        competitorStrategy,
        count: matching.length,
        chipsCustomers: matching.length ? average(matching, 'chipsCustomers') : null,
        competitorCustomers: matching.length ? average(matching, 'competitorCustomers') : null,
      };
    }),
  );

  return {
    count: records.length,
    averages: {
      chipsCustomers: average(records, 'chipsCustomers'),
      competitorCustomers: average(records, 'competitorCustomers'),
      chipsAverage: average(records, 'chipsAverage'),
      competitorAverage: average(records, 'competitorAverage'),
      chipsAverageChange: average(records, 'chipsAverageChange'),
    },
    byStrategy,
  };
}
