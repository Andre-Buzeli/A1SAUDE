/**
 * Página de Escalas de Trabalho
 * Sistema A1 Saúde - Módulo RH
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  RefreshCw,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  ArrowLeftRight,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassModal from '@/components/ui/GlassModal';
import GlassInput from '@/components/ui/GlassInput';
import GlassSelect from '@/components/ui/GlassSelect';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { rhService, WorkSchedule, ScheduleAssignment, Employee } from '@/services/rhService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const SCALE_TYPES = [
  { value: '12x36', label: '12x36 - 12h trabalho, 36h folga' },
  { value: '24x48', label: '24x48 - 24h trabalho, 48h folga' },
  { value: '5x2', label: '5x2 - Segunda a Sexta' },
  { value: '6x1', label: '6x1 - 6 dias trabalho, 1 folga' },
  { value: 'custom', label: 'Personalizada' }
];

const SHIFTS = [
  { value: 'morning', label: 'Manhã (07:00 - 13:00)', color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'afternoon', label: 'Tarde (13:00 - 19:00)', color: 'bg-orange-500/20 text-orange-300' },
  { value: 'night', label: 'Noite (19:00 - 07:00)', color: 'bg-purple-500/20 text-purple-300' },
  { value: 'day', label: 'Diurno (07:00 - 19:00)', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'full', label: 'Plantão 24h', color: 'bg-red-500/20 text-red-300' }
];

export const SchedulesPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [assignments, setAssignments] = useState<ScheduleAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ date: Date; employeeId?: string } | null>(null);

  const establishmentId = user?.establishmentId || '';

  // Form state para nova escala
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    scaleType: '12x36',
    department: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  // Form state para atribuição
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    shift: 'morning'
  });

  useEffect(() => {
    loadData();
  }, [establishmentId]);

  useEffect(() => {
    if (selectedSchedule) {
      loadAssignments();
    }
  }, [selectedSchedule, currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, employeesRes] = await Promise.all([
        rhService.getSchedules(establishmentId),
        rhService.getEmployees({ establishmentId, isActive: true })
      ]);

      setSchedules(schedulesRes);
      setEmployees(employeesRes.employees || []);
      
      if (schedulesRes.length > 0 && !selectedSchedule) {
        setSelectedSchedule(schedulesRes[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar escalas');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    if (!selectedSchedule) return;
    
    try {
      const startDate = getWeekStart(currentDate);
      const endDate = getWeekEnd(currentDate);
      
      const result = await rhService.getScheduleAssignments(
        selectedSchedule,
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      setAssignments(result);
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
    }
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getWeekEnd = (date: Date) => {
    const d = getWeekStart(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const getWeekDays = () => {
    const start = getWeekStart(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getAssignmentForCell = (employeeId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return assignments.find(
      a => a.employeeId === employeeId && a.date.split('T')[0] === dateStr
    );
  };

  const getShiftInfo = (shift: string) => {
    return SHIFTS.find(s => s.value === shift) || SHIFTS[0];
  };

  const handleCreateSchedule = async () => {
    try {
      await rhService.createSchedule({
        ...newSchedule,
        establishmentId
      });
      
      toast.success('Escala criada com sucesso');
      setShowCreateModal(false);
      setNewSchedule({
        name: '',
        scaleType: '12x36',
        department: '',
        startDate: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar escala');
    }
  };

  const handleAssign = async () => {
    if (!selectedSchedule || !selectedCell) return;
    
    try {
      await rhService.assignToSchedule(
        selectedSchedule,
        assignForm.employeeId,
        selectedCell.date.toISOString(),
        assignForm.shift
      );
      
      toast.success('Funcionário atribuído com sucesso');
      setShowAssignModal(false);
      setSelectedCell(null);
      loadAssignments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atribuir funcionário');
    }
  };

  const handleSwapShifts = async (assignment1Id: string, assignment2Id: string) => {
    try {
      await rhService.swapShifts(assignment1Id, assignment2Id);
      toast.success('Turnos trocados com sucesso');
      loadAssignments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao trocar turnos');
    }
  };

  const openAssignModal = (date: Date, employeeId?: string) => {
    setSelectedCell({ date, employeeId });
    setAssignForm({
      employeeId: employeeId || '',
      shift: 'morning'
    });
    setShowAssignModal(true);
  };

  const filteredEmployees = departmentFilter
    ? employees.filter(e => e.department === departmentFilter)
    : employees;

  const departments = [...new Set(employees.map(e => e.department))];

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
            <div className="p-3 bg-indigo-500/20 rounded-lg">
              <Calendar className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Escalas de Trabalho</h1>
              <p className="text-text-secondary">Gestão de turnos e horários</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <GlassButton onClick={loadData} variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </GlassButton>
            <GlassButton variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Escala
            </GlassButton>
          </div>
        </motion.div>

        {/* Seletor de Escala e Navegação */}
        <GlassCard className="p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={selectedSchedule || ''}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white min-w-[200px]"
              >
                {schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name} ({schedule.scaleType})
                  </option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Todos os Setores</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <GlassButton size="sm" variant="ghost" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-5 h-5" />
              </GlassButton>
              <span className="text-white font-medium min-w-[200px] text-center">
                {getWeekStart(currentDate).toLocaleDateString('pt-BR')} - {getWeekEnd(currentDate).toLocaleDateString('pt-BR')}
              </span>
              <GlassButton size="sm" variant="ghost" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-5 h-5" />
              </GlassButton>
              <GlassButton size="sm" variant="secondary" onClick={() => setCurrentDate(new Date())}>
                Hoje
              </GlassButton>
            </div>
          </div>
        </GlassCard>

        {/* Legenda */}
        <GlassCard className="p-3 mb-6">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <span className="text-text-secondary text-sm">Turnos:</span>
            {SHIFTS.map(shift => (
              <span key={shift.value} className={`px-2 py-1 rounded text-xs ${shift.color}`}>
                {shift.label.split(' ')[0]}
              </span>
            ))}
          </div>
        </GlassCard>

        {/* Grid de Escala */}
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary sticky left-0 bg-slate-800/90 z-10">
                    Funcionário
                  </th>
                  {getWeekDays().map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <th
                        key={idx}
                        className={`px-4 py-3 text-center text-sm font-medium min-w-[120px] ${
                          isToday ? 'bg-indigo-500/20 text-indigo-300' : 'text-text-secondary'
                        }`}
                      >
                        <div>{DAYS_OF_WEEK[day.getDay()]}</div>
                        <div className="text-xs opacity-70">{day.getDate()}/{day.getMonth() + 1}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      Nenhum funcionário encontrado
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 sticky left-0 bg-slate-800/90 z-10">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                            <span className="text-indigo-300 text-sm font-medium">
                              {employee.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{employee.name}</p>
                            <p className="text-text-secondary text-xs">{employee.position}</p>
                          </div>
                        </div>
                      </td>
                      {getWeekDays().map((day, idx) => {
                        const assignment = getAssignmentForCell(employee.id, day);
                        const shiftInfo = assignment ? getShiftInfo(assignment.shift) : null;
                        const isToday = day.toDateString() === new Date().toDateString();
                        
                        return (
                          <td
                            key={idx}
                            className={`px-2 py-2 text-center cursor-pointer hover:bg-white/10 transition-colors ${
                              isToday ? 'bg-indigo-500/10' : ''
                            }`}
                            onClick={() => openAssignModal(day, employee.id)}
                          >
                            {assignment ? (
                              <div className={`px-2 py-1 rounded text-xs ${shiftInfo?.color}`}>
                                {shiftInfo?.label.split(' ')[0]}
                                <div className="text-xs opacity-70 mt-1">
                                  {assignment.startTime} - {assignment.endTime}
                                </div>
                              </div>
                            ) : (
                              <div className="text-text-secondary/30 text-xs py-2">
                                + Adicionar
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Modal Criar Escala */}
        <GlassModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Nova Escala de Trabalho"
          size="md"
        >
          <div className="space-y-4">
            <GlassInput
              label="Nome da Escala"
              value={newSchedule.name}
              onChange={(v) => setNewSchedule(prev => ({ ...prev, name: v }))}
              placeholder="Ex: Escala UTI - Novembro"
            />

            <GlassSelect
              label="Tipo de Escala"
              value={newSchedule.scaleType}
              onChange={(v) => setNewSchedule(prev => ({ ...prev, scaleType: v }))}
              options={SCALE_TYPES}
            />

            <GlassSelect
              label="Setor (opcional)"
              value={newSchedule.department}
              onChange={(v) => setNewSchedule(prev => ({ ...prev, department: v }))}
              options={[
                { value: '', label: 'Todos os Setores' },
                ...departments.map(d => ({ value: d, label: d }))
              ]}
            />

            <GlassInput
              label="Data de Início"
              type="date"
              value={newSchedule.startDate}
              onChange={(v) => setNewSchedule(prev => ({ ...prev, startDate: v }))}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <GlassButton variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </GlassButton>
              <GlassButton variant="primary" onClick={handleCreateSchedule}>
                Criar Escala
              </GlassButton>
            </div>
          </div>
        </GlassModal>

        {/* Modal Atribuir Funcionário */}
        <GlassModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Atribuir Turno"
          size="md"
        >
          <div className="space-y-4">
            {selectedCell && (
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-white text-sm">
                  <strong>Data:</strong> {selectedCell.date.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}

            <GlassSelect
              label="Funcionário"
              value={assignForm.employeeId}
              onChange={(v) => setAssignForm(prev => ({ ...prev, employeeId: v }))}
              options={[
                { value: '', label: 'Selecione um funcionário' },
                ...filteredEmployees.map(e => ({ value: e.id, label: `${e.name} - ${e.position}` }))
              ]}
            />

            <GlassSelect
              label="Turno"
              value={assignForm.shift}
              onChange={(v) => setAssignForm(prev => ({ ...prev, shift: v }))}
              options={SHIFTS.map(s => ({ value: s.value, label: s.label }))}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <GlassButton variant="ghost" onClick={() => setShowAssignModal(false)}>
                Cancelar
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleAssign}
                disabled={!assignForm.employeeId}
              >
                Atribuir
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      </div>
    </div>
  );
};

export default SchedulesPage;








