import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Users, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PatientList } from '@/components/patients/PatientList';
import { patientService, Patient, PatientFilters } from '@/services/patientService';
import { useDevMode } from '@/hooks/useDevMode';
import { DevModeBanner } from '@/components/dev/DevModeBanner';

export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDevMode } = useDevMode();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PatientFilters>({
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [filters]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const searchFilters: PatientFilters = {
        ...filters,
        query: searchTerm || undefined,
        name: searchTerm || undefined,
      };

      const response = await patientService.searchPatients(searchFilters);
      setPatients(response.patients || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Erro ao carregar pacientes:', error);
      toast.error(error?.message || 'Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadPatients();
  };

  const handlePatientCreate = () => {
    navigate('/dev/patients/new');
  };

  const handlePatientSelect = (patient: Patient) => {
    navigate(`/dev/patients/${patient.id}`);
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Users className="w-8 h-8 mr-3 text-medical-blue" />
                Gestão de Pacientes
              </h1>
              <p className="text-text-secondary">
                {total} paciente{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}
              </p>
            </div>
            
            <GlassButton
              variant="primary"
              onClick={handlePatientCreate}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Paciente</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <GlassInput
                    placeholder="Buscar por nome ou CPF..."
                    value={searchTerm}
                    onChange={setSearchTerm}
                    icon={<Search className="w-5 h-5" />}
                  />
                  {searchTerm && (
                    <button
                      onClick={handleSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-medical-blue hover:text-medical-blue/80"
                    >
                      Buscar
                    </button>
                  )}
                </div>
              </div>
              
              <GlassButton
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </GlassButton>
              
              <GlassButton
                variant="primary"
                onClick={handleSearch}
                loading={loading}
              >
                Buscar
              </GlassButton>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
                    >
                      <option value="name">Nome</option>
                      <option value="createdAt">Data de Cadastro</option>
                      <option value="birthDate">Data de Nascimento</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Ordem
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
                    >
                      <option value="asc">Crescente</option>
                      <option value="desc">Decrescente</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Itens por página
                    </label>
                    <select
                      value={filters.limit}
                      onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-medical-blue/50"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>

        {/* Patient List */}
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
          ) : (
            <PatientList
              patients={patients}
              onPatientSelect={handlePatientSelect}
              onPatientCreate={handlePatientCreate}
              loading={loading}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center justify-between"
          >
            <p className="text-text-secondary">
              Página {filters.page} de {Math.ceil(total / (filters.limit || 20))}
            </p>
            
            <div className="flex space-x-2">
              <GlassButton
                variant="ghost"
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                disabled={filters.page === 1}
              >
                Anterior
              </GlassButton>
              
              <GlassButton
                variant="ghost"
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={(filters.page || 1) >= Math.ceil(total / (filters.limit || 20))}
              >
                Próxima
              </GlassButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientListPage;

