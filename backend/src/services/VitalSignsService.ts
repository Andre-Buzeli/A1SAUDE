import { PrismaClient, VitalSigns } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createVitalSignsSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  recordedAt: z.string().transform(str => new Date(str)).optional(),
  recordedBy: z.string().min(1, 'Profissional que mediu é obrigatório'),

  // Vital signs
  temperature: z.number().min(25).max(45).optional(),
  respiratoryRate: z.number().min(0).max(100).optional(),
  heartRate: z.number().min(0).max(300).optional(),
  systolicBP: z.number().min(0).max(300).optional(),
  diastolicBP: z.number().min(0).max(200).optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  painScale: z.number().min(0).max(10).optional(),

  // Additional measurements
  weight: z.number().min(0).max(500).optional(),
  height: z.number().min(0).max(300).optional(),
});

const searchVitalSignsSchema = z.object({
  patientId: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  recordedBy: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['recordedAt', 'temperature', 'heartRate', 'systolicBP']).default('recordedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export interface VitalSignsFilters {
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
  recordedBy?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recordedAt' | 'temperature' | 'heartRate' | 'systolicBP';
  sortOrder?: 'asc' | 'desc';
}

export interface VitalSignsWithDetails extends VitalSigns {
  patient: {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    gender: string;
  };
  recordedByUser?: {
    id: string;
    name: string;
    profile: string;
  };
}

export interface VitalSignsAnalysis {
  measurements: Partial<VitalSigns>;
  alerts: string[];
  interpretation: string;
  recommendations: string[];
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
}

export interface VitalSignsTrends {
  patientId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    temperature: Array<{ date: Date; value: number; unit: string }>;
    heartRate: Array<{ date: Date; value: number; unit: string }>;
    bloodPressure: Array<{ date: Date; systolic: number; diastolic: number }>;
    respiratoryRate: Array<{ date: Date; value: number; unit: string }>;
    oxygenSaturation: Array<{ date: Date; value: number; unit: string }>;
    weight: Array<{ date: Date; value: number; unit: string }>;
  };
}

export interface VitalSignsStats {
  totalMeasurements: number;
  measurementsToday: number;
  averageValues: {
    temperature: number;
    heartRate: number;
    systolicBP: number;
    diastolicBP: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
}

export class VitalSignsService {
  constructor(private prisma: PrismaClient) {}

  // Normal ranges for vital signs (Brazilian standards)
  private normalRanges = {
    temperature: { min: 36.1, max: 37.8, unit: 'celsius' }, // °C
    heartRate: {
      adult: { min: 60, max: 100, unit: 'beats_per_minute' },
      child: { min: 70, max: 120, unit: 'beats_per_minute' },
      infant: { min: 100, max: 160, unit: 'beats_per_minute' }
    },
    bloodPressure: {
      systolic: { min: 90, max: 140, unit: 'mmHg' },
      diastolic: { min: 60, max: 90, unit: 'mmHg' }
    },
    respiratoryRate: {
      adult: { min: 12, max: 20, unit: 'breaths_per_minute' },
      child: { min: 20, max: 30, unit: 'breaths_per_minute' },
      infant: { min: 30, max: 60, unit: 'breaths_per_minute' }
    },
    oxygenSaturation: { min: 95, max: 100, unit: 'percentage' }, // %
    painScale: { min: 0, max: 3, unit: 'scale' } // 0-10 scale, normal is 0-3
  };

