import React from 'react';
import GraphicalGameAnalysis from '../components/GraphicalGameAnalysis.jsx';
import CompetitiveGame from '../components/CompetitiveGame.jsx';

export default function TeoriaJuegos() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-brand-pink pb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-ink">Teoría de Juegos</h2>
          <p className="text-brand-muted text-sm mt-1">Matriz competitiva y clientes</p>
        </div>
      </div>

      <GraphicalGameAnalysis />
      <CompetitiveGame />
    </div>
  );
}
