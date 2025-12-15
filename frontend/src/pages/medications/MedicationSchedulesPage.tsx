import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  User,
  Pill,
  Clock,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { medicationService, MedicationSchedule } from '@/services/medicationService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const MedicationSchedulesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSchedules();
  }, [page]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await medicationService.getActiveSchedules();
      setSchedules(data);
      setTotalPages(1); // For now, assuming all active schedules fit in one page
    } catch (error: any) {
      console.error('Erro ao carregar cronogramas:', error);
      toast.error(error?.message || 'Erro ao carregar cronogramas');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSchedule = () => {
    navigate('/dev/medications/schedules/new');
  };

  const handleViewSchedule = (id: string) => {
    navigate(`/dev/medications/schedules/${id}`);
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      schedule.patient?.name.toLowerCase().includes(query) ||
      schedule.patient?.cpf.includes(query) ||
      schedule.medicationName.toLowerCase().includes(query)
    );
  });

  if (loading) {
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
                <Calendar className="w-8 h-8 mr-3 text-medical-purple" />
                Cronogramas de Medicação
              </h1>
              <p className="text-text-secondary">
                {filteredSchedules.length} cronograma{filteredSchedules.length !== 1 ? 's' : ''} ativo{filteredSchedules.length !== 1 ? 's' : ''}
              </p>
            </div>

            <GlassButton
              variant="primary"
              onClick={handleNewSchedule}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Cronograma</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <GlassInput
              placeholder="Buscar por paciente, CPF ou medicamento..."
              value={searchQuery}
              onChange={setSearchQuery}
              icon={<Search className="w-4 h-4" />}
            />
          </GlassCard>
        </motion.div>

        {/* Schedules List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredSchedules.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Calendar className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-lg">Nenhum cronograma ativo encontrado</p>
              <GlassButton
                variant="primary"
                onClick={handleNewSchedule}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Cronograma
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSchedules.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    variant="interactive"
                    className="p-6 cursor-pointer hover:bg-white/15"
                    onClick={() => handleViewSchedule(schedule.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-medical-purple/20 rounded-full flex items-center justify-center">
                            <Pill className="w-6 h-6 text-medical-purple" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {schedule.patient?.name || 'Paciente não identificado'}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              CPF: {schedule.patient?.cpf || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Medicamento</p>
                            <p className="text-white font-medium">{schedule.medicationName}</p>
                            <p className="text-sm text-text-secondary">{schedule.dosage}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Via</p>
                            <p className="text-white text-sm">{medicationService.getRouteLabel(schedule.route)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Frequência</p>
                            <p className="text-white text-sm">{schedule.frequency}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Período</p>
                            <p className="text-white text-sm">
                              {new Date(schedule.startDate).toLocaleDateString('pt-BR')}
                              {schedule.endDate && ` até ${new Date(schedule.endDate).toLocaleDateString('pt-BR')}`}
                            </p>
                          </div>
                        </div>

                        {schedule.instructions && (
                          <div className="mb-4">
                            <p className="text-xs text-text-secondary mb-1">Orientações</p>
                            <p className="text-white text-sm bg-white/5 p-2 rounded">{schedule.instructions}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-text-secondary text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                              Iniciado em {new Date(schedule.startDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <div className="bg-green-500/20 border border-green-400/30 rounded-lg px-3 py-1">
                            <p className="text-green-400 text-sm font-medium">ATIVO</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSchedule(schedule.id);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver Detalhes
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MedicationSchedulesPage;