  async createVitalSigns(data: any, recordedByUser: string): Promise<VitalSignsWithDetails> {
    const validatedData = createVitalSignsSchema.parse(data);

    // Get patient info for age-based calculations
    const patient = await this.prisma.patient.findUnique({
      where: { id: validatedData.patientId },
      select: { birthDate: true, gender: true }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    // Calculate age in years
    const ageInYears = this.calculateAge(patient.birthDate);

    // Analyze vital signs and generate alerts
    const analysis = this.analyzeVitalSigns(validatedData, ageInYears);
    
    // Use current date if not provided
    const recordedAt = validatedData.recordedAt || new Date();

    // Calculate BMI if weight and height are provided
    let bmi: number | undefined;
    if (validatedData.weight && validatedData.height) {
      const heightInMeters = validatedData.height / 100; // assuming height is in cm
      bmi = validatedData.weight / (heightInMeters * heightInMeters);
    }

    const vitalSigns = await this.prisma.vitalSigns.create({
      data: {
        patientId: validatedData.patientId,
        recordedAt: recordedAt,
        recordedBy: validatedData.recordedBy || recordedByUser,
        temperature: validatedData.temperature,
        respiratoryRate: validatedData.respiratoryRate,
        heartRate: validatedData.heartRate,
        systolicBP: validatedData.systolicBP,
        diastolicBP: validatedData.diastolicBP,
        oxygenSaturation: validatedData.oxygenSaturation,
        painScale: validatedData.painScale,
        weight: validatedData.weight,
        height: validatedData.height
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        }
      }
    });

    return vitalSigns as VitalSignsWithDetails;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }

    return age;
  }

