import { DECISION_META } from './params.js';

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function cellPayoff(params, qty, demand) {
  return params.price * Math.min(qty, demand) - params.cost * qty;
}

export function productionMatrix(params) {
  const qtys = [params.d1, params.d2, params.d3];
  const demands = [params.s1, params.s2];
  return qtys.map((qty) => demands.map((demand) => cellPayoff(params, qty, demand)));
}

export function expectedValue(row, pS1) {
  return pS1 * row[0] + (1 - pS1) * row[1];
}

export function expectedValues(matrix, pS1) {
  return matrix.map((row) => expectedValue(row, pS1));
}

export function argMax(values) {
  let idx = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] > values[idx]) idx = i;
  }
  return idx;
}

export function argMin(values) {
  let idx = 0;
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < values[idx]) idx = i;
  }
  return idx;
}

function crossing(rowA, rowB) {
  const num = rowB[1] - rowA[1];
  const den = rowA[0] - rowA[1] - rowB[0] + rowB[1];
  if (Math.abs(den) < 1e-12) return null;
  const p = num / den;
  if (p < -1e-9 || p > 1 + 1e-9) return null;
  return Math.min(1, Math.max(0, p));
}

export function criteriaWithoutProbability(matrix) {
  const rowMax = matrix.map((row) => Math.max(...row));
  const rowMin = matrix.map((row) => Math.min(...row));
  const optimisticIdx = argMax(rowMax);
  const conservativeIdx = argMax(rowMin);

  const bestS = [Math.max(...matrix.map((r) => r[0])), Math.max(...matrix.map((r) => r[1]))];
  const regret = matrix.map((row) => [bestS[0] - row[0], bestS[1] - row[1]]);
  const regretMax = regret.map((row) => Math.max(...row));
  const regretIdx = argMin(regretMax);

  return {
    optimistic: { index: optimisticIdx, id: DECISION_META[optimisticIdx].id, value: rowMax[optimisticIdx] },
    conservative: { index: conservativeIdx, id: DECISION_META[conservativeIdx].id, value: rowMin[conservativeIdx] },
    regret: {
      index: regretIdx,
      id: DECISION_META[regretIdx].id,
      value: regretMax[regretIdx],
      table: regret,
      rowMax: regretMax,
    },
  };
}

export function sensitivityAnalysis(matrix, pS1) {
  const evs = expectedValues(matrix, pS1);
  const bestIdx = argMax(evs);
  const crossings = {
    d1d2: crossing(matrix[0], matrix[1]),
    d1d3: crossing(matrix[0], matrix[2]),
    d2d3: crossing(matrix[1], matrix[2]),
  };
  const critical = crossings.d1d3 ?? crossings.d1d2 ?? crossings.d2d3;

  const chartData = [];
  for (let i = 0; i <= 100; i += 5) {
    const p = i / 100;
    const ev = expectedValues(matrix, p);
    chartData.push({
      probabilidad: p,
      d1: ev[0],
      d2: ev[1],
      d3: ev[2],
    });
  }

  const equations = matrix.map((row) => {
    const intercept = row[1];
    const slope = row[0] - row[1];
    return { intercept, slope, atP: (p) => slope * p + intercept };
  });

  return {
    evs,
    bestIdx,
    bestId: DECISION_META[bestIdx].id,
    bestValue: evs[bestIdx],
    crossings,
    critical,
    chartData,
    equations,
    crossed: critical != null && pS1 >= critical - 1e-9,
  };
}

export function bayesAnalysis(params, matrix) {
  const pS1 = params.pS1;
  const pS2 = 1 - pS1;
  const pF_S1 = params.pFGivenS1;
  const pF_S2 = params.pFGivenS2;
  const pU_S1 = 1 - pF_S1;
  const pU_S2 = 1 - pF_S2;

  const pF = pS1 * pF_S1 + pS2 * pF_S2;
  const pU = pS1 * pU_S1 + pS2 * pU_S2;

  const pS1_F = pF > 0 ? (pS1 * pF_S1) / pF : 0;
  const pS2_F = pF > 0 ? (pS2 * pF_S2) / pF : 0;
  const pS1_U = pU > 0 ? (pS1 * pU_S1) / pU : 0;
  const pS2_U = pU > 0 ? (pS2 * pU_S2) / pU : 0;

  const evNoStudy = expectedValues(matrix, pS1);
  const noStudyIdx = argMax(evNoStudy);

  const evF = expectedValues(matrix, pS1_F);
  const evU = expectedValues(matrix, pS1_U);
  const fIdx = argMax(evF);
  const uIdx = argMax(evU);

  const veod = pF * evF[fIdx] + pU * evU[uIdx];
  const ve = evNoStudy[noStudyIdx];

  const bestS1 = Math.max(...matrix.map((r) => r[0]));
  const bestS2 = Math.max(...matrix.map((r) => r[1]));
  const veip = pS1 * bestS1 + pS2 * bestS2;
  const veipDelta = veip - ve;
  const ivem = veod - ve;
  const efficiency = veipDelta !== 0 ? ivem / veipDelta : 0;

  return {
    pF,
    pU,
    pF_S1,
    pF_S2,
    pU_S1,
    pU_S2,
    pS1_F,
    pS2_F,
    pS1_U,
    pS2_U,
    evNoStudy,
    noStudyIdx,
    noStudyId: DECISION_META[noStudyIdx].id,
    ve,
    evF,
    evU,
    fIdx,
    fId: DECISION_META[fIdx].id,
    uIdx,
    uId: DECISION_META[uIdx].id,
    veod,
    veip,
    veipDelta,
    ivem,
    efficiency,
  };
}

