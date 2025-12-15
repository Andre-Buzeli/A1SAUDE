import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  TrendingUp,
  Activity,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { medicationService, MedicationAdministration, MedicationStats } from '@/services/medicationService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const MedicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();
  const [todayMedications, setTodayMedications] = useState<MedicationAdministration[]>([]);
  const [stats, setStats] = useState<MedicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'administered' | 'missed' | 'refused'>('all');

  useEffect(() => {
    loadMedicationData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadTodayMedications, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadMedicationData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadTodayMedications(), loadStats()]);
    } catch (error) {
      console.error('Erro ao carregar dados de medicações:', error);
      toast.error('Erro ao carregar dados de medicações');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayMedications = async () => {
    try {
      const medications = await medicationService.getScheduledForToday();
      setTodayMedications(medications);
    } catch (error) {
      console.error('Erro ao carregar medicações de hoje:', error);
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const statsData = await medicationService.getMedicationStats(today.toISOString());
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleAdministerMedication = async (id: string) => {
    try {
      await medicationService.administerMedication(id);
      toast.success('Medicamento administrado com sucesso!');
      loadTodayMedications();
      loadStats();
    } catch (error: any) {
      console.error('Erro ao administrar medicamento:', error);
      toast.error(error?.message || 'Erro ao administrar medicamento');
    }
  };

  const handleMarkAsMissed = async (id: string) => {
    try {
      await medicationService.markAsMissed(id, 'Não administrado no horário');
      toast.success('Medicamento marcado como perdido');
      loadTodayMedications();
      loadStats();
    } catch (error: any) {
      console.error('Erro ao marcar como perdido:', error);
      toast.error(error?.message || 'Erro ao marcar como perdido');
    }
  };

  const handleMarkAsRefused = async (id: string) => {
    try {
      await medicationService.markAsRefused(id, 'Paciente recusou');
      toast.success('Medicamento marcado como recusado');
      loadTodayMedications();
      loadStats();
    } catch (error: any) {
      console.error('Erro ao marcar como recusado:', error);
      toast.error(error?.message || 'Erro ao marcar como recusado');
    }
  };

  const filteredMedications = todayMedications.filter(medication => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      medication.patient?.name.toLowerCase().includes(query) ||
      medication.patient?.cpf.includes(query) ||
      medication.medicationName.toLowerCase().includes(query)
    );
  }).filter(medication => {
    if (filterStatus === 'all') return true;
    return medication.status === filterStatus;
  });

  const overdueMedications = filteredMedications.filter(med =>
    med.status === 'scheduled' && medicationService.isOverdue(med)
  );

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {isDevMode && <DevModeBanner />}
        <div className="container mx-auto px-4 py-8 pt-20">
          <GlassCard className="p-12">
            <div className="flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isDevMode && <DevModeBanner />}

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Pill className="w-8 h-8 mr-3 text-medical-green" />
                Administração de Medicamentos
              </h1>
              <p className="text-text-secondary">
                {filteredMedications.length} medicaç{filteredMedications.length !== 1 ? 'ões' : 'ão'} para hoje
                {overdueMedications.length > 0 && (
                  <span className="text-red-400 ml-2">
                    ({overdueMedications.length} atrasada{overdueMedications.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>

            <div className="flex space-x-3">
              <GlassButton
                variant="secondary"
                onClick={() => navigate('/dev/medications/schedules')}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Cronogramas</span>
              </GlassButton>

              <GlassButton
                variant="primary"
                onClick={() => navigate('/dev/medications/new')}
                className="flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Administrar</span>
              </GlassButton>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"
          >
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-medical-blue" />
                <div>
                  <p className="text-sm text-text-secondary">Total Hoje</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAdministrations}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-medical-green" />
                <div>
                  <p className="text-sm text-text-secondary">Administrados</p>
                  <p className="text-2xl font-bold text-white">{stats.administeredToday}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-sm text-text-secondary">Agendados</p>
                  <p className="text-2xl font-bold text-white">{stats.scheduledToday}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-sm text-text-secondary">Perdidos</p>
                  <p className="text-2xl font-bold text-white">{stats.missedToday}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-6 h-6 text-medical-purple" />
                <div>
                  <p className="text-sm text-text-secondary">Aderência</p>
                  <p className="text-2xl font-bold text-white">{stats.adherenceRate}%</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <GlassInput
                placeholder="Buscar por paciente, CPF ou medicamento..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="flex-1"
                icon={<Filter className="w-4 h-4" />}
              />

              <div className="flex space-x-2">
                <GlassButton
                  variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'scheduled' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('scheduled')}
                >
                  Agendados
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'administered' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('administered')}
                >
                  Administrados
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'missed' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('missed')}
                >
                  Perdidos
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Medications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredMedications.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Pill className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-lg">Nenhuma medicação encontrada</p>
              <GlassButton
                variant="primary"
                onClick={() => navigate('/dev/medications/new')}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Administrar Primeira Medicação
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredMedications.map((medication, index) => {
                const isOverdue = medicationService.isOverdue(medication);
                const timeUntil = medicationService.getTimeUntilNextDose(medication);

                return (
                  <motion.div
                    key={medication.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard
                      variant="interactive"
                      className={`p-6 cursor-pointer hover:bg-white/15 ${
                        isOverdue ? 'ring-2 ring-red-400/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              medication.status === 'administered' ? 'bg-green-500/20 text-green-400' :
                              medication.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                              medication.status === 'missed' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              <Pill className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {medication.patient?.name || 'Paciente não identificado'}
                              </h3>
                              <p className="text-sm text-text-secondary">
                                CPF: {medication.patient?.cpf || 'N/A'}
                              </p>
                            </div>

                            {isOverdue && (
                              <div className="bg-red-500/20 border border-red-400/50 rounded-lg px-3 py-1">
                                <p className="text-red-400 text-sm font-medium">ATRASADO</p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-text-secondary mb-1">Medicamento</p>
                              <p className="text-white font-medium">{medication.medicationName}</p>
                              <p className="text-sm text-text-secondary">{medication.dosage}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-secondary mb-1">Via</p>
                              <p className="text-white text-sm">{medicationService.getRouteLabel(medication.route)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-secondary mb-1">Horário</p>
                              <p className="text-white text-sm">
                                {new Date(medication.scheduledFor).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {medication.status === 'scheduled' && (
                                <p className={`text-xs font-medium ${
                                  isOverdue ? 'text-red-400' : 'text-green-400'
                                }`}>
                                  {timeUntil}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-text-secondary mb-1">Status</p>
                              <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${medicationService.getStatusColor(medication.status)}`}>
                                {medicationService.getStatusLabel(medication.status)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-text-secondary text-sm">
                              <Clock className="w-4 h-4" />
                              <span>
                                Frequência: {medication.frequency}
                              </span>
                            </div>

                            {medication.administeredAt && (
                              <div className="text-green-400 text-sm">
                                Administrado às {new Date(medication.administeredAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          {medication.status === 'scheduled' && (
                            <>
                              <GlassButton
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAdministerMedication(medication.id);
                                }}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Administrar
                              </GlassButton>

                              <GlassButton
                                variant="danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsMissed(medication.id);
                                }}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Perdido
                              </GlassButton>

                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRefused(medication.id);
                                }}
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Recusado
                              </GlassButton>
                            </>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MedicationsPage;


