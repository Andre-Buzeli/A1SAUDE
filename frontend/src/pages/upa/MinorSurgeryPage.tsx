import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Scissors, Plus, Search, User, Clock, CheckCircle,
  AlertTriangle, RefreshCw, Play, FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { minorSurgeryService, MinorSurgery } from '@/services/minorSurgeryService';

const MinorSurgeryPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [surgeries, setSurgeries] = useState<MinorSurgery[]>([]);
  const [todaySurgeries, setTodaySurgeries] = useState<MinorSurgery[]>([]);
  const [procedureTypes, setProcedureTypes] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'list'>('today');

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
  }, [establishmentId]);

  const loadData = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const [dashRes, todayRes, listRes, typesRes] = await Promise.all([
        minorSurgeryService.getDashboard(establishmentId),
        minorSurgeryService.getTodayProcedures(establishmentId),
        minorSurgeryService.list({ establishmentId, page: 1, limit: 50 }),
        minorSurgeryService.getProcedureTypes()
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (todayRes.success) setTodaySurgeries(todayRes.data);
      if (listRes.success) setSurgeries(listRes.items);
      if (typesRes.success) setProcedureTypes(typesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartProcedure = async (id: string) => {
    try {
      await minorSurgeryService.start(id);
      toast.success('Procedimento iniciado');
      loadData();
    } catch (error) {
      toast.error('Erro ao iniciar procedimento');
    }
  };

  const handleCompleteProcedure = async (id: string) => {
    try {
      await minorSurgeryService.complete(id, {});
      toast.success('Procedimento concluído');
      loadData();
    } catch (error) {
      toast.error('Erro ao concluir procedimento');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-500/20 text-blue-300',
      in_progress: 'bg-yellow-500/20 text-yellow-300',
      completed: 'bg-green-500/20 text-green-300',
      cancelled: 'bg-red-500/20 text-red-300'
    };
    return styles[status] || 'bg-gray-500/20 text-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      scheduled: 'Agendado',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const getProcedureTypeName = (type: string) => {
    const found = procedureTypes.find(t => t.id === type);
    return found?.name || type;
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
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Scissors className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Pequenas Cirurgias</h1>
              <p className="text-text-secondary">Procedimentos ambulatoriais</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton onClick={loadData} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GlassButton>
            <GlassButton variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Procedimento
            </GlassButton>
          </div>
        </motion.div>

        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Hoje</p>
              <p className="text-2xl font-bold text-white">{dashboard.todayCount}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Este Mês</p>
              <p className="text-2xl font-bold text-blue-300">{dashboard.monthCount}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Em Andamento</p>
              <p className="text-2xl font-bold text-yellow-300">{dashboard.inProgress}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Complicações</p>
              <p className="text-2xl font-bold text-red-300">{dashboard.complications}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Na Fila</p>
              <p className="text-2xl font-bold text-purple-300">
                {todaySurgeries.filter(s => s.status === 'scheduled').length}
              </p>
            </GlassCard>
          </div>
        )}

        {/* Procedure Types Distribution */}
        {dashboard?.byType && dashboard.byType.length > 0 && (
          <GlassCard className="p-4 mb-6">
            <h3 className="text-white font-medium mb-3">Procedimentos por Tipo (Este Mês)</h3>
            <div className="flex flex-wrap gap-3">
              {dashboard.byType.map((item: any) => (
                <div key={item.type} className="px-3 py-2 bg-white/5 rounded-lg">
                  <span className="text-white font-medium">{getProcedureTypeName(item.type)}</span>
                  <span className="ml-2 text-orange-400 font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1">
            <GlassButton
              onClick={() => setActiveTab('today')}
              variant={activeTab === 'today' ? 'primary' : 'ghost'}
              size="sm"
            >
              Hoje ({todaySurgeries.length})
            </GlassButton>
            <GlassButton
              onClick={() => setActiveTab('list')}
              variant={activeTab === 'list' ? 'primary' : 'ghost'}
              size="sm"
            >
              Histórico
            </GlassButton>
          </div>
        </GlassCard>

        {/* Today's Procedures */}
        {activeTab === 'today' && (
          <GlassCard className="p-6">
            {todaySurgeries.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <Scissors className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum procedimento agendado para hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySurgeries.map((surgery, index) => (
                  <motion.div
                    key={surgery.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        surgery.status === 'in_progress' ? 'bg-yellow-500/20' :
                        surgery.status === 'completed' ? 'bg-green-500/20' : 'bg-blue-500/20'
                      }`}>
                        <Scissors className={`w-5 h-5 ${
                          surgery.status === 'in_progress' ? 'text-yellow-400' :
                          surgery.status === 'completed' ? 'text-green-400' : 'text-blue-400'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{surgery.patient?.name}</p>
                        <p className="text-sm text-text-secondary">{surgery.procedureName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-text-secondary">{surgery.bodyRegion}</span>
                          {surgery.laterality && (
                            <>
                              <span className="text-xs text-text-secondary">•</span>
                              <span className="text-xs text-text-secondary">{surgery.laterality}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {surgery.anesthesiaType && (
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">
                          {surgery.anesthesiaType}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(surgery.status)}`}>
                        {getStatusText(surgery.status)}
                      </span>
                      {surgery.status === 'scheduled' && (
                        <GlassButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleStartProcedure(surgery.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </GlassButton>
                      )}
                      {surgery.status === 'in_progress' && (
                        <GlassButton
                          size="sm"
                          variant="success"
                          onClick={() => handleCompleteProcedure(surgery.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Concluir
                        </GlassButton>
                      )}
                      {surgery.status === 'completed' && (
                        <GlassButton size="sm" variant="ghost">
                          <FileText className="w-4 h-4" />
                        </GlassButton>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* Historical List */}
        {activeTab === 'list' && (
          <GlassCard className="overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Buscar paciente..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-medical-blue"
                  />
                </div>
                <select className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none">
                  <option value="">Todos os Tipos</option>
                  {procedureTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Paciente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Procedimento</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Região</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Duração</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {surgeries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                        Nenhum procedimento encontrado
                      </td>
                    </tr>
                  ) : (
                    surgeries.map((surgery) => (
                      <tr key={surgery.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="px-4 py-3 text-sm text-white">
                          {surgery.startTime
                            ? new Date(surgery.startTime).toLocaleDateString('pt-BR')
                            : new Date(surgery.createdAt || '').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-text-secondary" />
                            <span className="text-sm text-white">{surgery.patient?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">{surgery.procedureName}</td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {surgery.bodyRegion}
                          {surgery.laterality && ` (${surgery.laterality})`}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {surgery.duration ? `${surgery.duration} min` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(surgery.status)}`}>
                            {getStatusText(surgery.status)}
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

        {/* Procedure Types Reference */}
        {procedureTypes.length > 0 && (
          <GlassCard className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tipos de Procedimentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {procedureTypes.map((type) => (
                <div key={type.id} className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">{type.name}</p>
                  <p className="text-xs text-text-secondary">{type.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default MinorSurgeryPage;

