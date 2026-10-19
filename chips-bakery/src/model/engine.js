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

export function fmtN(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  const r4 = Math.round(n * 10000) / 10000;
  if (Math.abs(n - Math.round(n * 100) / 100) > 1e-6) return String(r4);
  return String(Math.round(n * 100) / 100);
}

function paren(n) {
  return n < 0 ? `(${fmtN(n)})` : fmtN(n);
}

export function lineEquation(slope, intercept, xName = 'q') {
  if (Math.abs(slope) < 1e-12) return fmtN(intercept);
  const absS = fmtN(Math.abs(slope));
  const slopePart = slope < 0 ? `− ${absS}${xName}` : `${absS}${xName}`;
  if (Math.abs(intercept) < 1e-12) return slope < 0 ? `−${absS}${xName}` : `${absS}${xName}`;
  if (slope < 0) return `${fmtN(intercept)} ${slopePart}`;
  return `${fmtN(intercept)} + ${slopePart}`;
}

function submatrix(matrix, rowIdx, colIdx) {
  return rowIdx.map((i) => colIdx.map((j) => matrix[i][j]));
}

function rowDominates(rowA, rowB) {
  let ge = true;
  let gt = false;
  let st = true;
  for (let j = 0; j < rowA.length; j += 1) {
    if (rowA[j] < rowB[j] - 1e-12) ge = false;
    if (rowA[j] > rowB[j] + 1e-12) gt = true;
    if (rowA[j] <= rowB[j] + 1e-12) st = false;
  }
  if (!ge || !gt) return null;
  return st ? 'estricta' : 'débil';
}

function colDominates(colA, colB) {
  let le = true;
  let lt = false;
  let st = true;
  for (let i = 0; i < colA.length; i += 1) {
    if (colA[i] > colB[i] + 1e-12) le = false;
    if (colA[i] < colB[i] - 1e-12) lt = true;
    if (colA[i] >= colB[i] - 1e-12) st = false;
  }
  if (!le || !lt) return null;
  return st ? 'estricta' : 'débil';
}

function columnOf(matrix, j) {
  return matrix.map((row) => row[j]);
}

export function saddleAlgebra(matrix, rowLabels, colLabels, saddle = null) {
  const s = saddle ?? saddlePoint(matrix);
  const steps = [];
  steps.push({
    title: 'Mínimo de cada fila (Chips, maximin)',
    lines: matrix.map((row, i) => {
      const shown = row.map(fmtN).join(', ');
      return `${rowLabels[i]}: min(${shown}) = ${fmtN(s.rowMin[i])}`;
    }),
  });
  steps.push({
    title: 'Maximin',
    lines: [
      `max{${s.rowMin.map(fmtN).join(', ')}} = ${fmtN(s.maximin)}`,
      `La mejor garantía en estrategia pura es ${rowLabels[s.maximinIdx]}.`,
    ],
  });
  steps.push({
    title: 'Máximo de cada columna (Mercado, minimax)',
    lines: colLabels.map((lab, j) => {
      const vals = matrix.map((row) => fmtN(row[j])).join(', ');
      return `${lab}: max(${vals}) = ${fmtN(s.colMax[j])}`;
    }),
  });
  steps.push({
    title: 'Minimax',
    lines: [
      `min{${s.colMax.map(fmtN).join(', ')}} = ${fmtN(s.minimax)}`,
      `La amenaza más barata para el mercado es ${colLabels[s.minimaxCol]}.`,
    ],
  });
  if (s.hasSaddle) {
    const cellLab = s.cell
      ? `${rowLabels[s.cell.i]} contra ${colLabels[s.cell.j]}`
      : `${rowLabels[s.maximinIdx]} contra ${colLabels[s.minimaxCol]}`;
    steps.push({
      title: 'Comparación: hay punto de silla',
      lines: [
        `Maximin = ${fmtN(s.maximin)} = Minimax = ${fmtN(s.minimax)}.`,
        `Equilibrio en estrategias puras: ${cellLab}.`,
        `Valor del juego v* = ${fmtN(s.cell?.value ?? s.maximin)}.`,
      ],
    });
  } else {
    steps.push({
      title: 'Comparación: no hay punto de silla',
      lines: [
        `Maximin = ${fmtN(s.maximin)} ≠ Minimax = ${fmtN(s.minimax)}.`,
        'Ninguna celda es a la vez mínimo de su fila y máximo de su columna.',
        'Hace falta reducir por dominancia y, si el residual no tiene silla, estrategia mixta.',
      ],
    });
  }
  return steps;
}

