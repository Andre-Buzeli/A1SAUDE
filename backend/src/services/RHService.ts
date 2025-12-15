/**
 * Serviço de Gestão de RH / Pessoas
 * Sistema A1 Saúde
 */

import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Schemas de validação
const createEmployeeSchema = z.object({
  registrationNumber: z.string().min(1, 'Matrícula é obrigatória'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  rg: z.string().optional(),
  birthDate: z.string().transform(str => new Date(str)),
  gender: z.enum(['male', 'female', 'other']),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  nationality: z.string().default('Brasileira'),
  
  // Endereço
  street: z.string().min(1, 'Logradouro é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipCode: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  
  // Contato
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  
  // Profissional
  position: z.string().min(1, 'Cargo é obrigatório'),
  department: z.string().min(1, 'Setor é obrigatório'),
  establishmentId: z.string().min(1, 'Estabelecimento é obrigatório'),
  admissionDate: z.string().transform(str => new Date(str)),
  
  // Contrato
  contractType: z.enum(['CLT', 'PJ', 'TEMP', 'INTERN', 'STATUTORY']),
  baseSalary: z.number().min(0, 'Salário deve ser positivo'),
  workHours: z.number().min(1).max(44),
  scaleType: z.enum(['12x36', '24x48', '5x2', '6x1', 'ADM']),
  
  // Dados Bancários
  bankName: z.string().optional(),
  bankAgency: z.string().optional(),
  bankAccount: z.string().optional(),
  pixKey: z.string().optional(),
  
  // Vínculo com usuário
  userId: z.string().optional()
});

const createTimeRecordSchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().transform(str => new Date(str)),
  clockIn1: z.string().optional(),
  clockOut1: z.string().optional(),
  clockIn2: z.string().optional(),
  clockOut2: z.string().optional(),
  justification: z.string().optional(),
  notes: z.string().optional()
});

const createVacationSchema = z.object({
  employeeId: z.string().min(1),
  referenceYear: z.number().min(2000),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  daysTotal: z.number().min(1).max(30),
  sellDays: z.number().min(0).max(10).default(0),
  notes: z.string().optional()
});

const createLeaveSchema = z.object({
  employeeId: z.string().min(1),
  leaveType: z.enum(['medical', 'maternity', 'paternity', 'bereavement', 'marriage', 'study', 'unpaid', 'other']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  expectedReturn: z.string().optional().transform(str => str ? new Date(str) : undefined),
  documentNumber: z.string().optional(),
  documentUrl: z.string().optional(),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  notes: z.string().optional()
});

const createScheduleSchema = z.object({
  name: z.string().min(1, 'Nome da escala é obrigatório'),
  establishmentId: z.string().min(1),
  department: z.string().optional(),
  scaleType: z.enum(['12x36', '24x48', '5x2', '6x1', 'custom']),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined)
});

export interface EmployeeFilters {
  query?: string;
  establishmentId?: string;
  department?: string;
  contractType?: string;
  position?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeStats {
  total: number;
  byCLT: number;
  byPJ: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
  averageSalary: number;
  totalPayroll: number;
}

export class RHService {
  constructor(private prisma: PrismaClient) {}

  // ==================== EMPLOYEES ====================

  async createEmployee(data: any) {
    const validatedData = createEmployeeSchema.parse(data);
    
    // Verificar se já existe funcionário com mesmo CPF ou matrícula
    const existing = await this.prisma.employee.findFirst({
      where: {
        OR: [
          { cpf: validatedData.cpf },
          { registrationNumber: validatedData.registrationNumber }
        ]
      }
    });

    if (existing) {
      throw new Error('Já existe funcionário com este CPF ou matrícula');
    }

    return await this.prisma.employee.create({
      data: {
        ...validatedData,
        isActive: true
      },
      include: {
        establishment: {
          select: { name: true, type: true }
        }
      }
    });
  }

