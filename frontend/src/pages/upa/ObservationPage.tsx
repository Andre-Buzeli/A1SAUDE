import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Ambulance
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface ObservationPatient {
  id: string;
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
  };
  priority: 'immediate' | 'very_urgent';
  chiefComplaint: string;
  vitalSigns: {
    heartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
  lastUpdate: string;
  observations: string[];
  status: 'critical' | 'stable' | 'improving' | 'worsening';
}

const ObservationPage: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<ObservationPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<ObservationPatient | null>(null);

  useEffect(() => {
    loadObservationPatients();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadObservationPatients, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadObservationPatients = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPatients: ObservationPatient[] = [
        {
          id: '1',
          patient: {
            id: 'p1',
            name: 'João Silva',
            cpf: '12345678901',
            birthDate: '1980-05-15',
            gender: 'male'
          },
          priority: 'immediate',
          chiefComplaint: 'Dor torácica intensa',
          vitalSigns: {
            heartRate: 120,
            bloodPressureSystolic: 160,
            bloodPressureDiastolic: 100,
            temperature: 37.2,
            oxygenSaturation: 95,
            respiratoryRate: 24
          },
          lastUpdate: new Date().toISOString(),
          observations: [
            'Paciente com dor torácica intensa, sudorese, palidez',
            'FC: 120 bpm, PA: 160/100 mmHg, SpO2: 95%',
            'ECG: alterações sugestivas de isquemia'
          ],
          status: 'critical'
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
          priority: 'very_urgent',
          chiefComplaint: 'Dificuldade respiratória',
          vitalSigns: {
            heartRate: 110,
            bloodPressureSystolic: 140,
            bloodPressureDiastolic: 90,
            temperature: 38.1,
            oxygenSaturation: 92,
            respiratoryRate: 28
          },
          lastUpdate: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          observations: [
            'Paciente com dispneia intensa, uso de musculatura acessória',
            'FC: 110 bpm, PA: 140/90 mmHg, SpO2: 92% em ar ambiente',
            'Iniciado oxigênio via cateter nasal 2L/min'
          ],
          status: 'critical'
        }
      ];

      setPatients(mockPatients);
    } catch (error) {
      console.error('Erro ao carregar pacientes em observação:', error);
      toast.error('Erro ao carregar pacientes em observação');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      critical: 'from-red-500/20 to-red-600/20 border-red-500/30',
      stable: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
      improving: 'from-green-500/20 to-green-600/20 border-green-500/30',
      worsening: 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
    };
    return colors[status as keyof typeof colors] || 'from-gray-500/20 to-gray-600/20';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      critical: 'Crítico',
      stable: 'Estável',
      improving: 'Melhorando',
      worsening: 'Piorando'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatVitalSign = (value: number | undefined, unit: string, normalRange?: string) => {
    if (value === undefined) return '--';
    const isNormal = normalRange ? `${value} ${unit}` : `${value}${unit}`;
    return isNormal;
  };

  const handleUpdateStatus = (patientId: string, newStatus: string) => {
    // Update patient status
    toast.success(`Status do paciente atualizado para ${getStatusLabel(newStatus)}`);
  };

  const handleAddObservation = (patientId: string, observation: string) => {
    // Add observation to patient
    toast.success('Observação adicionada com sucesso');
  };

  const handleTransferPatient = (patientId: string) => {
    // Open transfer modal
    toast.success('Abrindo modal de transferência para hospital');
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">
            Sala de Observação - UPA
          </h1>
          <p className="text-text-secondary">
            {user?.establishmentName} - Monitoramento de pacientes críticos
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Total em Observação</p>
                <p className="text-2xl font-bold text-white">{patients.length}</p>
              </div>
              <Activity className="w-8 h-8 text-medical-red" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Pacientes Críticos</p>
                <p className="text-2xl font-bold text-white">
                  {patients.filter(p => p.status === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Estáveis</p>
                <p className="text-2xl font-bold text-white">
                  {patients.filter(p => p.status === 'stable').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Melhorando</p>
                <p className="text-2xl font-bold text-white">
                  {patients.filter(p => p.status === 'improving').length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-green-400" />
            </div>
          </GlassCard>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {patients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className={`p-6 ${getStatusColor(patient.status)}`}>
                {/* Patient Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{patient.patient.name}</h3>
                    <p className="text-text-secondary text-sm">
                      {patient.patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.priority === 'immediate'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-orange-500/20 text-orange-300'
                    }`}>
                      {patient.priority === 'immediate' ? 'Imediato' : 'Muito Urgente'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'critical'
                        ? 'bg-red-500/20 text-red-300'
                        : patient.status === 'stable'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : patient.status === 'improving'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-orange-500/20 text-orange-300'
                    }`}>
                      {getStatusLabel(patient.status)}
                    </span>
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="mb-4">
                  <p className="text-text-secondary text-sm mb-1">Queixa Principal</p>
                  <p className="text-white font-medium">{patient.chiefComplaint}</p>
                </div>

                {/* Vital Signs */}
                <div className="mb-4">
                  <p className="text-text-secondary text-sm mb-2">Sinais Vitais</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-white">
                        {formatVitalSign(patient.vitalSigns.heartRate, 'bpm')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-white">
                        {formatVitalSign(patient.vitalSigns.bloodPressureSystolic, '/')}
                        {formatVitalSign(patient.vitalSigns.bloodPressureDiastolic, 'mmHg')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <span className="text-white">
                        {formatVitalSign(patient.vitalSigns.temperature, '°C')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-cyan-400" />
                      <span className="text-white">
                        {formatVitalSign(patient.vitalSigns.oxygenSaturation, '%')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-white">
                        {formatVitalSign(patient.vitalSigns.respiratoryRate, 'rpm')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-xs">
                        {new Date(patient.lastUpdate).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Latest Observations */}
                <div className="mb-4">
                  <p className="text-text-secondary text-sm mb-2">Últimas Observações</p>
                  <div className="space-y-1">
                    {patient.observations.slice(-2).map((obs, idx) => (
                      <p key={idx} className="text-white text-sm bg-white/10 p-2 rounded">
                        {obs}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedPatient(patient)}
                    className="text-white hover:bg-white/20"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detalhes
                  </GlassButton>

                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateStatus(patient.id, 'stable')}
                    className="text-white hover:bg-white/20"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Atualizar Status
                  </GlassButton>

                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTransferPatient(patient.id)}
                    className="text-white hover:bg-red-500/20"
                  >
                    <Ambulance className="w-4 h-4 mr-1" />
                    Transferir
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {patients.length === 0 && (
          <GlassCard className="p-8 text-center">
            <Activity className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">Nenhum paciente em observação no momento</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default ObservationPage;
