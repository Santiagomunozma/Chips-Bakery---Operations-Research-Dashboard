import React from 'react';
import { formatK, formatPct } from '../model/format.js';

function eqLabel(id, ev) {
  return `${id} ${formatK(ev, 0)}`;
}

export default function DecisionTree({ bayes }) {
  const noStudy = eqLabel(bayes.noStudyId, bayes.ve);
  const fav = eqLabel(bayes.fId, bayes.evF[bayes.fIdx]);
  const unfav = eqLabel(bayes.uId, bayes.evU[bayes.uIdx]);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 860 420" className="w-full min-w-[720px] h-auto">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#C48A4A" />
          </marker>
        </defs>

        <text x="430" y="28" textAnchor="middle" fill="#94a3b8" fontSize="12">Equivalente al árbol de SilverDecisions (valores en $k, vivos con el laboratorio)</text>

        <rect x="355" y="48" width="150" height="48" rx="8" fill="#1e293b" stroke="#C48A4A" />
        <text x="430" y="68" textAnchor="middle" fill="#E4B07A" fontSize="12" fontWeight="700">¿Estudio?</text>
        <text x="430" y="86" textAnchor="middle" fill="#cbd5e1" fontSize="11">nodo de decisión</text>

        <line x1="355" y1="72" x2="170" y2="72" stroke="#C48A4A" markerEnd="url(#arrow)" />
        <line x1="505" y1="72" x2="690" y2="72" stroke="#C48A4A" markerEnd="url(#arrow)" />

        <text x="250" y="62" textAnchor="middle" fill="#34d399" fontSize="11">Sí · VEOD {formatK(bayes.veod, 0)}</text>
        <text x="610" y="62" textAnchor="middle" fill="#F7B8C9" fontSize="11">No · VE {formatK(bayes.ve, 0)}</text>

        <circle cx="140" cy="72" r="22" fill="#0f172a" stroke="#34d399" />
        <text x="140" y="76" textAnchor="middle" fill="#34d399" fontSize="11">Est.</text>

        <rect x="655" y="48" width="150" height="48" rx="8" fill="#1e293b" stroke="#F7B8C9" />
        <text x="730" y="68" textAnchor="middle" fill="#F7B8C9" fontSize="12" fontWeight="700">Sin estudio</text>
        <text x="730" y="86" textAnchor="middle" fill="#e2e8f0" fontSize="12">{noStudy}</text>

        <line x1="140" y1="94" x2="140" y2="150" stroke="#C48A4A" />
        <line x1="140" y1="150" x2="60" y2="210" stroke="#C48A4A" markerEnd="url(#arrow)" />
        <line x1="140" y1="150" x2="250" y2="210" stroke="#C48A4A" markerEnd="url(#arrow)" />

        <text x="70" y="175" fill="#34d399" fontSize="11">F {formatPct(bayes.pF)}</text>
        <text x="185" y="175" fill="#C48A4A" fontSize="11">U {formatPct(bayes.pU)}</text>

        <rect x="10" y="214" width="130" height="56" rx="8" fill="#064e3b" stroke="#34d399" />
        <text x="75" y="236" textAnchor="middle" fill="#6ee7b7" fontSize="11">Favorable</text>
        <text x="75" y="256" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">{fav}</text>

        <rect x="185" y="214" width="130" height="56" rx="8" fill="#3f2a14" stroke="#C48A4A" />
        <text x="250" y="236" textAnchor="middle" fill="#E4B07A" fontSize="11">Desfavorable</text>
        <text x="250" y="256" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">{unfav}</text>

        <text x="75" y="292" textAnchor="middle" fill="#94a3b8" fontSize="10">P(S1|F) {formatPct(bayes.pS1_F)}</text>
        <text x="75" y="306" textAnchor="middle" fill="#94a3b8" fontSize="10">P(S2|F) {formatPct(bayes.pS2_F)}</text>
        <text x="250" y="292" textAnchor="middle" fill="#94a3b8" fontSize="10">P(S1|U) {formatPct(bayes.pS1_U)}</text>
        <text x="250" y="306" textAnchor="middle" fill="#94a3b8" fontSize="10">P(S2|U) {formatPct(bayes.pS2_U)}</text>

        <rect x="400" y="214" width="400" height="120" rx="8" fill="#0f172a" stroke="#334155" />
        <text x="420" y="240" fill="#E4B07A" fontSize="12" fontWeight="700">Lectura para la sustentación</text>
        <text x="420" y="264" fill="#cbd5e1" fontSize="12">
          {`Si el estudio es favorable, producir ${bayes.fId}. Si es desfavorable, ${bayes.uId}.`}
        </text>
        <text x="420" y="286" fill="#cbd5e1" fontSize="12">
          {`Sin estudio la mejor es ${bayes.noStudyId} con VE ${formatK(bayes.ve, 0)}.`}
        </text>
        <text x="420" y="308" fill="#cbd5e1" fontSize="12">
          {`VEOD ${formatK(bayes.veod, 0)} − VE ${formatK(bayes.ve, 0)} = IVEM ${formatK(bayes.ivem, 0)}.`}
        </text>
      </svg>
    </div>
  );
}
