import React from 'react';
import { KPICard } from '../components/medical/KPICard';
import { RecentAttendancesList } from '../components/medical/RecentAttendancesList';
import { UpcomingAppointmentsList } from '../components/medical/UpcomingAppointmentsList';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  FileText, 
  TestTube,
  Bed,
  Activity,
  Stethoscope
} from 'lucide-react';

// Test data for testing
const mockRecentAttendances = [
  {
    id: '1',
    startTime: new Date().toISOString(),
    status: 'completed',
    chiefComplaint: 'Dor de cabeça persistente',
    patient: {
      id: '1',
      name: 'João Silva',
      cpf: '123.456.789-01'
    },
    professional: {
      id: '1',
      name: 'Dr. Maria Santos',
      profile: 'medico'
    },
    triage: {
      priority: 'yellow'
    }
  },
  {
    id: '2',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress',
    chiefComplaint: 'Dor no peito',
    patient: {
      id: '2',
      name: 'Ana Costa',
      cpf: '987.654.321-09'
    },
    professional: {
      id: '2',
      name: 'Dr. Pedro Lima',
      profile: 'medico'
    },
    triage: {
      priority: 'red'
    }
  }
];

const mockUpcomingAppointments = [
  {
    id: '1',
    startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    status: 'scheduled',
    patient: {
      id: '1',
      name: 'Carlos Oliveira',
      cpf: '456.789.123-45'
    },
    professional: {
      id: '1',
      name: 'Dr. Maria Santos',
      profile: 'medico'
    }
  },
  {
    id: '2',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    status: 'scheduled',
    patient: {
      id: '2',
      name: 'Lucia Ferreira',
      cpf: '789.123.456-78'
    },
    professional: {
      id: '1',
      name: 'Dr. Maria Santos',
      profile: 'medico'
    }
  }
];

export const TestMedicalDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Test Medical Dashboard</h1>
            <p className="text-white/60 mt-1">
              Testing all medical dashboard components
            </p>
          </div>
        </div>

        {/* KPI Cards Test */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">KPI Cards Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total de Pacientes"
              value={150}
              icon={Users}
              color="blue"
            />
            <KPICard
              title="Atendimentos Hoje"
              value={25}
              icon={Calendar}
              color="green"
              trend={{ value: 12, isPositive: true }}
            />
            <KPICard
              title="Tempo Médio de Espera"
              value="45 min"
              icon={Clock}
              color="orange"
              trend={{ value: 5, isPositive: false }}
            />
            <KPICard
              title="Pacientes Críticos"
              value={3}
              icon={AlertTriangle}
              color="red"
            />
          </div>
        </div>

        {/* Hospital Specific KPIs */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Hospital KPIs Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <KPICard
              title="Total de Leitos"
              value={120}
              subtitle="95 ocupados"
              icon={Bed}
              color="purple"
            />
            <KPICard
              title="Taxa de Ocupação"
              value="79%"
              icon={Activity}
              color="green"
            />
            <KPICard
              title="Cirurgias Hoje"
              value={8}
              icon={Stethoscope}
              color="blue"
            />
            <KPICard
              title="Prescrições"
              value={42}
              icon={FileText}
              color="blue"
            />
            <KPICard
              title="Exames Solicitados"
              value={18}
              icon={TestTube}
              color="purple"
            />
          </div>
        </div>

        {/* Lists Test */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Attendances Test</h2>
            <RecentAttendancesList 
              attendances={mockRecentAttendances}
              onRefresh={() => console.log('Refresh clicked')}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Upcoming Appointments Test</h2>
            <UpcomingAppointmentsList 
              appointments={mockUpcomingAppointments}
              onRefresh={() => console.log('Refresh clicked')}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Testing Instructions</h3>
          <div className="text-white/80 space-y-2">
            <p>✅ KPI Cards with different colors and trends</p>
            <p>✅ Hospital-specific metrics display</p>
            <p>✅ Recent attendances list with priority indicators</p>
            <p>✅ Upcoming appointments with time calculations</p>
            <p>✅ Glassmorphism design system</p>
            <p>✅ Responsive grid layouts</p>
            <p>✅ Interactive hover effects</p>
          </div>
        </div>
      </div>
    </div>
  );
};