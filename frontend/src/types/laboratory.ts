// Tipos para o sistema de laboratório clínico

export interface LabTest {
  id: string;
  code: string;
  name: string;
  category: LabCategory;
  subcategory?: string;
  description: string;
  method: string;
  sampleType: SampleType;
  volumeRequired: number; // mL
  containerType: ContainerType;
  fastingRequired: boolean;
  preparation?: string;
  turnaroundTime: number; // horas
  referenceRanges: LabReferenceRange[];
  cost?: number;
  active: boolean;
  requiresApproval: boolean;
  emergencyAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  subcategories: string[];
}

export type SampleType =
  | 'blood'
  | 'urine'
  | 'stool'
  | 'sputum'
  | 'swab'
  | 'csf'
  | 'pleural_fluid'
  | 'ascites'
  | 'synovial_fluid'
  | 'amniotic_fluid'
  | 'other';

export type ContainerType =
  | 'serum_separator_tube'
  | 'plain_tube'
  | 'edta_tube'
  | 'citrate_tube'
  | 'heparin_tube'
  | 'fluoride_tube'
  | 'urine_container'
  | 'stool_container'
  | 'swab_transport'
  | 'other';

export interface LabReferenceRange {
  id: string;
  testId: string;
  gender?: 'M' | 'F' | 'both';
  ageMin?: number;
  ageMax?: number;
  ageUnit: 'days' | 'months' | 'years';
  minValue?: number;
  maxValue?: number;
  normalRange?: string;
  criticalLow?: number;
  criticalHigh?: number;
  units: string;
  interpretation?: string;
  active: boolean;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  patientBirthDate: Date;

  // Solicitação
  requestedBy: string;
  requestedByName: string;
  requestingDepartment: string;
  clinicalIndication: string;
  urgency: 'routine' | 'urgent' | 'emergency';

  // Exames solicitados
  tests: LabOrderTest[];

  // Amostra
  sampleCollectionDate?: Date;
  sampleReceivedDate?: Date;
  sampleType: SampleType;
  sampleVolume?: number;
  sampleCondition: SampleCondition;

  // Status
  status: LabOrderStatus;
  priority: 'low' | 'normal' | 'high' | 'critical';

  // Controle de qualidade
  qualityControl: LabQualityControl;

  // Resultados
  results: LabResult[];

  // Custos
  totalCost?: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type LabOrderStatus =
  | 'ordered'        // Solicitado
  | 'sample_collected' // Amostra coletada
  | 'sample_received' // Amostra recebida
  | 'in_progress'    // Em processamento
  | 'completed'      // Concluído
  | 'cancelled'      // Cancelado
  | 'rejected';      // Rejeitado

export type SampleCondition =
  | 'adequate'       // Adequada
  | 'insufficient'   // Insuficiente
  | 'hemolyzed'      // Hemolisada
  | 'clotted'        // Coagulada
  | 'contaminated'   // Contaminada
  | 'delayed';       // Atrasada

export interface LabOrderTest {
  id: string;
  orderId: string;
  testId: string;
  testCode: string;
  testName: string;
  status: LabTestStatus;
  priority: 'low' | 'normal' | 'high' | 'critical';
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export type LabTestStatus =
  | 'pending'        // Pendente
  | 'in_progress'    // Em andamento
  | 'completed'      // Concluído
  | 'cancelled'      // Cancelado
  | 'rejected';      // Rejeitado

export interface LabResult {
  id: string;
  orderId: string;
  testId: string;
  testCode: string;
  testName: string;

  // Valores
  value?: number;
  valueText?: string;
  units: string;
  referenceRange?: string;
  interpretation: LabResultInterpretation;

  // Flags
  isAbnormal: boolean;
  isCritical: boolean;
  isPreliminary: boolean;

  // Validação
  validatedBy?: string;
  validatedByName?: string;
  validatedAt?: Date;

  // Método
  method: string;
  instrument?: string;
  reagentLot?: string;

  // Controle de qualidade
  qcPassed: boolean;
  qcNotes?: string;

  // Notas
  notes?: string;
  comments?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type LabResultInterpretation =
  | 'normal'         // Normal
  | 'low'           // Baixo
  | 'high'          // Alto
  | 'critical_low'  // Crítico baixo
  | 'critical_high' // Crítico alto
  | 'abnormal'      // Anormal
  | 'inconclusive'  // Inconclusivo
  | 'not_done';     // Não realizado

export interface LabEquipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  type: LabEquipmentType;
  location: string;
  room: string;

  // Especificações
  specifications: {
    throughput?: number; // testes/hora
    precision?: number;
    accuracy?: number;
    linearity?: string;
    detectionLimit?: number;
    measuringRange?: string;
  };

  // Status e manutenção
  status: LabEquipmentStatus;
  lastMaintenance: Date;
  nextMaintenance: Date;
  lastCalibration: Date;
  nextCalibration: Date;

  // Utilização
  totalTests: number;
  monthlyUsage: number;
  downtimeHours: number;

  // Custos
  acquisitionCost?: number;
  maintenanceCost?: number;
  reagentCost?: number;

