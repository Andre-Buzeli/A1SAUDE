// Tipos para o sistema de Centro Cirúrgico

export interface SurgeryRoom {
  id: string;
  number: string;
  name: string;
  type: 'general' | 'cardiac' | 'neurosurgery' | 'orthopedic' | 'emergency';
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'blocked';
  capacity: number;
  equipment: SurgeryEquipment[];
  lastMaintenance: Date;
  nextMaintenance: Date;
  currentSurgery?: string; // Surgery ID
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurgeryEquipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  status: 'operational' | 'maintenance' | 'broken' | 'calibration';
  lastCalibration: Date;
  nextCalibration: Date;
  location: string;
  roomId?: string;
}

export interface SurgeryTeam {
  id: string;
  surgeryId: string;
  surgeon: SurgeryTeamMember;
  assistant?: SurgeryTeamMember;
  anesthetist: SurgeryTeamMember;
  scrubNurse: SurgeryTeamMember;
  circulatingNurse: SurgeryTeamMember;
  anesthesiologist?: SurgeryTeamMember;
  perfusionist?: SurgeryTeamMember;
  otherMembers?: SurgeryTeamMember[];
}

export interface SurgeryTeamMember {
  id: string;
  userId: string;
  name: string;
  role: 'surgeon' | 'assistant' | 'anesthetist' | 'scrub_nurse' | 'circulating_nurse' | 'anesthesiologist' | 'perfusionist' | 'other';
  specialty?: string;
  licenseNumber: string;
  phone: string;
  isAvailable: boolean;
}

export interface Surgery {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  patientBloodType?: string;
  patientAllergies?: string[];

  // Scheduling
  scheduledDate: Date;
  scheduledTime: string;
  estimatedDuration: number; // minutes
  priority: 'elective' | 'urgent' | 'emergency';

  // Procedure details
  procedureCode: string;
  procedureName: string;
  procedureType: string;
  description: string;
  diagnosis?: string;
  cid10Code?: string;

  // Location and team
  roomId: string;
  roomNumber: string;
  team: SurgeryTeam;

  // Anesthesia
  anesthesiaType: 'general' | 'regional' | 'local' | 'sedation' | 'none';
  asaClassification: 1 | 2 | 3 | 4 | 5 | 6; // American Society of Anesthesiologists

  // Status and execution
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'post_op';
  checkInTime?: Date;
  startTime?: Date;
  endTime?: Date;
  actualDuration?: number;

  // Complications and notes
  complications?: string;
  notes?: string;
  postOpNotes?: string;

  // Materials and supplies
  materials: SurgeryMaterial[];
  implants?: SurgeryImplant[];

  // Costs and billing
  estimatedCost?: number;
  actualCost?: number;
  insuranceApproval?: boolean;
  insuranceNumber?: string;

  // Follow-up
  postOpCare?: string;
  followUpDate?: Date;
  dischargeDate?: Date;

  // Audit
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurgeryMaterial {
  id: string;
  materialId: string;
  name: string;
  quantity: number;
  unit: string;
  lotNumber?: string;
  expirationDate?: Date;
  supplier: string;
  cost: number;
  isSterile: boolean;
  isImplant: boolean;
}

export interface SurgeryImplant {
  id: string;
  implantId: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  size?: string;
  lotNumber: string;
  expirationDate?: Date;
  cost: number;
  sterilizationMethod: string;
  biocompatibility: string;
}

export interface SurgerySchedule {
  id: string;
  date: Date;
  roomId: string;
  surgeries: Surgery[];
  totalDuration: number;
  availableTime: number;
  utilizationRate: number;
}

export interface SurgeryDashboardData {
  totalSurgeriesToday: number;
  totalSurgeriesMonth: number;
  surgeriesInProgress: number;
  surgeriesCompleted: number;
  surgeriesCancelled: number;
  averageDuration: number;
  roomUtilization: number;
  emergencySurgeries: number;
  rooms: {
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
  };
  team: {
    availableSurgeons: number;
    availableAnesthetists: number;
    availableNurses: number;
  };
}

export interface SurgeryReport {
  id: string;
  type: 'daily' | 'monthly' | 'procedure' | 'complications' | 'costs' | 'utilization';
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  data: any[];
  generatedBy: string;
  generatedAt: Date;
}

// Surgery request and approval
export interface SurgeryRequest {
  id: string;
  patientId: string;
  patientName: string;
  requestedBy: string;
  requestedByName: string;
  specialty: string;
  procedureCode: string;
  procedureName: string;
  urgency: 'elective' | 'urgent' | 'emergency';
  clinicalIndication: string;
  risks: string;
  benefits: string;
  alternatives: string;
  status: 'pending' | 'approved' | 'denied' | 'scheduled';
  approvedBy?: string;
  approvedAt?: Date;
  deniedReason?: string;
  estimatedCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Pre-operative assessment
export interface PreOpAssessment {
  id: string;
  surgeryId: string;
  patientId: string;
  assessedBy: string;
  assessedByName: string;
  assessmentDate: Date;

