import React, { useState } from 'react';
import { Home, Binary, Activity, UserCog, Clock, GitBranch, Menu, X } from 'lucide-react';

const navItems = [
  { id: 'contexto', label: 'Contexto Empresarial', icon: Home },
  { id: 'inferencia', label: 'Inferencia Bayesiana', icon: Binary },
  { id: 'sensibilidad', label: 'Análisis Sensibilidad', icon: Activity },
  { id: 'juegos', label: 'Teoría de Juegos', icon: UserCog },
  { id: 'colas', label: 'Líneas de espera', icon: Clock },
  { id: 'rutas', label: 'Análisis de Ruta', icon: GitBranch },
];

function NavButtons({ activeTab, onChoose }) {
  return navItems.map((item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onChoose(item.id)}
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
  });
}

export default function Sidebar({ activeTab, setActiveTab }) {
  const [open, setOpen] = useState(false);
  const choose = (id) => {
    setActiveTab(id);
    setOpen(false);
  };

  return (
    <>
      <div className="hidden md:flex w-64 bg-slate-800 h-screen fixed left-0 top-0 text-slate-200 border-r border-slate-700 flex-col">
        <div className="p-4 border-b border-slate-700">
          <img
            src="/logo-chips-bakery.png"
            alt="Chips Bakery"
            className="w-full rounded-lg"
          />
          <p className="text-xs text-slate-400 mt-2 text-center">Investigación de operaciones</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButtons activeTab={activeTab} onChoose={setActiveTab} />
        </nav>
      </div>

      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between gap-3 bg-slate-800 text-slate-200 border-b border-slate-700 px-3 py-2">
        <img
          src="/logo-chips-bakery.png"
          alt="Chips Bakery"
          className="h-10 w-16 object-cover object-center rounded-md"
        />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-600"
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
          <span className="text-sm font-medium">Menú</span>
        </button>
      </header>

      {open && (
        <div className="md:hidden fixed inset-x-0 top-14 bottom-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <nav className="relative bg-slate-800 text-slate-200 border-b border-slate-700 p-3 space-y-2 shadow-xl">
            <NavButtons activeTab={activeTab} onChoose={choose} />
          </nav>
        </div>
      )}
    </>
  );
}
