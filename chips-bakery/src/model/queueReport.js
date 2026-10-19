import { mmc } from './engine.js';
import { QUEUE_SAMPLE } from './params.js';

function num(n, digits = 4) {
  if (n == null || Number.isNaN(n) || !Number.isFinite(n)) return '—';
  return String(Number(n.toFixed(digits)));
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function rowCells(cells, extra = '') {
  return `<tr${extra}>${cells.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`;
}

function metricRows(model) {
  const rows = [
    ['ρ', num(model.rho, 4), 'λ / (cμ)'],
    ['P0', num(model.p0, 4), 'sistema vacío'],
    ['Pw', num(model.pw, 4), 'hay que esperar'],
    ['Lq', num(model.lq, 4), 'clientes en la fila'],
    ['L', num(model.l, 4), 'clientes en el sistema'],
    ['Wq', model.wq == null ? '—' : `${num(model.wq, 4)} min`, 'espera antes del servicio'],
    ['W', model.w == null ? '—' : `${num(model.w, 4)} min`, 'espera más servicio'],
  ];
  return rows.map((cells) => rowCells(cells)).join('');
}

function kpiCards(model) {
  const cards = [
    ['ρ', num(model.rho, 4)],
    ['P0', num(model.p0, 4)],
    ['Pw', num(model.pw, 4)],
    ['Lq', num(model.lq, 4)],
    ['L', num(model.l, 4)],
    ['Wq', model.wq == null ? '—' : `${num(model.wq, 2)} min`],
    ['W', model.w == null ? '—' : `${num(model.w, 2)} min`],
  ];
  return cards.map(([label, value]) => `
    <div class="kpi">
      <span>${esc(label)}</span>
      <strong>${esc(value)}</strong>
    </div>
  `).join('');
}

function development(queue, model) {
  if (!model.stable) {
    return `<div class="callout warn">Con λ = ${num(queue.lambda, 2)}, μ = ${num(queue.mu, 2)} y c = ${model.c} no hay estado estable: λ no es menor que cμ. La fila no tiene promedios finitos.</div>`;
  }
  const { lambda, mu, c, r, rho, p0 } = model;
  const n = Math.round(queue.n);
  let sum = 0;
  const terms = [];
  for (let i = 0; i < c; i += 1) {
    let fact = 1;
    for (let k = 2; k <= i; k += 1) fact *= k;
    const term = (r ** i) / fact;
    sum += term;
    terms.push(`n = ${i}: (${num(r, 4)})^${i} / ${i}! = ${num(term, 4)}`);
  }
  let factC = 1;
  for (let k = 2; k <= c; k += 1) factC *= k;
  const tail = (r ** c) / (factC * (1 - rho));
  const pnRows = [];
  let below = 0;
  for (let i = 0; i <= n; i += 1) {
    const p = model.pn(i);
    if (i < n) below += p;
    const branch = i <= c ? 'n ≤ c' : 'n > c';
    pnRows.push(rowCells([String(i), num(p, 6), branch]));
  }
  return `
    <ol class="steps">
      <li>r = λ / μ = ${num(lambda, 4)} / ${num(mu, 4)} = <b>${num(r, 4)}</b>.</li>
      <li>ρ = λ / (cμ) = ${num(lambda, 4)} / (${c} × ${num(mu, 4)}) = <b>${num(rho, 4)}</b>. Como ρ &lt; 1, hay estado estable.</li>
      <li>Suma de n = 0 hasta c − 1 de r^n / n!: ${terms.map(esc).join('; ')}. Total = <b>${num(sum, 4)}</b>.</li>
      <li>Término de cola = r^c / (c! (1 − ρ)) = <b>${num(tail, 4)}</b>.</li>
      <li>P0 = 1 / (${num(sum, 4)} + ${num(tail, 4)}) = <b>${num(p0, 4)}</b>.</li>
      <li>Pw = término de cola × P0 = <b>${num(model.pw, 4)}</b>.</li>
      <li>Lq = P0 · r^c · ρ / (c! (1 − ρ)^2) = <b>${num(model.lq, 4)}</b>.</li>
      <li>Wq = Lq / λ = <b>${num(model.wq, 4)} min</b>. L = Lq + λ/μ = <b>${num(model.l, 4)}</b>. W = Wq + 1/μ = <b>${num(model.w, 4)} min</b>.</li>
    </ol>
    <p class="lead">Probabilidad de exactamente n clientes en el sistema, hasta n = ${n}.</p>
    <table>
      <thead><tr><th>n</th><th>Pn</th><th>Rama</th></tr></thead>
      <tbody>${pnRows.join('')}</tbody>
    </table>
    <div class="callout">P(N &lt; ${n}) = ${num(below, 6)}. P(N ≥ ${n}) = <b>${num(model.pAtLeast(n), 6)}</b>.</div>
  `;
}

async function logoDataUrl() {
  try {
    const response = await fetch('/logo-chips-bakery.png');
    if (!response.ok) return '';
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

export async function buildQueueReportHtml(queue) {
  const logo = await logoDataUrl();
  const sampleLambda = QUEUE_SAMPLE.arrivals / QUEUE_SAMPLE.minutes;
  const serviceMean = QUEUE_SAMPLE.serviceTimes.reduce((acc, t) => acc + t, 0) / QUEUE_SAMPLE.serviceTimes.length;
  const sampleMu = 1 / serviceMean;
  const channels = Math.max(queue.c || 1, 2);
  const one = mmc(sampleLambda, sampleMu, 1);
  const many = mmc(sampleLambda, sampleMu, channels);
  const current = mmc(queue.lambda, queue.mu, queue.c);
  const issued = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

  const windows = QUEUE_SAMPLE.windows.map((w) => rowCells([
    w.day,
    w.slot,
    String(w.minutes),
    String(w.arrivals),
  ])).join('');

  const times = QUEUE_SAMPLE.serviceTimes.map((t) => `<span>${num(t, 1)}</span>`).join('');
  const mark = logo
    ? `<div class="logo-frame"><img class="logo" src="${logo}" alt="Chips Bakery" /></div>`
    : '<div class="wordmark">Chips<br>Bakery</div>';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Chips Bakery · líneas de espera</title>
  <style>
    @page { size: A4; margin: 14mm 14mm 18mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; }
    body { padding: 18px 22px 28px; }
    @media print { body { padding: 0; } }
    body {
      font-family: "Segoe UI", Calibri, sans-serif;
      color: #1F1A17;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    header.sheet {
      display: flex;
      align-items: center;
      gap: 18px;
      background: #FDE8EF;
      border: 1px solid #F7B8C9;
      border-bottom: 4px solid #C48A4A;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 18px;
    }
    .logo-frame {
      width: 128px;
      height: 96px;
      border-radius: 12px;
      overflow: hidden;
      flex: 0 0 auto;
      background: #F7B8C9;
    }
    .logo {
      width: 118%;
      height: 118%;
      max-width: none;
      object-fit: cover;
      object-position: center 44%;
      margin: -8% 0 0 -9%;
      display: block;
    }
    .wordmark {
      width: 118px;
      height: 92px;
      border-radius: 10px;
      background: #F7B8C9;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-weight: 800;
      font-size: 18px;
      line-height: 1.05;
    }
    .identity { flex: 1; min-width: 0; }
    .kicker {
      margin: 0;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #7A5560;
      font-weight: 700;
    }
    h1 { margin: 2px 0 0; font-size: 24px; line-height: 1.15; }
    .meta { margin: 6px 0 0; font-size: 12px; color: #7A5560; }
    h2 {
      margin: 22px 0 8px;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #7A5560;
      border-bottom: 1px solid #F7B8C9;
      padding-bottom: 4px;
    }
    p, li { font-size: 12.5px; }
    .lead { margin: 8px 0; }
    table { border-collapse: collapse; width: 100%; margin: 8px 0 4px; font-size: 12px; }
    th, td { border: 1px solid #F3D0DC; padding: 6px 8px; text-align: left; }
    th { background: #1F1A17; color: #FFF7FA; font-weight: 600; }
    tbody tr:nth-child(even) td { background: #FFF7FA; }
    tr.total td { background: #FDE8EF; font-weight: 700; }
    .callout {
      background: #FFF7FA;
      border-left: 4px solid #C48A4A;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 12.5px;
    }
    .callout.warn { border-left-color: #b45309; background: #fff7ed; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 10px 0 4px; }
    .kpi {
      background: #FFF7FA;
      border: 1px solid #F7B8C9;
      border-radius: 10px;
      padding: 8px 10px;
    }
    .kpi span { display: block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #7A5560; }
    .kpi strong { display: block; margin-top: 2px; font-size: 16px; color: #C48A4A; }
    .times { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
    .times span {
      background: #FFF7FA;
      border: 1px solid #F7B8C9;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 11px;
    }
    ol.steps { margin: 8px 0 8px 18px; padding: 0; }
    ol.steps li { margin: 4px 0; }
    footer.sheet {
      margin-top: 22px;
      border-top: 1px solid #F7B8C9;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #7A5560;
    }
  </style>
</head>
<body>
  <header class="sheet">
    ${mark}
    <div class="identity">
      <p class="kicker">Investigación de operaciones</p>
      <h1>Líneas de espera en la ventanilla</h1>
      <p class="meta">Informe M/M/c · ${esc(issued)}</p>
      <p class="meta">La muestra es fija. El desarrollo usa los controles que están en pantalla al exportar.</p>
    </div>
  </header>

  <h2>01 · Muestra de llegadas</h2>
  <p class="lead">Durante el pico de la mañana de dos sábados (4 y 11 de octubre), de 10:00 a 12:00, se contaron las llegadas a la ventanilla. Los canales se tratan como idénticos.</p>
  <table>
    <thead><tr><th>Día</th><th>Franja</th><th>Minutos</th><th>Llegadas</th></tr></thead>
    <tbody>
      ${windows}
      ${rowCells(['Total', '', String(QUEUE_SAMPLE.minutes), String(QUEUE_SAMPLE.arrivals)], ' class="total"')}
    </tbody>
  </table>
  <div class="callout">λ = ${QUEUE_SAMPLE.arrivals} llegadas / ${QUEUE_SAMPLE.minutes} minutos = <b>${num(sampleLambda, 2)} clientes por minuto</b> (${num(sampleLambda * 60, 0)} por hora).</div>

  <h2>02 · Tiempos de servicio</h2>
  <p class="lead">Servicios cronometrados con el empleado ocupado, en minutos.</p>
  <div class="times">${times}</div>
  <div class="callout">La media es ${num(serviceMean, 2)} minuto, así que μ = 1 / ${num(serviceMean, 2)} = <b>${num(sampleMu, 2)} pedidos por minuto y canal</b> (${num(sampleMu * 60, 0)} por hora).</div>
  <p class="lead">Con un solo mostrador esa afluencia dejaba al empleado ocupado el 75 % del tiempo y una espera media de unos 3 minutos. Por eso se abrió un segundo canal con la misma velocidad.</p>

  <h2>03 · Un canal frente a ${channels}</h2>
  <p class="lead">Comparación con las tasas de la muestra: λ = ${num(sampleLambda, 2)} y μ = ${num(sampleMu, 2)}.</p>
  <table>
    <thead><tr><th>Medida</th><th>1 canal</th><th>${channels} canales</th></tr></thead>
    <tbody>
      ${rowCells(['ρ', num(one.rho, 4), num(many.rho, 4)])}
      ${rowCells(['P0', num(one.p0, 4), num(many.p0, 4)])}
      ${rowCells(['Pw', num(one.pw, 4), num(many.pw, 4)])}
      ${rowCells(['Lq', num(one.lq, 4), num(many.lq, 4)])}
      ${rowCells(['L', num(one.l, 4), num(many.l, 4)])}
      ${rowCells(['Wq', `${num(one.wq, 4)} min`, `${num(many.wq, 4)} min`])}
      ${rowCells(['W', `${num(one.w, 4)} min`, `${num(many.w, 4)} min`])}
    </tbody>
  </table>

  <h2>04 · Desarrollo con los controles actuales</h2>
  <p class="lead">λ = ${num(queue.lambda, 2)} clientes/min · μ = ${num(queue.mu, 2)} por canal · c = ${current.c}.</p>
  ${current.stable ? `<div class="kpis">${kpiCards(current)}</div>` : ''}
  ${development(queue, current)}
  <table>
    <thead><tr><th>Medida</th><th>Valor</th><th>Lectura</th></tr></thead>
    <tbody>${metricRows(current)}</tbody>
  </table>

  <footer class="sheet">
    <span>Chips Bakery</span>
    <span>Líneas de espera · M/M/c</span>
  </footer>
</body>
</html>`;

  return html;
}

export async function openQueueReport(queue) {
  const report = window.open('', '_blank');
  if (!report) return false;
  const html = await buildQueueReportHtml(queue);
  if (report.closed) return false;
  report.document.open();
  report.document.write(html);
  report.document.close();
  report.focus();
  setTimeout(() => {
    if (!report.closed) report.print();
  }, 400);
  return true;
}
