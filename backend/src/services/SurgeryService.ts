/**
 * Serviço de Centro Cirúrgico
 * Sistema A1 Saúde - Hospital
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Schemas de validação
const createSurgerySchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  establishmentId: z.string().min(1, 'Estabelecimento é obrigatório'),
  admissionId: z.string().optional(),
  
  // Procedimento
  procedureCode: z.string().min(1, 'Código do procedimento é obrigatório'),
  procedureName: z.string().min(1, 'Nome do procedimento é obrigatório'),
  procedureType: z.enum(['elective', 'urgency', 'emergency']),
  laterality: z.enum(['left', 'right', 'bilateral', 'na']).optional(),
  
  // Agendamento
  scheduledDate: z.string().transform(str => new Date(str)),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  estimatedDuration: z.number().min(15, 'Duração mínima de 15 minutos'),
  roomNumber: z.string().min(1, 'Sala é obrigatória'),
  
  // Equipe
  surgeonId: z.string().min(1, 'Cirurgião principal é obrigatório'),
  assistantIds: z.array(z.string()).optional(),
  anesthetistId: z.string().optional(),
  instrumenterId: z.string().optional(),
  nursingTeam: z.array(z.string()).optional(),
  
  // Anestesia
  anesthesiaType: z.enum(['general', 'regional', 'local', 'sedation', 'combined']).optional(),
  asaScore: z.string().optional(),
  
  // Pré-operatório
  preOpNotes: z.string().optional(),
  preOpExams: z.array(z.string()).optional()
});

const completeSurgerySchema = z.object({
  actualEndTime: z.string().transform(str => new Date(str)),
  complications: z.string().optional(),
  bloodLoss: z.number().optional(),
  surgicalNotes: z.string().optional(),
  recoveryNotes: z.string().optional(),
  materialsUsed: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    lot: z.string().optional()
  })).optional()
});

export interface SurgeryFilters {
  patientId?: string;
  surgeonId?: string;
  establishmentId?: string;
  status?: string;
  procedureType?: string;
  roomNumber?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface SurgeryStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  byRoom: Record<string, number>;
  averageDuration: number;
}

export interface RoomStatus {
  roomNumber: string;
  status: 'available' | 'in_use' | 'preparing' | 'cleaning' | 'maintenance';
  currentSurgery?: {
    id: string;
    procedureName: string;
    patientName: string;
    surgeonName: string;
    startTime: Date;
    estimatedEnd: Date;
  };
  nextSurgery?: {
    id: string;
    procedureName: string;
    scheduledTime: string;
  };
}

export class SurgeryService {
  constructor(private prisma: PrismaClient) {}

  // ==================== CRUD ====================

  async createSurgery(data: any) {
    const validatedData = createSurgerySchema.parse(data);

    // Verificar se paciente existe
    const patient = await this.prisma.patient.findUnique({
      where: { id: validatedData.patientId }
    });

    if (!patient) {
      throw new Error('Paciente não encontrado');
    }

    // Verificar conflito de sala
    const conflictingSurgery = await this.checkRoomConflict(
      validatedData.roomNumber,
      validatedData.scheduledDate,
      validatedData.scheduledTime,
      validatedData.estimatedDuration
    );

    if (conflictingSurgery) {
      throw new Error('Sala já está ocupada neste horário');
    }

    // Verificar conflito de cirurgião
    const surgeonConflict = await this.checkSurgeonConflict(
      validatedData.surgeonId,
      validatedData.scheduledDate,
      validatedData.scheduledTime,
      validatedData.estimatedDuration
    );

    if (surgeonConflict) {
      throw new Error('Cirurgião já está agendado para outro procedimento neste horário');
    }

    return await this.prisma.surgery.create({
      data: {
        ...validatedData,
        assistantIds: validatedData.assistantIds ? JSON.stringify(validatedData.assistantIds) : undefined,
        nursingTeam: validatedData.nursingTeam ? JSON.stringify(validatedData.nursingTeam) : undefined,
        preOpExams: validatedData.preOpExams ? JSON.stringify(validatedData.preOpExams) : undefined,
        status: 'scheduled'
      },
      include: {
        patient: {
          select: { id: true, name: true, cpf: true }
        },
        establishment: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async getSurgeryById(id: string) {
    const surgery = await this.prisma.surgery.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
            gender: true,
            bloodType: true,
            allergies: true
          }
        },
        establishment: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    if (!surgery) {
      throw new Error('Cirurgia não encontrada');
    }

    return surgery;
  }

  async searchSurgeries(filters: SurgeryFilters) {
    const {
      patientId,
      surgeonId,
      establishmentId,
      status,
      procedureType,
      roomNumber,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const where: any = {};

    if (patientId) where.patientId = patientId;
    if (surgeonId) where.surgeonId = surgeonId;
    if (establishmentId) where.establishmentId = establishmentId;
    if (status) where.status = status;
    if (procedureType) where.procedureType = procedureType;
    if (roomNumber) where.roomNumber = roomNumber;

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = startDate;
      if (endDate) where.scheduledDate.lte = endDate;
    }

    const total = await this.prisma.surgery.count({ where });

    const surgeries = await this.prisma.surgery.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true }
        },
        establishment: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      surgeries,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateSurgery(id: string, data: any) {
    const existing = await this.prisma.surgery.findUnique({ where: { id } });
    
    if (!existing) {
      throw new Error('Cirurgia não encontrada');
    }

    if (['in_progress', 'completed'].includes(existing.status)) {
      throw new Error('Não é possível alterar uma cirurgia em andamento ou finalizada');
    }

    return await this.prisma.surgery.update({
      where: { id },
      data,
      include: {
        patient: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async cancelSurgery(id: string, reason?: string) {
    const surgery = await this.prisma.surgery.findUnique({ where: { id } });
    
    if (!surgery) {
      throw new Error('Cirurgia não encontrada');
    }

    if (['in_progress', 'completed'].includes(surgery.status)) {
      throw new Error('Não é possível cancelar uma cirurgia em andamento ou finalizada');
    }

    return await this.prisma.surgery.update({
      where: { id },
      data: {
        status: 'cancelled',
        preOpNotes: reason 
          ? `${surgery.preOpNotes || ''}\nCANCELADO: ${reason}`.trim()
          : surgery.preOpNotes
      }
    });
  }

  // ==================== WORKFLOW ====================

  async confirmPreOp(id: string, consentSigned: boolean, fastingConfirmed: boolean) {
    const surgery = await this.prisma.surgery.findUnique({ where: { id } });
    
    if (!surgery) {
      throw new Error('Cirurgia não encontrada');
    }

    return await this.prisma.surgery.update({
      where: { id },
      data: {
        status: 'pre_op',
        consentSigned,
        fastingConfirmed
      }
    });
  }

  async startSurgery(id: string) {
    const surgery = await this.prisma.surgery.findUnique({ where: { id } });
    
    if (!surgery) {
      throw new Error('Cirurgia não encontrada');
    }

    if (!['scheduled', 'pre_op'].includes(surgery.status)) {
      throw new Error('Cirurgia não pode ser iniciada neste status');
    }

    return await this.prisma.surgery.update({
      where: { id },
      data: {
        status: 'in_progress',
        actualStartTime: new Date()
      }
    });
  }

  async completeSurgery(id: string, data: any) {
    const surgery = await this.prisma.surgery.findUnique({ where: { id } });
    
    if (!surgery) {
      throw new Error('Cirurgia não encontrada');
    }

    if (surgery.status !== 'in_progress') {
      throw new Error('Cirurgia não está em andamento');
    }

    const validatedData = completeSurgerySchema.parse(data);

    return await this.prisma.surgery.update({
      where: { id },
      data: {
        ...validatedData,
        status: 'completed',
        materialsUsed: validatedData.materialsUsed 
          ? JSON.stringify(validatedData.materialsUsed)
          : undefined
      },
      include: {
        patient: {
          select: { id: true, name: true }
        }
      }
    });
  }

  async moveToRecovery(id: string, recoveryNotes?: string) {
    const surgery = await this.prisma.surgery.findUnique({ where: { id } });
    
    if (!surgery) {
      throw new Error('Cirurgia não encontrada');
    }

    return await this.prisma.surgery.update({
      where: { id },
      data: {
        status: 'recovery',
        recoveryNotes
      }
    });
  }

  // ==================== CONFLITOS ====================

  private async checkRoomConflict(
    roomNumber: string,
    date: Date,
    time: string,
    duration: number,
    excludeId?: string
  ): Promise<boolean> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const surgeries = await this.prisma.surgery.findMany({
      where: {
        roomNumber,
        scheduledDate: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: { notIn: ['cancelled'] },
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });

    // Verificar sobreposição de horários
    const [newHours, newMinutes] = time.split(':').map(Number);
    const newStart = newHours * 60 + newMinutes;
    const newEnd = newStart + duration;

    for (const surgery of surgeries) {
      const [existingHours, existingMinutes] = surgery.scheduledTime.split(':').map(Number);
      const existingStart = existingHours * 60 + existingMinutes;
      const existingEnd = existingStart + surgery.estimatedDuration;

      // Verifica sobreposição
      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }

    return false;
  }

  private async checkSurgeonConflict(
    surgeonId: string,
    date: Date,
    time: string,
    duration: number,
    excludeId?: string
  ): Promise<boolean> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const surgeries = await this.prisma.surgery.findMany({
      where: {
        surgeonId,
        scheduledDate: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: { notIn: ['cancelled', 'completed'] },
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });

    const [newHours, newMinutes] = time.split(':').map(Number);
    const newStart = newHours * 60 + newMinutes;
    const newEnd = newStart + duration;

    for (const surgery of surgeries) {
      const [existingHours, existingMinutes] = surgery.scheduledTime.split(':').map(Number);
      const existingStart = existingHours * 60 + existingMinutes;
      const existingEnd = existingStart + surgery.estimatedDuration;

      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }

    return false;
  }

  // ==================== SALAS ====================

  async getRoomsStatus(establishmentId: string): Promise<RoomStatus[]> {
    // Obter lista de salas (por enquanto, mock)
    const rooms = ['Sala 1', 'Sala 2', 'Sala 3', 'Sala 4'];
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const statuses: RoomStatus[] = [];

    for (const roomNumber of rooms) {
      const currentSurgery = await this.prisma.surgery.findFirst({
        where: {
          establishmentId,
          roomNumber,
          status: 'in_progress'
        },
        include: {
          patient: {
            select: { name: true }
          }
        }
      });

      const nextSurgery = await this.prisma.surgery.findFirst({
        where: {
          establishmentId,
          roomNumber,
          scheduledDate: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: 'scheduled'
        },
        orderBy: { scheduledTime: 'asc' }
      });

      let status: RoomStatus['status'] = 'available';
      
      if (currentSurgery) {
        status = 'in_use';
      }

      statuses.push({
        roomNumber,
        status,
        currentSurgery: currentSurgery ? {
          id: currentSurgery.id,
          procedureName: currentSurgery.procedureName,
          patientName: currentSurgery.patient.name,
          surgeonName: '', // Seria obtido do User
          startTime: currentSurgery.actualStartTime || currentSurgery.scheduledDate,
          estimatedEnd: new Date(
            (currentSurgery.actualStartTime || currentSurgery.scheduledDate).getTime() + 
            currentSurgery.estimatedDuration * 60000
          )
        } : undefined,
        nextSurgery: nextSurgery ? {
          id: nextSurgery.id,
          procedureName: nextSurgery.procedureName,
          scheduledTime: nextSurgery.scheduledTime
        } : undefined
      });
    }

    return statuses;
  }

  // ==================== ESTATÍSTICAS ====================

  async getStats(establishmentId?: string, startDate?: Date, endDate?: Date): Promise<SurgeryStats> {
    const where: any = {};
    
    if (establishmentId) where.establishmentId = establishmentId;
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = startDate;
      if (endDate) where.scheduledDate.lte = endDate;
    }

    const surgeries = await this.prisma.surgery.findMany({
      where,
      select: {
        status: true,
        procedureType: true,
        roomNumber: true,
        estimatedDuration: true,
        actualStartTime: true,
        actualEndTime: true
      }
    });

    const total = surgeries.length;
    const scheduled = surgeries.filter(s => s.status === 'scheduled').length;
    const inProgress = surgeries.filter(s => s.status === 'in_progress').length;
    const completed = surgeries.filter(s => s.status === 'completed').length;
    const cancelled = surgeries.filter(s => s.status === 'cancelled').length;

    const byType: Record<string, number> = {};
    const byRoom: Record<string, number> = {};
    let totalDuration = 0;
    let durationCount = 0;

    surgeries.forEach(s => {
      byType[s.procedureType] = (byType[s.procedureType] || 0) + 1;
      byRoom[s.roomNumber] = (byRoom[s.roomNumber] || 0) + 1;
      
      if (s.actualStartTime && s.actualEndTime) {
        totalDuration += (s.actualEndTime.getTime() - s.actualStartTime.getTime()) / 60000;
        durationCount++;
      }
    });

    return {
      total,
      scheduled,
      inProgress,
      completed,
      cancelled,
      byType,
      byRoom,
      averageDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0
    };
  }

  async getTodaySurgeries(establishmentId?: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const where: any = {
      scheduledDate: {
        gte: startOfDay,
        lt: endOfDay
      }
    };

    if (establishmentId) where.establishmentId = establishmentId;

    return await this.prisma.surgery.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true }
        }
      },
      orderBy: { scheduledTime: 'asc' }
    });
  }

  // ==================== DASHBOARD ====================

  async getDashboardData(establishmentId: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [stats, todaySurgeries, roomsStatus, inProgress] = await Promise.all([
      this.getStats(establishmentId, startOfMonth, endOfMonth),
      this.getTodaySurgeries(establishmentId),
      this.getRoomsStatus(establishmentId),
      this.prisma.surgery.count({
        where: {
          establishmentId,
          status: 'in_progress'
        }
      })
    ]);

    const availableRooms = roomsStatus.filter(r => r.status === 'available').length;

    return {
      stats,
      todaySurgeries,
      roomsStatus,
      inProgress,
      availableRooms,
      totalRooms: roomsStatus.length
    };
  }
}

