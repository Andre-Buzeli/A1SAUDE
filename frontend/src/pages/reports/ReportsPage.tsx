import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Mail,
  Settings,
  FileSpreadsheet,
  FileImage,
  Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface ReportType {
  id: string;
  name: string;
  description: string;
  formats: string[];
  parameters: string[];
  icon: React.ReactNode;
  color: string;
}

interface DashboardMetrics {
  attendanceMetrics: {
    today: number;
    week: number;
    month: number;
    avgWaitTime: number;
  };
  patientMetrics: {
    total: number;
    newThisMonth: number;
    returning: number;
  };
  bedMetrics: {
    total: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  };
  financialMetrics: {
    revenue: number;
    expenses: number;
    budgetVariance: number;
  };
}

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    format: 'json' as 'json' | 'pdf' | 'excel'
  });
  const [activeTab, setActiveTab] = useState<'reports' | 'scheduled' | 'shared'>('reports');
  const [scheduledReports, setScheduledReports] = useState<any[]>([]);
  const [sharedReports, setSharedReports] = useState<any[]>([]);

  const reportTypes: ReportType[] = [
    {
      id: 'attendance',
      name: 'Relatório de Atendimentos',
      description: 'Relatório completo de atendimentos por período',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate'],
      icon: <Activity className="w-6 h-6" />,
      color: 'text-blue-400'
    },
    {
      id: 'patients',
      name: 'Relatório de Pacientes',
      description: 'Cadastro de pacientes ativos',
      formats: ['json', 'pdf', 'excel'],
      parameters: [],
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-400'
    },
    {
      id: 'financial',
      name: 'Relatório Financeiro',
      description: 'Relatório de receitas e despesas',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate'],
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-yellow-400'
    },
    {
      id: 'epidemiology',
      name: 'Relatório Epidemiológico',
      description: 'Notificações e casos de doenças',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate', 'disease'],
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-red-400'
    },
    {
      id: 'medications',
      name: 'Relatório de Medicamentos',
      description: 'Controle de medicamentos e prescrições',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate', 'medication'],
      icon: <Activity className="w-6 h-6" />,
      color: 'text-purple-400'
    },
    {
      id: 'exams',
      name: 'Relatório de Exames',
      description: 'Solicitações e resultados de exames',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate', 'examType'],
      icon: <FileText className="w-6 h-6" />,
      color: 'text-indigo-400'
    },
    {
      id: 'rh',
      name: 'Relatório de RH',
      description: 'Equipe, escalas e produtividade',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate', 'department'],
      icon: <Users className="w-6 h-6" />,
      color: 'text-cyan-400'
    },
    {
      id: 'beds',
      name: 'Relatório de Leitos',
      description: 'Ocupação e disponibilidade de leitos',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate'],
      icon: <Activity className="w-6 h-6" />,
      color: 'text-orange-400'
    },
    {
      id: 'quality',
      name: 'Relatório de Qualidade',
      description: 'Indicadores de qualidade assistencial',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate'],
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'text-emerald-400'
    },
    {
      id: 'emergency',
      name: 'Relatório de Emergência',
      description: 'Atendimentos de emergência e triagem',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate', 'priority'],
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-rose-400'
    },
    {
      id: 'vaccination',
      name: 'Relatório de Vacinação',
      description: 'Cobertura vacinal e campanhas',
      formats: ['json', 'pdf', 'excel'],
      parameters: ['startDate', 'endDate', 'vaccine'],
      icon: <Activity className="w-6 h-6" />,
      color: 'text-teal-400'
    }
  ];

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      // Mock dashboard metrics - replace with actual API call
      const mockMetrics: DashboardMetrics = {
        attendanceMetrics: {
          today: 45,
          week: 312,
          month: 1247,
          avgWaitTime: 15
        },
        patientMetrics: {
          total: 2847,
          newThisMonth: 89,
          returning: 2758
        },
        bedMetrics: {
          total: 50,
          occupied: 38,
          available: 12,
          occupancyRate: 76
        },
        financialMetrics: {
          revenue: 45000,
          expenses: 38000,
          budgetVariance: 7000
        }
      };

      setDashboardMetrics(mockMetrics);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast.error('Erro ao carregar métricas do dashboard');
    }
  };

  const generateReport = async (reportType: ReportType) => {
    if (!selectedReport) return;

    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('format', reportFilters.format);

      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);

      // Mock report generation - replace with actual API call
      const endpoint = `/api/reports/${selectedReport.id}?${params.toString()}`;

      if (reportFilters.format === 'json') {
        // For JSON, show preview
        toast.success(`Relatório ${selectedReport.name} gerado em JSON`);
      } else {
        // For PDF/Excel, trigger download
        const link = document.createElement('a');
        link.href = endpoint;
        link.download = `relatorio-${selectedReport.id}.${reportFilters.format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Relatório ${selectedReport.name} baixado`);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const scheduleReport = async (reportType: ReportType, scheduleData: any) => {
    try {
      // Mock scheduling - replace with actual API call
      const scheduledReport = {
        id: `scheduled-${Date.now()}`,
        reportType: reportType.id,
        name: reportType.name,
        frequency: scheduleData.frequency,
        nextRun: scheduleData.nextRun,
        recipients: scheduleData.recipients,
        format: scheduleData.format,
        createdAt: new Date().toISOString(),
        active: true
      };

      setScheduledReports(prev => [...prev, scheduledReport]);
      toast.success('Relatório agendado com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar relatório:', error);
      toast.error('Erro ao agendar relatório');
    }
  };

  const shareReport = async (reportType: ReportType, shareData: any) => {
    try {
      // Mock sharing - replace with actual API call
      const sharedReport = {
        id: `shared-${Date.now()}`,
        reportType: reportType.id,
        name: reportType.name,
        sharedWith: shareData.sharedWith,
        permissions: shareData.permissions,
        expiresAt: shareData.expiresAt,
        sharedAt: new Date().toISOString(),
        accessCount: 0
      };

      setSharedReports(prev => [...prev, sharedReport]);
      toast.success('Relatório compartilhado com sucesso!');
    } catch (error) {
      console.error('Erro ao compartilhar relatório:', error);
      toast.error('Erro ao compartilhar relatório');
    }
  };

  const exportReport = async (reportType: ReportType, format: string) => {
    try {
      setLoading(true);

      // Enhanced export functionality
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('timestamp', new Date().toISOString());

      if (reportFilters.startDate) params.append('startDate', reportFilters.startDate);
      if (reportFilters.endDate) params.append('endDate', reportFilters.endDate);

      const endpoint = `/api/reports/${reportType.id}/export?${params.toString()}`;

      if (format === 'json') {
        // For JSON, create a data URL and download
        const mockData = {
          reportType: reportType.id,
          generatedAt: new Date().toISOString(),
          filters: reportFilters,
          data: `Mock data for ${reportType.name}`
        };

        const dataStr = JSON.stringify(mockData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `relatorio-${reportType.id}-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast.success(`Relatório ${reportType.name} exportado em JSON`);
      } else {
        // For PDF/Excel, mock download
        const link = document.createElement('a');
        link.href = endpoint;
        link.download = `relatorio-${reportType.id}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Relatório ${reportType.name} baixado em ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Relatórios e Analytics
          </h1>
          <p className="text-text-secondary">
            {user?.establishmentName} - Relatórios e métricas do sistema
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg mb-6"
        >
          {[
            { id: 'reports', label: 'Relatórios', icon: FileText },
            { id: 'scheduled', label: 'Agendados', icon: Clock },
            { id: 'shared', label: 'Compartilhados', icon: Share2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <>
            {/* Dashboard Metrics */}
            {dashboardMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Atendimentos Hoje</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(dashboardMetrics.attendanceMetrics.today)}
                  </p>
                  <p className="text-text-secondary text-xs">
                    Semana: {formatNumber(dashboardMetrics.attendanceMetrics.week)}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-medical-blue" />
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total de Pacientes</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(dashboardMetrics.patientMetrics.total)}
                  </p>
                  <p className="text-text-secondary text-xs">
                    Novos: {formatNumber(dashboardMetrics.patientMetrics.newThisMonth)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-medical-green" />
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Taxa de Ocupação</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboardMetrics.bedMetrics.occupancyRate}%
                  </p>
                  <p className="text-text-secondary text-xs">
                    {dashboardMetrics.bedMetrics.occupied}/{dashboardMetrics.bedMetrics.total} leitos
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-medical-orange" />
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Resultado Financeiro</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(dashboardMetrics.financialMetrics.budgetVariance)}
                  </p>
                  <p className="text-text-secondary text-xs">
                    Receita: {formatCurrency(dashboardMetrics.financialMetrics.revenue)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-medical-purple" />
              </div>
            </GlassCard>
          </div>
        )}

        {/* Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Reports */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Relatórios Disponíveis</h2>

              <div className="space-y-4">
                {reportTypes.map((report) => (
                  <motion.div
                    key={report.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border backdrop-blur-sm cursor-pointer transition-all ${
                      selectedReport?.id === report.id
                        ? 'bg-white/20 border-white/50'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-white/10 ${report.color}`}>
                        {report.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white">{report.name}</h3>
                        <p className="text-text-secondary text-sm mt-1">{report.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-text-secondary">
                            Formatos: {report.formats.join(', ')}
                          </span>
                          {report.parameters.length > 0 && (
                            <span className="text-xs text-text-secondary">
                              Parâmetros: {report.parameters.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Report Generator */}
          <div>
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Gerar Relatório</h2>

              {selectedReport ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {selectedReport.name}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* Report Parameters */}
                  {selectedReport.parameters.includes('startDate') && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={reportFilters.startDate}
                        onChange={(e) => setReportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  )}

                  {selectedReport.parameters.includes('endDate') && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={reportFilters.endDate}
                        onChange={(e) => setReportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  )}

                  {selectedReport.parameters.includes('disease') && (
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Doença
                      </label>
                      <select
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="">Todas as doenças</option>
                        <option value="COVID-19">COVID-19</option>
                        <option value="Influenza">Influenza</option>
                        <option value="Dengue">Dengue</option>
                      </select>
                    </div>
                  )}

                  {/* Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Formato
                    </label>
                    <select
                      value={reportFilters.format}
                      onChange={(e) => setReportFilters(prev => ({ ...prev, format: e.target.value as any }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      {selectedReport.formats.map(format => (
                        <option key={format} value={format}>
                          {format.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Generate Button */}
                  <GlassButton
                    onClick={() => generateReport(selectedReport)}
                    loading={loading}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Gerar Relatório</span>
                  </GlassButton>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <p className="text-text-secondary">
                    Selecione um relatório para gerar
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Estatísticas Rápidas</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-medical-blue mb-1">
                  {dashboardMetrics?.attendanceMetrics.avgWaitTime}min
                </div>
                <div className="text-sm text-text-secondary">Tempo Médio de Espera</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-medical-green mb-1">
                  {Math.round((dashboardMetrics?.patientMetrics.returning || 0) / (dashboardMetrics?.patientMetrics.total || 1) * 100)}%
                </div>
                <div className="text-sm text-text-secondary">Taxa de Retorno</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-medical-orange mb-1">
                  {dashboardMetrics?.bedMetrics.available}
                </div>
                <div className="text-sm text-text-secondary">Leitos Disponíveis</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-medical-purple mb-1">
                  {dashboardMetrics?.financialMetrics.expenses ?
                    Math.round((dashboardMetrics.financialMetrics.budgetVariance / dashboardMetrics.financialMetrics.expenses) * 100) : 0}%
                </div>
                <div className="text-sm text-text-secondary">Variação Orçamentária</div>
              </div>
            </div>
          </GlassCard>
        </div>
        )}

        {/* Scheduled Reports Tab */}
        {activeTab === 'scheduled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Relatórios Agendados</h2>
                <p className="text-gray-400">Relatórios gerados automaticamente</p>
              </div>
              <GlassButton
                onClick={() => toast.success('Agendar relatório em desenvolvimento')}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Novo Agendamento
              </GlassButton>
            </div>

            <GlassCard className="p-6">
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Relatórios Agendados</h3>
                <p className="text-gray-500 mb-4">Funcionalidade em desenvolvimento</p>
                <p className="text-sm text-gray-600">
                  Aqui você poderá agendar relatórios para serem gerados automaticamente em intervalos definidos
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Shared Reports Tab */}
        {activeTab === 'shared' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Relatórios Compartilhados</h2>
                <p className="text-gray-400">Relatórios compartilhados com outros usuários</p>
              </div>
              <GlassButton
                onClick={() => toast.success('Compartilhar relatório em desenvolvimento')}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </GlassButton>
            </div>

            <GlassCard className="p-6">
              <div className="text-center py-12">
                <Share2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Relatórios Compartilhados</h3>
                <p className="text-gray-500 mb-4">Funcionalidade em desenvolvimento</p>
                <p className="text-sm text-gray-600">
                  Aqui você poderá compartilhar relatórios com outros profissionais e controlar permissões de acesso
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
