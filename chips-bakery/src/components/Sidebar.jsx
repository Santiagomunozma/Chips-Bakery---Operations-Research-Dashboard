import React from 'react';
import { Home, Binary, Activity, UserCog } from 'lucide-react';

const navItems = [
  { id: 'contexto', label: 'Contexto Empresarial', icon: Home },
  { id: 'inferencia', label: 'Inferencia Bayesiana', icon: Binary },
  { id: 'sensibilidad', label: 'Análisis Sensibilidad', icon: Activity },
  { id: 'juegos', label: 'Teoría de Juegos', icon: UserCog },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-64 bg-slate-800 h-screen fixed left-0 top-0 text-slate-200 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <img
          src="/logo-chips-bakery.png"
          alt="Chips Bakery"
          className="w-full rounded-lg"
        />
        <p className="text-xs text-slate-400 mt-2 text-center">Investigación de operaciones</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-tan text-white'
                  : 'hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
