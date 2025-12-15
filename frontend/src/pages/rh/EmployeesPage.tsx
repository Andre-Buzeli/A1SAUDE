/**
 * Lista de Funcionários
 * Sistema A1 Saúde
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  UserMinus,
  Download,
  ChevronLeft,
  ChevronRight,
  Building2,
  Briefcase
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { rhService, Employee, EmployeeFilters } from '@/services/rhService';
import { toast } from 'react-hot-toast';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtros
  const [filters, setFilters] = useState<EmployeeFilters>({
    query: '',
    contractType: '',
    department: '',
    isActive: true,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [page, filters.contractType, filters.department, filters.isActive]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const result = await rhService.getEmployees({
        ...filters,
        page
      });
      setEmployees(result.employees);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadEmployees();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const contractTypeOptions = [
    { value: '', label: 'Todos os contratos' },
    { value: 'CLT', label: 'CLT' },
    { value: 'PJ', label: 'Pessoa Jurídica' },
    { value: 'TEMP', label: 'Temporário' },
    { value: 'INTERN', label: 'Estagiário' },
    { value: 'STATUTORY', label: 'Estatutário' }
  ];

  const statusOptions = [
    { value: 'true', label: 'Ativos' },
    { value: 'false', label: 'Inativos' },
    { value: '', label: 'Todos' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <GlassButton
              variant="ghost"
              onClick={() => navigate('/dev/rh')}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </GlassButton>
            <div>
              <h1 className="text-3xl font-bold text-white">Funcionários</h1>
              <p className="text-white/60 mt-1">
                {total} funcionário{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <GlassButton
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </GlassButton>
            <GlassButton
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/dev/rh/employees/new')}
              className="flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Funcionário</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Busca e Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <GlassInput
                  placeholder="Buscar por nome, CPF, matrícula ou email..."
                  value={filters.query || ''}
                  onChange={(value) => setFilters({ ...filters, query: value })}
                  onKeyDown={handleKeyPress}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <GlassButton onClick={handleSearch}>
                Buscar
              </GlassButton>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <GlassSelect
                  label="Tipo de Contrato"
                  value={filters.contractType || ''}
                  onChange={(value) => setFilters({ ...filters, contractType: value })}
                  options={contractTypeOptions}
                />
                <GlassInput
                  label="Setor"
                  placeholder="Filtrar por setor..."
                  value={filters.department || ''}
                  onChange={(value) => setFilters({ ...filters, department: value })}
                />
                <GlassSelect
                  label="Status"
                  value={String(filters.isActive)}
                  onChange={(value) => setFilters({ ...filters, isActive: value === '' ? undefined : value === 'true' })}
                  options={statusOptions}
                />
              </motion.div>
            )}
          </GlassCard>
        </motion.div>

        {/* Lista de Funcionários */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 mx-auto mb-4 text-white/30" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum funcionário encontrado</h3>
                <p className="text-white/50 mb-4">Tente ajustar os filtros ou cadastre um novo funcionário</p>
                <GlassButton onClick={() => navigate('/dev/rh/employees/new')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar Funcionário
                </GlassButton>
              </div>
            ) : (
              <>
                {/* Tabela */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-white/60 font-medium">Funcionário</th>
                        <th className="text-left p-4 text-white/60 font-medium">Cargo/Setor</th>
                        <th className="text-left p-4 text-white/60 font-medium">Contrato</th>
                        <th className="text-left p-4 text-white/60 font-medium">Admissão</th>
                        <th className="text-left p-4 text-white/60 font-medium">Salário</th>
                        <th className="text-left p-4 text-white/60 font-medium">Status</th>
                        <th className="text-right p-4 text-white/60 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee, index) => (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                {employee.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-medium">{employee.name}</p>
                                <p className="text-white/50 text-sm">Mat: {employee.registrationNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-white">{employee.position}</p>
                              <p className="text-white/50 text-sm flex items-center">
                                <Building2 className="w-3 h-3 mr-1" />
                                {employee.department}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full border ${
                              employee.contractType === 'CLT' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : employee.contractType === 'PJ'
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                              {rhService.getContractTypeLabel(employee.contractType)}
                            </span>
                          </td>
                          <td className="p-4 text-white/70">
                            {new Date(employee.admissionDate).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4 text-white">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(employee.baseSalary)}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full border ${
                              employee.isActive
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {employee.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => navigate(`/dev/rh/employees/${employee.id}`)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4 text-white/60" />
                              </button>
                              <button
                                onClick={() => navigate(`/dev/rh/employees/${employee.id}/edit`)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-white/60" />
                              </button>
                              {employee.isActive && (
                                <button
                                  onClick={() => {/* TODO: Implementar desligamento */}}
                                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                  title="Desligar"
                                >
                                  <UserMinus className="w-4 h-4 text-red-400/60" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between p-4 border-t border-white/10">
                  <p className="text-white/50 text-sm">
                    Mostrando {((page - 1) * (filters.limit || 20)) + 1} - {Math.min(page * (filters.limit || 20), total)} de {total}
                  </p>
                  <div className="flex items-center space-x-2">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </GlassButton>
                    <span className="text-white px-3">
                      {page} / {totalPages}
                    </span>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </GlassButton>
                  </div>
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeesPage;

