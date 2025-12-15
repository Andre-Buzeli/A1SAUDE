import React from 'react';
import { 
  Clock, 
  User, 
  AlertTriangle,
  Calendar,
  RefreshCw,
  Shield
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface PendingTriagesListProps {
  triages: any[];
  onRefresh: () => void;
}

export const PendingTriagesList: React.FC<PendingTriagesListProps> = ({ 
  triages, 
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

  const getWaitingTime = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}min`;
    }
  };

  const getWaitingTimeColor = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes > 60) return 'text-red-400';
    if (diffMinutes > 30) return 'text-orange-400';
    return 'text-green-400';
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Triagens Pendentes</h3>
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
        {triages.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">Nenhuma triagem pendente</p>
            <p className="text-white/40 text-sm mt-1">Todos os pacientes foram triados</p>
          </div>
        ) : (
          triages.map((triage) => (
            <div
              key={triage.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-white">
                    Aguardando Triagem
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-black/20 ${getWaitingTimeColor(triage.startTime)}`}>
                    {getWaitingTime(triage.startTime)}
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  {formatDate(triage.startTime)} {formatTime(triage.startTime)}
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="w-4 h-4 text-white/60" />
                  <span className="text-sm text-white font-medium">
                    {triage.patient.name}
                  </span>
                  <span className="text-xs text-white/60">
                    ({calculateAge(triage.patient.birthDate)} anos)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60">
                <span>
                  CPF: {triage.patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                </span>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  Iniciar Triagem
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {triages.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
            Ver todas as triagens pendentes
          </button>
        </div>
      )}
    </GlassCard>
  );
};