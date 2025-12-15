import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, User, Filter, Pill } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { prescriptionService, Prescription } from '@/services/prescriptionService';

export const PrescriptionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPrescriptions();
  }, [filterStatus, page]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      
      const filters: any = {
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      if (searchQuery) {
        // Note: Backend would need to support search by patient name
        // For now, we'll filter on frontend
      }

      const data = await prescriptionService.searchPrescriptions(filters);
      setPrescriptions(data.prescriptions || []);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      console.error('Erro ao carregar prescrições:', error);
      toast.error(error?.message || 'Erro ao carregar prescrições');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPrescription = () => {
    navigate('/dev/prescriptions/new');
  };

  const handleViewPrescription = (id: string) => {
    navigate(`/dev/prescriptions/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-medical-green/20 text-medical-green border-medical-green/30';
      case 'completed':
        return 'bg-medical-blue/20 text-medical-blue border-medical-blue/30';
      case 'cancelled':
        return 'bg-medical-red/20 text-medical-red border-medical-red/30';
      case 'expired':
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativa',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      expired: 'Expirada'
    };
    return labels[status] || status;
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      prescription.patient?.name.toLowerCase().includes(query) ||
      prescription.patient?.cpf.includes(query) ||
      prescription.medications.some(m => m.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
                <FileText className="w-8 h-8 mr-3 text-medical-blue" />
                Prescrições Médicas
              </h1>
              <p className="text-text-secondary">
                {filteredPrescriptions.length} prescrição{filteredPrescriptions.length !== 1 ? 'ões' : ''} encontrada{filteredPrescriptions.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <GlassButton
              variant="primary"
              onClick={handleNewPrescription}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Prescrição</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
                  Todas
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'active' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                >
                  Ativas
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'completed' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('completed')}
                >
                  Concluídas
                </GlassButton>
                <GlassButton
                  variant={filterStatus === 'cancelled' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('cancelled')}
                >
                  Canceladas
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Prescriptions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <GlassCard className="p-12">
              <div className="flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            </GlassCard>
          ) : filteredPrescriptions.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <FileText className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-lg">Nenhuma prescrição encontrada</p>
              <GlassButton
                variant="primary"
                onClick={handleNewPrescription}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Prescrição
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPrescriptions.map((prescription, index) => (
                <motion.div
                  key={prescription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard 
                    variant="interactive"
                    className="p-6 cursor-pointer hover:bg-white/15"
                    onClick={() => handleViewPrescription(prescription.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-medical-blue/20 rounded-full flex items-center justify-center">
                            <Pill className="w-6 h-6 text-medical-blue" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {prescription.patient?.name || 'Paciente não identificado'}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              CPF: {prescription.patient?.cpf || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Medicamentos</p>
                            <p className="text-white text-sm">
                              {prescription.medications.length} medicamento{prescription.medications.length !== 1 ? 's' : ''}
                            </p>
                            <div className="mt-1 space-y-1">
                              {prescription.medications.slice(0, 2).map((med, idx) => (
                                <p key={idx} className="text-xs text-text-secondary">
                                  • {med.name} - {med.dosage}
                                </p>
                              ))}
                              {prescription.medications.length > 2 && (
                                <p className="text-xs text-text-secondary">
                                  +{prescription.medications.length - 2} mais
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Profissional</p>
                            <p className="text-white text-sm">{prescription.professional?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-secondary mb-1">Validade</p>
                            <p className="text-white text-sm">
                              {new Date(prescription.validUntil).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(prescription.status)}`}>
                            {getStatusLabel(prescription.status)}
                          </div>
                          <div className="flex items-center space-x-1 text-text-secondary text-sm">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(prescription.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPrescription(prescription.id);
                          }}
                        >
                          Ver Detalhes
                        </GlassButton>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </GlassButton>
              <span className="text-white px-4">
                Página {page} de {totalPages}
              </span>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </GlassButton>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PrescriptionListPage;

