// Tipos para o sistema de exames de imagem

export interface ImagingExam {
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

  // Exame
  examType: ImagingExamType;
  examCode: string;
  examName: string;
  bodyRegion: string[];
  laterality: 'bilateral' | 'left' | 'right' | null;
  contrast: boolean;
  contrastType?: string;

  // Agendamento e execução
  scheduledDate?: Date;
  scheduledTime?: string;
  performedDate?: Date;
  performedTime?: string;
  duration?: number; // minutos

  // Equipe
  radiologistId?: string;
  radiologistName?: string;
  technicianId: string;
  technicianName: string;

  // Equipamento
  equipmentId: string;
  equipmentName: string;
  roomNumber: string;

  // Status
  status: 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'reported';

  // Resultados
  images: ImagingImage[];
  report?: ImagingReport;

  // Controle de qualidade
  qualityControl: ImagingQualityControl;

  // Custos
  cost?: number;
  insuranceApproval?: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingExamType {
  id: string;
  code: string;
  name: string;
  category: 'radiography' | 'ultrasound' | 'ct' | 'mri' | 'mammography' | 'nuclear' | 'interventional';
  description: string;
  preparation?: string;
  contraindications?: string[];
  radiationDose?: number; // mSv
  typicalDuration: number; // minutos
  requiresContrast: boolean;
  active: boolean;
}

export interface ImagingImage {
  id: string;
  examId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  format: 'dicom' | 'jpeg' | 'png' | 'tiff';
  width: number;
  height: number;
  seriesNumber: number;
  instanceNumber: number;
  sliceLocation?: number;
  acquisitionDate: Date;
  dicomTags?: Record<string, any>;
  annotations?: ImagingAnnotation[];
  qualityScore?: number;
}

export interface ImagingAnnotation {
  id: string;
  imageId: string;
  type: 'arrow' | 'line' | 'circle' | 'rectangle' | 'text' | 'measurement';
  coordinates: number[];
  label?: string;
  measurement?: {
    value: number;
    unit: string;
    type: 'distance' | 'angle' | 'area' | 'volume';
  };
  color: string;
  createdBy: string;
  createdAt: Date;
}

export interface ImagingReport {
  id: string;
  examId: string;
  radiologistId: string;
  radiologistName: string;

  // Conteúdo
  findings: string;
  impression: string;
  conclusion: string;
  recommendations?: string;

  // Classificação
  birads?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Para mamografia
  severity: 'normal' | 'benign' | 'indeterminate' | 'suspicious' | 'malignant';

  // Templates
  templateUsed?: string;
  structuredData?: Record<string, any>;

  // Status
  status: 'draft' | 'preliminary' | 'final';
  preliminaryReport?: string;
  preliminaryRadiologistId?: string;

  // Revisão
  reviewedBy?: string;
  reviewedAt?: Date;
  amendments?: ImagingReportAmendment[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  reportDate: Date;
}

export interface ImagingReportAmendment {
  id: string;
  reportId: string;
  previousContent: string;
  newContent: string;
  reason: string;
  amendedBy: string;
  amendedAt: Date;
}

export interface ImagingEquipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  type: ImagingExamType['category'];
  roomNumber: string;
  location: string;

  // Especificações técnicas
  specifications: {
    voltage?: number;
    current?: number;
    power?: number;
    fieldStrength?: number; // Para RM
    sliceThickness?: number; // Para TC/RM
    matrixSize?: number;
    detectorType?: string;
  };

  // Status e manutenção
  status: 'operational' | 'maintenance' | 'calibration' | 'broken' | 'decommissioned';
  lastMaintenance: Date;
  nextMaintenance: Date;
  lastCalibration: Date;
  nextCalibration: Date;

  // Utilização
  utilizationHours: number;
  totalExams: number;
  availability: number; // percentual

