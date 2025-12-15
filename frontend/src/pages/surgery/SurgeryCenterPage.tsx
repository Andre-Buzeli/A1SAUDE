import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Bed,
  Users,
  BarChart3,
  Settings,
  Plus,
  Stethoscope,
  FileText,
  TrendingUp
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import SurgeryDashboard from '@/components/surgery/SurgeryDashboard';
import SurgeryScheduler from '@/components/surgery/SurgeryScheduler';

type SurgeryTab = 'dashboard' | 'schedule' | 'rooms' | 'team' | 'reports' | 'settings';

const SurgeryCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SurgeryTab>('dashboard');
  const [showScheduler, setShowScheduler] = useState(false);

  const tabs = [
    { id: 'dashboard' as SurgeryTab, label: 'Dashboard', icon: BarChart3 },
    { id: 'schedule' as SurgeryTab, label: 'Agenda', icon: Calendar },
    { id: 'rooms' as SurgeryTab, label: 'Salas', icon: Bed },
    { id: 'team' as SurgeryTab, label: 'Equipe', icon: Users },
    { id: 'reports' as SurgeryTab, label: 'Relatórios', icon: TrendingUp },
    { id: 'settings' as SurgeryTab, label: 'Configurações', icon: Settings }
  ];

  const renderContent = () => {
    if (showScheduler) {
      return (
        <SurgeryScheduler
          onScheduled={(surgery) => {
            console.log('Cirurgia agendada:', surgery);
            setShowScheduler(false);
            // Refresh data
          }}
          onCancel={() => setShowScheduler(false)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <SurgeryDashboard />;
      case 'schedule':
        return (
          <GlassCard className="p-8 text-center">
            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Agenda Cirúrgica</h3>
            <p className="text-white/60 mb-6">
              Sistema completo de agendamento e controle de cirurgias
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📅 Agendamento</h4>
                <p className="text-white/70 text-sm">Agendamento de cirurgias com validação automática</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⏰ Controle de Tempo</h4>
                <p className="text-white/70 text-sm">Monitoramento de duração e eficiência</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔄 Status em Tempo Real</h4>
                <p className="text-white/70 text-sm">Atualização automática do status das cirurgias</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">👥 Equipe Multidisciplinar</h4>
                <p className="text-white/70 text-sm">Coordenação de cirurgiões, anestesistas e equipe</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Utilização de Salas</h4>
                <p className="text-white/70 text-sm">Otimização da ocupação das salas cirúrgicas</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📋 Protocolos</h4>
                <p className="text-white/70 text-sm">Checklists e protocolos padronizados</p>
              </div>
            </div>
            <GlassButton
              onClick={() => setShowScheduler(true)}
              variant="primary"
              className="mt-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar Nova Cirurgia
            </GlassButton>
          </GlassCard>
        );
      case 'rooms':
        return (
          <GlassCard className="p-8 text-center">
            <Bed className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Controle de Salas</h3>
            <p className="text-white/60 mb-6">
              Gerenciamento completo das salas cirúrgicas
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🏥 Mapeamento Visual</h4>
                <p className="text-white/70 text-sm">Visualização gráfica das salas e equipamentos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔧 Manutenção</h4>
                <p className="text-white/70 text-sm">Controle de manutenção preventiva e corretiva</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Utilização</h4>
                <p className="text-white/70 text-sm">Relatórios de ocupação e eficiência</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⚙️ Equipamentos</h4>
                <p className="text-white/70 text-sm">Cadastro e controle de equipamentos médicos</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🧹 Limpeza</h4>
                <p className="text-white/70 text-sm">Protocolos de limpeza e desinfecção</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📅 Agendamento</h4>
                <p className="text-white/70 text-sm">Calendário de reservas e manutenções</p>
              </div>
            </div>
          </GlassCard>
        );
      case 'team':
        return (
          <GlassCard className="p-8 text-center">
            <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Equipe Cirúrgica</h3>
            <p className="text-white/60 mb-6">
              Gestão completa da equipe multidisciplinar
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">👨‍⚕️ Cirurgiões</h4>
                <p className="text-white/70 text-sm">Cadastro e especialidades dos cirurgiões</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">💉 Anestesistas</h4>
                <p className="text-white/70 text-sm">Controle de anestesistas e especialidades</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🩺 Enfermeiros</h4>
                <p className="text-white/70 text-sm">Equipe de enfermagem especializada</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📅 Escalas</h4>
                <p className="text-white/70 text-sm">Controle de escalas e plantões</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🎓 Treinamentos</h4>
                <p className="text-white/70 text-sm">Registro de capacitações e certificações</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📈 Performance</h4>
                <p className="text-white/70 text-sm">Avaliação de desempenho e qualidade</p>
              </div>
            </div>
          </GlassCard>
        );
      case 'reports':
        return (
          <GlassCard className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Relatórios Cirúrgicos</h3>
            <p className="text-white/60 mb-6">
              Análises completas e relatórios gerenciais
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Volume Cirúrgico</h4>
                <p className="text-white/70 text-sm">Quantidade de cirurgias por período</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⏱️ Tempo Cirúrgico</h4>
                <p className="text-white/70 text-sm">Análise de duração e eficiência</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">💰 Custos</h4>
                <p className="text-white/70 text-sm">Análise financeira e orçamentária</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🏥 Utilização de Salas</h4>
                <p className="text-white/70 text-sm">Taxa de ocupação e eficiência</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">⚕️ Qualidade</h4>
                <p className="text-white/70 text-sm">Índices de qualidade e complicações</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold text-white mb-2">👥 Equipe</h4>
                <p className="text-white/70 text-sm">Performance individual e coletiva</p>
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
              Configurações do centro cirúrgico
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
                    <span className="text-white/80">Tempo Máximo Cirurgia</span>
                    <span className="text-white">8 horas</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Alerta Antecedência</span>
                    <span className="text-white">30 min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Protocolos</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Checklists Ativos</span>
                    <span className="text-green-400">Sim</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Auditoria Automática</span>
                    <span className="text-green-400">Sim</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                    <span className="text-white/80">Backup Diário</span>
                    <span className="text-green-400">Sim</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        );
      default:
        return <SurgeryDashboard />;
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
                  Centro Cirúrgico
                </h1>
                <p className="text-text-secondary">
                  Gestão completa de cirurgias e equipe multidisciplinar
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <GlassButton variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                Protocolos
              </GlassButton>
              <GlassButton
                onClick={() => setShowScheduler(true)}
                variant="primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agendar Cirurgia
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

export default SurgeryCenterPage;