  private analyzeVitalSigns(data: any, ageInYears: number): VitalSignsAnalysis {
    const alerts: string[] = [];
    let severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' = 'normal';
    const recommendations: string[] = [];
    let interpretation = 'Sinais vitais dentro da normalidade';

    // Temperature analysis
    if (data.temperature) {
      if (data.temperature < 36.1) {
        alerts.push('Hipotermia');
        severity = this.escalateSeverity(severity, 'moderate');
        recommendations.push('Aquecer o paciente, monitorar temperatura');
      } else if (data.temperature > 37.8) {
        if (data.temperature > 39.0) {
          alerts.push('Febre alta');
          severity = this.escalateSeverity(severity, 'severe');
          recommendations.push('Avaliar foco infeccioso, considerar antibioticoterapia');
        } else {
          alerts.push('Febre');
          severity = this.escalateSeverity(severity, 'mild');
          recommendations.push('Monitorar temperatura, hidratação adequada');
        }
      }
    }

    // Heart rate analysis based on age
    if (data.heartRate) {
      const hrRange = this.getHeartRateRange(ageInYears);
      if (data.heartRate < hrRange.min) {
        alerts.push('Bradicardia');
        severity = this.escalateSeverity(severity, 'moderate');
        recommendations.push('Monitorar ECG, avaliar medicações');
      } else if (data.heartRate > hrRange.max) {
        if (data.heartRate > hrRange.max * 1.5) {
          alerts.push('Taquicardia grave');
          severity = this.escalateSeverity(severity, 'severe');
          recommendations.push('Avaliar causa, monitorar continuamente');
        } else {
          alerts.push('Taquicardia');
          severity = this.escalateSeverity(severity, 'mild');
          recommendations.push('Monitorar frequência cardíaca');
        }
      }
    }

    // Blood pressure analysis
    if (data.systolicBP && data.diastolicBP) {
      if (data.systolicBP < 90 || data.diastolicBP < 60) {
        alerts.push('Hipotensão');
        severity = this.escalateSeverity(severity, 'moderate');
        recommendations.push('Posicionar paciente, avaliar hidratação, monitorar PA');
      } else if (data.systolicBP > 140 || data.diastolicBP > 90) {
        if (data.systolicBP > 180 || data.diastolicBP > 110) {
          alerts.push('Crise hipertensiva');
          severity = this.escalateSeverity(severity, 'critical');
          recommendations.push('Tratamento imediato anti-hipertensivo, monitorização contínua');
        } else {
          alerts.push('Hipertensão');
          severity = this.escalateSeverity(severity, 'moderate');
          recommendations.push('Avaliar fatores de risco, considerar tratamento');
        }
      }
    }

    // Respiratory rate analysis based on age
    if (data.respiratoryRate) {
      const rrRange = this.getRespiratoryRateRange(ageInYears);
      if (data.respiratoryRate < rrRange.min) {
        alerts.push('Bradipneia');
        severity = this.escalateSeverity(severity, 'moderate');
        recommendations.push('Monitorar respiração, avaliar nível de consciência');
      } else if (data.respiratoryRate > rrRange.max) {
        if (data.respiratoryRate > rrRange.max * 1.5) {
          alerts.push('Taquipneia grave');
          severity = this.escalateSeverity(severity, 'severe');
          recommendations.push('Oxigenoterapia, avaliação pulmonar');
        } else {
          alerts.push('Taquipneia');
          severity = this.escalateSeverity(severity, 'mild');
          recommendations.push('Monitorar frequência respiratória');
        }
      }
    }

    // Oxygen saturation analysis
    if (data.oxygenSaturation) {
      if (data.oxygenSaturation < 95) {
        if (data.oxygenSaturation < 90) {
          alerts.push('Hipoxemia grave');
          severity = this.escalateSeverity(severity, 'critical');
          recommendations.push('Oxigenoterapia imediata, avaliação intensiva');
        } else {
          alerts.push('Hipoxemia');
          severity = this.escalateSeverity(severity, 'severe');
          recommendations.push('Oxigenoterapia, monitorar saturação');
        }
      }
    }

    // Pain scale analysis
    if (data.painScale) {
      if (data.painScale >= 7) {
        alerts.push('Dor intensa');
        severity = this.escalateSeverity(severity, 'moderate');
        recommendations.push('Avaliar causa da dor, analgesia adequada');
      } else if (data.painScale >= 4) {
        alerts.push('Dor moderada');
        severity = this.escalateSeverity(severity, 'mild');
        recommendations.push('Considerar analgesia');
      }
    }

    // BMI analysis if calculated
    if (data.weight && data.height) {
      const heightInMeters = data.height / 100; // assuming height is in cm
      const calculatedBMI = data.weight / (heightInMeters * heightInMeters);

      if (calculatedBMI < 18.5) {
        alerts.push('Baixo peso (IMC < 18.5)');
        recommendations.push('Avaliação nutricional');
      } else if (calculatedBMI >= 25 && calculatedBMI < 30) {
        alerts.push('Sobrepeso (IMC 25-29.9)');
        recommendations.push('Orientação nutricional');
      } else if (calculatedBMI >= 30) {
        if (calculatedBMI >= 40) {
          alerts.push('Obesidade grau III (IMC ≥ 40)');
          severity = this.escalateSeverity(severity, 'moderate');
          recommendations.push('Avaliação multidisciplinar, manejo nutricional');
        } else {
          alerts.push('Obesidade (IMC ≥ 30)');
          recommendations.push('Orientação nutricional e atividade física');
        }
      }
    }

    // Update interpretation based on alerts
    if (alerts.length > 0) {
      interpretation = `Alterações encontradas: ${alerts.join(', ')}`;
    }

    return {
      measurements: data,
      alerts,
      interpretation,
      recommendations,
      severity
    };
  }

  private getHeartRateRange(ageInYears: number) {
    if (ageInYears < 1) return this.normalRanges.heartRate.infant;
    if (ageInYears < 12) return this.normalRanges.heartRate.child;
    return this.normalRanges.heartRate.adult;
  }

  private getRespiratoryRateRange(ageInYears: number) {
    if (ageInYears < 1) return this.normalRanges.respiratoryRate.infant;
    if (ageInYears < 12) return this.normalRanges.respiratoryRate.child;
    return this.normalRanges.respiratoryRate.adult;
  }

  private escalateSeverity(current: string, newSeverity: string): 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' {
    const levels = ['normal', 'mild', 'moderate', 'severe', 'critical'];
    const currentIndex = levels.indexOf(current);
    const newIndex = levels.indexOf(newSeverity);
    return levels[Math.max(currentIndex, newIndex)] as 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
  }