  // Custos
  acquisitionCost?: number;
  maintenanceCost?: number;
  depreciation?: number;

  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingQualityControl {
  id: string;
  examId: string;
  equipmentId: string;

  // Parâmetros técnicos
  kvp?: number; // kilovoltage peak
  mas?: number; // milliampere-seconds
  exposureTime?: number;
  fieldSize?: string;
  focalSpot?: string;
  gridRatio?: number;
  distance?: number; // source-to-image distance

  // Métricas de qualidade
  uniformity?: number;
  contrast?: number;
  resolution?: number;
  noise?: number;
  artifacts?: string[];

  // Dose de radiação
  doseAreaProduct?: number; // DAP
  ctDoseIndex?: number; // CTDI
  effectiveDose?: number;

  // Avaliação
  qualityScore: number; // 1-10
  passFail: boolean;
  comments?: string;

  // Auditoria
  performedBy: string;
  performedAt: Date;
}

export interface ImagingWorklist {
  id: string;
  date: Date;
  technicianId: string;
  technicianName: string;
  roomId: string;
  roomNumber: string;

  exams: ImagingWorklistItem[];
  status: 'scheduled' | 'in_progress' | 'completed';

  startTime?: Date;
  endTime?: Date;
  totalDuration?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingWorklistItem {
  id: string;
  examId: string;
  patientName: string;
  examType: string;
  priority: 'routine' | 'urgent' | 'emergency';
  estimatedDuration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ImagingDashboardData {
  totalExamsToday: number;
  totalExamsMonth: number;
  examsByType: Record<string, number>;
  equipmentStatus: {
    operational: number;
    maintenance: number;
    broken: number;
    total: number;
  };
  averageWaitTime: number; // minutos
  averageReportTime: number; // horas
  criticalFindings: number;
  pendingReports: number;
  utilizationRate: number;
  technicianWorkload: number;
  roomUtilization: Record<string, number>;
}

export interface ImagingProtocol {
  id: string;
  name: string;
  examType: string;
  bodyRegion: string;
  indication: string;

  // Parâmetros técnicos
  parameters: {
    kvp?: number;
    mas?: number;
    sliceThickness?: number;
    fieldOfView?: number;
    matrix?: number;
    contrast?: boolean;
    contrastVolume?: number;
    contrastRate?: number;
    phases?: string[];
  };

  // Instruções
  patientPreparation: string;
  positioning: string;
  breathingInstructions?: string;
  scanningProtocol: string;

  // Qualidade
  qualityCriteria: string[];
  radiationOptimization: boolean;

  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingTemplate {
  id: string;
  name: string;
  examType: string;
  category: string;

  // Estrutura do template
  sections: {
    name: string;
    required: boolean;
    content: string;
    variables?: string[];
  }[];

  // Campos estruturados
  structuredFields?: {
    name: string;
    type: 'text' | 'select' | 'multiselect' | 'number';
    options?: string[];
    required: boolean;
  }[];

  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImagingAnalytics {
  period: {
    start: Date;
    end: Date;
  };

  // Volume
  totalExams: number;
  examsByType: Record<string, number>;
  examsByModality: Record<string, number>;
  examsByDepartment: Record<string, number>;

  // Performance
  averageWaitTime: number;
  averageReportTime: number;
  averageExamDuration: number;
  utilizationRate: number;

  // Qualidade
  positiveFindingsRate: number;
  criticalFindingsRate: number;
  discrepancyRate: number;

  // Eficiência
  equipmentDowntime: number; // horas
  repeatRate: number;
  cancellationRate: number;

  // Financeiro
  totalRevenue: number;
  costPerExam: number;
  reimbursementRate: number;
}

// Tipos para filtros e busca
export interface ImagingFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  examType?: string[];
  modality?: string[];
  department?: string[];
  radiologist?: string[];
  technician?: string[];
  urgency?: string[];
  patientName?: string;
  accessionNumber?: string;
}

export interface ImagingSearchParams {
  query: string;
  filters: ImagingFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

// Tipos para integração PACS
export interface PACSStudy {
  studyInstanceUID: string;
  studyID: string;
  studyDescription: string;
  patientID: string;
  patientName: string;
  studyDate: Date;
  studyTime: string;
  modalities: string[];
  numberOfSeries: number;
  numberOfInstances: number;
}

export interface PACSSeries {
  seriesInstanceUID: string;
  seriesNumber: number;
  seriesDescription: string;
  modality: string;
  numberOfInstances: number;
  bodyPart: string;
  laterality?: string;
}

export interface PACSInstance {
  sopInstanceUID: string;
  instanceNumber: number;
  sopClassUID: string;
  transferSyntaxUID: string;
  imageData: Uint8Array;
  dicomTags: Record<string, any>;
}







