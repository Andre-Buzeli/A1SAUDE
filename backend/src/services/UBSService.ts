import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createAttendanceSchema = z.object({
  patientId: z.string().min(1, 'ID do paciente é obrigatório'),
  professionalId: z.string().min(1, 'ID do profissional é obrigatório'),
  establishmentId: z.string().min(1, 'ID do estabelecimento é obrigatório'),
  type: z.enum(['consultation', 'emergency', 'procedure', 'surgery', 'exam', 'vaccination']),
  chiefComplaint: z.string().min(1, 'Queixa principal é obrigatória'),
  notes: z.string().optional()
});

const createProcedureSchema = z.object({
  attendanceId: z.string().min(1, 'ID do atendimento é obrigatório'),
  name: z.string().min(1, 'Nome do procedimento é obrigatório'),
  description: z.string().optional()
});

export interface UBStats {
  totalAttendances: number;
  completedToday: number;
  scheduledToday: number;
  cancelledToday: number;
  avgWaitTime: number;
  vaccinationCoverage: number;
  mostRequestedServices: Array<{ service: string; count: number }>;
}

export class UBSService {
  constructor(private prisma: PrismaClient) {}

  // Criar atendimento UBS
  async createAttendance(data: any, professionalId: string) {
    const validatedData = createAttendanceSchema.parse(data);

    const attendance = await this.prisma.attendance.create({
      data: {
        patientId: validatedData.patientId,
        professionalId: validatedData.professionalId,
        establishmentId: validatedData.establishmentId,
        type: validatedData.type,
        status: 'scheduled',
        chiefComplaint: validatedData.chiefComplaint,
        notes: validatedData.notes,
        startTime: new Date()
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
        },
        professional: {
          select: {
            id: true,
            name: true,
            profile: true
          }
        }
      }
    });