  // Vital signs
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  bmi: number;

  // Laboratory results
  hemoglobin?: number;
  hematocrit?: number;
  platelets?: number;
  creatinine?: number;
  bloodGlucose?: number;
  coagulationTests?: any;

  // Physical assessment
  asaScore: 1 | 2 | 3 | 4 | 5 | 6;
  mallampatiScore?: 1 | 2 | 3 | 4;
  airwayAssessment: string;
  cardiacRisk: string;
  pulmonaryRisk: string;
  otherRisks: string;

  // Clearance status
  medicalClearance: 'cleared' | 'conditional' | 'not_cleared';
  anesthesiaClearance: 'cleared' | 'conditional' | 'not_cleared';
  cardiologyClearance?: 'cleared' | 'conditional' | 'not_cleared';

  // Recommendations
  recommendations: string;
  specialRequirements: string;

  createdAt: Date;
  updatedAt: Date;
}

// Post-operative care
export interface PostOpCare {
  id: string;
  surgeryId: string;
  patientId: string;

  // Recovery room
  recoveryStart: Date;
  recoveryEnd?: Date;
  aldreteScore?: number[]; // Multiple scores over time
  painAssessment: number[]; // VAS scores
  vitalSigns: any[]; // Time-series vital signs

  // Pain management
  painMedications: any[];
  pcaUsage?: any; // Patient Controlled Analgesia

  // Complications
  complications: string[];
  interventions: string[];

  // Discharge planning
  dischargeCriteria: string[];
  dischargeDate?: Date;
  dischargeInstructions: string;

  // Follow-up
  followUpAppointments: any[];
  homeCareInstructions: string;

  createdAt: Date;
  updatedAt: Date;
}

// Surgery protocols and checklists
export interface SurgeryProtocol {
  id: string;
  name: string;
  procedureType: string;
  specialty: string;
  version: string;

  // Checklist items
  preOpChecklist: ChecklistItem[];
  intraOpChecklist: ChecklistItem[];
  postOpChecklist: ChecklistItem[];

  // Required equipment
  requiredEquipment: string[];

  // Required materials
  requiredMaterials: any[];

  // Standard duration
  standardDuration: number;

  // Instructions
  instructions: string;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  item: string;
  category: string;
  required: boolean;
  order: number;
}

// Surgery statistics and KPIs
export interface SurgeryStats {
  period: {
    start: Date;
    end: Date;
  };

  // Volume metrics
  totalSurgeries: number;
  surgeriesByType: Record<string, number>;
  surgeriesBySpecialty: Record<string, number>;
  emergencyRate: number;

  // Quality metrics
  complicationRate: number;
  infectionRate: number;
  mortalityRate: number;
  readmissionRate: number;

  // Efficiency metrics
  averageDuration: number;
  roomUtilization: number;
  onTimeStartRate: number;
  cancellationRate: number;

  // Cost metrics
  averageCost: number;
  costPerMinute: number;
  costVariance: number;

  // Team performance
  surgeonPerformance: any[];
  roomPerformance: any[];
}

// Filter and search types
export interface SurgeryFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  priority?: string[];
  specialty?: string[];
  surgeon?: string[];
  room?: string[];
  procedureType?: string[];
  patientName?: string;
  procedureCode?: string;
}

export interface SurgerySearchParams {
  query: string;
  filters: SurgeryFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}









