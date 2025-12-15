import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  LogOut, Plus, Search, User, Calendar, FileText,
  CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { dischargeService, Discharge } from '@/services/dischargeService';

const DischargePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [discharges, setDischarges] = useState<Discharge[]>([]);
  const [pending, setPending] = useState<Discharge[]>([]);
  const [todayDischarges, setTodayDischarges] = useState<Discharge[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'today' | 'all'>('pending');

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
  }, [establishmentId]);

  const loadData = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const [dashRes, pendingRes, todayRes, listRes] = await Promise.all([
        dischargeService.getDashboard(establishmentId),
        dischargeService.getPending(establishmentId),
        dischargeService.getTodayDischarges(establishmentId),
        dischargeService.list({ establishmentId, page: 1, limit: 50 })
      ]);

      if (dashRes.success) setDashboard(dashRes.data);
      if (pendingRes.success) setPending(pendingRes.data);
      if (todayRes.success) setTodayDischarges(todayRes.data);
      if (listRes.success) setDischarges(listRes.items);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de altas');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { bg: string; text: string }> = {
      medical: { bg: 'bg-green-500/20', text: 'text-green-300' },
      request: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
      transfer: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
      death: { bg: 'bg-red-500/20', text: 'text-red-300' },
      escape: { bg: 'bg-purple-500/20', text: 'text-purple-300' }
    };
    return types[type] || { bg: 'bg-gray-500/20', text: 'text-gray-300' };
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      medical: 'Alta Médica',
      request: 'A Pedido',
      transfer: 'Transferência',
      death: 'Óbito',
      escape: 'Evasão'
    };
    return typeMap[type] || type;
  };

  const getConditionText = (condition: string) => {
    const conditionMap: Record<string, string> = {
      improved: 'Melhorado',
      cured: 'Curado',
      stable: 'Estável',
      unchanged: 'Inalterado',
      worsened: 'Piorado',
      death: 'Óbito'
    };
    return conditionMap[condition] || condition;
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
            <div className="p-3 bg-green-500/20 rounded-lg">
              <LogOut className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Altas Hospitalares</h1>
              <p className="text-text-secondary">Gestão de altas e saídas</p>
            </div>
          </div>
          <GlassButton variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova Alta
          </GlassButton>
        </motion.div>

        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Altas Hoje</p>
                  <p className="text-2xl font-bold text-white">{dashboard.todayCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Este Mês</p>
                  <p className="text-2xl font-bold text-green-300">{dashboard.monthCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-300">{dashboard.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Tipos</p>
                  <p className="text-2xl font-bold text-purple-300">{dashboard.byType?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </GlassCard>
          </div>
        )}

        {/* Tabs */}
        <GlassCard className="p-2 mb-6">
          <div className="flex space-x-1">
            <GlassButton
              onClick={() => setActiveTab('pending')}
              variant={activeTab === 'pending' ? 'primary' : 'ghost'}
              size="sm"
            >
              Pendentes ({pending.length})
            </GlassButton>
            <GlassButton
              onClick={() => setActiveTab('today')}
              variant={activeTab === 'today' ? 'primary' : 'ghost'}
              size="sm"
            >
              Hoje ({todayDischarges.length})
            </GlassButton>
            <GlassButton
              onClick={() => setActiveTab('all')}
              variant={activeTab === 'all' ? 'primary' : 'ghost'}
              size="sm"
            >
              Todas
            </GlassButton>
          </div>
        </GlassCard>

        {/* Content */}
        {activeTab === 'pending' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Altas Pendentes de Finalização</h3>
            {pending.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-green-400" />
                <p>Nenhuma alta pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((discharge) => (
                  <motion.div
                    key={discharge.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <User className="w-8 h-8 text-text-secondary" />
                      <div>
                        <p className="text-white font-medium">{discharge.patient?.name}</p>
                        <p className="text-sm text-text-secondary">{discharge.mainDiagnosis}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(discharge.dischargeType).bg} ${getTypeBadge(discharge.dischargeType).text}`}>
                        {getTypeText(discharge.dischargeType)}
                      </span>
                      <GlassButton size="sm" variant="primary">
                        Finalizar
                      </GlassButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {activeTab === 'today' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Altas de Hoje</h3>
            {todayDischarges.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <LogOut className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhuma alta registrada hoje</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayDischarges.map((discharge) => (
                  <div key={discharge.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(discharge.dischargeType).bg} ${getTypeBadge(discharge.dischargeType).text}`}>
                        {getTypeText(discharge.dischargeType)}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {new Date(discharge.dischargeDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white font-medium">{discharge.patient?.name}</p>
                    <p className="text-sm text-text-secondary mb-2">{discharge.mainDiagnosis}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        Condição: {getConditionText(discharge.patientCondition)}
                      </span>
                      <span className="text-text-secondary">
                        Dr(a). {discharge.physicianName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {activeTab === 'all' && (
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
                  <option value="medical">Alta Médica</option>
                  <option value="request">A Pedido</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Paciente</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Diagnóstico</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Condição</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {discharges.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                        Nenhuma alta encontrada
                      </td>
                    </tr>
                  ) : (
                    discharges.map((discharge) => (
                      <tr key={discharge.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="px-4 py-3 text-sm text-white">
                          {new Date(discharge.dischargeDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-text-secondary" />
                            <span className="text-sm text-white">{discharge.patient?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary truncate max-w-[200px]">
                          {discharge.mainDiagnosis}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(discharge.dischargeType).bg} ${getTypeBadge(discharge.dischargeType).text}`}>
                            {getTypeText(discharge.dischargeType)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {getConditionText(discharge.patientCondition)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            discharge.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {discharge.status === 'completed' ? 'Concluída' : 'Pendente'}
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

        {/* Stats by Type */}
        {dashboard?.byType && dashboard.byType.length > 0 && (
          <GlassCard className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Altas por Tipo (Este Mês)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {dashboard.byType.map((item: any) => (
                <div key={item.type} className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-white font-medium">{getTypeText(item.type)}</p>
                  <p className="text-2xl font-bold text-green-400">{item.count}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default DischargePage;