  // Calibração
  calibrationHistory: LabCalibrationRecord[];

  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type LabEquipmentType =
  | 'biochemistry_analyzer'
  | 'hematology_analyzer'
  | 'immunoassay_analyzer'
  | 'urine_analyzer'
  | 'microscope'
  | 'centrifuge'
  | 'incubator'
  | 'refrigerator'
  | 'freezer'
  | 'pipette'
  | 'balance'
  | 'ph_meter'
  | 'spectrophotometer'
  | 'other';

export type LabEquipmentStatus =
  | 'operational'
  | 'maintenance'
  | 'calibration'
  | 'repair'
  | 'decommissioned';

export interface LabCalibrationRecord {
  id: string;
  equipmentId: string;
  performedBy: string;
  performedByName: string;
  calibrationDate: Date;
  dueDate: Date;
  standardUsed: string;
  results: {
    parameter: string;
    targetValue: number;
    measuredValue: number;
    acceptableRange: string;
    passed: boolean;
  }[];
  notes?: string;
}

export interface LabQualityControl {
  id: string;
  orderId: string;

  // Controle interno
  internalControls: LabQCResult[];

  // Controle externo
  externalControls: LabQCResult[];

  // Avaliação geral
  overallQC: 'passed' | 'failed' | 'warning';

  // Notas
  qcNotes?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LabQCResult {
  id: string;
  controlId: string;
  controlName: string;
  level: 'low' | 'normal' | 'high';
  targetValue: number;
  measuredValue: number;
  acceptableRange: string;
  passed: boolean;
  notes?: string;
}

export interface LabWorklist {
  id: string;
  date: Date;
  technicianId: string;
  technicianName: string;
  workstation: string;

  orders: LabWorklistOrder[];
  status: 'scheduled' | 'in_progress' | 'completed';

  startTime?: Date;
  endTime?: Date;
  totalTests: number;
  completedTests: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface LabWorklistOrder {
  id: string;
  orderId: string;
  patientName: string;
  tests: LabWorklistTest[];
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface LabWorklistTest {
  id: string;
  testId: string;
  testCode: string;
  testName: string;
  status: 'pending' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}

export interface LabDashboardData {
  totalOrdersToday: number;
  totalOrdersMonth: number;
  ordersByStatus: Record<LabOrderStatus, number>;
  ordersByUrgency: Record<string, number>;
  ordersByCategory: Record<string, number>;
  averageTurnaroundTime: number; // minutos
  criticalResults: number;
  rejectedSamples: number;
  equipmentStatus: {
    operational: number;
    maintenance: number;
    repair: number;
    total: number;
  };
  technicianWorkload: number;
  qcFailures: number;
  costPerTest: number;
  utilizationRate: number;
}

export interface LabPanel {
  id: string;
  name: string;
  code: string;
  description: string;
  category: string;
  tests: LabTest[];
  cost?: number;
  commonlyOrdered: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabAnalytics {
  period: {
    start: Date;
    end: Date;
  };

  // Volume
  totalOrders: number;
  totalTests: number;
  ordersByCategory: Record<string, number>;
  testsByType: Record<string, number>;

  // Performance
  averageTurnaroundTime: number;
  onTimeDeliveryRate: number;
  rejectionRate: number;
  repeatRate: number;

  // Qualidade
  qcPassRate: number;
  criticalValueResponseTime: number;
  deltaCheckFailures: number;

  // Eficiência
  costPerTest: number;
  technicianProductivity: number;
  equipmentUtilization: number;

  // Satisfação
  customerSatisfactionScore?: number;
  complaintRate: number;
}

export interface LabReagent {
  id: string;
  name: string;
  manufacturer: string;
  catalogNumber: string;
  lotNumber: string;
  expirationDate: Date;
  receivedDate: Date;
  quantityReceived: number;
  quantityRemaining: number;
  unit: string;
  storageConditions: string;
  cost?: number;
  status: 'active' | 'expired' | 'depleted' | 'quarantined';
  equipmentCompatible: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LabCriticalValue {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  testId: string;
  testName: string;
  resultId: string;
  value: string;
  units: string;
  referenceRange: string;
  criticality: 'low_critical' | 'high_critical' | 'panic';
  notifiedTo: string[];
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  responseTime?: number; // minutos
  followUpRequired: boolean;
  followUpNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para filtros e busca
export interface LabFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  urgency?: string[];
  category?: string[];
  department?: string[];
  patientName?: string;
  orderNumber?: string;
}

export interface LabSearchParams {
  query: string;
  filters: LabFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

// Tipos para integração LIS
export interface LISMessage {
  id: string;
  messageType: 'order' | 'result' | 'status_update' | 'qc_result';
  hl7Message: string;
  parsedData: any;
  status: 'received' | 'processed' | 'error';
  errorMessage?: string;
  processedAt?: Date;
  createdAt: Date;
}

export interface LISIntegration {
  id: string;
  name: string;
  type: 'bidirectional' | 'unidirectional_in' | 'unidirectional_out';
  endpoint: string;
  authentication: {
    type: 'basic' | 'bearer' | 'api_key';
    credentials: any;
  };
  messageFormat: 'hl7' | 'json' | 'xml';
  active: boolean;
  lastSync: Date;
  syncStatus: 'success' | 'error' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para perfis de referência
export interface LabReferenceProfile {
  id: string;
  name: string;
  description: string;
  ageMin?: number;
  ageMax?: number;
  gender?: 'M' | 'F';
  pregnancyStatus?: boolean;
  ethnicity?: string;
  ranges: LabReferenceRange[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para relatórios
export interface LabReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'qc' | 'audit' | 'performance';
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedBy: string;
  generatedAt: Date;
  format: 'pdf' | 'excel' | 'html';
  fileUrl?: string;
}









