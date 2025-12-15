import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  FileText,
  Monitor,
  Users,
  Settings,
  Plus,
  Stethoscope,
  Search,
  Eye,
  Edit,
  X
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import ImagingDashboard from '@/components/imaging/ImagingDashboard';
import ImagingRequest from '@/components/imaging/ImagingRequest';

type ImagingTab = 'dashboard' | 'schedule' | 'exams' | 'equipment' | 'reports' | 'settings';

const ImagingCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ImagingTab>('dashboard');
  const [showRequest, setShowRequest] = useState(false);

  const tabs = [
    { id: 'dashboard' as ImagingTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'schedule' as ImagingTab, label: 'Agenda', icon: Calendar },
    { id: 'exams' as ImagingTab, label: 'Exames', icon: Search },
    { id: 'equipment' as ImagingTab, label: 'Equipamentos', icon: Monitor },
    { id: 'reports' as ImagingTab, label: 'Laudos', icon: FileText },
    { id: 'settings' as ImagingTab, label: 'Configurações', icon: Settings }
  ];

  const renderContent = () => {
    if (showRequest) {
      return (
        <ImagingRequest
          onRequested={(exam) => {
            console.log('Exame solicitado:', exam);
            setShowRequest(false);
            // Refresh data
          }}
          onCancel={() => setShowRequest(false)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <ImagingDashboard />;
      case 'schedule':
        return (
          <GlassCard className="p-8 text-center">
            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Agenda de Exames</h3>
            <p className="text-white/60 mb-6">
              Sistema completo de agendamento e controle de exames de imagem
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📅 Agendamento Inteligente</h4>
                <p className="text-white/70 text-sm">Otimização automática de horários e recursos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🏥 Controle de Salas</h4>
                <p className="text-white/70 text-sm">Gestão completa de salas de exame</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">👥 Worklists</h4>
                <p className="text-white/70 text-sm">Listas de trabalho para técnicos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Priorização</h4>
                <p className="text-white/70 text-sm">Sistema de prioridade por urgência</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔄 Reagendamento</h4>
                <p className="text-white/70 text-sm">Reagendamento automático por conflitos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📱 Notificações</h4>
                <p className="text-white/70 text-sm">Alertas em tempo real para equipe</p>
              </div>
            </div>
            <GlassButton
              onClick={() => setShowRequest(true)}
              variant="primary"
              className="mt-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar Exame
            </GlassButton>
          </GlassCard>
        );
      case 'exams':
        return (
          <GlassCard className="p-8 text-center">
            <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Gestão de Exames</h3>
            <p className="text-white/60 mb-6">
              Controle completo do ciclo de vida dos exames de imagem
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔍 Solicitações</h4>
                <p className="text-white/70 text-sm">Recebimento e validação de solicitações</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⚡ Execução</h4>
                <p className="text-white/70 text-sm">Controle em tempo real da execução</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🖼️ Imagens</h4>
                <p className="text-white/70 text-sm">Armazenamento e visualização PACS</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📋 Laudos</h4>
                <p className="text-white/70 text-sm">Sistema de laudo estruturado</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">✅ Qualidade</h4>
                <p className="text-white/70 text-sm">Controle de qualidade automático</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📤 Distribuição</h4>
                <p className="text-white/70 text-sm">Envio automático para solicitantes</p>
              </div>
            </div>
          </GlassCard>
        );
      case 'equipment':
        return (
          <GlassCard className="p-8 text-center">
            <Monitor className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Equipamentos</h3>
            <p className="text-white/60 mb-6">
              Gestão completa de equipamentos de imagem médica
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Monitoramento</h4>
                <p className="text-white/70 text-sm">Status em tempo real de todos os equipamentos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔧 Manutenção</h4>
                <p className="text-white/70 text-sm">Agendamento e controle de manutenções</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📈 Utilização</h4>
                <p className="text-white/70 text-sm">Análise de produtividade e eficiência</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⚙️ Calibração</h4>
                <p className="text-white/70 text-sm">Controle de calibração e qualidade</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">💰 Custos</h4>
                <p className="text-white/70 text-sm">Análise de custos e depreciação</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📱 IoT</h4>
                <p className="text-white/70 text-sm">Integração com sensores inteligentes</p>
              </div>
            </div>
          </GlassCard>
        );
      case 'reports':
        return (
          <GlassCard className="p-8 text-center">
            <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Sistema de Laudos</h3>
            <p className="text-white/60 mb-6">
              Laudos estruturados com templates inteligentes
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📝 Templates</h4>
                <p className="text-white/70 text-sm">Templates estruturados por modalidade</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🎯 IA Assistida</h4>
                <p className="text-white/70 text-sm">Sugestões automáticas de achados</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Estruturado</h4>
                <p className="text-white/70 text-sm">Dados estruturados para pesquisa</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">👥 Colaboração</h4>
                <p className="text-white/70 text-sm">Revisão e contra-assinatura</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📤 Integração</h4>
                <p className="text-white/70 text-sm">Envio automático para sistemas</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔍 Pesquisa</h4>
                <p className="text-white/70 text-sm">Busca avançada em laudos</p>
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
              Configurações avançadas do centro de imagem
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
                    <span className="text-white/80">Tempo Máximo de Espera</span>
                    <span className="text-white">4 horas</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Prioridade Emergencial</span>
                    <span className="text-green-400">Ativada</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Recursos Avançados</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">PACS Integrado</span>
                    <span className="text-green-400">Ativo</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">IA para Laudos</span>
                    <span className="text-yellow-400">Em Teste</span>
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
                <Eye className="w-5 h-5" />
                <span>Ver Protocolos</span>
              </GlassButton>

              <GlassButton variant="secondary" className="h-16 flex-col space-y-2">
                <Edit className="w-5 h-5" />
                <span>Editar Templates</span>
              </GlassButton>

              <GlassButton variant="secondary" className="h-16 flex-col space-y-2">
                <X className="w-5 h-5" />
                <span>Gerenciar Usuários</span>
              </GlassButton>
            </div>
          </GlassCard>
        );
      default:
        return <ImagingDashboard />;
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
                <Stethoscope className="w-8 h-8 text-medical-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Centro de Imagem
                </h1>
                <p className="text-text-secondary">
                  Gestão completa de exames de imagem e laudos radiológicos
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <GlassButton variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Protocolos
              </GlassButton>
              <GlassButton
                onClick={() => setShowRequest(true)}
                variant="primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Solicitar Exame
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

export default ImagingCenterPage;