    return attendance;
  }

  // Listar atendimentos UBS
  async getAttendances(establishmentId: string, filters?: any) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { establishmentId };

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.professionalId) where.professionalId = filters.professionalId;
    if (filters?.date) {
      const date = new Date(filters.date);
      where.startTime = {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      };
    }

    const [attendances, total] = await Promise.all([
      this.prisma.attendance.findMany({
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
          },
          professional: {
            select: {
              id: true,
              name: true,
              profile: true
            }
          }
        },
        orderBy: { startTime: 'asc' },
        skip,
        take: limit
      }),
      this.prisma.attendance.count({ where })
    ]);

    return {
      attendances,
      total,
      page,
      limit,
      hasMore: total > page * limit
    };
  }

  // Atualizar status do atendimento
  async updateAttendanceStatus(id: string, status: string, notes?: string) {
    const updateData: any = { status };
    if (notes) updateData.notes = notes;
    if (status === 'completed') updateData.endTime = new Date();

    return await this.prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true
          }
        }
      }
    });
  }

  // Registrar vacinação
  async recordVaccination(data: any) {
    const validatedData = createProcedureSchema.parse(data);

    const vaccination = await this.prisma.procedure.create({
      data: {
        attendanceId: validatedData.attendanceId,
        name: validatedData.name,
        description: validatedData.description || 'Vacinação realizada',
        performedBy: data.performedBy
      },
      include: {
        attendance: {
          select: {
            id: true,
            patientId: true,
            startTime: true
          }
        }
      }
    });

    return vaccination;
  }

  // Listar vacinações
  async getVaccinations(establishmentId: string, filters?: any) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      attendance: {
        establishmentId
      },
      name: {
        contains: 'vacina',
        mode: 'insensitive'
      }
    };

    if (filters?.date) {
      const date = new Date(filters.date);
      where.performedAt = {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      };
    }

    const [vaccinations, total] = await Promise.all([
      this.prisma.procedure.findMany({
        where,
        include: {
          attendance: {
            select: {
              id: true,
              patient: {
                select: {
                  id: true,
                  name: true,
                  cpf: true
                }
              }
            }
          }
        },
        orderBy: { performedAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.procedure.count({ where })
    ]);

    return {
      vaccinations,
      total,
      page,
      limit,
      hasMore: total > page * limit
    };
  }

  // Estatísticas UBS
  async getUBStats(establishmentId: string): Promise<UBStats> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [
      totalAttendances,
      completedToday,
      scheduledToday,
      cancelledToday,
      vaccinationCount
    ] = await Promise.all([
      this.prisma.attendance.count({ where: { establishmentId } }),
      this.prisma.attendance.count({
        where: {
          establishmentId,
          status: 'completed',
          startTime: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),
      this.prisma.attendance.count({
        where: {
          establishmentId,
          status: 'scheduled',
          startTime: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),
      this.prisma.attendance.count({
        where: {
          establishmentId,
          status: 'cancelled',
          startTime: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),
      this.prisma.procedure.count({
        where: {
          attendance: {
            establishmentId
          },
          name: {
            contains: 'vacina',
            mode: 'insensitive'
          }
        }
      })
    ]);

    // Calcular tempo médio de espera (simplificado)
    const avgWaitTime = 30; // minutos - valor padrão

    // Serviços mais solicitados
    const serviceTypes = await this.prisma.attendance.groupBy({
      by: ['type'],
      where: { establishmentId },
      _count: {
        type: true
      },
      orderBy: {
        _count: {
          type: 'desc'
        }
      },
      take: 5
    });

    const mostRequestedServices = serviceTypes.map(item => ({
      service: item.type,
      count: item._count.type
    }));

    return {
      totalAttendances,
      completedToday,
      scheduledToday,
      cancelledToday,
      avgWaitTime,
      vaccinationCoverage: vaccinationCount,
      mostRequestedServices
    };
  }

  // Campanhas de vacinação
  async getVaccinationCampaigns(establishmentId: string) {
    // Implementação simplificada - em produção, teria uma tabela de campanhas
    const campaigns = [
      {
        id: '1',
        name: 'Campanha de Vacinação contra Gripe',
        description: 'Vacinação anual contra influenza',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-05-31'),
        targetAudience: 'Idosos, crianças, gestantes',
        status: 'active'
      },
      {
        id: '2',
        name: 'Campanha de Vacinação contra Sarampo',
        description: 'Vacinação contra sarampo para crianças',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-06-30'),
        targetAudience: 'Crianças de 6 meses a 5 anos',
        status: 'active'
      }
    ];

    return campaigns;
  }

  // Métodos adicionais necessários para os controllers
  async cancelAppointment(appointmentId: string, reason: string) {
    // Mock implementation since models don't exist
    return {
      id: appointmentId,
      status: 'canceled',
      reason: reason,
      canceledAt: new Date()
    };
  }

  async recordVaccination(vaccinationData: any) {
    // Mock implementation since models don't exist
    return {
      id: 'vaccination-1',
      patientId: vaccinationData.patientId,
      vaccineName: vaccinationData.vaccineName,
      administeredAt: new Date(),
      professionalId: vaccinationData.professionalId
    };
  }

  async getVaccinationHistory(patientId: string) {
    // Mock implementation since models don't exist
    return [
      {
        id: 'vaccination-1',
        vaccineName: 'Influenza',
        administeredAt: new Date('2024-01-15'),
        professionalName: 'Dr. João Santos'
      },
      {
        id: 'vaccination-2',
        vaccineName: 'Sarampo',
        administeredAt: new Date('2024-02-20'),
        professionalName: 'Dra. Ana Costa'
      }
    ];
  }

  async getVaccinationCard(patientId: string) {
    // Mock implementation since models don't exist
    return {
      patientId: patientId,
      vaccines: [
        {
          name: 'Influenza',
          date: new Date('2024-01-15'),
          lot: 'LOT123',
          manufacturer: 'Butantan'
        },
        {
          name: 'Sarampo',
          date: new Date('2024-02-20'),
          lot: 'LOT456',
          manufacturer: 'Bio-Manguinhos'
        }
      ]
    };
  }

  async getUpcomingVaccinations(establishmentId: string, days: number = 30) {
    // Mock implementation since models don't exist
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + days);
    
    return [
      {
        id: 'upcoming-1',
        patientName: 'Maria Silva',
        vaccineName: 'Hepatite B',
        scheduledDate: upcomingDate,
        status: 'scheduled'
      }
    ];
  }
}