import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Heart,
  Stethoscope,
  Syringe,
  Thermometer,
  UserCheck,
  Bed,
  Shield,
  Home,
  FileText,
  Target
} from 'lucide-react';
import { KPICard } from '../medical/KPICard';
import { NursingActivitiesList } from './NursingActivitiesList';
import { PendingTriagesList } from './PendingTriagesList';
import { CriticalPatientsList } from './CriticalPatientsList';
import { nursingDashboardService, NursingDashboardData } from '../../services/nursingDashboardService';
import { useAuth } from '../../contexts/AuthContext';

interface NursingDashboardProps {
  establishmentType: 'hospital' | 'upa' | 'ubs';
}

export const NursingDashboard: React.FC<NursingDashboardProps> = ({ establishmentType }) => {
  const [dashboardData, setDashboardData] = useState<NursingDashboardData | null>(null);
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
      const data = await nursingDashboardService.getDashboard(establishmentType);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dashboard de enfermagem');
    } finally {
      setLoading(false);
    }
  };

  const getEstablishmentTitle = () => {
    switch (establishmentType) {
      case 'hospital':
        return 'Dashboard Enfermagem - Hospital';
      case 'upa':
        return 'Dashboard Enfermagem - UPA';
      case 'ubs':
        return 'Dashboard Enfermagem - UBS';
      default:
        return 'Dashboard Enfermagem';
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
              title="Pacientes sob Cuidados"
              value={specific.patientsInCare || 0}
              subtitle="Internados"
              icon={Bed}
              color="blue"
            />
            <KPICard
              title="Horários de Medicação"
              value={specific.medicationSchedules || 0}
              subtitle="Prescrições ativas"
              icon={Syringe}
              color="green"
            />
            <KPICard
              title="Procedimentos Realizados"
              value={specific.nursingProcedures || 0}
              subtitle="Hoje"
              icon={Activity}
              color="purple"
            />
            <KPICard
              title="Preparações para Alta"
              value={specific.dischargePreparations || 0}
              subtitle="Programadas"
              icon={CheckCircle}
              color="green"
            />
          </>
        );

      case 'upa':
        return (
          <>
            <KPICard
              title="Triagens Realizadas"
              value={specific.triagesPerformed || 0}
              subtitle="Hoje"
              icon={Shield}
              color="blue"
            />
            <KPICard
              title="Cuidados de Emergência"
              value={specific.emergencyNursingCare || 0}
              subtitle="Atendimentos"
              icon={AlertTriangle}
              color="red"
            />
            <KPICard
              title="Pacientes em Observação"
              value={specific.observationPatients || 0}
              icon={Activity}
              color="orange"
            />
            <KPICard
              title="Intervenções Críticas"
              value={specific.criticalInterventions || 0}
              subtitle="Prioridade alta"
              icon={Heart}
              color="red"
            />
          </>
        );

      case 'ubs':
        return (
          <>
            <KPICard
              title="Cuidados Preventivos"
              value={specific.preventiveCareActivities || 0}
              subtitle="Atividades hoje"
              icon={Shield}
              color="green"
            />
            <KPICard
              title="Apoio em Vacinação"
              value={specific.vaccinationSupport || 0}
              subtitle="Vacinas aplicadas"
              icon={Syringe}
              color="blue"
            />
            <KPICard
              title="Pacientes Crônicos"
              value={specific.chronicCarePatients || 0}
              subtitle="Em acompanhamento"
              icon={Heart}
              color="purple"
            />
            <KPICard
              title="Educação em Saúde"
              value={specific.healthEducationActivities || 0}
              subtitle="Atividades"
              icon={FileText}
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
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
            {dashboardData.establishmentInfo.name} • {user?.profile === 'enfermeiro' ? 'Enfermeiro(a)' : 'Técnico(a)'} {user?.name}
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* KPIs Gerais de Enfermagem */}
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
          title="Triagens Pendentes"
          value={dashboardData.metrics.pendingTriages}
          icon={Clock}
          color="orange"
        />
        <KPICard
          title="Triagens Completadas"
          value={dashboardData.metrics.completedTriages}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* KPIs Específicos de Enfermagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Tempo Médio Triagem"
          value={`${dashboardData.metrics.averageTriageTime} min`}
          icon={Clock}
          color={dashboardData.metrics.averageTriageTime > 15 ? 'red' : dashboardData.metrics.averageTriageTime > 10 ? 'orange' : 'green'}
        />
        <KPICard
          title="Pacientes Críticos"
          value={dashboardData.metrics.criticalPatients}
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Medicamentos Administrados"
          value={dashboardData.metrics.medicationsAdministered}
          icon={Syringe}
          color="blue"
        />
        <KPICard
          title="Sinais Vitais Registrados"
          value={dashboardData.metrics.vitalSignsRecorded}
          icon={Thermometer}
          color="purple"
        />
      </div>

      {/* KPI de Atividades de Enfermagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Atividades de Cuidados"
          value={dashboardData.metrics.nursingCareActivities}
          subtitle="Realizadas hoje"
          icon={UserCheck}
          color="green"
        />
        {renderEstablishmentSpecificKPIs()}
      </div>

      {/* Listas de Atividades de Enfermagem */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NursingActivitiesList 
          activities={dashboardData.recentActivities}
          onRefresh={loadDashboardData}
        />
        <PendingTriagesList 
          triages={dashboardData.pendingTriages}
          onRefresh={loadDashboardData}
        />
        <CriticalPatientsList 
          patients={dashboardData.criticalPatients}
          onRefresh={loadDashboardData}
        />
      </div>
    </div>
  );
};