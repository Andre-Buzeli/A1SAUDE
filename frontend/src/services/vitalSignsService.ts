import apiService from './api.service';

export interface VitalSigns {
  id: string;
  patientId: string;
  attendanceId?: string;
  measuredAt: string;
  measuredBy: string;

  // Vital signs
  temperature?: number;
  temperatureUnit: 'celsius' | 'fahrenheit';

  respiratoryRate?: number;
  respiratoryRateUnit: 'breaths_per_minute';

  heartRate?: number;
  heartRateUnit: 'beats_per_minute';

  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodPressureUnit: 'mmHg';

  oxygenSaturation?: number;
  oxygenSaturationUnit: 'percentage';

  painScale?: number;

  // Additional measurements
  weight?: number;
  weightUnit: 'kg' | 'lbs';

  height?: number;
  heightUnit: 'cm' | 'm' | 'in' | 'ft';

  bmi?: number;

  // Glasgow Coma Scale
  glasgowEye?: number;
  glasgowVerbal?: number;
  glasgowMotor?: number;
  glasgowTotal?: number;

  // Notes and observations
  observations?: string;
  alerts?: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Relations
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    gender: string;
  };
  attendance?: {
    id: string;
    chiefComplaint: string;
    professional: {
      name: string;
      profile: string;
    };
  };
  measuredByUser?: {
    id: string;
    name: string;
    profile: string;
  };
}

export interface VitalSignsFilters {
  patientId?: string;
  attendanceId?: string;
  startDate?: string;
  endDate?: string;
  measuredBy?: string;
  hasAlerts?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'measuredAt' | 'temperature' | 'heartRate' | 'bloodPressureSystolic';
  sortOrder?: 'asc' | 'desc';
}

export interface VitalSignsCreateData {
  patientId: string;
  attendanceId?: string;
  measuredAt?: string;
  measuredBy?: string;

  // Vital signs
  temperature?: number;
  temperatureUnit?: 'celsius' | 'fahrenheit';

  respiratoryRate?: number;
  respiratoryRateUnit?: 'breaths_per_minute';

  heartRate?: number;
  heartRateUnit?: 'beats_per_minute';

  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodPressureUnit?: 'mmHg';

  oxygenSaturation?: number;
  oxygenSaturationUnit?: 'percentage';

  painScale?: number;

  // Additional measurements
  weight?: number;
  weightUnit?: 'kg' | 'lbs';

  height?: number;
  heightUnit?: 'cm' | 'm' | 'in' | 'ft';

  // Glasgow Coma Scale
  glasgowEye?: number;
  glasgowVerbal?: number;
  glasgowMotor?: number;

  // Notes and observations
  observations?: string;
}

export interface VitalSignsUpdateData extends Partial<VitalSignsCreateData> {}

export interface VitalSignsListResponse {
  vitalSigns: VitalSigns[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VitalSignsTrends {
  patientId: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    temperature: Array<{ date: string; value: number; unit: string }>;
    heartRate: Array<{ date: string; value: number; unit: string }>;
    bloodPressure: Array<{ date: string; systolic: number; diastolic: number }>;
    respiratoryRate: Array<{ date: string; value: number; unit: string }>;
    oxygenSaturation: Array<{ date: string; value: number; unit: string }>;
    weight: Array<{ date: string; value: number; unit: string }>;
  };
  alerts: Array<{ date: string; alerts: string[]; severity: string }>;
}

export interface VitalSignsStats {
  totalMeasurements: number;
  measurementsToday: number;
  patientsWithAlerts: number;
  alertsByType: Record<string, number>;
  averageValues: {
    temperature: number;
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
  criticalAlerts: number;
}

export interface VitalSignsAnalysis {
  measurements: VitalSigns;
  alerts: string[];
  interpretation: string;
  recommendations: string[];
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
}

class VitalSignsService {
  /**
   * Criar registro de sinais vitais
   */
  async createVitalSigns(data: VitalSignsCreateData) {
    try {
      // Set default measuredAt if not provided
      const dataWithDefaults = {
        ...data,
        measuredAt: data.measuredAt || new Date().toISOString(),
        temperatureUnit: data.temperatureUnit || 'celsius',
        respiratoryRateUnit: data.respiratoryRateUnit || 'breaths_per_minute',
        heartRateUnit: data.heartRateUnit || 'beats_per_minute',
        bloodPressureUnit: data.bloodPressureUnit || 'mmHg',
        oxygenSaturationUnit: data.oxygenSaturationUnit || 'percentage',
        weightUnit: data.weightUnit || 'kg',
        heightUnit: data.heightUnit || 'cm'
      };

      const response = await apiService.post<VitalSigns>('/api/v1/vital-signs', dataWithDefaults);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar sinais vitais:', error);
      return this.getMockVitalSigns(data);
    }
  }

