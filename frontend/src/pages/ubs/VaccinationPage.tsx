import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Syringe, Plus, Search, Filter, Calendar, AlertTriangle,
  ChevronDown, User, FileText, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { vaccinationService, Vaccination } from '@/services/vaccinationService';

const VaccinationPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ status: '', vaccineName: '' });
  const [showForm, setShowForm] = useState(false);

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadData();
  }, [establishmentId, pagination.page, filters]);

  const loadData = async () => {
    if (!establishmentId) return;
    try {
      setLoading(true);
      const [dashboardRes, listRes] = await Promise.all([
        vaccinationService.getDashboard(establishmentId),
        vaccinationService.list({
          establishmentId,
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        })
      ]);

      if (dashboardRes.success) setDashboard(dashboardRes.data);
      if (listRes.success) {
        setVaccinations(listRes.items);
        setPagination(prev => ({ ...prev, ...listRes.pagination }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de vacinação');
    } finally {
      setLoading(false);
    }
  };

  if (loading && vaccinations.length === 0) {
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
              <Syringe className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Vacinação</h1>
              <p className="text-text-secondary">Controle de imunização</p>
            </div>
          </div>
          <GlassButton onClick={() => setShowForm(true)} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova Vacinação
          </GlassButton>
        </motion.div>

        {/* KPIs */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Hoje</p>
                  <p className="text-2xl font-bold text-white">{dashboard.todayCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Este Mês</p>
                  <p className="text-2xl font-bold text-white">{dashboard.monthCount}</p>
                </div>
                <Syringe className="w-8 h-8 text-green-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Doses Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-300">{dashboard.pendingNextDose}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Vacinas Aplicadas</p>
                  <p className="text-2xl font-bold text-purple-300">{dashboard.byVaccine?.length || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </GlassCard>
          </div>
        )}

        {/* Filters */}
        <GlassCard className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <span className="text-white">Filtros:</span>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Buscar vacina..."
                  value={filters.vaccineName}
                  onChange={(e) => setFilters(prev => ({ ...prev, vaccineName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-medical-blue"
                />
              </div>
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-medical-blue"
            >
              <option value="">Todos os Status</option>
              <option value="applied">Aplicadas</option>
              <option value="scheduled">Agendadas</option>
              <option value="postponed">Adiadas</option>
            </select>
            <GlassButton onClick={loadData} variant="secondary" size="sm">
              Buscar
            </GlassButton>
          </div>
        </GlassCard>

        {/* Vaccination List */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Paciente</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Vacina</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Dose</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Lote</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vaccinations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                      Nenhuma vacinação encontrada
                    </td>
                  </tr>
                ) : (
                  vaccinations.map((vaccination) => (
                    <tr key={vaccination.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">
                        {new Date(vaccination.applicationDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-text-secondary" />
                          <span className="text-sm text-white">{vaccination.patient?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{vaccination.vaccineName}</td>
                      <td className="px-4 py-3 text-sm text-white">{vaccination.dose}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{vaccination.batch}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          vaccination.status === 'applied' ? 'bg-green-500/20 text-green-300' :
                          vaccination.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {vaccination.status === 'applied' ? 'Aplicada' :
                           vaccination.status === 'scheduled' ? 'Agendada' : 'Adiada'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <GlassButton size="sm" variant="ghost">
                          <ChevronDown className="w-4 h-4" />
                        </GlassButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <span className="text-sm text-text-secondary">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
              </span>
              <div className="flex space-x-2">
                <GlassButton
                  size="sm"
                  variant="ghost"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Anterior
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Próximo
                </GlassButton>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Top Vaccines */}
        {dashboard?.byVaccine && dashboard.byVaccine.length > 0 && (
          <GlassCard className="mt-6 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Vacinas Mais Aplicadas (Este Mês)</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {dashboard.byVaccine.slice(0, 5).map((vaccine: any, index: number) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-white font-medium truncate">{vaccine.name}</p>
                  <p className="text-2xl font-bold text-green-400">{vaccine.count}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default VaccinationPage;

