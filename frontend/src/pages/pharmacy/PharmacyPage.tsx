import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pill,
  Package,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  AlertTriangle,
  Plus
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import PharmacyDashboard from '@/components/pharmacy/PharmacyDashboard';
import PharmacyStockControl from '@/components/pharmacy/PharmacyStockControl';
import PharmacyDispensation from '@/components/pharmacy/PharmacyDispensation';
import PharmacyEntry from '@/components/pharmacy/PharmacyEntry';

type PharmacyTab = 'dashboard' | 'stock' | 'dispensation' | 'entry' | 'reports' | 'settings';

const PharmacyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PharmacyTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as PharmacyTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'stock' as PharmacyTab, label: 'Estoque', icon: Package },
    { id: 'dispensation' as PharmacyTab, label: 'Dispensação', icon: Users },
    { id: 'entry' as PharmacyTab, label: 'Entrada', icon: Plus },
    { id: 'reports' as PharmacyTab, label: 'Relatórios', icon: TrendingUp },
    { id: 'settings' as PharmacyTab, label: 'Configurações', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PharmacyDashboard />;
      case 'stock':
        return <PharmacyStockControl />;
      case 'dispensation':
        return <PharmacyDispensation />;
      case 'entry':
        return <PharmacyEntry />;
      case 'reports':
        return (
          <GlassCard className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Relatórios da Farmácia</h3>
            <p className="text-white/60 mb-6">
              Sistema de relatórios em desenvolvimento
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Consumo de Medicamentos</h4>
                <p className="text-white/70 text-sm">Relatório de dispensações por período</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">💰 Relatório Financeiro</h4>
                <p className="text-white/70 text-sm">Análise de custos e lucros</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📅 Controle de Validade</h4>
                <p className="text-white/70 text-sm">Medicamentos próximos do vencimento</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🏥 Estoque por Unidade</h4>
                <p className="text-white/70 text-sm">Distribuição por setores</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⚠️ Alertas e Anomalias</h4>
                <p className="text-white/70 text-sm">Problemas identificados</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📈 Tendências</h4>
                <p className="text-white/70 text-sm">Análise histórica de consumo</p>
              </div>
            </div>
          </GlassCard>
        );
      case 'settings':
        return (
          <GlassCard className="p-8 text-center">
            <Settings className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Configurações da Farmácia</h3>
            <p className="text-white/60 mb-6">
              Configurações do sistema de farmácia
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Parâmetros de Estoque</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Alerta Estoque Baixo</span>
                    <span className="text-white">20%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Alerta Estoque Crítico</span>
                    <span className="text-white">10%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Dias para Vencimento</span>
                    <span className="text-white">30 dias</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Configurações Gerais</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Controle de Acesso</span>
                    <span className="text-green-400">Ativo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Auditoria</span>
                    <span className="text-green-400">Ativo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Backup Automático</span>
                    <span className="text-green-400">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        );
      default:
        return <PharmacyDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-medical-blue/20 rounded-lg">
                <Pill className="w-8 h-8 text-medical-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Farmácia
                </h1>
                <p className="text-text-secondary">
                  Gestão completa de medicamentos e dispensação
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <GlassButton variant="secondary" size="sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alertas
              </GlassButton>
              <GlassButton variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Medicamento
              </GlassButton>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <GlassButton
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? 'primary' : 'ghost'}
                  className="flex items-center space-x-2 whitespace-nowrap"
                  size="sm"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </GlassButton>
              );
            })}
          </div>
        </GlassCard>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacyPage;