function snapshotOf(matrix, rowIdx, colIdx, rowLabels, colLabels) {
  return {
    matrix: submatrix(matrix, rowIdx, colIdx),
    rowIdx: [...rowIdx],
    colIdx: [...colIdx],
    rowLabels: rowIdx.map((i) => rowLabels[i]),
    colLabels: colIdx.map((j) => colLabels[j]),
  };
}

function findDominanceMove(reduced, rowLabs, colLabs) {
  const m = reduced.length;
  const n = reduced[0].length;
  const tries = [
    { kind: 'estricta', rows: true },
    { kind: 'estricta', rows: false },
    { kind: 'débil', rows: true },
    { kind: 'débil', rows: false },
  ];
  for (const trySpec of tries) {
    if (trySpec.rows) {
      for (let i = 0; i < m; i += 1) {
        for (let k = 0; k < m; k += 1) {
          if (i === k) continue;
          const t = rowDominates(reduced[i], reduced[k]);
          if (t !== trySpec.kind) continue;
          const comps = reduced[i].map((v, j) => `${fmtN(v)} ${v > reduced[k][j] + 1e-12 ? '>' : '≥'} ${fmtN(reduced[k][j])} (${colLabs[j]})`);
          return {
            player: 'fila',
            type: t,
            keeper: i,
            drop: k,
            title: `${rowLabs[i]} domina ${t === 'estricta' ? 'estrictamente' : 'débilmente'} a ${rowLabs[k]}`,
            lines: [
              `Comparación celda a celda: ${comps.join('; ')}.`,
              `Se elimina la fila ${rowLabs[k]}.`,
            ],
          };
        }
      }
    } else {
      for (let j = 0; j < n; j += 1) {
        for (let k = 0; k < n; k += 1) {
          if (j === k) continue;
          const t = colDominates(columnOf(reduced, j), columnOf(reduced, k));
          if (t !== trySpec.kind) continue;
          const comps = reduced.map((row, i) => `${fmtN(row[j])} ${row[j] < row[k] - 1e-12 ? '<' : '≤'} ${fmtN(row[k])} (${rowLabs[i]})`);
          return {
            player: 'columna',
            type: t,
            keeper: j,
            drop: k,
            title: `${colLabs[j]} domina ${t === 'estricta' ? 'estrictamente' : 'débilmente'} a ${colLabs[k]} (el mercado prefiere pagos menores)`,
            lines: [
              `Comparación fila a fila: ${comps.join('; ')}.`,
              `Se elimina la columna ${colLabs[k]}.`,
            ],
          };
        }
      }
    }
  }
  return null;
}

