import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  LogOut,
  Transfer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface Admission {
  id: string;
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
  };
  bed: {
    id: string;
    number: string;
    unit: {
      name: string;
    };
  };
  admissionDate: string;
  dischargeDate?: string;
  reason: string;
  diagnosis?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'discharged';
  attendingPhysician?: string;
  observations?: string;
}

const AdmissionsPage: React.FC = () => {
  const { user } = useAuth();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'discharged'>('active');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  useEffect(() => {
    loadAdmissions();
    // Auto-refresh every 10 minutes
    const interval = setInterval(loadAdmissions, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [statusFilter, priorityFilter]);

  const loadAdmissions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAdmissions: Admission[] = [
        {
          id: '1',
          patient: {
            id: 'p1',
            name: 'João Silva',
            cpf: '12345678901',
            birthDate: '1980-05-15',
            gender: 'male'
          },
          bed: {
            id: 'b1',
            number: '101',
            unit: { name: 'Enfermaria Geral' }
          },
          admissionDate: '2024-01-15T10:30:00Z',
          reason: 'Dor torácica intensa',
          diagnosis: 'Infarto agudo do miocárdio',
          priority: 'urgent',
          status: 'active',
          attendingPhysician: 'Dr. Carlos Santos',
          observations: 'Paciente estável, em monitoramento cardíaco'
        },
        {
          id: '2',
          patient: {
            id: 'p2',
            name: 'Maria Santos',
            cpf: '98765432109',
            birthDate: '1975-08-22',
            gender: 'female'
          },
          bed: {
            id: 'b2',
            number: '201',
            unit: { name: 'UTI' }
          },
          admissionDate: '2024-01-14T15:45:00Z',
          dischargeDate: '2024-01-16T09:20:00Z',
          reason: 'Dificuldade respiratória',
          diagnosis: 'Pneumonia bacteriana',
          priority: 'high',
          status: 'discharged',
          attendingPhysician: 'Dra. Ana Costa',
          observations: 'Alta hospitalar realizada. Paciente recuperado.'
        }
      ];

      let filteredAdmissions = mockAdmissions;

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredAdmissions = filteredAdmissions.filter(a => a.status === statusFilter);
      }

      // Apply priority filter
      if (priorityFilter !== 'all') {
        filteredAdmissions = filteredAdmissions.filter(a => a.priority === priorityFilter);
      }

      // Apply search filter
      if (searchTerm) {
        filteredAdmissions = filteredAdmissions.filter(a =>
          a.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.patient.cpf.includes(searchTerm) ||
          a.reason.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setAdmissions(filteredAdmissions);
    } catch (error) {
      console.error('Erro ao carregar internações:', error);
      toast.error('Erro ao carregar internações');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-500/20 text-blue-300',
      medium: 'bg-green-500/20 text-green-300',
      high: 'bg-yellow-500/20 text-yellow-300',
      urgent: 'bg-red-500/20 text-red-300'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500/20 text-gray-300';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const calculateLengthOfStay = (admissionDate: string, dischargeDate?: string) => {
    const start = new Date(admissionDate);
    const end = dischargeDate ? new Date(dischargeDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDischarge = (admissionId: string) => {
    // Open discharge modal
    toast.success('Abrindo modal de alta hospitalar');
  };

  const handleTransfer = (admissionId: string) => {
    // Open transfer modal
    toast.success('Abrindo modal de transferência');
  };

  const handleNewAdmission = () => {
    // Navigate to new admission form
    toast.success('Abrindo formulário de nova internação');
  };

  const activeAdmissions = admissions.filter(a => a.status === 'active');
  const dischargedToday = admissions.filter(a =>
    a.status === 'discharged' &&
    new Date(a.dischargeDate!).toDateString() === new Date().toDateString()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
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
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Gestão de Internações
              </h1>
              <p className="text-text-secondary">
                {user?.establishmentName} - Controle de pacientes internados
              </p>
            </div>
            <GlassButton
              variant="primary"
              onClick={handleNewAdmission}
              className="flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Nova Internação</span>
            </GlassButton>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Internações Ativas</p>
                <p className="text-2xl font-bold text-white">{activeAdmissions.length}</p>
              </div>
              <Users className="w-8 h-8 text-medical-red" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Altas Hoje</p>
                <p className="text-2xl font-bold text-green-300">{dischargedToday.length}</p>
              </div>
              <LogOut className="w-8 h-8 text-green-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Tempo Médio</p>
                <p className="text-2xl font-bold text-medical-purple">
                  {activeAdmissions.length > 0
                    ? Math.round(activeAdmissions.reduce((sum, a) =>
                        sum + calculateLengthOfStay(a.admissionDate), 0) / activeAdmissions.length)
                    : 0} dias
                </p>
              </div>
              <Clock className="w-8 h-8 text-medical-purple" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Prioridade Urgente</p>
                <p className="text-2xl font-bold text-red-300">
                  {admissions.filter(a => a.priority === 'urgent' && a.status === 'active').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-400" />
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <GlassCard className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-text-secondary" />
              <GlassInput
                placeholder="Buscar por nome, CPF ou motivo..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-64"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="discharged">Alta</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Admissions List */}
        <div className="space-y-4">
          {admissions.map((admission, index) => (
            <motion.div
              key={admission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{admission.patient.name}</h3>
                      <p className="text-text-secondary text-sm">
                        CPF: {admission.patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(admission.priority)}`}>
                      {getPriorityLabel(admission.priority)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admission.status === 'active'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {admission.status === 'active' ? 'Ativo' : 'Alta'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {admission.status === 'active' && (
                      <>
                        <GlassButton
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTransfer(admission.id)}
                          className="text-white hover:bg-white/20"
                        >
                          <Transfer className="w-4 h-4 mr-1" />
                          Transferir
                        </GlassButton>
                        <GlassButton
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDischarge(admission.id)}
                          className="text-white hover:bg-green-500/20"
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          Dar Alta
                        </GlassButton>
                      </>
                    )}
                    <GlassButton
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </GlassButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">Leito</p>
                    <p className="text-white font-medium">
                      {admission.bed.number} - {admission.bed.unit.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary text-sm mb-1">Data de Internação</p>
                    <p className="text-white font-medium">
                      {new Date(admission.admissionDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {calculateLengthOfStay(admission.admissionDate, admission.dischargeDate)} dias
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary text-sm mb-1">Médico Responsável</p>
                    <p className="text-white font-medium">
                      {admission.attendingPhysician || 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-text-secondary text-sm mb-1">Motivo da Internação</p>
                      <p className="text-white">{admission.reason}</p>
                    </div>

                    {admission.diagnosis && (
                      <div>
                        <p className="text-text-secondary text-sm mb-1">Diagnóstico</p>
                        <p className="text-white">{admission.diagnosis}</p>
                      </div>
                    )}
                  </div>

                  {admission.observations && (
                    <div className="mt-4">
                      <p className="text-text-secondary text-sm mb-1">Observações</p>
                      <p className="text-white bg-white/5 p-3 rounded-lg">
                        {admission.observations}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {admissions.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">Nenhuma internação encontrada</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default AdmissionsPage;
