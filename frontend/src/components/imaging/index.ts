// Componentes do Centro de Imagem
export { default as ImagingDashboard } from './ImagingDashboard';
export { default as ImagingRequest } from './ImagingRequest';
export { default as ImagingExample } from './ImagingExample';

// Tipos
export type {
  ImagingExam,
  ImagingEquipment,
  ImagingDashboardData,
  ImagingWorklist,
  ImagingReport,
  ImagingExamType,
  ImagingImage,
  ImagingAnnotation,
  ImagingQualityControl,
  ImagingProtocol,
  ImagingTemplate,
  ImagingAnalytics,
  ImagingFilters,
  ImagingSearchParams,
  PACSStudy,
  PACSSeries,
  PACSInstance
} from '@/types/imaging';

// Hook
export { useImaging } from '@/hooks/useImaging';