export function iterativeDominance(matrix, rowLabels, colLabels) {
  let rowIdx = matrix.map((_, i) => i);
  let colIdx = matrix[0].map((_, j) => j);
  const steps = [];
  steps.push({
    title: 'Matriz inicial',
    lines: ['Se busca una fila o columna dominada (estricta antes que débil; filas antes que columnas).'],
    snapshot: snapshotOf(matrix, rowIdx, colIdx, rowLabels, colLabels),
  });

  let guard = 0;
  while (guard < 20 && rowIdx.length >= 1 && colIdx.length >= 1 && (rowIdx.length > 1 || colIdx.length > 1)) {
    guard += 1;
    const reduced = submatrix(matrix, rowIdx, colIdx);
    const rowLabs = rowIdx.map((i) => rowLabels[i]);
    const colLabs = colIdx.map((j) => colLabels[j]);
    const move = findDominanceMove(reduced, rowLabs, colLabs);
    if (!move) break;
    if (move.player === 'fila') {
      const dropped = rowIdx[move.drop];
      rowIdx = rowIdx.filter((_, i) => i !== move.drop);
      steps.push({
        title: move.title,
        lines: move.lines.concat([`Quedan filas: ${rowIdx.map((i) => rowLabels[i]).join(', ')}.`]),
        snapshot: snapshotOf(matrix, rowIdx, colIdx, rowLabels, colLabels),
        eliminated: { kind: 'row', index: dropped, label: rowLabels[dropped], type: move.type },
      });
    } else {
      const dropped = colIdx[move.drop];
      colIdx = colIdx.filter((_, j) => j !== move.drop);
      steps.push({
        title: move.title,
        lines: move.lines.concat([`Quedan columnas: ${colIdx.map((j) => colLabels[j]).join(', ')}.`]),
        snapshot: snapshotOf(matrix, rowIdx, colIdx, rowLabels, colLabels),
        eliminated: { kind: 'col', index: dropped, label: colLabels[dropped], type: move.type },
      });
    }
  }

  const remaining = snapshotOf(matrix, rowIdx, colIdx, rowLabels, colLabels);
  const remSaddle = saddlePoint(remaining.matrix);
  let conclusion;
  if (rowIdx.length === 1 && colIdx.length === 1) {
    conclusion = `Queda un subjuego 1×1. Equilibrio puro ${remaining.rowLabels[0]} contra ${remaining.colLabels[0]} con valor ${fmtN(remaining.matrix[0][0])}.`;
  } else if (remSaddle.hasSaddle) {
    conclusion = `El subjuego residual tiene punto de silla. Valor ${fmtN(remSaddle.maximin)} en ${remaining.rowLabels[remSaddle.cell?.i ?? remSaddle.maximinIdx]} contra ${remaining.colLabels[remSaddle.cell?.j ?? remSaddle.minimaxCol]}.`;
  } else if (steps.length === 1) {
    conclusion = 'Ninguna fila ni columna es dominada. El juego no se reduce; hay que resolver por silla o mixto sobre la matriz completa.';
  } else {
    conclusion = `El residual es ${rowIdx.length}×${colIdx.length} sin silla. Se resuelve por estrategia mixta / método gráfico.`;
  }
  steps.push({ title: 'Cierre de dominancia', lines: [conclusion], snapshot: remaining });

  return { steps, remaining, eliminatedAny: steps.some((st) => st.eliminated) };
}

