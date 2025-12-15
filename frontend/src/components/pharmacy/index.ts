// Componentes da Farmácia
export { default as PharmacyDashboard } from './PharmacyDashboard';
export { default as PharmacyStockControl } from './PharmacyStockControl';
export { default as PharmacyDispensation } from './PharmacyDispensation';
export { default as PharmacyEntry } from './PharmacyEntry';
export { default as PharmacyExample } from './PharmacyExample';

// Tipos
export type {
  PharmacyMedication,
  PharmacyStock,
  PharmacyMovement,
  PharmacySupplier,
  PharmacyOrder,
  PharmacyDispensation,
  PharmacyDashboardData,
  PharmacyFilters,
  StockAlert,
  MedicationBatch
} from '@/types/pharmacy';

// Hook
export { usePharmacy } from '@/hooks/usePharmacy';
