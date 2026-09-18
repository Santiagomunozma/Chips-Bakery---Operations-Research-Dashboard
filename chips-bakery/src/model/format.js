export function formatK(n, digits = 0) {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const body = digits === 0 ? Math.round(abs).toString() : abs.toFixed(digits);
  return `${sign}$${body}k`;
}

export function formatPct(p, digits = 1) {
  return `${(p * 100).toFixed(digits)}%`;
}

export function formatMoney(n) {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US')}`;
}