export function mixed2x2(matrix) {
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];
  const saddle = saddlePoint(matrix);
  const denP = a - c - b + d;
  const denQ = a - b - c + d;
  const pRaw = Math.abs(denP) < 1e-12 ? null : (d - c) / denP;
  const qRaw = Math.abs(denQ) < 1e-12 ? null : (d - b) / denQ;
  const p = pRaw == null ? null : Math.min(1, Math.max(0, pRaw));
  const q = qRaw == null ? null : Math.min(1, Math.max(0, qRaw));
  let value = null;
  if (p != null) value = p * a + (1 - p) * c;
  const validMix = p != null && q != null && p > 0 && p < 1 && q > 0 && q < 1 && !saddle.hasSaddle;

  const steps = [];
  steps.push({
    title: 'Indiferencia del mercado (p*)',
    lines: [
      `Chips juega la primera fila con probabilidad p y la segunda con 1 − p.`,
      `Se igualan los pagos esperados de las dos columnas:`,
      `p·${paren(a)} + (1−p)·${paren(c)} = p·${paren(b)} + (1−p)·${paren(d)}`,
      `p* = (d − c) / (a − c − b + d) = (${fmtN(d)} − ${paren(c)}) / (${fmtN(a)} − ${paren(c)} − ${paren(b)} + ${fmtN(d)})`,
      Math.abs(denP) < 1e-12
        ? 'El denominador es 0: las columnas son paralelas; no hay mixto interior por esta vía.'
        : `p* = ${fmtN(d - c)} / ${fmtN(denP)} = ${fmtN(pRaw)}.`,
    ],
  });
  steps.push({
    title: 'Indiferencia de Chips (q*)',
    lines: [
      `El mercado juega S1 con probabilidad q y S2 con 1 − q.`,
      `Se igualan los pagos esperados de las dos filas:`,
      `q·${paren(a)} + (1−q)·${paren(b)} = q·${paren(c)} + (1−q)·${paren(d)}`,
      `q* = (d − b) / (a − b − c + d) = (${fmtN(d)} − ${paren(b)}) / (${fmtN(a)} − ${paren(b)} − ${paren(c)} + ${fmtN(d)})`,
      Math.abs(denQ) < 1e-12
        ? 'El denominador es 0: las filas son paralelas; no hay mixto interior por esta vía.'
        : `q* = ${fmtN(d - b)} / ${fmtN(denQ)} = ${fmtN(qRaw)}.`,
    ],
  });
  if (saddle.hasSaddle) {
    steps.push({
      title: 'Valor (estrategia pura)',
      lines: [`Hay silla: v* = ${fmtN(saddle.maximin)}. El mixto interior no aplica.`],
    });
  } else if (validMix) {
    const vCol1 = p * a + (1 - p) * c;
    const vCol2 = p * b + (1 - p) * d;
    const vRow1 = q * a + (1 - q) * b;
    steps.push({
      title: 'Valor del juego v*',
      lines: [
        `v* = p*·a + (1−p*)·c = ${fmtN(p)}·${paren(a)} + ${fmtN(1 - p)}·${paren(c)} = ${fmtN(vCol1)}`,
        `Comprobación columna S2: p*·b + (1−p*)·d = ${fmtN(p)}·${paren(b)} + ${fmtN(1 - p)}·${paren(d)} = ${fmtN(vCol2)}`,
        `Comprobación fila 1: q*·a + (1−q*)·b = ${fmtN(q)}·${paren(a)} + ${fmtN(1 - q)}·${paren(b)} = ${fmtN(vRow1)}`,
        `Las tres vías coinciden (salvo redondeo). Maximin ${fmtN(saddle.maximin)} < v* < Minimax ${fmtN(saddle.minimax)}.`,
      ],
    });
  } else {
    steps.push({
      title: 'Sin mixto interior',
      lines: [
        pRaw == null || qRaw == null
          ? 'Denominador nulo: no se puede igualar al rival.'
          : `p* = ${fmtN(pRaw)} o q* = ${fmtN(qRaw)} cae fuera de (0, 1). El equilibrio no es mixto interior.`,
      ],
    });
  }

  return {
    a, b, c, d,
    denP,
    denQ,
    pRaw,
    qRaw,
    p,
    q,
    value,
    saddle,
    validMix,
    steps,
  };
}

function expectedRowQ(row, q) {
  return q * row[0] + (1 - q) * row[1];
}

