import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LabPanel from './components/LabPanel';
import ContextoEmpresarial from './views/ContextoEmpresarial';
import InferenciaBayesiana from './views/InferenciaBayesiana';
import AnalisisSensibilidad from './views/AnalisisSensibilidad';
import TeoriaJuegos from './views/TeoriaJuegos';
import { LabProvider } from './state/LabContext';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('contexto');

  const renderView = () => {
    switch (activeTab) {
      case 'contexto': return <ContextoEmpresarial />;
      case 'inferencia': return <InferenciaBayesiana />;
      case 'sensibilidad': return <AnalisisSensibilidad />;
      case 'juegos': return <TeoriaJuegos />;
      default: return <ContextoEmpresarial />;
    }
  };

  return (
    <div className="flex bg-slate-900 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <LabPanel />
          {renderView()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <LabProvider>
      <Dashboard />
    </LabProvider>
  );
}

export default App;
