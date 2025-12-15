/**
 * Página de Gestão de Férias
 * Sistema A1 Saúde - Módulo RH
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Palmtree,
  Plus,
  RefreshCw,
  User,
  Calendar,
  Search,
  Check,
  X,
  AlertTriangle,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassModal from '@/components/ui/GlassModal';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassTextarea from '@/components/ui/GlassTextarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { rhService, Vacation, Employee } from '@/services/rhService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export const VacationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const establishmentId = user?.establishmentId || '';

  // Form state
  const [requestForm, setRequestForm] = useState({
    employeeId: '',
    referenceYear: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    daysTotal: 30,
    sellDays: 0,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [establishmentId, statusFilter, yearFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vacationsRes, employeesRes] = await Promise.all([
        rhService.getVacations({
          status: statusFilter || undefined,
          year: yearFilter
        }),
        rhService.getEmployees({ establishmentId, isActive: true })
      ]);

      setVacations(vacationsRes);
      setEmployees(employeesRes.employees || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar férias');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    try {
      // Calcular dias totais
      const start = new Date(requestForm.startDate);
      const end = new Date(requestForm.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      await rhService.requestVacation({
        ...requestForm,
        daysTotal: diffDays
      });

      toast.success('Férias solicitadas com sucesso');
      setShowRequestModal(false);
      setRequestForm({
        employeeId: '',
        referenceYear: new Date().getFullYear(),
        startDate: '',
        endDate: '',
        daysTotal: 30,
        sellDays: 0,
        notes: ''
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao solicitar férias');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await rhService.approveVacation(id);
      toast.success('Férias aprovadas');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar férias');
    }
  };

  const handleReject = async () => {
    if (!selectedVacation || !rejectReason) return;

    try {
      await rhService.rejectVacation(selectedVacation.id, rejectReason);
      toast.success('Férias rejeitadas');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedVacation(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao rejeitar férias');
    }
  };

  const openRejectModal = (vacation: Vacation) => {
    setSelectedVacation(vacation);
    setShowRejectModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      approved: 'bg-green-500/20 text-green-300',
      rejected: 'bg-red-500/20 text-red-300',
      cancelled: 'bg-gray-500/20 text-gray-300',
      in_progress: 'bg-blue-500/20 text-blue-300',
      completed: 'bg-purple-500/20 text-purple-300'
    };

    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      cancelled: 'Cancelado',
      in_progress: 'Em Andamento',
      completed: 'Concluído'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
  };

  const calculateVacationValue = (baseSalary: number, days: number, sellDays: number) => {
    const dailyRate = baseSalary / 30;
    const vacationPay = dailyRate * days;
    const oneThird = vacationPay / 3;
    const soldValue = dailyRate * sellDays;
    return vacationPay + oneThird + soldValue;
  };

  const stats = {
    pending: vacations.filter(v => v.status === 'pending').length,
    approved: vacations.filter(v => v.status === 'approved').length,
    inProgress: vacations.filter(v => v.status === 'in_progress').length,
    total: vacations.length
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading && vacations.length === 0) {
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
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Palmtree className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestão de Férias</h1>
              <p className="text-text-secondary">Solicitações e aprovações</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton onClick={loadData} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GlassButton>
            <GlassButton variant="primary" onClick={() => setShowRequestModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Solicitar Férias
            </GlassButton>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-text-secondary text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <Check className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-text-secondary text-sm">Aprovadas</p>
                <p className="text-2xl font-bold text-white">{stats.approved}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <Palmtree className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-text-secondary text-sm">Em Andamento</p>
                <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-text-secondary text-sm">Total {yearFilter}</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filtros */}
        <GlassCard className="p-4 mb-6">
          <div className="flex items-center space-x-4 flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluído</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </GlassCard>

        {/* Lista de Férias */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Funcionário</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Período Aquisitivo</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Início</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Fim</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Dias</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Abono</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vacations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                      <Palmtree className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Nenhuma solicitação de férias encontrada
                    </td>
                  </tr>
                ) : (
                  vacations.map((vacation) => (
                    <tr key={vacation.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {vacation.employee?.name || 'N/A'}
                            </p>
                            <p className="text-text-secondary text-xs">
                              {vacation.employee?.position || ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-white text-sm">
                        {vacation.referenceYear}
                      </td>
                      <td className="px-4 py-3 text-center text-white text-sm">
                        {new Date(vacation.startDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center text-white text-sm">
                        {new Date(vacation.endDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white font-medium">{vacation.daysTotal}</span>
                        <span className="text-text-secondary text-xs ml-1">dias</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {vacation.sellDays > 0 ? (
                          <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs">
                            {vacation.sellDays} dias
                          </span>
                        ) : (
                          <span className="text-text-secondary text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(vacation.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {vacation.status === 'pending' && (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleApprove(vacation.id)}
                              className="text-green-400 hover:text-green-300 p-1"
                              title="Aprovar"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openRejectModal(vacation)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Rejeitar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Modal Solicitar Férias */}
        <GlassModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Solicitar Férias"
          size="lg"
        >
          <div className="space-y-4">
            <GlassSelect
              label="Funcionário *"
              value={requestForm.employeeId}
              onChange={(v) => setRequestForm(prev => ({ ...prev, employeeId: v }))}
              options={[
                { value: '', label: 'Selecione um funcionário' },
                ...employees.map(e => ({ value: e.id, label: `${e.name} - ${e.registrationNumber}` }))
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <GlassSelect
                label="Período Aquisitivo *"
                value={requestForm.referenceYear.toString()}
                onChange={(v) => setRequestForm(prev => ({ ...prev, referenceYear: Number(v) }))}
                options={years.map(y => ({ value: y.toString(), label: y.toString() }))}
              />

              <GlassInput
                label="Dias a Vender (Abono)"
                type="number"
                value={requestForm.sellDays.toString()}
                onChange={(v) => setRequestForm(prev => ({ ...prev, sellDays: Math.min(10, Math.max(0, Number(v))) }))}
                placeholder="0-10 dias"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Data de Início *"
                type="date"
                value={requestForm.startDate}
                onChange={(v) => setRequestForm(prev => ({ ...prev, startDate: v }))}
              />

              <GlassInput
                label="Data de Término *"
                type="date"
                value={requestForm.endDate}
                onChange={(v) => setRequestForm(prev => ({ ...prev, endDate: v }))}
              />
            </div>

            {requestForm.startDate && requestForm.endDate && (
              <div className="p-3 bg-cyan-500/10 rounded-lg">
                <p className="text-cyan-300 text-sm">
                  <strong>Período:</strong>{' '}
                  {Math.ceil(
                    Math.abs(new Date(requestForm.endDate).getTime() - new Date(requestForm.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                  ) + 1}{' '}
                  dias de férias
                </p>
              </div>
            )}

            <GlassTextarea
              label="Observações"
              value={requestForm.notes}
              onChange={(v) => setRequestForm(prev => ({ ...prev, notes: v }))}
              placeholder="Informações adicionais..."
              rows={3}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <GlassButton variant="ghost" onClick={() => setShowRequestModal(false)}>
                Cancelar
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleRequest}
                disabled={!requestForm.employeeId || !requestForm.startDate || !requestForm.endDate}
              >
                Solicitar Férias
              </GlassButton>
            </div>
          </div>
        </GlassModal>

        {/* Modal Rejeitar */}
        <GlassModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Rejeitar Solicitação"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-red-500/10 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium">Atenção</p>
                <p className="text-text-secondary text-sm">
                  Esta ação irá rejeitar a solicitação de férias. O funcionário será notificado.
                </p>
              </div>
            </div>

            <GlassTextarea
              label="Motivo da Rejeição *"
              value={rejectReason}
              onChange={setRejectReason}
              placeholder="Informe o motivo da rejeição..."
              rows={4}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <GlassButton variant="ghost" onClick={() => setShowRejectModal(false)}>
                Cancelar
              </GlassButton>
              <GlassButton
                variant="danger"
                onClick={handleReject}
                disabled={!rejectReason}
              >
                Confirmar Rejeição
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      </div>
    </div>
  );
};

export default VacationsPage;






