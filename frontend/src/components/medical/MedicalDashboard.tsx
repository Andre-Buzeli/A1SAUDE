import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  TestTube,
  Bed,
  Activity,
  Stethoscope,
  Syringe,
  Heart,
  Home
} from 'lucide-react';
import { KPICard } from './KPICard';
import { RecentAttendancesList } from './RecentAttendancesList';
import { UpcomingAppointmentsList } from './UpcomingAppointmentsList';
import { medicalDashboardService, MedicalDashboardData } from '../../services/medicalDashboardService';
import { useAuth } from '../../contexts/AuthContext';

interface MedicalDashboardProps {
  establishmentType: 'hospital' | 'upa' | 'ubs';
}

export const MedicalDashboard: React.FC<MedicalDashboardProps> = ({ establishmentType }) => {
  const [dashboardData, setDashboardData] = useState<MedicalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, [establishmentType]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicalDashboardService.getDashboard(establishmentType);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dashboard médico');
    } finally {
      setLoading(false);
    }
  };

  const getEstablishmentTitle = () => {
    switch (establishmentType) {
      case 'hospital':
        return 'Dashboard Médico - Hospital';
      case 'upa':
        return 'Dashboard Médico - UPA';
      case 'ubs':
        return 'Dashboard Médico - UBS';
      default:
        return 'Dashboard Médico';
    }
  };

  const renderEstablishmentSpecificKPIs = () => {
    if (!dashboardData?.metrics.establishmentSpecificMetrics) return null;

    const specific = dashboardData.metrics.establishmentSpecificMetrics;

    switch (establishmentType) {
      case 'hospital':
        return (
          <>
            <KPICard
              title="Total de Leitos"
              value={specific.totalBeds || 0}
              subtitle={`${specific.occupiedBeds || 0} ocupados`}
              icon={Bed}
              color="purple"
            />
            <KPICard
              title="Taxa de Ocupação"
              value={`${specific.occupancyRate || 0}%`}
              icon={Activity}
              color={specific.occupancyRate > 80 ? 'red' : specific.occupancyRate > 60 ? 'orange' : 'green'}
            />
            <KPICard
              title="Cirurgias Hoje"
              value={specific.surgeriesToday || 0}
              icon={Stethoscope}
              color="blue"
            />
            <KPICard
              title="Pacientes UTI"
              value={specific.icuPatients || 0}
              icon={Heart}
              color="red"
            />
            <KPICard
              title="Altas Planejadas"
              value={specific.dischargesPlanned || 0}
              icon={CheckCircle}
              color="green"
            />
          </>
        );

      case 'upa':
        return (
          <>
            <KPICard
              title="Emergências"
              value={specific.emergencyAttendances || 0}
              subtitle="Atendimentos de emergência hoje"
              icon={AlertTriangle}
              color="red"
            />
            <KPICard
              title="Observação"
              value={specific.observationPatients || 0}
              subtitle="Pacientes em observação"
              icon={Activity}
              color="orange"
            />
            <KPICard
              title="Prioridade Vermelha"
              value={specific.triageStats?.red || 0}
              icon={AlertTriangle}
              color="red"
            />
            <KPICard
              title="Prioridade Laranja"
              value={specific.triageStats?.orange || 0}
              icon={Clock}
              color="orange"
            />
          </>
        );

      case 'ubs':
        return (
          <>
            <KPICard
              title="Consultas Agendadas"
              value={specific.scheduledConsultations || 0}
              subtitle="Para hoje"
              icon={Calendar}
              color="blue"
            />
            <KPICard
              title="Vacinações"
              value={specific.vaccinationsToday || 0}
              subtitle="Aplicadas hoje"
              icon={Syringe}
              color="green"
            />
            <KPICard
              title="Cuidados Preventivos"
              value={specific.preventiveCare || 0}
              icon={Heart}
              color="purple"
            />
            <KPICard
              title="Visitas Domiciliares"
              value={specific.homeVisits || 0}
              icon={Home}
              color="gray"
            />
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-100 mb-2">Erro ao carregar dashboard</h3>
        <p className="text-red-200 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="bg-red-500/30 hover:bg-red-500/40 border border-red-400/30 text-red-100 px-4 py-2 rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{getEstablishmentTitle()}</h1>
          <p className="text-white/60 mt-1">
            {dashboardData.establishmentInfo.name} • Dr(a). {user?.name}
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Pacientes"
          value={dashboardData.metrics.totalPatients}
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Atendimentos Hoje"
          value={dashboardData.metrics.todayAttendances}
          icon={Calendar}
          color="green"
        />
        <KPICard
          title="Atendimentos Pendentes"
          value={dashboardData.metrics.pendingAttendances}
          icon={Clock}
          color="orange"
        />
        <KPICard
          title="Completados Hoje"
          value={dashboardData.metrics.completedAttendances}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* KPIs Médicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Tempo Médio de Espera"
          value={`${dashboardData.metrics.averageWaitTime} min`}
          icon={Clock}
          color={dashboardData.metrics.averageWaitTime > 60 ? 'red' : dashboardData.metrics.averageWaitTime > 30 ? 'orange' : 'green'}
        />
        <KPICard
          title="Pacientes Críticos"
          value={dashboardData.metrics.criticalPatients}
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Prescrições Hoje"
          value={dashboardData.metrics.prescriptionsToday}
          icon={FileText}
          color="blue"
        />
        <KPICard
          title="Exames Solicitados"
          value={dashboardData.metrics.examsRequested}
          icon={TestTube}
          color="purple"
        />
      </div>

      {/* KPIs Específicos por Estabelecimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {renderEstablishmentSpecificKPIs()}
      </div>

      {/* Listas de Atendimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAttendancesList 
          attendances={dashboardData.recentAttendances}
          onRefresh={loadDashboardData}
        />
        <UpcomingAppointmentsList 
          appointments={dashboardData.upcomingAppointments}
          onRefresh={loadDashboardData}
        />
      </div>
    </div>
  );
};