export function graphicalMx2(matrix, rowLabels) {
  const equations = matrix.map((row, i) => {
    const intercept = row[1];
    const slope = row[0] - row[1];
    return {
      id: rowLabels[i],
      intercept,
      slope,
      text: `E(${rowLabels[i]}) = ${lineEquation(slope, intercept, 'q')}`,
      at: (q) => intercept + slope * q,
    };
  });

  const crossings = [];
  for (let i = 0; i < matrix.length; i += 1) {
    for (let j = i + 1; j < matrix.length; j += 1) {
      const q = crossing(matrix[i], matrix[j]);
      if (q == null) continue;
      const v = expectedRowQ(matrix[i], q);
      crossings.push({ i, j, q, v, labels: [rowLabels[i], rowLabels[j]] });
    }
  }

  const candidates = [0, 1, ...crossings.map((c) => c.q)];
  const unique = [];
  candidates.forEach((q) => {
    if (!unique.some((u) => Math.abs(u - q) < 1e-9)) unique.push(q);
  });

  const evaluated = unique.map((q) => {
    const vals = matrix.map((row) => expectedRowQ(row, q));
    const mx = Math.max(...vals);
    const active = vals.map((v, i) => (Math.abs(v - mx) < 1e-6 ? i : -1)).filter((i) => i >= 0);
    return { q, v: mx, active };
  });

  const isEnd = (q) => q < 1e-9 || q > 1 - 1e-9;
  let best = evaluated[0];
  evaluated.forEach((pt) => {
    if (pt.v < best.v - 1e-9) {
      best = pt;
      return;
    }
    if (Math.abs(pt.v - best.v) > 1e-9) return;
    if (isEnd(pt.q) && !isEnd(best.q)) {
      best = pt;
      return;
    }
    if (isEnd(best.q) && !isEnd(pt.q)) return;
    if (pt.active.length < best.active.length) best = pt;
    else if (pt.active.length === best.active.length && Math.abs(pt.q - 0.5) < Math.abs(best.q - 0.5)) best = pt;
  });

  const chartData = [];
  for (let i = 0; i <= 100; i += 1) {
    const q = i / 100;
    const point = { q, envelope: Math.max(...matrix.map((row) => expectedRowQ(row, q))) };
    rowLabels.forEach((lab, idx) => {
      point[lab] = expectedRowQ(matrix[idx], q);
    });
    chartData.push(point);
  }

  return {
    equations,
    crossings,
    qStar: best.q,
    vStar: best.v,
    activeRows: best.active,
    activeLabels: best.active.map((i) => rowLabels[i]),
    chartData,
    note: 'Cada recta es el pago de una estrategia pura de Chips si el mercado juega S1 con probabilidad q. El mercado elige q que minimiza la envolvente superior; Chips responde con las filas que tocan ese punto.',
  };
}

export function graphical2x2(matrix, rowLabels, colLabels, mixed = null) {
  const mix = mixed ?? mixed2x2(matrix);
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];
  const s1 = { intercept: c, slope: a - c };
  const s2 = { intercept: d, slope: b - d };
  const equations = [
    { id: colLabels[0], intercept: s1.intercept, slope: s1.slope, text: `E(${colLabels[0]}) = ${lineEquation(s1.slope, s1.intercept, 'p')}` },
    { id: colLabels[1], intercept: s2.intercept, slope: s2.slope, text: `E(${colLabels[1]}) = ${lineEquation(s2.slope, s2.intercept, 'p')}` },
  ];
  const chartData = [];
  for (let i = 0; i <= 100; i += 1) {
    const p = i / 100;
    chartData.push({
      p,
      [colLabels[0]]: s1.intercept + s1.slope * p,
      [colLabels[1]]: s2.intercept + s2.slope * p,
    });
  }
  const pStar = mix.validMix ? mix.p : mix.saddle.hasSaddle ? (mix.saddle.cell?.i === 0 ? 1 : 0) : mix.p;
  const vStar = mix.validMix ? mix.value : mix.saddle.hasSaddle ? mix.saddle.maximin : mix.value;
  return {
    equations,
    chartData,
    pStar,
    vStar,
    rowLabels,
    colLabels,
    validMix: mix.validMix,
    note: `Eje p = P(${rowLabels[0]}). Las dos rectas son el pago esperado si el mercado se queda en cada columna. El cruce es el mixto que hace al mercado indiferente.`,
  };
}

