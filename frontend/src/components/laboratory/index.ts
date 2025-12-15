// Componentes do Laboratório Clínico
export { default as LaboratoryDashboard } from './LaboratoryDashboard';
export { default as LaboratoryOrder } from './LaboratoryOrder';
export { default as LaboratoryExample } from './LaboratoryExample';

// Tipos
export type {
  LabTest,
  LabCategory,
  LabOrder,
  LabOrderTest,
  LabResult,
  LabEquipment,
  LabQualityControl,
  LabWorklist,
  LabDashboardData,
  LabPanel,
  LabAnalytics,
  LabReagent,
  LabCriticalValue,
  LabFilters,
  LabSearchParams,
  LISMessage,
  LISIntegration,
  LabReferenceProfile,
  LabReport
} from '@/types/laboratory';

// Hook
export { useLaboratory } from '@/hooks/useLaboratory';
