import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  TestTube, Plus, Search, Filter, Clock, AlertTriangle,
  CheckCircle, User, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { labService, LabExam } from '@/services/labService';

const LabPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<LabExam[]>([]);
  const [worklist, setWorklist] = useState<LabExam[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<LabExam[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'worklist' | 'critical' | 'list'>('worklist');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
  }, [establishmentId]);

  const loadData = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const [dashRes, worklistRes, criticalRes, listRes] = await Promise.all([
        labService.getDashboard(establishmentId),
        labService.getWorklist(establishmentId),
        labService.getCriticalAlerts(establishmentId),
        labService.list({ establishmentId, page: 1, limit: 20 })
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (worklistRes.success) setWorklist(worklistRes.data);
      if (criticalRes.success) setCriticalAlerts(criticalRes.data);
      if (listRes.success) {
        setExams(listRes.items);
        setPagination(prev => ({ ...prev, ...listRes.pagination }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do laboratório');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      requested: 'bg-gray-500/20 text-gray-300',
      scheduled: 'bg-blue-500/20 text-blue-300',
      collected: 'bg-yellow-500/20 text-yellow-300',
      processing: 'bg-purple-500/20 text-purple-300',
      completed: 'bg-green-500/20 text-green-300'
    };
    return statusStyles[status] || 'bg-gray-500/20 text-gray-300';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      requested: 'Solicitado',
      scheduled: 'Agendado',
      collected: 'Coletado',
      processing: 'Processando',
      completed: 'Concluído'
    };
    return statusMap[status] || status;
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TestTube className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Laboratório</h1>
              <p className="text-text-secondary">Exames laboratoriais</p>
            </div>
          </div>
          <GlassButton variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </GlassButton>
        </motion.div>

        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Solicitados Hoje</p>
              <p className="text-2xl font-bold text-white">{dashboard.todayRequested}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Coletados Hoje</p>
              <p className="text-2xl font-bold text-yellow-300">{dashboard.todayCollected}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Laudados Hoje</p>
              <p className="text-2xl font-bold text-green-300">{dashboard.todayCompleted}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-blue-300">{dashboard.pending}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Alertas Críticos</p>
              <p className="text-2xl font-bold text-red-300">{dashboard.criticalPending}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Na Worklist</p>
              <p className="text-2xl font-bold text-purple-300">{worklist.length}</p>
            </GlassCard>
          </div>
        )}

        {/* Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1">
            <GlassButton
              onClick={() => setActiveTab('worklist')}
              variant={activeTab === 'worklist' ? 'primary' : 'ghost'}
              size="sm"
            >
              Worklist ({worklist.length})
            </GlassButton>
            <GlassButton
              onClick={() => setActiveTab('critical')}
              variant={activeTab === 'critical' ? 'primary' : 'ghost'}
              size="sm"
            >
              <AlertTriangle className="w-4 h-4 mr-1 text-red-400" />
              Alertas Críticos ({criticalAlerts.length})
            </GlassButton>
            <GlassButton
              onClick={() => setActiveTab('list')}
              variant={activeTab === 'list' ? 'primary' : 'ghost'}
              size="sm"
            >
              Todos os Exames
            </GlassButton>
          </div>
        </GlassCard>

        {/* Worklist */}
        {activeTab === 'worklist' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Lista de Trabalho</h3>
            {worklist.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <TestTube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum exame pendente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {worklist.map((exam) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {exam.isCritical && <AlertTriangle className="w-5 h-5 text-red-400" />}
                      <div>
                        <p className="text-white font-medium">{exam.patient?.name}</p>
                        <p className="text-sm text-text-secondary">{exam.examName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-text-secondary">{exam.sampleId || '-'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(exam.status)}`}>
                        {getStatusText(exam.status)}
                      </span>
                      <GlassButton size="sm" variant="primary">
                        Processar
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Critical Alerts */}
        {activeTab === 'critical' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              Alertas Críticos - Pendentes de Validação
            </h3>
            {criticalAlerts.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-green-400" />
                <p>Nenhum alerta crítico pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalAlerts.map((exam) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-white font-medium">{exam.patient?.name}</span>
                      </div>
                      <span className="text-sm text-red-300">{exam.criticalAlert}</span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{exam.examName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-secondary">
                        Resultado em: {exam.analyzedAt && new Date(exam.analyzedAt).toLocaleString('pt-BR')}
                      </span>
                      <div className="flex space-x-2">
                        <GlassButton size="sm" variant="ghost">Ver Resultado</GlassButton>
                        <GlassButton size="sm" variant="primary">Validar</GlassButton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* All Exams List */}
        {activeTab === 'list' && (
          <GlassCard className="overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Buscar paciente ou exame..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-medical-blue"
                  />
                </div>
                <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none">
                  <option value="">Todas as Categorias</option>
                  <option value="hematology">Hematologia</option>
                  <option value="biochemistry">Bioquímica</option>
                  <option value="urinalysis">Urinálise</option>
                  <option value="serology">Sorologia</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Paciente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Exame</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Categoria</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {exams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                        Nenhum exame encontrado
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">
                          {new Date(exam.createdAt || '').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-text-secondary" />
                            <span className="text-sm text-white">{exam.patient?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">{exam.examName}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary capitalize">{exam.examCategory}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(exam.status)}`}>
                            {getStatusText(exam.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <GlassButton size="sm" variant="ghost">
                            <FileText className="w-4 h-4" />
                          </GlassButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Categories Distribution */}
        {dashboard?.byCategory && dashboard.byCategory.length > 0 && (
          <GlassCard className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Exames por Categoria (Hoje)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dashboard.byCategory.map((item: any) => (
                <div key={item.category} className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-white font-medium capitalize">{item.category}</p>
                  <p className="text-2xl font-bold text-purple-400">{item.count}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default LabPage;

