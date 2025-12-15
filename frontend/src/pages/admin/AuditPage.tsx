/**
 * Página de Auditoria
 * Sistema A1 Saúde - Módulo Admin
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  RefreshCw,
  Search,
  Filter,
  User,
  Calendar,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  Settings,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassModal from '@/components/ui/GlassModal';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userProfile: string;
  action: string;
  module: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
  createdAt: string;
}

const ACTION_TYPES = [
  { value: '', label: 'Todas as Ações' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'CREATE', label: 'Criação' },
  { value: 'UPDATE', label: 'Atualização' },
  { value: 'DELETE', label: 'Exclusão' },
  { value: 'VIEW', label: 'Visualização' },
  { value: 'EXPORT', label: 'Exportação' },
  { value: 'CONFIG', label: 'Configuração' }
];

const MODULES = [
  { value: '', label: 'Todos os Módulos' },
  { value: 'auth', label: 'Autenticação' },
  { value: 'patients', label: 'Pacientes' },
  { value: 'attendances', label: 'Atendimentos' },
  { value: 'prescriptions', label: 'Prescrições' },
  { value: 'exams', label: 'Exames' },
  { value: 'users', label: 'Usuários' },
  { value: 'establishments', label: 'Estabelecimentos' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'rh', label: 'RH' },
  { value: 'pharmacy', label: 'Farmácia' },
  { value: 'reports', label: 'Relatórios' }
];

// Mock data para demonstração
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Dr. Carlos Silva',
    userProfile: 'medico',
    action: 'CREATE',
    module: 'prescriptions',
    description: 'Criou prescrição para paciente Maria Santos',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 Chrome/119',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Ana Costa',
    userProfile: 'enfermeiro',
    action: 'UPDATE',
    module: 'patients',
    description: 'Atualizou sinais vitais do paciente João Lima',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 Firefox/120',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Maria Oliveira',
    userProfile: 'recepcionista',
    action: 'CREATE',
    module: 'patients',
    description: 'Cadastrou novo paciente Pedro Henrique',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 Chrome/119',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'José Santos',
    userProfile: 'gestor_local',
    action: 'LOGIN',
    module: 'auth',
    description: 'Login realizado com sucesso',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 Safari/17',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Admin Sistema',
    userProfile: 'gestor_geral',
    action: 'CONFIG',
    module: 'establishments',
    description: 'Alterou configurações do Hospital Central',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 Chrome/119',
    details: JSON.stringify({ field: 'operatingHours', oldValue: '07:00-19:00', newValue: '06:00-22:00' }),
    createdAt: new Date(Date.now() - 60 * 60000).toISOString()
  },
  {
    id: '6',
    userId: 'user6',
    userName: 'Fernanda Lima',
    userProfile: 'farmaceutico',
    action: 'UPDATE',
    module: 'pharmacy',
    description: 'Registrou dispensação de medicamento',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 Edge/119',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString()
  },
  {
    id: '7',
    userId: 'user7',
    userName: 'Roberto Dias',
    userProfile: 'supervisor',
    action: 'EXPORT',
    module: 'reports',
    description: 'Exportou relatório de atendimentos mensal',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 Chrome/119',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: '8',
    userId: 'user4',
    userName: 'José Santos',
    userProfile: 'gestor_local',
    action: 'DELETE',
    module: 'users',
    description: 'Desativou usuário temporário',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 Safari/17',
    createdAt: new Date(Date.now() - 180 * 60000).toISOString()
  }
];

export const AuditPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, actionFilter, moduleFilter, dateFrom, dateTo]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      // Em produção, buscar do backend: const result = await auditService.getLogs();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      setLogs(mockAuditLogs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log =>
        log.userName.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term) ||
        log.ipAddress.includes(term)
      );
    }

    if (actionFilter) {
      result = result.filter(log => log.action === actionFilter);
    }

    if (moduleFilter) {
      result = result.filter(log => log.module === moduleFilter);
    }

    if (dateFrom) {
      result = result.filter(log => new Date(log.createdAt) >= new Date(dateFrom));
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59);
      result = result.filter(log => new Date(log.createdAt) <= to);
    }

    setFilteredLogs(result);
    setCurrentPage(1);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return <LogIn className="w-4 h-4 text-green-400" />;
      case 'LOGOUT':
        return <LogOut className="w-4 h-4 text-gray-400" />;
      case 'CREATE':
        return <Plus className="w-4 h-4 text-blue-400" />;
      case 'UPDATE':
        return <Edit className="w-4 h-4 text-yellow-400" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      case 'VIEW':
        return <Eye className="w-4 h-4 text-purple-400" />;
      case 'EXPORT':
        return <Download className="w-4 h-4 text-cyan-400" />;
      case 'CONFIG':
        return <Settings className="w-4 h-4 text-orange-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      LOGIN: 'bg-green-500/20 text-green-300',
      LOGOUT: 'bg-gray-500/20 text-gray-300',
      CREATE: 'bg-blue-500/20 text-blue-300',
      UPDATE: 'bg-yellow-500/20 text-yellow-300',
      DELETE: 'bg-red-500/20 text-red-300',
      VIEW: 'bg-purple-500/20 text-purple-300',
      EXPORT: 'bg-cyan-500/20 text-cyan-300',
      CONFIG: 'bg-orange-500/20 text-orange-300'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[action] || 'bg-gray-500/20 text-gray-300'}`}>
        {action}
      </span>
    );
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const openDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const exportLogs = () => {
    // Em produção, fazer download do CSV
    const csv = filteredLogs.map(log => 
      `${formatDateTime(log.createdAt)},${log.userName},${log.action},${log.module},${log.description},${log.ipAddress}`
    ).join('\n');
    
    const header = 'Data/Hora,Usuário,Ação,Módulo,Descrição,IP\n';
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    total: filteredLogs.length,
    creates: filteredLogs.filter(l => l.action === 'CREATE').length,
    updates: filteredLogs.filter(l => l.action === 'UPDATE').length,
    deletes: filteredLogs.filter(l => l.action === 'DELETE').length
  };

  if (loading) {
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
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Auditoria</h1>
              <p className="text-text-secondary">Logs de atividades do sistema</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton onClick={loadLogs} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GlassButton>
            <GlassButton variant="primary" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </GlassButton>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <p className="text-text-secondary text-sm">Total de Logs</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-text-secondary text-sm">Criações</p>
            <p className="text-2xl font-bold text-blue-300">{stats.creates}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-text-secondary text-sm">Atualizações</p>
            <p className="text-2xl font-bold text-yellow-300">{stats.updates}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-text-secondary text-sm">Exclusões</p>
            <p className="text-2xl font-bold text-red-300">{stats.deletes}</p>
          </GlassCard>
        </div>

        {/* Filters */}
        <GlassCard className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <GlassInput
                placeholder="Buscar por usuário, descrição ou IP..."
                value={searchTerm}
                onChange={setSearchTerm}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <GlassSelect
              value={actionFilter}
              onChange={setActionFilter}
              options={ACTION_TYPES}
            />
            <GlassSelect
              value={moduleFilter}
              onChange={setModuleFilter}
              options={MODULES}
            />
            <GlassInput
              type="date"
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Data inicial"
            />
            <GlassInput
              type="date"
              value={dateTo}
              onChange={setDateTo}
              placeholder="Data final"
            />
          </div>
        </GlassCard>

        {/* Logs Table */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Usuário</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Ação</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Módulo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Descrição</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">IP</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                      <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-text-secondary" />
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-text-secondary" />
                          <div>
                            <p className="text-white text-sm">{log.userName}</p>
                            <p className="text-text-secondary text-xs">{log.userProfile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white text-sm capitalize">
                        {log.module}
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-sm max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <code className="text-xs bg-white/10 px-2 py-1 rounded text-text-secondary">
                          {log.ipAddress}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDetails(log)}
                          className="text-medical-blue hover:text-blue-300 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-text-secondary text-sm">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length}
              </p>
              <div className="flex items-center space-x-2">
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </GlassButton>
                <span className="text-white text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Details Modal */}
        <GlassModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Detalhes do Log"
          size="lg"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-text-secondary text-xs mb-1">Data/Hora</p>
                  <p className="text-white text-sm">{formatDateTime(selectedLog.createdAt)}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-text-secondary text-xs mb-1">Ação</p>
                  <div className="flex items-center space-x-2">
                    {getActionIcon(selectedLog.action)}
                    {getActionBadge(selectedLog.action)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-text-secondary text-xs mb-1">Usuário</p>
                <p className="text-white">{selectedLog.userName}</p>
                <p className="text-text-secondary text-sm">{selectedLog.userProfile}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-text-secondary text-xs mb-1">Módulo</p>
                <p className="text-white capitalize">{selectedLog.module}</p>
              </div>

              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-text-secondary text-xs mb-1">Descrição</p>
                <p className="text-white">{selectedLog.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-text-secondary text-xs mb-1">Endereço IP</p>
                  <code className="text-white text-sm">{selectedLog.ipAddress}</code>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-text-secondary text-xs mb-1">User Agent</p>
                  <p className="text-white text-xs truncate">{selectedLog.userAgent}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-text-secondary text-xs mb-1">Detalhes Técnicos</p>
                  <pre className="text-white text-xs bg-black/30 p-2 rounded overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <GlassButton variant="ghost" onClick={() => setShowDetailsModal(false)}>
                  Fechar
                </GlassButton>
              </div>
            </div>
          )}
        </GlassModal>
      </div>
    </div>
  );
};

export default AuditPage;