export function gameWalkthrough(matrix, rowLabels, colLabels) {
  const saddle = saddlePoint(matrix);
  const algebra = saddleAlgebra(matrix, rowLabels, colLabels, saddle);
  const dominance = iterativeDominance(matrix, rowLabels, colLabels);
  const graph = graphicalMx2(matrix, rowLabels);
  const rem = dominance.remaining;
  let residualMix = null;
  let graph2x2 = null;

  if (rem.rowIdx.length === 2 && rem.colIdx.length === 2) {
    residualMix = mixed2x2(rem.matrix);
    graph2x2 = graphical2x2(rem.matrix, rem.rowLabels, rem.colLabels, residualMix);
  } else if (!saddle.hasSaddle && graph.activeRows.length === 2 && matrix[0].length === 2) {
    const sub = graph.activeRows.map((i) => matrix[i]);
    const labs = graph.activeRows.map((i) => rowLabels[i]);
    residualMix = mixed2x2(sub);
    graph2x2 = graphical2x2(sub, labs, colLabels, residualMix);
  }

  return { saddle, algebra, dominance, graph, residualMix, graph2x2 };
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

function factorial(n) {
  let value = 1;
  for (let i = 2; i <= n; i += 1) value *= i;
  return value;
}

export function poissonPmf(lambda, x) {
  const k = Math.round(x);
  if (k < 0 || lambda < 0) return null;
  return (lambda ** k) * Math.exp(-lambda) / factorial(k);
}

function pnAt(p0, r, servers, n) {
  const k = Math.round(n);
  if (k < 0 || p0 == null) return null;
  let value = p0;
  for (let i = 1; i <= k; i += 1) {
    value *= r / (i <= servers ? i : servers);
  }
  return value;
}

export function mmc(lambda, mu, c) {
  const servers = Math.max(1, Math.round(Number(c) || 1));
  const r = mu > 0 ? lambda / mu : Infinity;
  const rho = mu > 0 ? lambda / (servers * mu) : Infinity;
  const stable = lambda >= 0 && mu > 0 && Number.isFinite(rho) && rho < 1;
  const serviceCdf = (t) => (mu > 0 && t >= 0 ? 1 - Math.exp(-mu * t) : null);
  if (!stable) {
    return {
      lambda,
      mu,
      c: servers,
      r,
      rho,
      stable: false,
      p0: null,
      lq: null,
      l: null,
      wq: null,
      w: null,
      pw: null,
      pn: () => null,
      pAtLeast: () => null,
      serviceCdf,
    };
  }

  let sum = 0;
  for (let n = 0; n < servers; n += 1) {
    sum += (r ** n) / factorial(n);
  }
  const tail = (r ** servers) / (factorial(servers) * (1 - rho));
  const p0 = 1 / (sum + tail);
  const pw = tail * p0;
  const lq = (p0 * (r ** servers) * rho) / (factorial(servers) * (1 - rho) ** 2);
  const l = lq + r;
  const wq = lambda === 0 ? 0 : lq / lambda;
  const w = wq + 1 / mu;
  const pn = (n) => pnAt(p0, r, servers, n);
  const pAtLeast = (n) => {
    const k = Math.round(n);
    if (k <= 0) return 1;
    let below = 0;
    for (let i = 0; i < k; i += 1) below += pn(i);
    return Math.max(0, 1 - below);
  };

  return {
    lambda,
    mu,
    c: servers,
    r,
    rho,
    stable: true,
    p0,
    lq,
    l,
    wq,
    w,
    pw,
    pn,
    pAtLeast,
    serviceCdf,
  };
}

export function mm1(lambda, mu) {
  return mmc(lambda, mu, 1);
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
  const gameRowLabels = DECISION_META.map((m) => m.short);
  const gameColLabels = ['S1', 'S2'];
  const gameWalk = gameWalkthrough(gameMatrix, gameRowLabels, gameColLabels);
  const mixedWalk = gameWalkthrough(mixedMatrix, ['d2', 'd3'], gameColLabels);
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
    gameWalk,
    mixedWalk,
    nfgPure: nfgPure(gameMatrix),
    nfgMixed: nfgMixed(mixedMatrix),
    historyRows: rows,
    frequencies: freq,
    pS2: 1 - params.pS1,
    margin: params.price - params.cost,
  };
}
