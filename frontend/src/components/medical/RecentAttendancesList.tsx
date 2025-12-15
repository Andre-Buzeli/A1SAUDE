import React from 'react';
import { Clock, User, Calendar, RefreshCw } from 'lucide-react';
import { RecentAttendance } from '../../services/medicalDashboardService';

interface RecentAttendancesListProps {
  attendances: RecentAttendance[];
  onRefresh?: () => void;
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'red':
      return 'text-red-400 bg-red-500/20';
    case 'orange':
      return 'text-orange-400 bg-orange-500/20';
    case 'yellow':
      return 'text-yellow-400 bg-yellow-500/20';
    case 'green':
      return 'text-green-400 bg-green-500/20';
    case 'blue':
      return 'text-blue-400 bg-blue-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-400 bg-green-500/20';
    case 'in_progress':
      return 'text-blue-400 bg-blue-500/20';
    case 'scheduled':
      return 'text-yellow-400 bg-yellow-500/20';
    case 'cancelled':
      return 'text-red-400 bg-red-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
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
      return 'Não compareceu';
    default:
      return status;
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
      return 'Sem triagem';
  }
};

export const RecentAttendancesList: React.FC<RecentAttendancesListProps> = ({
  attendances,
  onRefresh
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Atendimentos Recentes
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {attendances.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Nenhum atendimento recente encontrado</p>
          </div>
        ) : (
          attendances.map((attendance) => {
            const { date, time } = formatDateTime(attendance.startTime);
            const statusColor = getStatusColor(attendance.status);
            const priorityColor = getPriorityColor(attendance.triage?.priority);

            return (
              <div
                key={attendance.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-white/60 mr-2" />
                      <span className="font-medium text-white">
                        {attendance.patient.name}
                      </span>
                      <span className="text-white/60 text-sm ml-2">
                        CPF: {attendance.patient.cpf}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm mb-2">
                      {attendance.chiefComplaint}
                    </p>
                    <div className="flex items-center text-sm text-white/60">
                      <span>{date} às {time}</span>
                      <span className="mx-2">•</span>
                      <span>Dr(a). {attendance.professional.name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {getStatusText(attendance.status)}
                    </span>
                    {attendance.triage && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
                        {getPriorityText(attendance.triage.priority)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {attendances.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            Ver todos os atendimentos
          </button>
        </div>
      )}
    </div>
  );
};