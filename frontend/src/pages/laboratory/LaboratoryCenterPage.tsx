import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  FileText,
  Microscope,
  Users,
  Settings,
  Plus,
  Flask,
  Search,
  Droplet,
  Target,
  AlertCircle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LaboratoryDashboard from '@/components/laboratory/LaboratoryDashboard';
import LaboratoryOrder from '@/components/laboratory/LaboratoryOrder';

type LaboratoryTab = 'dashboard' | 'orders' | 'processing' | 'results' | 'quality' | 'settings';

const LaboratoryCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LaboratoryTab>('dashboard');
  const [showOrder, setShowOrder] = useState(false);

  const tabs = [
    { id: 'dashboard' as LaboratoryTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'orders' as LaboratoryTab, label: 'Pedidos', icon: Calendar },
    { id: 'processing' as LaboratoryTab, label: 'Processamento', icon: Flask },
    { id: 'results' as LaboratoryTab, label: 'Resultados', icon: Search },
    { id: 'quality' as LaboratoryTab, label: 'Qualidade', icon: Target },
    { id: 'settings' as LaboratoryTab, label: 'Configurações', icon: Settings }
  ];

  const renderContent = () => {
    if (showOrder) {
      return (
        <LaboratoryOrder
          onOrdered={(order) => {
            console.log('Pedido realizado:', order);
            setShowOrder(false);
            // Refresh data
          }}
          onCancel={() => setShowOrder(false)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <LaboratoryDashboard />;
      case 'orders':
        return (
          <GlassCard className="p-8 text-center">
            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Gestão de Pedidos</h3>
            <p className="text-white/60 mb-6">
              Controle completo do ciclo de vida dos pedidos laboratoriais
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📝 Solicitações</h4>
                <p className="text-white/70 text-sm">Recebimento e validação de pedidos médicos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🩸 Coleta</h4>
                <p className="text-white/70 text-sm">Controle de coleta e recebimento de amostras</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🏷️ Triagem</h4>
                <p className="text-white/70 text-sm">Separação e identificação de amostras</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⚡ Priorização</h4>
                <p className="text-white/70 text-sm">Sistema inteligente de prioridade de exames</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Rastreamento</h4>
                <p className="text-white/70 text-sm">Acompanhamento em tempo real do status</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🚨 Notificações</h4>
                <p className="text-white/70 text-sm">Alertas automáticos para situações críticas</p>
              </div>
            </div>
            <GlassButton
              onClick={() => setShowOrder(true)}
              variant="primary"
              className="mt-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Pedido
            </GlassButton>
          </GlassCard>
        );
      case 'processing':
        return (
          <GlassCard className="p-8 text-center">
            <Flask className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Processamento Laboratorial</h3>
            <p className="text-white/60 mb-6">
              Controle completo do processamento de amostras e exames
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🧪 Preparação</h4>
                <p className="text-white/70 text-sm">Centrifugação, alíquotas e preparação de amostras</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔬 Análise</h4>
                <p className="text-white/70 text-sm">Execução de exames em equipamentos automatizados</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📋 Worklists</h4>
                <p className="text-white/70 text-sm">Listas de trabalho otimizadas por equipamento</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⚙️ Equipamentos</h4>
                <p className="text-white/70 text-sm">Monitoramento e controle de instrumentos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔄 Controle</h4>
                <p className="text-white/70 text-sm">Controle de qualidade interno e externo</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⏱️ Tempo Real</h4>
                <p className="text-white/70 text-sm">Atualização automática do status dos exames</p>
              </div>
            </div>
          </GlassCard>
        );
      case 'results':
        return (
          <GlassCard className="p-8 text-center">
            <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Gestão de Resultados</h3>
            <p className="text-white/60 mb-6">
              Sistema completo de validação, interpretação e liberação de resultados
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Validação</h4>
                <p className="text-white/70 text-sm">Revisão automática e manual de resultados</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔍 Interpretação</h4>
                <p className="text-white/70 text-sm">Análise clínica com valores de referência</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🚨 Críticos</h4>
                <p className="text-white/70 text-sm">Notificação imediata de valores críticos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📝 Laudos</h4>
                <p className="text-white/70 text-sm">Geração automática de laudos estruturados</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📤 Distribuição</h4>
                <p className="text-white/70 text-sm">Envio automático para solicitantes</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📈 Histórico</h4>
                <p className="text-white/70 text-sm">Controle completo do histórico de resultados</p>
              </div>
            </div>
          </GlassCard>
        );
      case 'quality':
        return (
          <GlassCard className="p-8 text-center">
            <Target className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Controle de Qualidade</h3>
            <p className="text-white/60 mb-6">
              Sistema abrangente de garantia da qualidade laboratorial
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🎯 Controle Interno</h4>
                <p className="text-white/70 text-sm">Materiais de controle diário e calibração</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🌍 Controle Externo</h4>
                <p className="text-white/70 text-sm">Participação em programas de proficiência</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📏 Calibração</h4>
                <p className="text-white/70 text-sm">Calibração regular de equipamentos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Estatísticas</h4>
                <p className="text-white/70 text-sm">Análise estatística de performance</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🎓 Acreditação</h4>
                <p className="text-white/70 text-sm">Preparação para acreditação laboratorial</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📋 Auditorias</h4>
                <p className="text-white/70 text-sm">Auditorias internas e externas</p>
              </div>
            </div>
          </GlassCard>
        );
      case 'settings':
        return (
          <GlassCard className="p-8 text-center">
            <Settings className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Configurações</h3>
            <p className="text-white/60 mb-6">
              Configurações avançadas do laboratório clínico
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Parâmetros Gerais</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Horário de Funcionamento</span>
                    <span className="text-white">06:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Tempo Máximo de Processamento</span>
                    <span className="text-white">48 horas</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Amostras por Técnico</span>
                    <span className="text-white">80/dia</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Integrações</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">LIS Integrado</span>
                    <span className="text-green-400">Ativo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">PACS Conectado</span>
                    <span className="text-green-400">Ativo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Backup Automático</span>
                    <span className="text-green-400">Diário</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassButton variant="secondary" className="h-16 flex-col space-y-2">
                <FileText className="w-5 h-5" />
                <span>Gerenciar Exames</span>
              </GlassButton>

              <GlassButton variant="secondary" className="h-16 flex-col space-y-2">
                <Microscope className="w-5 h-5" />
                <span>Configurar Equipamentos</span>
              </GlassButton>

              <GlassButton variant="secondary" className="h-16 flex-col space-y-2">
                <Users className="w-5 h-5" />
                <span>Gerenciar Usuários</span>
              </GlassButton>
            </div>
          </GlassCard>
        );
      default:
        return <LaboratoryDashboard />;
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
                <Flask className="w-8 h-8 text-medical-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Laboratório Clínico
                </h1>
                <p className="text-text-secondary">
                  Análises laboratoriais, controle de qualidade e gestão completa
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <GlassButton variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Protocolos
              </GlassButton>
              <GlassButton
                onClick={() => setShowOrder(true)}
                variant="primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Solicitar Exames
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

export default LaboratoryCenterPage;