  async getEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        establishment: {
          select: { id: true, name: true, type: true }
        },
        timeRecords: {
          orderBy: { date: 'desc' },
          take: 30
        },
        vacations: {
          orderBy: { startDate: 'desc' },
          take: 5
        },
        leaves: {
          orderBy: { startDate: 'desc' },
          take: 5
        }
      }
    });

    if (!employee) {
      throw new Error('Funcionário não encontrado');
    }

    return employee;
  }

  async searchEmployees(filters: EmployeeFilters) {
    const {
      query,
      establishmentId,
      department,
      contractType,
      position,
      isActive = true,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = filters;

    const where: any = { isActive };

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { cpf: { contains: query.replace(/\D/g, '') } },
        { registrationNumber: { contains: query } },
        { email: { contains: query } }
      ];
    }

    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    if (department) {
      where.department = department;
    }

    if (contractType) {
      where.contractType = contractType;
    }

    if (position) {
      where.position = { contains: position };
    }

    const total = await this.prisma.employee.count({ where });

    const employees = await this.prisma.employee.findMany({
      where,
      include: {
        establishment: {
          select: { id: true, name: true, type: true }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      employees,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateEmployee(id: string, data: any) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    
    if (!existing) {
      throw new Error('Funcionário não encontrado');
    }

    // Se está alterando CPF, verificar duplicidade
    if (data.cpf && data.cpf !== existing.cpf) {
      const duplicateCpf = await this.prisma.employee.findFirst({
        where: { cpf: data.cpf, id: { not: id } }
      });
      if (duplicateCpf) {
        throw new Error('CPF já cadastrado para outro funcionário');
      }
    }

    return await this.prisma.employee.update({
      where: { id },
      data,
      include: {
        establishment: {
          select: { name: true, type: true }
        }
      }
    });
  }

  async terminateEmployee(id: string, reason: string, terminationDate: Date) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    
    if (!employee) {
      throw new Error('Funcionário não encontrado');
    }

    return await this.prisma.employee.update({
      where: { id },
      data: {
        isActive: false,
        terminationDate,
        terminationReason: reason
      }
    });
  }

  async getEmployeeStats(establishmentId?: string): Promise<EmployeeStats> {
    const where: any = { isActive: true };
    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    const employees = await this.prisma.employee.findMany({
      where,
      select: {
        contractType: true,
        department: true,
        position: true,
        baseSalary: true
      }
    });

    const total = employees.length;
    const byCLT = employees.filter(e => e.contractType === 'CLT').length;
    const byPJ = employees.filter(e => e.contractType === 'PJ').length;
    
    const byDepartment: Record<string, number> = {};
    const byPosition: Record<string, number> = {};
    let totalSalary = 0;

    employees.forEach(e => {
      byDepartment[e.department] = (byDepartment[e.department] || 0) + 1;
      byPosition[e.position] = (byPosition[e.position] || 0) + 1;
      totalSalary += e.baseSalary;
    });

    return {
      total,
      byCLT,
      byPJ,
      byDepartment,
      byPosition,
      averageSalary: total > 0 ? totalSalary / total : 0,
      totalPayroll: totalSalary
    };
  }

  // ==================== TIME RECORDS ====================

  async clockIn(employeeId: string, timestamp?: Date) {
    const now = timestamp || new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Buscar ou criar registro do dia
    let record = await this.prisma.timeRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: dateOnly
        }
      }
    });

    if (!record) {
      // Primeiro registro do dia - entrada manhã
      record = await this.prisma.timeRecord.create({
        data: {
          employeeId,
          date: dateOnly,
          clockIn1: now
        }
      });
    } else if (!record.clockIn2 && record.clockOut1) {
      // Retorno do almoço
      record = await this.prisma.timeRecord.update({
        where: { id: record.id },
        data: { clockIn2: now }
      });
    } else {
      throw new Error('Entrada já registrada para este período');
    }

    return record;
  }

  async clockOut(employeeId: string, timestamp?: Date) {
    const now = timestamp || new Date();
    const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const record = await this.prisma.timeRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: dateOnly
        }
      }
    });

    if (!record) {
      throw new Error('Nenhuma entrada registrada hoje');
    }

    if (!record.clockOut1 && record.clockIn1) {
      // Saída para almoço
      return await this.prisma.timeRecord.update({
        where: { id: record.id },
        data: { clockOut1: now }
      });
    } else if (!record.clockOut2 && record.clockIn2) {
      // Saída final
      return await this.prisma.timeRecord.update({
        where: { id: record.id },
        data: { clockOut2: now }
      });
    } else {
      throw new Error('Saída já registrada para este período');
    }
  }

  async getTimeRecords(employeeId: string, startDate: Date, endDate: Date) {
    return await this.prisma.timeRecord.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: { name: true, registrationNumber: true }
        }
      }
    });
  }

  async approveTimeRecord(id: string, approverId: string) {
    return await this.prisma.timeRecord.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date()
      }
    });
  }

  async justifyTimeRecord(id: string, justification: string) {
    return await this.prisma.timeRecord.update({
      where: { id },
      data: {
        status: 'justified',
        justification
      }
    });
  }

  // ==================== VACATIONS ====================

  async requestVacation(data: any) {
    const validatedData = createVacationSchema.parse(data);

    // Verificar conflitos de período
    const conflicts = await this.prisma.vacation.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        status: { in: ['pending', 'approved', 'in_progress'] },
        OR: [
          {
            startDate: { lte: validatedData.endDate },
            endDate: { gte: validatedData.startDate }
          }
        ]
      }
    });

    if (conflicts) {
      throw new Error('Já existe férias agendadas para este período');
    }

    return await this.prisma.vacation.create({
      data: {
        ...validatedData,
        status: 'pending'
      },
      include: {
        employee: {
          select: { name: true, registrationNumber: true }
        }
      }
    });
  }

  async approveVacation(id: string, approverId: string) {
    return await this.prisma.vacation.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date()
      }
    });
  }

  async rejectVacation(id: string, reason: string) {
    return await this.prisma.vacation.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason
      }
    });
  }

  async getVacations(filters: { employeeId?: string; status?: string; year?: number }) {
    const where: any = {};
    
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.year) where.referenceYear = filters.year;

    return await this.prisma.vacation.findMany({
      where,
      include: {
        employee: {
          select: { name: true, registrationNumber: true, department: true }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  // ==================== LEAVES ====================

  async createLeave(data: any) {
    const validatedData = createLeaveSchema.parse(data);

    return await this.prisma.leave.create({
      data: {
        ...validatedData,
        status: 'active'
      },
      include: {
        employee: {
          select: { name: true, registrationNumber: true }
        }
      }
    });
  }

  async endLeave(id: string, actualReturn: Date) {
    return await this.prisma.leave.update({
      where: { id },
      data: {
        status: 'completed',
        actualReturn
      }
    });
  }

  async getLeaves(filters: { employeeId?: string; status?: string; leaveType?: string }) {
    const where: any = {};
    
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.leaveType) where.leaveType = filters.leaveType;

    return await this.prisma.leave.findMany({
      where,
      include: {
        employee: {
          select: { name: true, registrationNumber: true, department: true }
        }
      },
      orderBy: { startDate: 'desc' }
    });
  }

  // ==================== SCHEDULES ====================

  async createSchedule(data: any) {
    const validatedData = createScheduleSchema.parse(data);

    return await this.prisma.workSchedule.create({
      data: {
        ...validatedData,
        isActive: true
      }
    });
  }

  async assignToSchedule(scheduleId: string, employeeId: string, date: Date, shift: { start: string; end: string; type: string }) {
    return await this.prisma.scheduleAssignment.create({
      data: {
        scheduleId,
        employeeId,
        date,
        shiftStart: shift.start,
        shiftEnd: shift.end,
        shiftType: shift.type,
        status: 'scheduled'
      }
    });
  }

  async getScheduleAssignments(scheduleId: string, startDate: Date, endDate: Date) {
    return await this.prisma.scheduleAssignment.findMany({
      where: {
        scheduleId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        employee: {
          select: { name: true, registrationNumber: true }
        }
      },
      orderBy: [{ date: 'asc' }, { shiftStart: 'asc' }]
    });
  }

  async swapShifts(assignment1Id: string, assignment2Id: string) {
    const [a1, a2] = await Promise.all([
      this.prisma.scheduleAssignment.findUnique({ where: { id: assignment1Id } }),
      this.prisma.scheduleAssignment.findUnique({ where: { id: assignment2Id } })
    ]);

    if (!a1 || !a2) {
      throw new Error('Atribuições não encontradas');
    }

    // Trocar os funcionários
    await this.prisma.$transaction([
      this.prisma.scheduleAssignment.update({
        where: { id: assignment1Id },
        data: { employeeId: a2.employeeId, status: 'swapped', swappedWith: a2.employeeId }
      }),
      this.prisma.scheduleAssignment.update({
        where: { id: assignment2Id },
        data: { employeeId: a1.employeeId, status: 'swapped', swappedWith: a1.employeeId }
      })
    ]);

    return { success: true };
  }

  // ==================== DASHBOARD ====================

  async getDashboardData(establishmentId?: string) {
    const where: any = { isActive: true };
    if (establishmentId) {
      where.establishmentId = establishmentId;
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      stats,
      pendingVacations,
      activeLeaves,
      todayAbsent,
      recentHires
    ] = await Promise.all([
      this.getEmployeeStats(establishmentId),
      this.prisma.vacation.count({
        where: { status: 'pending', employee: where }
      }),
      this.prisma.leave.count({
        where: { status: 'active', employee: where }
      }),
      this.prisma.timeRecord.count({
        where: {
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          },
          clockIn1: null,
          employee: where
        }
      }),
      this.prisma.employee.findMany({
        where: {
          ...where,
          admissionDate: { gte: startOfMonth }
        },
        orderBy: { admissionDate: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          position: true,
          department: true,
          admissionDate: true
        }
      })
    ]);

    return {
      stats,
      alerts: {
        pendingVacations,
        activeLeaves,
        todayAbsent
      },
      recentHires
    };
  }
}