  async getVitalSignsById(id: string): Promise<VitalSignsWithDetails | null> {
    const vitalSigns = await this.prisma.vitalSigns.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        }
      }
    });

    return vitalSigns as VitalSignsWithDetails | null;
  }

  async searchVitalSigns(filters: VitalSignsFilters): Promise<{
    vitalSigns: VitalSignsWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const validatedFilters = searchVitalSignsSchema.parse(filters);

    const where: any = {};

    if (validatedFilters.patientId) where.patientId = validatedFilters.patientId;
    if (validatedFilters.recordedBy) where.recordedBy = validatedFilters.recordedBy;

    if (validatedFilters.startDate || validatedFilters.endDate) {
      where.recordedAt = {};
      if (validatedFilters.startDate) where.recordedAt.gte = validatedFilters.startDate;
      if (validatedFilters.endDate) where.recordedAt.lte = validatedFilters.endDate;
    }

    const total = await this.prisma.vitalSigns.count({ where });

    const vitalSigns = await this.prisma.vitalSigns.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        }
      },
      orderBy: {
        [validatedFilters.sortBy]: validatedFilters.sortOrder
      },
      skip: (validatedFilters.page - 1) * validatedFilters.limit,
      take: validatedFilters.limit
    });

    const totalPages = Math.ceil(total / validatedFilters.limit);

    return {
      vitalSigns: vitalSigns as VitalSignsWithDetails[],
      total,
      page: validatedFilters.page,
      totalPages
    };
  }

  async updateVitalSigns(id: string, data: any): Promise<VitalSignsWithDetails> {
    const validatedData = createVitalSignsSchema.partial().parse(data);

    // Get existing record for patient info
    const existing = await this.prisma.vitalSigns.findUnique({
      where: { id },
      include: { patient: { select: { birthDate: true } } }
    });

    if (!existing) {
      throw new Error('Sinais vitais não encontrados');
    }

    const ageInYears = this.calculateAge(existing.patient.birthDate);
    const analysis = this.analyzeVitalSigns(validatedData, ageInYears);

    // Calculate BMI if weight and height are provided
    let bmi: number | undefined;
    if (validatedData.weight && validatedData.height) {
      const heightInMeters = validatedData.height / 100; // assuming height is in cm
      bmi = validatedData.weight / (heightInMeters * heightInMeters);
    }

    const vitalSigns = await this.prisma.vitalSigns.update({
      where: { id },
      data: {
        ...validatedData,
        // Remove BMI calculation as it's not in the schema
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        }
      }
    });

    return vitalSigns as VitalSignsWithDetails;
  }

  async getVitalSignsTrends(patientId: string, days: number = 30): Promise<VitalSignsTrends> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const vitalSigns = await this.prisma.vitalSigns.findMany({
      where: {
        patientId,
        recordedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        recordedAt: 'asc'
      }
    });

    const metrics = {
      temperature: vitalSigns
        .filter(vs => vs.temperature !== null)
        .map(vs => ({
          date: vs.recordedAt,
          value: vs.temperature!,
          unit: 'celsius'
        })),
      heartRate: vitalSigns
        .filter(vs => vs.heartRate !== null)
        .map(vs => ({
          date: vs.recordedAt,
          value: vs.heartRate!,
          unit: 'beats_per_minute'
        })),
      bloodPressure: vitalSigns
        .filter(vs => vs.systolicBP !== null && vs.diastolicBP !== null)
        .map(vs => ({
          date: vs.recordedAt,
          systolic: vs.systolicBP!,
          diastolic: vs.diastolicBP!
        })),
      respiratoryRate: vitalSigns
        .filter(vs => vs.respiratoryRate !== null)
        .map(vs => ({
          date: vs.recordedAt,
          value: vs.respiratoryRate!,
          unit: 'breaths_per_minute'
        })),
      oxygenSaturation: vitalSigns
        .filter(vs => vs.oxygenSaturation !== null)
        .map(vs => ({
          date: vs.recordedAt,
          value: vs.oxygenSaturation!,
          unit: 'percentage'
        })),
      weight: vitalSigns
        .filter(vs => vs.weight !== null)
        .map(vs => ({
          date: vs.recordedAt,
          value: vs.weight!,
          unit: 'kg'
        }))
    };

    return {
      patientId,
      period: { start: startDate, end: endDate },
      metrics
    };
  }

  async getVitalSignsStats(startDate?: Date, endDate?: Date): Promise<VitalSignsStats> {
    const where: any = {};
    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) where.recordedAt.gte = startDate;
      if (endDate) where.recordedAt.lte = endDate;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const [allVitalSigns, todayVitalSigns] = await Promise.all([
      this.prisma.vitalSigns.findMany({
        where,
        select: {
          temperature: true,
          heartRate: true,
          systolicBP: true,
          diastolicBP: true,
          respiratoryRate: true,
          oxygenSaturation: true
        }
      }),
      this.prisma.vitalSigns.findMany({
        where: {
          recordedAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        select: {
          id: true,
          patientId: true
        }
      })
    ]);

    const totalMeasurements = allVitalSigns.length;
    const measurementsToday = todayVitalSigns.length;

    // Calculate averages
    const validTemperatures = allVitalSigns.filter(vs => vs.temperature !== null).map(vs => vs.temperature!);
    const validHeartRates = allVitalSigns.filter(vs => vs.heartRate !== null).map(vs => vs.heartRate!);
    const validSystolic = allVitalSigns.filter(vs => vs.systolicBP !== null).map(vs => vs.systolicBP!);
    const validDiastolic = allVitalSigns.filter(vs => vs.diastolicBP !== null).map(vs => vs.diastolicBP!);
    const validRespiratoryRates = allVitalSigns.filter(vs => vs.respiratoryRate !== null).map(vs => vs.respiratoryRate!);
    const validOxygenSaturations = allVitalSigns.filter(vs => vs.oxygenSaturation !== null).map(vs => vs.oxygenSaturation!);

    const averageValues = {
      temperature: validTemperatures.length > 0 ? validTemperatures.reduce((sum, val) => sum + val, 0) / validTemperatures.length : 0,
      heartRate: validHeartRates.length > 0 ? validHeartRates.reduce((sum, val) => sum + val, 0) / validHeartRates.length : 0,
      systolicBP: validSystolic.length > 0 ? validSystolic.reduce((sum, val) => sum + val, 0) / validSystolic.length : 0,
      diastolicBP: validDiastolic.length > 0 ? validDiastolic.reduce((sum, val) => sum + val, 0) / validDiastolic.length : 0,
      respiratoryRate: validRespiratoryRates.length > 0 ? validRespiratoryRates.reduce((sum, val) => sum + val, 0) / validRespiratoryRates.length : 0,
      oxygenSaturation: validOxygenSaturations.length > 0 ? validOxygenSaturations.reduce((sum, val) => sum + val, 0) / validOxygenSaturations.length : 0
    };

    return {
      totalMeasurements,
      measurementsToday,
      averageValues
    };
  }

  async getLatestVitalSigns(patientId: string, limit: number = 5): Promise<VitalSignsWithDetails[]> {
    const vitalSigns = await this.prisma.vitalSigns.findMany({
      where: { patientId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        }
      },
      orderBy: {
        recordedAt: 'desc'
      },
      take: limit
    });

    return vitalSigns as VitalSignsWithDetails[];
  }

  async getVitalSignsWithAlerts(limit: number = 20): Promise<VitalSignsWithDetails[]> {
    // Since alerts field doesn't exist in schema, we'll implement a basic version
    // that returns recent vital signs - actual alert logic would need to be implemented
    const vitalSigns = await this.prisma.vitalSigns.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true
          }
        }
      },
      orderBy: {
        recordedAt: 'desc'
      },
      take: limit
    });

    return vitalSigns as VitalSignsWithDetails[];
  }
}