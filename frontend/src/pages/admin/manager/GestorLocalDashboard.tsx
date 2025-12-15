import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Users,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Stethoscope,
  Bed,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Settings,
  Bell
} from 'lucide-react';
import GlassCard from '../../../components/ui/GlassCard';
import GlassButton from '../../../components/ui/GlassButton';

interface LocalMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'break';
  shift: string;
  department: string;
}

interface Equipment {
  id: string;
  name: string;
  status: 'operational' | 'maintenance' | 'offline';
  lastMaintenance: string;
  nextMaintenance: string;
}

const GestorLocalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedShift, setSelectedShift] = useState('current');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  // Dados simulados para demonstração
  useEffect(() => {
    setStaff([
      {
        id: '1',
        name: 'Dr. João Silva',
        role: 'Médico',
        status: 'online',
        shift: 'Manhã',
        department: 'Clínica Geral'
      },
      {
        id: '2',
        name: 'Enf. Maria Santos',
        role: 'Enfermeira',
        status: 'online',
        shift: 'Manhã',
        department: 'Emergência'
      },
      {
        id: '3',
        name: 'Téc. Pedro Costa',
        role: 'Técnico',
        status: 'break',
        shift: 'Manhã',
        department: 'Laboratório'
      }
    ]);

    setEquipment([
      {
        id: '1',
        name: 'Raio-X Digital',
        status: 'operational',
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-04-15'
      },
      {
        id: '2',
        name: 'Ultrassom',
        status: 'maintenance',
        lastMaintenance: '2024-01-10',
        nextMaintenance: '2024-02-10'
      },
      {
        id: '3',
        name: 'ECG',
        status: 'operational',
        lastMaintenance: '2024-01-20',
        nextMaintenance: '2024-04-20'
      }
    ]);
  }, []);

  const metrics: LocalMetric[] = [
    {
      title: 'Pacientes Hoje',
      value: '127',
      change: '+12 vs ontem',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-400'
    },
    {
      title: 'Taxa de Ocupação',
      value: '68%',
      change: '+5% vs ontem',
      trend: 'up',
      icon: <Bed className="w-6 h-6" />,
      color: 'text-green-400'
    },
    {
      title: 'Equipe Presente',
      value: '32/35',
      change: '3 ausências',
      trend: 'stable',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'text-yellow-400'
    },
    {
      title: 'Tempo Médio Espera',
      value: '18min',
      change: '-3min vs ontem',
      trend: 'up',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-purple-400'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'operational': return 'text-green-400';
      case 'break':
      case 'maintenance': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'break': return 'Pausa';
      case 'operational': return 'Operacional';
      case 'maintenance': return 'Manutenção';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            <span>Dashboard Gestor Local</span>
          </h1>
          <p className="text-white/70 mt-1 text-sm">
            UBS Vila Nova - Gestão operacional do estabelecimento
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-md"
          >
            <option value="current">Turno Atual</option>
            <option value="morning">Manhã</option>
            <option value="afternoon">Tarde</option>
            <option value="night">Noite</option>
          </select>
          
          <GlassButton onClick={() => navigate('/dev/gestor-local/reports')}>
            Relatório Diário
          </GlassButton>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className={metric.color}>
                  {metric.icon}
                </div>
                <div className="flex items-center space-x-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {metric.value}
                </h3>
                <p className="text-sm text-white/70 mb-2">
                  {metric.title}
                </p>
                <p className={`text-xs ${
                  metric.trend === 'up' ? 'text-green-400' : 
                  metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.change}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Equipe e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipe Presente */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Equipe Presente</span>
              </h3>
              <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dev/gestor-local/staff')}>
                Ver Todos
              </GlassButton>
            </div>
            
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-white/70 text-sm">{member.role} - {member.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`${getStatusColor(member.status)} font-medium text-sm`}>
                      {getStatusLabel(member.status)}
                    </span>
                    <p className="text-white/50 text-xs">{member.shift}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Alertas Operacionais */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-400" />
                <span>Alertas Operacionais</span>
              </h3>
              <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dev/gestor-local/operations')}>
                Ver Todos
              </GlassButton>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Ultrassom em Manutenção</p>
                  <p className="text-white/70 text-sm">Equipamento indisponível até 15h</p>
                  <p className="text-white/50 text-xs mt-1">Há 1 hora</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Fila de Espera Aumentando</p>
                  <p className="text-white/70 text-sm">15 pacientes aguardando atendimento</p>
                  <p className="text-white/50 text-xs mt-1">Há 15 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Meta de Atendimentos</p>
                  <p className="text-white/70 text-sm">Meta diária atingida com sucesso</p>
                  <p className="text-white/50 text-xs mt-1">Há 30 minutos</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Atendimentos e Equipamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atendimentos por Hora */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-green-400" />
                <span>Atendimentos por Hora</span>
              </h3>
            </div>
            
            <div className="space-y-3">
              {[
                { hour: '08:00', count: 12, max: 15 },
                { hour: '09:00', count: 15, max: 15 },
                { hour: '10:00', count: 18, max: 20 },
                { hour: '11:00', count: 14, max: 20 },
                { hour: '12:00', count: 8, max: 15 },
                { hour: '13:00', count: 11, max: 15 }
              ].map((item) => (
                <div key={item.hour} className="flex items-center justify-between">
                  <span className="text-white/70 w-16">{item.hour}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-green-400 h-2 rounded-full" 
                        style={{ width: `${(item.count / item.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-white text-sm w-12 text-right">
                    {item.count}/{item.max}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Status dos Equipamentos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Status dos Equipamentos</span>
              </h3>
              <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dev/gestor-local/operations')}>
                Manutenção
              </GlassButton>
            </div>
            
            <div className="space-y-4">
              {equipment.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-white/50 text-sm">
                      Próxima manutenção: {new Date(item.nextMaintenance).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`${getStatusColor(item.status)} font-medium text-sm`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Ações Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Ações Rápidas</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassButton className="h-20 flex-col" onClick={() => navigate('/dev/gestor-local/staff')}>
              <Users className="w-6 h-6 mb-2" />
              <span>Gerenciar Equipe</span>
            </GlassButton>
            
            <GlassButton className="h-20 flex-col" onClick={() => navigate('/dev/gestor-local/operations')}>
              <Calendar className="w-6 h-6 mb-2" />
              <span>Agendar Consulta</span>
            </GlassButton>
            
            <GlassButton className="h-20 flex-col" onClick={() => navigate('/dev/gestor-local/operations')}>
              <Settings className="w-6 h-6 mb-2" />
              <span>Configurações</span>
            </GlassButton>
            
            <GlassButton className="h-20 flex-col" onClick={() => navigate('/dev/gestor-local/reports')}>
              <Activity className="w-6 h-6 mb-2" />
              <span>Relatórios</span>
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default GestorLocalDashboard;
