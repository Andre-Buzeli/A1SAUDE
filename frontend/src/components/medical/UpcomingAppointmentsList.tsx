import React from 'react';
import { Calendar, User, Clock, RefreshCw, Plus } from 'lucide-react';
import { UpcomingAppointment } from '../../services/medicalDashboardService';

interface UpcomingAppointmentsListProps {
  appointments: UpcomingAppointment[];
  onRefresh?: () => void;
}

export const UpcomingAppointmentsList: React.FC<UpcomingAppointmentsListProps> = ({
  appointments,
  onRefresh
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    let dateText = date.toLocaleDateString('pt-BR');
    if (isToday) dateText = 'Hoje';
    else if (isTomorrow) dateText = 'Amanhã';
    
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return { dateText, time, isToday, isTomorrow };
  };

  const getTimeUntilAppointment = (dateString: string) => {
    const appointmentTime = new Date(dateString);
    const now = new Date();
    const diffMs = appointmentTime.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Atrasado';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `Em ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Em ${diffHours}h ${diffMinutes}min`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Em ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Próximos Agendamentos
        </h3>
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Atualizar lista"
            >
              <RefreshCw className="w-4 h-4 text-white/60" />
            </button>
          )}
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Novo agendamento"
          >
            <Plus className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">Nenhum agendamento próximo encontrado</p>
            <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-100 px-4 py-2 rounded-lg transition-colors">
              Agendar consulta
            </button>
          </div>
        ) : (
          appointments.map((appointment) => {
            const { dateText, time, isToday, isTomorrow } = formatDateTime(appointment.startTime);
            const timeUntil = getTimeUntilAppointment(appointment.startTime);
            const isUrgent = isToday && new Date(appointment.startTime).getTime() - new Date().getTime() < 60 * 60 * 1000; // menos de 1 hora

            return (
              <div
                key={appointment.id}
                className={`
                  border rounded-lg p-4 transition-colors cursor-pointer
                  ${isUrgent 
                    ? 'bg-orange-500/10 border-orange-400/30 hover:bg-orange-500/20' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-white/60 mr-2" />
                      <span className="font-medium text-white">
                        {appointment.patient.name}
                      </span>
                      <span className="text-white/60 text-sm ml-2">
                        CPF: {appointment.patient.cpf}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-white/60 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className={isToday || isTomorrow ? 'font-medium text-white/80' : ''}>
                        {dateText} às {time}
                      </span>
                    </div>
                    <div className="text-sm text-white/60">
                      Dr(a). {appointment.professional.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span 
                      className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${isUrgent 
                          ? 'text-orange-200 bg-orange-500/30' 
                          : isToday || isTomorrow 
                            ? 'text-blue-200 bg-blue-500/30'
                            : 'text-gray-300 bg-gray-500/30'
                        }
                      `}
                    >
                      {timeUntil}
                    </span>
                    {isUrgent && (
                      <span className="text-orange-400 text-xs font-medium">
                        Próximo!
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                      Iniciar consulta
                    </button>
                    <span className="text-white/40">•</span>
                    <button className="text-white/60 hover:text-white/80 text-sm transition-colors">
                      Reagendar
                    </button>
                  </div>
                  <button className="text-red-400 hover:text-red-300 text-sm transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {appointments.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            Ver todos os agendamentos
          </button>
        </div>
      )}
    </div>
  );
};