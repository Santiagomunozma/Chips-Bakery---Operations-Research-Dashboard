export const GRAPHICAL_GAME_DEFAULTS = [
  {
    id: 'scenario-1',
    label: 'Caso 1',
    firstLine: { label: 'Pago A', atZero: 0.2, atOne: -0.05 },
    secondLine: { label: 'Pago B', atZero: -0.1, atOne: 0.4 },
  },
  {
    id: 'scenario-2',
    label: 'Caso 2',
    firstLine: { label: 'Pago A', atZero: 0.2, atOne: -0.1 },
    secondLine: { label: 'Pago B', atZero: -0.05, atOne: 0.4 },
  },
];

export function calculateGraphicalGameAnalysis(scenarios) {
  const lines = scenarios.flatMap((scenario) => (
    [scenario.firstLine, scenario.secondLine].map((line, index) => ({
      ...line,
      id: `${scenario.id}-line-${index + 1}`,
      scenarioId: scenario.id,
      scenarioLabel: scenario.label,
      slope: line.atOne - line.atZero,
      intercept: line.atZero,
      valueAt: (p) => line.atZero + (line.atOne - line.atZero) * p,
    }))
  ));

  const intersections = scenarios.map((scenario) => {
    const firstLine = lines.find((line) => line.id === `${scenario.id}-line-1`);
    const secondLine = lines.find((line) => line.id === `${scenario.id}-line-2`);
    const slopeDifference = firstLine.slope - secondLine.slope;

    if (Math.abs(slopeDifference) < 1e-12) {
      return { id: scenario.id, label: scenario.label, firstLine, secondLine, p: null, q: null, value: null };
    }

    const p = (secondLine.intercept - firstLine.intercept) / slopeDifference;
    const value = firstLine.valueAt(p);
    return {
      id: scenario.id,
      label: scenario.label,
      firstLine,
      secondLine,
      p,
      q: 1 - p,
      value,
      withinProbabilityRange: p >= 0 && p <= 1,
    };
  });

  return { lines, intersections };
}
