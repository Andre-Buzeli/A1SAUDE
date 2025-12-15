import React from 'react';
import { 
  AlertTriangle, 
  User, 
  Clock,
  Heart,
  RefreshCw,
  Activity
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface CriticalPatientsListProps {
  patients: any[];
  onRefresh: () => void;
}

export const CriticalPatientsList: React.FC<CriticalPatientsListProps> = ({ 
  patients, 
  onRefresh 
}) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'red':
        return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'orange':
        return 'text-orange-400 bg-orange-500/20 border-orange-400/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'red':
        return 'EMERGÊNCIA';
      case 'orange':
        return 'MUITO URGENTE';
      default:
        return priority.toUpperCase();
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'red':
        return <Heart className="w-4 h-4" />;
      case 'orange':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Aguardando';
      case 'in_progress':
        return 'Em atendimento';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const getTimeSinceTriage = (triageTime: string) => {
    const now = new Date();
    const triage = new Date(triageTime);
    const diffMinutes = Math.floor((now.getTime() - triage.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min atrás`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}min atrás`;
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Pacientes Críticos</h3>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Atualizar lista"
        >
          <RefreshCw className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="space-y-3">
        {patients.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">Nenhum paciente crítico</p>
            <p className="text-white/40 text-sm mt-1">Situação estável no momento</p>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className={`border rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer ${getPriorityColor(patient.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getPriorityIcon(patient.priority)}
                  <span className="text-sm font-bold">
                    {getPriorityText(patient.priority)}
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  Triagem: {getTimeSinceTriage(patient.triageTime)}
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white font-medium">
                    {patient.patient.name}
                  </span>
                  <span className="text-xs text-white/60">
                    ({calculateAge(patient.patient.birthDate)} anos)
                  </span>
                </div>
                <p className="text-sm text-white/80 ml-6">
                  {patient.attendance.chiefComplaint}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60">
                <span>
                  Status: {getStatusText(patient.attendance.status)}
                </span>
                <span>
                  {formatDate(patient.attendance.startTime)} {formatTime(patient.attendance.startTime)}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">
                    CPF: {patient.patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </span>
                  <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {patients.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Ver todos os pacientes críticos
          </button>
        </div>
      )}
    </GlassCard>
  );
};