export function saddlePoint(matrix) {
  const rowMin = matrix.map((row) => Math.min(...row));
  const maximin = Math.max(...rowMin);
  const maximinIdx = argMax(rowMin);

  const colCount = matrix[0].length;
  const colMax = Array.from({ length: colCount }, (_, j) => Math.max(...matrix.map((row) => row[j])));
  const minimax = Math.min(...colMax);
  const minimaxCol = argMin(colMax);

  const hasSaddle = Math.abs(maximin - minimax) < 1e-9;
  let cell = null;
  if (hasSaddle) {
    for (let i = 0; i < matrix.length; i += 1) {
      for (let j = 0; j < colCount; j += 1) {
        if (Math.abs(matrix[i][j] - maximin) < 1e-9 && Math.abs(rowMin[i] - maximin) < 1e-9 && Math.abs(colMax[j] - minimax) < 1e-9) {
          cell = { i, j, value: matrix[i][j] };
          break;
        }
      }
      if (cell) break;
    }
  }

  return {
    rowMin,
    colMax,
    maximin,
    maximinIdx,
    minimax,
    minimaxCol,
    hasSaddle,
    cell,
  };
}

export function mixed2x2(matrix) {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];
  const saddle = saddlePoint(matrix);
  const denP = a - c - b + d;
  const denQ = a - b - c + d;
  const p = Math.abs(denP) < 1e-12 ? null : (d - c) / denP;
  const q = Math.abs(denQ) < 1e-12 ? null : (d - b) / denQ;
  const pClamped = p == null ? null : Math.min(1, Math.max(0, p));
  const qClamped = q == null ? null : Math.min(1, Math.max(0, q));
  let value = null;
  if (pClamped != null) {
    value = pClamped * a + (1 - pClamped) * c;
  }
  return {
    a, b, c, d,
    p: pClamped,
    q: qClamped,
    value,
    saddle,
    validMix: pClamped != null && qClamped != null && pClamped > 0 && pClamped < 1,
  };
}

export function nfgPure(matrix) {
  const lines = [
    'NFG 1 R "Chips Bakery vs Mercado" { "Chips Bakery" "Mercado" } { { "d1" "d2" "d3" } { "S1 (Baja)" "S2 (Alta)" } }',
  ];
  for (let j = 0; j < 2; j += 1) {
    for (let i = 0; i < 3; i += 1) {
      const v = round2(matrix[i][j]);
      lines.push(`${v} ${-v}`);
    }
  }
  return lines.join('\n');
}

export function nfgMixed(matrix) {
  const lines = [
    'NFG 1 R "Chips Bakery - Estrategia Mixta" { "Chips Bakery" "Mercado" } { { "d2 (250g)" "d3 (400g)" } { "S1 (Baja)" "S2 (Alta)" } }',
  ];
  for (let j = 0; j < 2; j += 1) {
    for (let i = 0; i < 2; i += 1) {
      const v = round2(matrix[i][j]);
      lines.push(`${v} ${-v}`);
    }
  }
  return lines.join('\n');
}

export function historyRows(history, params) {
  return history.map((row) => {
    const sold = Math.min(row.di, row.demand);
    const leftover = Math.max(0, row.di - row.demand);
    const rev = params.price * sold;
    const cost = params.cost * row.di;
    const profit = rev - cost;
    const low = row.demand <= params.s1;
    return { ...row, sold, leftover, rev, cost, profit, low };
  });
}

export function frequencyFromHistory(history, params) {
  const nBaja = history.filter((row) => row.demand <= params.s1).length;
  const n = history.length || 1;
  return {
    nBaja,
    nAlta: n - nBaja,
    n,
    pS1: nBaja / n,
  };
}

export function analyze({ params, history, mixedMatrix, gameOverride }) {
  const matrix = productionMatrix(params);
  const gameMatrix = gameOverride ?? matrix;
  const evs = expectedValues(matrix, params.pS1);
  const bestIdx = argMax(evs);
  const crit = criteriaWithoutProbability(matrix);
  const sensitivity = sensitivityAnalysis(matrix, params.pS1);
  const bayes = bayesAnalysis(params, matrix);
  const saddle = saddlePoint(gameMatrix);
  const mixed = mixed2x2(mixedMatrix);
  const rows = historyRows(history, params);
  const freq = frequencyFromHistory(history, params);

  const decisions = DECISION_META.map((meta, i) => ({
    ...meta,
    qty: params[meta.qtyKey],
    payoffs: matrix[i],
    ev: evs[i],
  }));

  return {
    matrix,
    gameMatrix,
    decisions,
    evs,
    bestIdx,
    bestId: DECISION_META[bestIdx].id,
    bestEv: evs[bestIdx],
    criteria: crit,
    sensitivity,
    bayes,
    saddle,
    mixed,
    nfgPure: nfgPure(gameMatrix),
    nfgMixed: nfgMixed(mixedMatrix),
    historyRows: rows,
    frequencies: freq,
    pS2: 1 - params.pS1,
    margin: params.price - params.cost,
  };
}
