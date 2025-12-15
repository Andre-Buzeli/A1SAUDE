import { PrismaClient, User, UserProfile, EstablishmentType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos'),
  phone: z.string().optional(),
  profile: z.enum(['gestor_geral', 'diretor_local', 'gestor_local', 'coordenador_geral', 'coordenador_local', 'supervisor', 'secretario', 'recepcionista', 'medico', 'enfermeiro', 'tecnico_enfermagem', 'farmaceutico', 'psicologo', 'fisioterapeuta', 'system_master']),
  establishmentType: z.enum(['ubs', 'upa', 'hospital']),
  establishmentId: z.string().min(1, 'Estabelecimento é obrigatório')
});

const updateUserSchema = createUserSchema.partial().omit({ establishmentId: true });

export interface UserFilters {
  profile?: UserProfile;
  establishmentType?: EstablishmentType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByProfile: Record<string, number>;
  usersByEstablishment: Record<string, number>;
  recentRegistrations: number;
}

export class AdminUserService {
  constructor(private prisma: PrismaClient) {}

  async getUsers(establishmentId: string, filters: UserFilters = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Apply establishment-based filtering based on user permissions
    // System master and gestor_geral see all, others see only their establishment
    const userProfile = await this.getUserProfileFromContext(establishmentId);
    if (userProfile && !['system_master', 'gestor_geral'].includes(userProfile)) {
      where.establishmentId = establishmentId;
    }

    // Apply filters
    if (filters.profile) where.profile = filters.profile;
    if (filters.establishmentType) where.establishmentType = filters.establishmentType;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { cpf: { contains: filters.search } }
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          cpf: true,
          phone: true,
          profile: true,
          establishmentType: true,
          establishmentName: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      users,
      total,
      page,
      limit,
      hasMore: total > page * limit
    };
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        profile: true,
        establishmentType: true,
        establishmentId: true,
        establishmentName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async createUser(data: any, adminEstablishmentId: string) {
    const validatedData = createUserSchema.parse(data);

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { cpf: validatedData.cpf }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Usuário já cadastrado com este email ou CPF');
    }

    // Get establishment details
    const establishment = await this.prisma.establishment.findUnique({
      where: { id: validatedData.establishmentId }
    });

    if (!establishment) {
      throw new Error('Estabelecimento não encontrado');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await this.prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        cpf: validatedData.cpf,
        phone: validatedData.phone,
        passwordHash: hashedPassword,
        profile: validatedData.profile as UserProfile,
        establishmentType: validatedData.establishmentType as EstablishmentType,
        establishmentId: validatedData.establishmentId,
        establishmentName: establishment.name,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        profile: true,
        establishmentType: true,
        establishmentName: true,
        isActive: true,
        createdAt: true
      }
    });

    // TODO: Send welcome email with temporary password

    return {
      ...user,
      tempPassword // Return temp password for admin to communicate
    };
  }

  async updateUser(id: string, data: any) {
    const validatedData = updateUserSchema.parse(data);

    // Check if email/cpf conflicts with other users
    if (validatedData.email || validatedData.cpf) {
      const conflictCheck = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: validatedData.email ? [{ email: validatedData.email }] : [],
              ...(validatedData.cpf ? [{ cpf: validatedData.cpf }] : [])
            }
          ]
        }
      });

      if (conflictCheck) {
        throw new Error('Email ou CPF já cadastrado para outro usuário');
      }
    }

    // If changing establishment, update establishment name
    let updateData: any = { ...validatedData };
    if (validatedData.establishmentId) {
      const establishment = await this.prisma.establishment.findUnique({
        where: { id: validatedData.establishmentId }
      });
      if (establishment) {
        updateData.establishmentName = establishment.name;
      }
    }

    return await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        profile: true,
        establishmentType: true,
        establishmentName: true,
        isActive: true,
        updatedAt: true
      }
    });
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    return await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        updatedAt: true
      }
    });
  }

  async resetUserPassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    return await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true
      }
    });
  }

  async getUserStats(establishmentId: string): Promise<UserStats> {
    const baseWhere: any = {};

    // Apply establishment filtering based on permissions
    const userProfile = await this.getUserProfileFromContext(establishmentId);
    if (userProfile && !['system_master', 'gestor_geral'].includes(userProfile)) {
      baseWhere.establishmentId = establishmentId;
    }

    const [
      totalUsers,
      activeUsers,
      usersByProfile,
      usersByEstablishment,
      recentRegistrations
    ] = await Promise.all([
      // Total de usuários
      this.prisma.user.count({ where: baseWhere }),

      // Usuários ativos
      this.prisma.user.count({ where: { ...baseWhere, isActive: true } }),

      // Usuários por perfil
      this.prisma.user.groupBy({
        by: ['profile'],
        where: baseWhere,
        _count: true
      }),

      // Usuários por estabelecimento
      this.prisma.user.groupBy({
        by: ['establishmentType'],
        where: baseWhere,
        _count: true
      }),

      // Registros recentes (últimos 30 dias)
      this.prisma.user.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    const profileStats = usersByProfile.reduce((acc, stat) => {
      acc[stat.profile] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    const establishmentStats = usersByEstablishment.reduce((acc, stat) => {
      acc[stat.establishmentType] = stat._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByProfile: profileStats,
      usersByEstablishment: establishmentStats,
      recentRegistrations
    };
  }

  async getAvailableProfiles() {
    // Return all available profiles with descriptions
    return [
      { value: 'system_master', label: 'Administrador do Sistema', description: 'Acesso total ao sistema' },
      { value: 'gestor_geral', label: 'Gestor Geral', description: 'Gestão completa de todos os estabelecimentos' },
      { value: 'diretor_local', label: 'Diretor Local', description: 'Gestão do estabelecimento específico' },
      { value: 'gestor_local', label: 'Gestor Local', description: 'Gestão operacional do estabelecimento' },
      { value: 'coordenador_geral', label: 'Coordenador Geral', description: 'Coordenação geral entre unidades' },
      { value: 'coordenador_local', label: 'Coordenador Local', description: 'Coordenação local da equipe' },
      { value: 'supervisor', label: 'Supervisor', description: 'Supervisão de equipe' },
      { value: 'secretario', label: 'Secretário', description: 'Secretaria e administração' },
      { value: 'recepcionista', label: 'Recepcionista', description: 'Recepção e agendamentos' },
      { value: 'medico', label: 'Médico', description: 'Profissional médico' },
      { value: 'enfermeiro', label: 'Enfermeiro', description: 'Profissional de enfermagem' },
      { value: 'tecnico_enfermagem', label: 'Técnico de Enfermagem', description: 'Técnico de enfermagem' },
      { value: 'farmaceutico', label: 'Farmacêutico', description: 'Profissional farmacêutico' },
      { value: 'psicologo', label: 'Psicólogo', description: 'Profissional de psicologia' },
      { value: 'fisioterapeuta', label: 'Fisioterapeuta', description: 'Profissional de fisioterapia' }
    ];
  }

  private async getUserProfileFromContext(establishmentId: string): Promise<string | null> {
    // This would be implemented to get the current user's profile from context
    // For now, return null (no filtering)
    return null;
  }
}
