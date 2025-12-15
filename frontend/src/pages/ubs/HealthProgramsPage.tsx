import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Heart, Users, Baby, User, Activity, Plus, Search, Filter,
  Calendar, AlertTriangle, ChevronRight, Clock, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { healthProgramService, HealthProgram, ProgramEnrollment } from '@/services/healthProgramService';

type TabType = 'dashboard' | 'hiperdia' | 'prenatal' | 'childcare' | 'elderly';

const programIcons: Record<string, React.ReactNode> = {
  hiperdia: <Heart className="w-5 h-5" />,
  prenatal: <Baby className="w-5 h-5" />,
  childcare: <Users className="w-5 h-5" />,
  elderly: <User className="w-5 h-5" />
};

const programNames: Record<string, string> = {
  hiperdia: 'Hiperdia',
  prenatal: 'Pré-Natal',
  childcare: 'Puericultura',
  elderly: 'Idosos'
};

const HealthProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [pendingVisits, setPendingVisits] = useState<ProgramEnrollment[]>([]);

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadDashboard();
  }, [establishmentId]);

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      loadProgramData(activeTab);
    }
  }, [activeTab, establishmentId]);

  const loadDashboard = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const [dashRes, pendingRes] = await Promise.all([
        healthProgramService.getDashboard(establishmentId),
        healthProgramService.getPendingVisits(establishmentId)
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (pendingRes.success) setPendingVisits(pendingRes.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadProgramData = async (programName: string) => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      let response;
      switch (programName) {
        case 'hiperdia':
          response = await healthProgramService.getHiperdiaData(establishmentId);
          break;
        case 'prenatal':
          response = await healthProgramService.getPrenatalData(establishmentId);
          break;
        case 'childcare':
          response = await healthProgramService.getChildcareData(establishmentId);
          break;
        case 'elderly':
          response = await healthProgramService.getElderlyData(establishmentId);
          break;
      }
      if (response?.success) setEnrollments(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados do programa:', error);
      toast.error('Erro ao carregar dados do programa');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'hiperdia', label: 'Hiperdia', icon: Heart },
    { id: 'prenatal', label: 'Pré-Natal', icon: Baby },
    { id: 'childcare', label: 'Puericultura', icon: Users },
    { id: 'elderly', label: 'Idosos', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Programas de Saúde</h1>
              <p className="text-text-secondary">Acompanhamento de programas preventivos</p>
            </div>
          </div>
          <GlassButton variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova Inscrição
          </GlassButton>
        </motion.div>

        {/* Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <GlassButton
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  variant={activeTab === tab.id ? 'primary' : 'ghost'}
                  className="flex items-center space-x-2 whitespace-nowrap"
                  size="sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </GlassButton>
              );
            })}
          </div>
        </GlassCard>

        {/* Content */}
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* KPIs */}
            {dashboard && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Inscritos Ativos</p>
                      <p className="text-2xl font-bold text-white">{dashboard.activeEnrollments}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Alto Risco</p>
                      <p className="text-2xl font-bold text-red-300">{dashboard.highRisk}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Visitas Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-300">{dashboard.pendingVisits}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Programas</p>
                      <p className="text-2xl font-bold text-green-300">{dashboard.programs?.length || 0}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Programs Overview */}
            {dashboard?.programs && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Programas Ativos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dashboard.programs.map((program: any) => (
                    <div
                      key={program.id}
                      onClick={() => setActiveTab(program.name as TabType)}
                      className="p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 bg-medical-blue/20 rounded-lg">
                          {programIcons[program.name] || <Activity className="w-5 h-5 text-medical-blue" />}
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-secondary" />
                      </div>
                      <h4 className="text-white font-medium">{programNames[program.name] || program.name}</h4>
                      <p className="text-2xl font-bold text-medical-blue">{program.activeCount}</p>
                      <p className="text-xs text-text-secondary">pacientes ativos</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Pending Visits */}
            {pendingVisits.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Visitas Pendentes</h3>
                <div className="space-y-2">
                  {pendingVisits.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          enrollment.riskLevel === 'high' ? 'bg-red-500' :
                          enrollment.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="text-white font-medium">{enrollment.patient?.name}</p>
                          <p className="text-xs text-text-secondary">
                            {enrollment.program?.name && programNames[enrollment.program.name]}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-yellow-300">
                          {enrollment.nextVisitDate && new Date(enrollment.nextVisitDate).toLocaleDateString('pt-BR')}
                        </p>
                        <GlassButton size="sm" variant="ghost">Agendar</GlassButton>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        ) : (
          /* Program List */
          <GlassCard className="overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {programNames[activeTab]} - Pacientes Inscritos
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-medical-blue"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Paciente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Inscrição</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Risco</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Última Visita</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Próxima Visita</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                        Nenhum paciente inscrito neste programa
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-text-secondary" />
                            <div>
                              <p className="text-sm text-white font-medium">{enrollment.patient?.name}</p>
                              <p className="text-xs text-text-secondary">{enrollment.patient?.cpf}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            enrollment.riskLevel === 'high' ? 'bg-red-500/20 text-red-300' :
                            enrollment.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {enrollment.riskLevel === 'high' ? 'Alto' :
                             enrollment.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {enrollment.lastVisitDate
                            ? new Date(enrollment.lastVisitDate).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {enrollment.nextVisitDate
                            ? new Date(enrollment.nextVisitDate).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            enrollment.status === 'active' ? 'bg-green-500/20 text-green-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {enrollment.status === 'active' ? 'Ativo' : enrollment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default HealthProgramsPage;

