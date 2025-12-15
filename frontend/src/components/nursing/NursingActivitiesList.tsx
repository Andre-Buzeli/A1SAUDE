import React from 'react';
import { 
  Clock, 
  User, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface NursingActivitiesListProps {
  activities: any[];
  onRefresh: () => void;
}

export const NursingActivitiesList: React.FC<NursingActivitiesListProps> = ({ 
  activities, 
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-orange-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em andamento';
      case 'scheduled':
        return 'Agendado';
      case 'cancelled':
        return 'Cancelado';
      case 'no_show':
        return 'Faltou';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'red':
        return 'text-red-400';
      case 'orange':
        return 'text-orange-400';
      case 'yellow':
        return 'text-yellow-400';
      case 'green':
        return 'text-green-400';
      case 'blue':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case 'red':
        return 'Emergência';
      case 'orange':
        return 'Muito Urgente';
      case 'yellow':
        return 'Urgente';
      case 'green':
        return 'Pouco Urgente';
      case 'blue':
        return 'Não Urgente';
      default:
        return '';
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Atividades Recentes</h3>
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
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">Nenhuma atividade recente</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(activity.status)}
                  <span className="text-sm font-medium text-white">
                    {getStatusText(activity.status)}
                  </span>
                  {activity.triage?.priority && (
                    <span className={`text-xs px-2 py-1 rounded-full bg-black/20 ${getPriorityColor(activity.triage.priority)}`}>
                      {getPriorityText(activity.triage.priority)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/60">
                  {formatDate(activity.startTime)} {formatTime(activity.startTime)}
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white font-medium">
                    {activity.patient.name}
                  </span>
                </div>
                <p className="text-sm text-white/80 ml-6">
                  {activity.chiefComplaint}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60">
                <span>
                  {activity.professional.profile === 'enfermeiro' ? 'Enfermeiro(a)' : 'Técnico(a)'}: {activity.professional.name}
                </span>
                <span>
                  CPF: {activity.patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Ver todas as atividades
          </button>
        </div>
      )}
    </GlassCard>
  );
};