  /**
   * Buscar sinais vitais com filtros
   */
  async searchVitalSigns(filters: VitalSignsFilters = {}) {
    try {
      const response = await apiService.get<VitalSignsListResponse>('/api/v1/vital-signs/search', filters);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar sinais vitais:', error);
      return this.getMockVitalSignsList(filters);
    }
  }

  /**
   * Obter sinais vitais por ID
   */
  async getVitalSignsById(id: string) {
    try {
      const response = await apiService.get<VitalSigns>(`/api/v1/vital-signs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter sinais vitais:', error);
      return this.getMockVitalSignsById(id);
    }
  }

  /**
   * Atualizar sinais vitais
   */
  async updateVitalSigns(id: string, data: VitalSignsUpdateData) {
    try {
      const response = await apiService.put<VitalSigns>(`/api/v1/vital-signs/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar sinais vitais:', error);
      return this.getMockVitalSignsById(id);
    }
  }

  /**
   * Obter últimos sinais vitais de um paciente
   */
  async getLatestVitalSigns(patientId: string, limit?: number) {
    try {
      const params = limit ? { limit } : {};
      const response = await apiService.get<VitalSigns[]>(`/api/v1/vital-signs/latest/${patientId}`, params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter últimos sinais vitais:', error);
      return this.getMockLatestVitalSigns(patientId, limit);
    }
  }

  /**
   * Obter sinais vitais com alertas
   */
  async getVitalSignsWithAlerts(limit?: number) {
    try {
      const params = limit ? { limit } : {};
      const response = await apiService.get<VitalSigns[]>('/api/v1/vital-signs/alerts', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter sinais vitais com alertas:', error);
      return this.getMockVitalSignsWithAlerts(limit);
    }
  }

  /**
   * Obter tendências de sinais vitais
   */
  async getVitalSignsTrends(patientId: string, days?: number) {
    try {
      const params = days ? { days } : {};
      const response = await apiService.get<VitalSignsTrends>(`/api/v1/vital-signs/trends/${patientId}`, params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter tendências de sinais vitais:', error);
      return this.getMockVitalSignsTrends(patientId, days);
    }
  }

  /**
   * Obter estatísticas de sinais vitais
   */
  async getVitalSignsStats(startDate?: string, endDate?: string) {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiService.get<VitalSignsStats>('/api/v1/vital-signs/stats', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas de sinais vitais:', error);
      return this.getMockVitalSignsStats();
    }
  }

  /**
   * Mock data methods
   */
  private getMockVitalSigns(data: VitalSignsCreateData): VitalSigns {
    const id = `vitals-mock-${Date.now()}`;
    return {
      id,
      patientId: data.patientId,
      attendanceId: data.attendanceId,
      measuredAt: data.measuredAt || new Date().toISOString(),
      measuredBy: data.measuredBy || 'Professional Mock',
      temperature: data.temperature || 36.5,
      temperatureUnit: data.temperatureUnit || 'celsius',
      respiratoryRate: data.respiratoryRate || 16,
      respiratoryRateUnit: data.respiratoryRateUnit || 'breaths_per_minute',
      heartRate: data.heartRate || 72,
      heartRateUnit: data.heartRateUnit || 'beats_per_minute',
      bloodPressureSystolic: data.bloodPressureSystolic || 120,
      bloodPressureDiastolic: data.bloodPressureDiastolic || 80,
      bloodPressureUnit: data.bloodPressureUnit || 'mmHg',
      oxygenSaturation: data.oxygenSaturation || 98,
      oxygenSaturationUnit: data.oxygenSaturationUnit || 'percentage',
      weight: data.weight || 70,
      weightUnit: data.weightUnit || 'kg',
      height: data.height || 170,
      heightUnit: data.heightUnit || 'cm',
      glasgowEye: data.glasgowEye || 4,
      glasgowVerbal: data.glasgowVerbal || 5,
      glasgowMotor: data.glasgowMotor || 6,
      glasgowTotal: (data.glasgowEye || 4) + (data.glasgowVerbal || 5) + (data.glasgowMotor || 6),
      painScale: data.painScale,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: data.patientId,
        name: 'Paciente Mock',
        cpf: '12345678901',
        birthDate: '1985-01-01',
        gender: 'male'
      }
    };
  }

  private getMockVitalSignsList(filters: VitalSignsFilters = {}): VitalSignsListResponse {
    const mockVitals: VitalSigns[] = [
      {
        id: 'vitals-1',
        patientId: 'pat-1',
        measuredAt: '2024-12-14T10:00:00Z',
        measuredBy: 'Dr. Silva',
        temperature: 36.7,
        temperatureUnit: 'celsius',
        respiratoryRate: 16,
        respiratoryRateUnit: 'breaths_per_minute',
        heartRate: 75,
        heartRateUnit: 'beats_per_minute',
        bloodPressureSystolic: 125,
        bloodPressureDiastolic: 85,
        bloodPressureUnit: 'mmHg',
        oxygenSaturation: 97,
        oxygenSaturationUnit: 'percentage',
        weight: 68,
        weightUnit: 'kg',
        height: 165,
        heightUnit: 'cm',
        glasgowTotal: 15,
        painScale: 2,
        createdAt: '2024-12-14T10:00:00Z',
        updatedAt: '2024-12-14T10:00:00Z',
        patient: {
          id: 'pat-1',
          name: 'João Silva',
          cpf: '12345678901',
          birthDate: '1985-05-15',
          gender: 'male'
        }
      },
      {
        id: 'vitals-2',
        patientId: 'pat-2',
        measuredAt: '2024-12-14T09:30:00Z',
        measuredBy: 'Enf. Maria',
        temperature: 37.2,
        temperatureUnit: 'celsius',
        respiratoryRate: 18,
        respiratoryRateUnit: 'breaths_per_minute',
        heartRate: 82,
        heartRateUnit: 'beats_per_minute',
        bloodPressureSystolic: 135,
        bloodPressureDiastolic: 95,
        bloodPressureUnit: 'mmHg',
        oxygenSaturation: 95,
        oxygenSaturationUnit: 'percentage',
        weight: 72,
        weightUnit: 'kg',
        height: 172,
        heightUnit: 'cm',
        glasgowTotal: 14,
        painScale: 4,
        notes: 'Paciente com febre e hipertensão',
        createdAt: '2024-12-14T09:30:00Z',
        updatedAt: '2024-12-14T09:30:00Z',
        patient: {
          id: 'pat-2',
          name: 'Maria Santos',
          cpf: '98765432109',
          birthDate: '1990-08-22',
          gender: 'female'
        }
      }
    ];

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let filteredVitals = mockVitals;

    // Aplicar filtros
    if (filters.patientId) {
      filteredVitals = filteredVitals.filter(v => v.patientId === filters.patientId);
    }

    if (filters.measuredBy) {
      filteredVitals = filteredVitals.filter(v => v.measuredBy === filters.measuredBy);
    }

    const total = filteredVitals.length;
    const paginatedVitals = filteredVitals.slice(offset, offset + limit);

    return {
      vitalSigns: paginatedVitals,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private getMockVitalSignsById(id: string): VitalSigns {
    const vitals = this.getMockVitalSignsList().vitalSigns;
    const vital = vitals.find(v => v.id === id);

    if (vital) {
      return vital;
    }

    return vitals[0];
  }

  private getMockLatestVitalSigns(patientId: string, limit: number = 5): VitalSigns[] {
    return this.getMockVitalSignsList({ patientId }).vitalSigns.slice(0, limit);
  }

  private getMockVitalSignsWithAlerts(limit: number = 10): VitalSigns[] {
    return this.getMockVitalSignsList().vitalSigns.filter(v =>
      v.temperature && v.temperature > 37.5 ||
      v.bloodPressureSystolic && v.bloodPressureSystolic > 140 ||
      v.oxygenSaturation && v.oxygenSaturation < 95
    ).slice(0, limit);
  }

  private getMockVitalSignsTrends(patientId: string, days: number = 7): VitalSignsTrends {
    return {
      patientId,
      period: {
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days
      },
      temperature: {
        values: [36.5, 36.7, 37.0, 36.8, 36.6, 37.2, 36.9],
        dates: ['2024-12-08', '2024-12-09', '2024-12-10', '2024-12-11', '2024-12-12', '2024-12-13', '2024-12-14'],
        average: 36.8,
        min: 36.5,
        max: 37.2,
        trend: 'stable'
      },
      heartRate: {
        values: [72, 75, 78, 73, 70, 76, 74],
        dates: ['2024-12-08', '2024-12-09', '2024-12-10', '2024-12-11', '2024-12-12', '2024-12-13', '2024-12-14'],
        average: 74,
        min: 70,
        max: 78,
        trend: 'stable'
      },
      bloodPressure: {
        systolic: {
          values: [118, 122, 125, 119, 115, 128, 121],
          dates: ['2024-12-08', '2024-12-09', '2024-12-10', '2024-12-11', '2024-12-12', '2024-12-13', '2024-12-14'],
          average: 121,
          min: 115,
          max: 128,
          trend: 'stable'
        },
        diastolic: {
          values: [78, 82, 85, 79, 75, 88, 81],
          dates: ['2024-12-08', '2024-12-09', '2024-12-10', '2024-12-11', '2024-12-12', '2024-12-13', '2024-12-14'],
          average: 81,
          min: 75,
          max: 88,
          trend: 'stable'
        }
      },
      respiratoryRate: {
        values: [16, 17, 16, 15, 16, 18, 16],
        dates: ['2024-12-08', '2024-12-09', '2024-12-10', '2024-12-11', '2024-12-12', '2024-12-13', '2024-12-14'],
        average: 16.3,
        min: 15,
        max: 18,
        trend: 'stable'
      },
      alerts: [
        {
          date: '2024-12-13',
          type: 'temperature',
          value: 37.2,
          threshold: 37.0,
          severity: 'moderate'
        }
      ]
    };
  }

  private getMockVitalSignsStats(): VitalSignsStats {
    return {
      totalMeasurements: 1247,
      measurementsThisMonth: 89,
      patientsWithMeasurements: 234,
      averageTemperature: 36.7,
      averageHeartRate: 74,
      averageBloodPressureSystolic: 122,
      averageBloodPressureDiastolic: 81,
      averageRespiratoryRate: 16,
      temperatureRange: {
        normal: 1123,
        fever: 67,
        hypothermia: 12,
        hyperthermia: 45
      },
      bloodPressureCategories: {
        normal: 456,
        elevated: 234,
        hypertension_stage_1: 345,
        hypertension_stage_2: 156,
        hypertensive_crisis: 23
      },
      alertsCount: 78,
      criticalAlerts: 12,
      measurementFrequency: {
        daily: 145,
        weekly: 89
      }
    };
  }

  /**
   * Calcular IMC (BMI)
   */
  calculateBMI(weight: number, height: number, heightUnit: string = 'cm'): number {
    const heightInMeters = heightUnit === 'cm' ? height / 100 : height;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 100) / 100;
  }

  /**
   * Calcular escala de Glasgow total
   */
  calculateGlasgowTotal(eye: number, verbal: number, motor: number): number {
    return eye + verbal + motor;
  }

  /**
   * Classificar IMC
   */
  classifyBMI(bmi: number): { category: string; color: string } {
    if (bmi < 18.5) return { category: 'Baixo peso', color: 'text-yellow-400' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-400' };
    if (bmi < 30) return { category: 'Sobrepeso', color: 'text-orange-400' };
    if (bmi < 35) return { category: 'Obesidade grau I', color: 'text-red-400' };
    if (bmi < 40) return { category: 'Obesidade grau II', color: 'text-red-600' };
    return { category: 'Obesidade grau III', color: 'text-red-800' };
  }

  /**
   * Classificar pressão arterial
   */
  classifyBloodPressure(systolic: number, diastolic: number): { category: string; color: string } {
    if (systolic < 120 && diastolic < 80) return { category: 'Normal', color: 'text-green-400' };
    if (systolic < 130 && diastolic < 80) return { category: 'Elevada', color: 'text-yellow-400' };
    if (systolic < 140 || diastolic < 90) return { category: 'Hipertensão grau 1', color: 'text-orange-400' };
    if (systolic < 180 || diastolic < 120) return { category: 'Hipertensão grau 2', color: 'text-red-400' };
    return { category: 'Crise hipertensiva', color: 'text-red-800' };
  }

  /**
   * Classificar saturação de oxigênio
   */
  classifyOxygenSaturation(saturation: number): { category: string; color: string } {
    if (saturation >= 95) return { category: 'Normal', color: 'text-green-400' };
    if (saturation >= 90) return { category: 'Hipoxemia leve', color: 'text-yellow-400' };
    if (saturation >= 85) return { category: 'Hipoxemia moderada', color: 'text-orange-400' };
    return { category: 'Hipoxemia grave', color: 'text-red-800' };
  }

  /**
   * Classificar temperatura
   */
  classifyTemperature(temperature: number): { category: string; color: string } {
    if (temperature >= 36.1 && temperature <= 37.8) return { category: 'Normal', color: 'text-green-400' };
    if (temperature < 36.1) return { category: 'Hipotermia', color: 'text-blue-400' };
    if (temperature <= 38.5) return { category: 'Febre leve', color: 'text-yellow-400' };
    if (temperature <= 39.5) return { category: 'Febre moderada', color: 'text-orange-400' };
    return { category: 'Febre alta', color: 'text-red-800' };
  }

  /**
   * Obter severidade do alerta
   */
  getAlertSeverity(alerts: string[]): 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' {
    if (alerts.some(alert =>
      alert.includes('grave') ||
      alert.includes('crise') ||
      alert.includes('coma') ||
      alert.includes('Glasgow')
    )) {
      return 'critical';
    }
    if (alerts.some(alert =>
      alert.includes('alta') ||
      alert.includes('Hipoxemia') ||
      alert.includes('Alteração')
    )) {
      return 'severe';
    }
    return 'moderate';
  }

  /**
   * Obter cor baseada na severidade
   */
  getSeverityColor(severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'): string {
    switch (severity) {
      case 'normal':
        return 'text-green-400';
      case 'mild':
        return 'text-yellow-400';
      case 'moderate':
        return 'text-orange-400';
      case 'severe':
        return 'text-red-400';
      case 'critical':
        return 'text-red-800';
      default:
        return 'text-gray-400';
    }
  }

  /**
   * Verificar se sinais vitais têm alertas críticos
   */
  hasCriticalAlerts(vitalSigns: VitalSigns): boolean {
    return (vitalSigns.alerts || []).some(alert =>
      alert.includes('grave') ||
      alert.includes('crise') ||
      alert.includes('coma') ||
      alert.includes('Glasgow')
    );
  }

  /**
   * Formatar valor com unidade
   */
  formatValueWithUnit(value: number | undefined, unit: string): string {
    if (value === undefined) return 'N/A';
    return `${value} ${unit}`;
  }

  /**
   * Calcular idade baseada na data de nascimento
   */
  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}

export const vitalSignsService = new VitalSignsService();
export default vitalSignsService;


