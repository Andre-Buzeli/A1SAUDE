/**
 * Página de Controle de Ponto
 * Sistema A1 Saúde - Módulo RH
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Plus,
  RefreshCw,
  User,
  Calendar,
  Search,
  Check,
  X,
  AlertTriangle,
  LogIn,
  LogOut,
  FileText,
  ChevronLeft,
  ChevronRight,
  Timer
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassModal from '@/components/ui/GlassModal';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import GlassTextarea from '@/components/ui/GlassTextarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { rhService, TimeRecord, Employee } from '@/services/rhService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export const TimeRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  const [justification, setJustification] = useState('');
  const [clockingIn, setClockingIn] = useState(false);

  const establishmentId = user?.establishmentId || '';

  useEffect(() => {
    loadEmployees();
  }, [establishmentId]);

  useEffect(() => {
    if (selectedEmployee) {
      loadRecords();
    }
  }, [selectedEmployee, currentMonth]);

  const loadEmployees = async () => {
    try {
      const result = await rhService.getEmployees({ establishmentId, isActive: true });
      setEmployees(result.employees || []);
      
      // Auto-selecionar primeiro funcionário
      if (result.employees?.length > 0) {
        setSelectedEmployee(result.employees[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    if (!selectedEmployee) return;
    
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const result = await rhService.getTimeRecords(
        selectedEmployee,
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      setRecords(result);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const handleClockIn = async () => {
    if (!selectedEmployee) return;
    
    try {
      setClockingIn(true);
      await rhService.clockIn(selectedEmployee);
      toast.success('Entrada registrada com sucesso');
      loadRecords();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar entrada');
    } finally {
      setClockingIn(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedEmployee) return;
    
    try {
      setClockingIn(true);
      await rhService.clockOut(selectedEmployee);
      toast.success('Saída registrada com sucesso');
      loadRecords();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar saída');
    } finally {
      setClockingIn(false);
    }
  };

  const handleApprove = async (recordId: string) => {
    try {
      await rhService.approveTimeRecord(recordId);
      toast.success('Registro aprovado');
      loadRecords();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aprovar registro');
    }
  };

  const handleJustify = async () => {
    if (!selectedRecord || !justification) return;
    
    try {
      await rhService.justifyTimeRecord(selectedRecord.id, justification);
      toast.success('Justificativa registrada');
      setShowJustifyModal(false);
      setJustification('');
      setSelectedRecord(null);
      loadRecords();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar justificativa');
    }
  };

  const openJustifyModal = (record: TimeRecord) => {
    setSelectedRecord(record);
    setJustification(record.justification || '');
    setShowJustifyModal(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newDate);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-300',
      approved: 'bg-green-500/20 text-green-300',
      rejected: 'bg-red-500/20 text-red-300',
      justified: 'bg-blue-500/20 text-blue-300'
    };
    
    const labels: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      justified: 'Justificado'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatTime = (time?: string) => {
    if (!time) return '--:--';
    return time.substring(0, 5);
  };

  const calculateWorkedHours = (record: TimeRecord) => {
    let totalMinutes = 0;
    
    if (record.clockIn1 && record.clockOut1) {
      const [h1, m1] = record.clockIn1.split(':').map(Number);
      const [h2, m2] = record.clockOut1.split(':').map(Number);
      totalMinutes += (h2 * 60 + m2) - (h1 * 60 + m1);
    }
    
    if (record.clockIn2 && record.clockOut2) {
      const [h1, m1] = record.clockIn2.split(':').map(Number);
      const [h2, m2] = record.clockOut2.split(':').map(Number);
      totalMinutes += (h2 * 60 + m2) - (h1 * 60 + m1);
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getRecordForDay = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    return records.find(r => r.date.split('T')[0] === dateStr);
  };

  const selectedEmployeeData = employees.find(e => e.id === selectedEmployee);

  const stats = {
    workedDays: records.filter(r => r.clockIn1).length,
    pendingApproval: records.filter(r => r.status === 'pending').length,
    lateCount: records.filter(r => r.lateMinutes > 0).length,
    overtimeMinutes: records.reduce((acc, r) => acc + (r.overtimeMinutes || 0), 0)
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
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <Clock className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Controle de Ponto</h1>
              <p className="text-text-secondary">Registro de entrada e saída</p>
            </div>
          </div>
          <GlassButton onClick={loadRecords} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </GlassButton>
        </motion.div>

        {/* Seletor de Funcionário e Registro Rápido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <GlassCard className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <GlassSelect
                  label="Funcionário"
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  options={[
                    { value: '', label: 'Selecione...' },
                    ...employees.map(e => ({ value: e.id, label: `${e.name} - ${e.registrationNumber}` }))
                  ]}
                />
              </div>

              <div className="flex items-center space-x-4">
                <GlassButton size="sm" variant="ghost" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-5 h-5" />
                </GlassButton>
                <span className="text-white font-medium min-w-[150px] text-center">
                  {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
                <GlassButton size="sm" variant="ghost" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-5 h-5" />
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Registro Rápido */}
          <GlassCard className="p-4">
            <h3 className="text-white font-medium mb-3">Registrar Agora</h3>
            <div className="flex space-x-2">
              <GlassButton
                variant="success"
                className="flex-1"
                onClick={handleClockIn}
                disabled={clockingIn || !selectedEmployee}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Entrada
              </GlassButton>
              <GlassButton
                variant="danger"
                className="flex-1"
                onClick={handleClockOut}
                disabled={clockingIn || !selectedEmployee}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Saída
              </GlassButton>
            </div>
            <p className="text-text-secondary text-xs mt-2 text-center">
              {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </GlassCard>
        </div>

        {/* KPIs */}
        {selectedEmployee && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Dias Trabalhados</p>
              <p className="text-2xl font-bold text-white">{stats.workedDays}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-300">{stats.pendingApproval}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Atrasos</p>
              <p className="text-2xl font-bold text-red-300">{stats.lateCount}</p>
            </GlassCard>
            <GlassCard className="p-4">
              <p className="text-text-secondary text-sm">Horas Extras</p>
              <p className="text-2xl font-bold text-green-300">
                {Math.floor(stats.overtimeMinutes / 60)}h{(stats.overtimeMinutes % 60).toString().padStart(2, '0')}
              </p>
            </GlassCard>
          </div>
        )}

        {/* Tabela de Registros */}
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-medium">
              Registros de Ponto - {selectedEmployeeData?.name || 'Selecione um funcionário'}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Data</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Entrada 1</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Saída 1</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Entrada 2</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Saída 2</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Trabalhado</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {getDaysInMonth().map((day) => {
                  const record = getRecordForDay(day);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isFuture = day > new Date();
                  
                  return (
                    <tr
                      key={day.toISOString()}
                      className={`
                        ${isWeekend ? 'bg-white/5' : ''}
                        ${isToday ? 'bg-emerald-500/10' : ''}
                        ${isFuture ? 'opacity-50' : ''}
                        hover:bg-white/5 transition-colors
                      `}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-text-secondary" />
                          <span className="text-white text-sm">
                            {day.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${record?.clockIn1 ? 'text-white' : 'text-text-secondary'}`}>
                          {formatTime(record?.clockIn1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${record?.clockOut1 ? 'text-white' : 'text-text-secondary'}`}>
                          {formatTime(record?.clockOut1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${record?.clockIn2 ? 'text-white' : 'text-text-secondary'}`}>
                          {formatTime(record?.clockIn2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${record?.clockOut2 ? 'text-white' : 'text-text-secondary'}`}>
                          {formatTime(record?.clockOut2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-white text-sm font-medium">
                          {record ? calculateWorkedHours(record) : '--'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {record && getStatusBadge(record.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {record && record.status === 'pending' && (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleApprove(record.id)}
                              className="text-green-400 hover:text-green-300"
                              title="Aprovar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openJustifyModal(record)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Justificar"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Modal Justificativa */}
        <GlassModal
          isOpen={showJustifyModal}
          onClose={() => setShowJustifyModal(false)}
          title="Justificar Registro"
          size="md"
        >
          <div className="space-y-4">
            {selectedRecord && (
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white text-sm">
                  <strong>Data:</strong> {new Date(selectedRecord.date).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-text-secondary text-sm mt-1">
                  Entrada: {formatTime(selectedRecord.clockIn1)} | Saída: {formatTime(selectedRecord.clockOut1)}
                </p>
              </div>
            )}

            <GlassTextarea
              label="Justificativa"
              value={justification}
              onChange={setJustification}
              placeholder="Descreva o motivo da inconsistência..."
              rows={4}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <GlassButton variant="ghost" onClick={() => setShowJustifyModal(false)}>
                Cancelar
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleJustify}
                disabled={!justification}
              >
                Salvar Justificativa
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      </div>
    </div>
  );
};

export default TimeRecordsPage;








