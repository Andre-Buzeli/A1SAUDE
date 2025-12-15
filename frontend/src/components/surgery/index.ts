// Componentes do Centro Cirúrgico
export { default as SurgeryDashboard } from './SurgeryDashboard';
export { default as SurgeryScheduler } from './SurgeryScheduler';
export { default as SurgeryExample } from './SurgeryExample';

// Tipos
export type {
  Surgery,
  SurgeryRoom,
  SurgeryTeam,
  SurgeryDashboardData,
  SurgerySchedule,
  SurgeryRequest,
  PreOpAssessment,
  PostOpCare,
  SurgeryProtocol,
  ChecklistItem,
  SurgeryStats,
  SurgeryFilters,
  SurgerySearchParams
} from '@/types/surgery';

// Hook
export { useSurgery } from '@/hooks/useSurgery';
