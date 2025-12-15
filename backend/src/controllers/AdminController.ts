import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AdminDashboardService } from '../services/AdminDashboardService';
import { hasPermission } from '../config/permissions';
import { AuthenticatedRequest } from '../types/auth';

export class AdminController {
  private adminDashboardService: AdminDashboardService;

  constructor(private prisma: PrismaClient) {
    this.adminDashboardService = new AdminDashboardService(prisma);
  }

  // GET /api/admin/dashboard - Dashboard executivo para gestores
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;

      // Verificar se o usuário tem permissão para acessar o dashboard administrativo
      const requiredPermissions = [
        'gestor_geral:read',
        'diretor_local:read',
        'gestor_local:read',
        'admin:full_access'
      ];

      const hasAccess = requiredPermissions.some(permission => 
        hasPermission(user.permissions, permission as any)
      );

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para acessar o dashboard administrativo'
        });
      }

      // Obter métricas do dashboard baseado no perfil do usuário
      const metrics = await this.adminDashboardService.getExecutiveDashboard(
        user.profile,
        user.establishmentId
      );

      res.json({
        success: true,
        data: metrics,
        user: {
          profile: user.profile,
          establishmentType: user.establishmentType,
          establishmentName: user.establishmentName
        }
      });

    } catch (error: any) {
      console.error('Erro ao obter dashboard administrativo:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao carregar dashboard administrativo'
      });
    }
  }

  // GET /api/admin/establishments - Listar estabelecimentos (para gestores)
  async getEstablishments(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:estrutura_administrativa') ||
                       hasPermission(user.permissions, 'diretor_local:read') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para listar estabelecimentos'
        });
      }

      // Filtrar estabelecimentos baseado no perfil
      const isGestorGeral = user.profile === 'gestor_geral' || user.profile === 'system_master';
      const whereClause = isGestorGeral ? 
        { isActive: true } : 
        { id: user.establishmentId, isActive: true };

      const establishments = await this.prisma.establishment.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          cnesCode: true,
          type: true,
          city: true,
          state: true,
          phone: true,
          email: true,
          isActive: true,
          _count: {
            select: {
              users: { where: { isActive: true } },
              beds: true,
              attendances: {
                where: {
                  startTime: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                  }
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      res.json({
        success: true,
        data: establishments
      });

    } catch (error: any) {
      console.error('Erro ao listar estabelecimentos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao listar estabelecimentos'
      });
    }
  }

  // GET /api/admin/users - Listar usuários (para gestores)
  async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { page = 1, limit = 20, profile, establishmentId, search } = req.query;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:recursos_humanos') ||
                       hasPermission(user.permissions, 'diretor_local:read') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para listar usuários'
        });
      }

      // Construir filtros
      const isGestorGeral = user.profile === 'gestor_geral' || user.profile === 'system_master';
      let whereClause: any = { isActive: true };

      // Filtro por estabelecimento
      if (!isGestorGeral) {
        whereClause.establishmentId = user.establishmentId;
      } else if (establishmentId) {
        whereClause.establishmentId = establishmentId as string;
      }

      // Filtro por perfil
      if (profile) {
        whereClause.profile = profile;
      }

      // Filtro por busca
      if (search) {
        whereClause.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { cpf: { contains: search as string } }
        ];
      }

      // Paginação
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: whereClause,
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
            createdAt: true
          },
          orderBy: { name: 'asc' },
          skip,
          take
        }),
        this.prisma.user.count({ where: whereClause })
      ]);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao listar usuários'
      });
    }
  }

  // POST /api/admin/users - Criar usuário (para gestores)
  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const {
        name,
        email,
        cpf,
        phone,
        password,
        profile,
        establishmentId,
        establishmentType
      } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:recursos_humanos') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para criar usuários'
        });
      }

      // Validações básicas
      if (!name || !email || !cpf || !password || !profile || !establishmentId) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Todos os campos obrigatórios devem ser preenchidos'
        });
      }

      // Verificar se o estabelecimento existe
      const establishment = await this.prisma.establishment.findUnique({
        where: { id: establishmentId }
      });

      if (!establishment) {
        return res.status(400).json({
          error: 'Estabelecimento inválido',
          message: 'Estabelecimento não encontrado'
        });
      }

      // Hash da senha
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 12);

      // Criar usuário
      const newUser = await this.prisma.user.create({
        data: {
          name,
          email,
          cpf: cpf.replace(/\D/g, ''), // Remove caracteres não numéricos
          phone,
          passwordHash,
          profile,
          establishmentType: establishmentType || establishment.type,
          establishmentId,
          establishmentName: establishment.name
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

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'create_user',
          resource: 'user',
          details: {
            createdUserId: newUser.id,
            createdUserProfile: newUser.profile,
            establishmentId
          }
        }
      });

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Usuário criado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Dados duplicados',
          message: 'Email ou CPF já cadastrado no sistema'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar usuário'
      });
    }
  }

  // PUT /api/admin/users/:id - Atualizar usuário (para gestores)
  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { id } = req.params;
      const body = req.body as any;
      const { name, email, phone, profile, isActive } = body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:recursos_humanos') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para atualizar usuários'
        });
      }

      // Verificar se o usuário existe
      const existingUser = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          message: 'Usuário não existe no sistema'
        });
      }

      // Diretor local só pode editar usuários do seu estabelecimento
      if (user.profile === 'diretor_local' && existingUser.establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você só pode editar usuários do seu estabelecimento'
        });
      }

      // Atualizar usuário
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
          ...(profile && { profile }),
          ...(isActive !== undefined && { isActive })
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
          updatedAt: true
        }
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'update_user',
          resource: 'user',
          details: {
            updatedUserId: id,
            changes: { name, email, phone, profile, isActive }
          }
        }
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Usuário atualizado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao atualizar usuário'
      });
    }
  }

  // GET /api/admin/professionals - Listar profissionais (para gestores)
  async getProfessionals(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { page = 1, limit = 20, profile, search, specialty } = req.query;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:recursos_humanos') ||
                       hasPermission(user.permissions, 'diretor_local:read') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para listar profissionais'
        });
      }

      // Construir filtros
      const isGestorGeral = user.profile === 'gestor_geral' || user.profile === 'system_master';
      let whereClause: any = { 
        isActive: true,
        profile: {
          in: ['medico', 'enfermeiro', 'tecnico_enfermagem', 'farmaceutico', 'psicologo', 'fisioterapeuta']
        }
      };

      // Filtro por estabelecimento
      if (!isGestorGeral) {
        whereClause.establishmentId = user.establishmentId;
      }

      // Filtro por perfil específico
      if (profile) {
        whereClause.profile = profile;
      }

      // Filtro por busca
      if (search) {
        whereClause.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { cpf: { contains: search as string } }
        ];
      }

      // Paginação
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [professionals, total] = await Promise.all([
        this.prisma.user.findMany({
          where: whereClause,
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
            createdAt: true
          },
          orderBy: { name: 'asc' },
          skip,
          take
        }),
        this.prisma.user.count({ where: whereClause })
      ]);

      res.json({
        success: true,
        data: professionals,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error: any) {
      console.error('Erro ao listar profissionais:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao listar profissionais'
      });
    }
  }

  // POST /api/admin/professionals - Criar profissional (para gestores)
  async createProfessional(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const {
        name,
        email,
        cpf,
        phone,
        password,
        profile,
        establishmentId,
        establishmentType,
        professionalRegistry,
        specialty
      } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:recursos_humanos') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para criar profissionais'
        });
      }

      // Validações básicas
      if (!name || !email || !cpf || !password || !profile || !establishmentId) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Todos os campos obrigatórios devem ser preenchidos'
        });
      }

      // Validar se é um perfil profissional
      const professionalProfiles = ['medico', 'enfermeiro', 'tecnico_enfermagem', 'farmaceutico', 'psicologo', 'fisioterapeuta'];
      if (!professionalProfiles.includes(profile)) {
        return res.status(400).json({
          error: 'Perfil inválido',
          message: 'Perfil deve ser um perfil profissional válido'
        });
      }

      // Diretor local só pode criar profissionais no seu estabelecimento
      if (user.profile === 'diretor_local' && establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Diretor local só pode criar profissionais no seu estabelecimento'
        });
      }

      // Verificar se o estabelecimento existe
      const establishment = await this.prisma.establishment.findUnique({
        where: { id: establishmentId }
      });

      if (!establishment) {
        return res.status(400).json({
          error: 'Estabelecimento inválido',
          message: 'Estabelecimento não encontrado'
        });
      }

      // Hash da senha
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 12);

      // Criar profissional
      const newProfessional = await this.prisma.user.create({
        data: {
          name,
          email,
          cpf: cpf.replace(/\D/g, ''),
          phone,
          passwordHash,
          profile,
          establishmentType: establishmentType || establishment.type,
          establishmentId,
          establishmentName: establishment.name
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

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'create_professional',
          resource: 'user',
          details: {
            createdUserId: newProfessional.id,
            createdUserProfile: newProfessional.profile,
            establishmentId,
            professionalRegistry,
            specialty
          }
        }
      });

      res.status(201).json({
        success: true,
        data: newProfessional,
        message: 'Profissional criado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao criar profissional:', error);
      
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Dados duplicados',
          message: 'Email ou CPF já cadastrado no sistema'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar profissional'
      });
    }
  }

  // PUT /api/admin/professionals/:id - Atualizar profissional (para gestores)
  async updateProfessional(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { id } = req.params;
      const { name, email, phone, specialty, professionalRegistry, isActive } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:recursos_humanos') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para atualizar profissionais'
        });
      }

      // Verificar se o profissional existe
      const existingProfessional = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!existingProfessional) {
        return res.status(404).json({
          error: 'Profissional não encontrado',
          message: 'Profissional não existe no sistema'
        });
      }

      // Diretor local só pode editar profissionais do seu estabelecimento
      if (user.profile === 'diretor_local' && existingProfessional.establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você só pode editar profissionais do seu estabelecimento'
        });
      }

      // Atualizar profissional
      const updatedProfessional = await this.prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
          ...(isActive !== undefined && { isActive })
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
          updatedAt: true
        }
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'update_professional',
          resource: 'user',
          details: {
            updatedUserId: id,
            changes: { name, email, phone, specialty, professionalRegistry, isActive }
          }
        }
      });

      res.json({
        success: true,
        data: updatedProfessional,
        message: 'Profissional atualizado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao atualizar profissional:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao atualizar profissional'
      });
    }
  }

  // DELETE /api/admin/professionals/:id - Desativar profissional (para gestores)
  async deleteProfessional(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { id } = req.params;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:recursos_humanos') ||
                       hasPermission(user.permissions, 'diretor_local:delete') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para desativar profissionais'
        });
      }

      // Verificar se o profissional existe
      const existingProfessional = await this.prisma.user.findUnique({
        where: { id }
      });

      if (!existingProfessional) {
        return res.status(404).json({
          error: 'Profissional não encontrado',
          message: 'Profissional não existe no sistema'
        });
      }

      // Diretor local só pode desativar profissionais do seu estabelecimento
      if (user.profile === 'diretor_local' && existingProfessional.establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você só pode desativar profissionais do seu estabelecimento'
        });
      }

      // Desativar profissional (soft delete)
      const deactivatedProfessional = await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
          establishmentName: true,
          isActive: true,
          updatedAt: true
        }
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'deactivate_professional',
          resource: 'user',
          details: {
            deactivatedUserId: id,
            professionalName: deactivatedProfessional.name,
            professionalProfile: deactivatedProfessional.profile
          }
        }
      });

      res.json({
        success: true,
        data: deactivatedProfessional,
        message: 'Profissional desativado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao desativar profissional:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao desativar profissional'
      });
    }
  }

  // GET /api/admin/financial - Obter dados financeiros (para gestores)
  async getFinancialData(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { year, month, category } = req.query;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:financeiro') ||
                       hasPermission(user.permissions, 'diretor_local:read') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para acessar dados financeiros'
        });
      }

      // Construir filtros
      const isGestorGeral = user.profile === 'gestor_geral' || user.profile === 'system_master';
      let whereClause: any = { isActive: true };

      // Filtro por estabelecimento
      if (!isGestorGeral) {
        whereClause.establishmentId = user.establishmentId;
      }

      // Filtros adicionais
      if (year) whereClause.year = parseInt(year as string);
      if (month) whereClause.month = parseInt(month as string);
      if (category) whereClause.category = category;

      // Buscar orçamentos
      const budgets = await this.prisma.budget.findMany({
        where: whereClause,
        include: {
          establishment: {
            select: { name: true, type: true }
          },
          expenses: {
            where: { status: { in: ['approved', 'paid'] } }
          }
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { category: 'asc' }
        ]
      });

      // Buscar despesas
      const expenseWhereClause: any = {};
      if (!isGestorGeral) {
        expenseWhereClause.establishmentId = user.establishmentId;
      }
      if (year && month) {
        const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
        const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
        expenseWhereClause.expenseDate = {
          gte: startDate,
          lte: endDate
        };
      }

      const expenses = await this.prisma.expense.findMany({
        where: expenseWhereClause,
        include: {
          establishment: {
            select: { name: true, type: true }
          },
          creator: {
            select: { name: true }
          }
        },
        orderBy: { expenseDate: 'desc' },
        take: 50
      });

      // Calcular resumo financeiro
      const totalBudgeted = budgets.reduce((sum, budget) => sum + Number(budget.budgetedAmount), 0);
      const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.spentAmount), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

      res.json({
        success: true,
        data: {
          budgets,
          expenses,
          summary: {
            totalBudgeted,
            totalSpent,
            totalExpenses,
            remainingBudget: totalBudgeted - totalSpent,
            budgetUtilization: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
          }
        }
      });

    } catch (error: any) {
      console.error('Erro ao obter dados financeiros:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao obter dados financeiros'
      });
    }
  }

  // POST /api/admin/financial/budget - Criar orçamento (para gestores)
  async createBudget(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const {
        establishmentId,
        year,
        month,
        category,
        subcategory,
        budgetedAmount,
        description
      } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:financeiro') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para criar orçamentos'
        });
      }

      // Validações básicas
      if (!establishmentId || !year || !month || !category || !budgetedAmount) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Todos os campos obrigatórios devem ser preenchidos'
        });
      }

      // Diretor local só pode criar orçamentos no seu estabelecimento
      if (user.profile === 'diretor_local' && establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Diretor local só pode criar orçamentos no seu estabelecimento'
        });
      }

      // Criar orçamento
      const newBudget = await this.prisma.budget.create({
        data: {
          establishmentId,
          year: parseInt(year),
          month: parseInt(month),
          category,
          subcategory,
          budgetedAmount: parseFloat(budgetedAmount),
          description
        },
        include: {
          establishment: {
            select: { name: true, type: true }
          }
        }
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'create_budget',
          resource: 'budget',
          details: {
            budgetId: newBudget.id,
            establishmentId,
            year,
            month,
            category,
            budgetedAmount
          }
        }
      });

      res.status(201).json({
        success: true,
        data: newBudget,
        message: 'Orçamento criado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao criar orçamento:', error);
      
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Orçamento duplicado',
          message: 'Já existe um orçamento para esta categoria no período especificado'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar orçamento'
      });
    }
  }

  // POST /api/admin/financial/expense - Criar despesa (para gestores)
  async createExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const {
        establishmentId,
        budgetId,
        category,
        subcategory,
        amount,
        description,
        expenseDate,
        invoiceNumber,
        supplier,
        paymentMethod
      } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:financeiro') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para criar despesas'
        });
      }

      // Validações básicas
      if (!establishmentId || !category || !amount || !description || !expenseDate) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Todos os campos obrigatórios devem ser preenchidos'
        });
      }

      // Diretor local só pode criar despesas no seu estabelecimento
      if (user.profile === 'diretor_local' && establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Diretor local só pode criar despesas no seu estabelecimento'
        });
      }

      // Criar despesa
      const newExpense = await this.prisma.expense.create({
        data: {
          establishmentId,
          budgetId,
          category,
          subcategory,
          amount: parseFloat(amount),
          description,
          expenseDate: new Date(expenseDate),
          invoiceNumber,
          supplier,
          paymentMethod,
          createdBy: user.id
        },
        include: {
          establishment: {
            select: { name: true, type: true }
          },
          budget: {
            select: { category: true, budgetedAmount: true, spentAmount: true }
          },
          creator: {
            select: { name: true }
          }
        }
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'create_expense',
          resource: 'expense',
          details: {
            expenseId: newExpense.id,
            establishmentId,
            category,
            amount,
            supplier
          }
        }
      });

      res.status(201).json({
        success: true,
        data: newExpense,
        message: 'Despesa criada com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao criar despesa:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar despesa'
      });
    }
  }

  // GET /api/admin/financial/contracts - Listar contratos (para gestores)
  async getContracts(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { page = 1, limit = 20, status, contractType, search } = req.query;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:contratos') ||
                       hasPermission(user.permissions, 'diretor_local:read') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para listar contratos'
        });
      }

      // Construir filtros
      const isGestorGeral = user.profile === 'gestor_geral' || user.profile === 'system_master';
      let whereClause: any = {};

      // Filtro por estabelecimento
      if (!isGestorGeral) {
        whereClause.establishmentId = user.establishmentId;
      }

      // Filtros adicionais
      if (status) whereClause.status = status;
      if (contractType) whereClause.contractType = contractType;
      if (search) {
        whereClause.OR = [
          { contractNumber: { contains: search as string, mode: 'insensitive' } },
          { supplier: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      // Paginação
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [contracts, total] = await Promise.all([
        this.prisma.contract.findMany({
          where: whereClause,
          include: {
            establishment: {
              select: { name: true, type: true }
            },
            creator: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        this.prisma.contract.count({ where: whereClause })
      ]);

      res.json({
        success: true,
        data: contracts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error: any) {
      console.error('Erro ao listar contratos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao listar contratos'
      });
    }
  }

  // POST /api/admin/financial/contract - Criar contrato (para gestores)
  async createContract(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const {
        establishmentId,
        contractNumber,
        supplier,
        description,
        contractType,
        startDate,
        endDate,
        totalValue,
        monthlyValue,
        paymentTerms,
        renewalTerms,
        contactPerson,
        contactPhone,
        contactEmail,
        notes
      } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:contratos') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para criar contratos'
        });
      }

      // Validações básicas
      if (!establishmentId || !contractNumber || !supplier || !description || !contractType || !startDate || !endDate || !totalValue) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Todos os campos obrigatórios devem ser preenchidos'
        });
      }

      // Diretor local só pode criar contratos no seu estabelecimento
      if (user.profile === 'diretor_local' && establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Diretor local só pode criar contratos no seu estabelecimento'
        });
      }

      // Criar contrato
      const newContract = await this.prisma.contract.create({
        data: {
          establishmentId,
          contractNumber,
          supplier,
          description,
          contractType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalValue: parseFloat(totalValue),
          monthlyValue: monthlyValue ? parseFloat(monthlyValue) : null,
          paymentTerms,
          renewalTerms,
          contactPerson,
          contactPhone,
          contactEmail,
          notes,
          createdBy: user.id
        },
        include: {
          establishment: {
            select: { name: true, type: true }
          },
          creator: {
            select: { name: true }
          }
        }
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'create_contract',
          resource: 'contract',
          details: {
            contractId: newContract.id,
            establishmentId,
            contractNumber,
            supplier,
            totalValue
          }
        }
      });

      res.status(201).json({
        success: true,
        data: newContract,
        message: 'Contrato criado com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao criar contrato:', error);
      
      if (error.code === 'P2002') {
        return res.status(400).json({
          error: 'Contrato duplicado',
          message: 'Já existe um contrato com este número no estabelecimento'
        });
      }

      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar contrato'
      });
    }
  }

  // GET /api/admin/reports - Gerar relatórios (para gestores)
  async getReports(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { 
        reportType, 
        startDate, 
        endDate, 
        format = 'json',
        includeCharts = false,
        mask = 'false'
      } = req.query;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'reports:read') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para gerar relatórios'
        });
      }

      // Construir filtros baseado no perfil
      const isGestorGeral = user.profile === 'gestor_geral' || user.profile === 'system_master';
      const establishmentFilter = isGestorGeral ? {} : { establishmentId: user.establishmentId };

      // Definir período padrão se não fornecido
      const defaultStartDate = new Date();
      defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
      const defaultEndDate = new Date();

      const periodStart = startDate ? new Date(startDate as string) : defaultStartDate;
      const periodEnd = endDate ? new Date(endDate as string) : defaultEndDate;

      let reportData: any = {};

      // Gerar diferentes tipos de relatório
      switch (reportType) {
        case 'attendance':
          reportData = await this.generateAttendanceReport(establishmentFilter, periodStart, periodEnd);
          break;
        case 'financial':
          reportData = await this.generateFinancialReport(establishmentFilter, periodStart, periodEnd);
          break;
        case 'users':
          reportData = await this.generateUsersReport(establishmentFilter);
          break;
        case 'performance':
          reportData = await this.generatePerformanceReport(establishmentFilter, periodStart, periodEnd);
          break;
        default:
          reportData = await this.generateSummaryReport(establishmentFilter, periodStart, periodEnd);
      }

      // Adicionar metadados do relatório
      const reportMetadata = {
        reportType: reportType || 'summary',
        generatedBy: user.name,
        generatedAt: new Date(),
        period: {
          startDate: periodStart,
          endDate: periodEnd
        },
        scope: isGestorGeral ? 'all_establishments' : 'local_establishment',
        establishmentName: user.establishmentName
      };

      if ((format as string).toLowerCase() === 'csv') {
        const { toCSV } = await import('../utils/csv');
        const flat = Array.isArray((reportData as any).details) ? (reportData as any).details : [];
        const rows = String(mask) === 'true' ? (await import('../utils/mask')).maskPayload ? (() => { const { maskPayload } = require('../utils/mask'); return flat.map((r:any) => maskPayload(r)); })() : flat : flat;
        const csv = toCSV(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_${reportType || 'summary'}.csv`);
        res.send(csv);
        return;
      }
      if ((format as string).toLowerCase() === 'xls') {
        const { toXLS } = await import('../utils/xls');
        const flat = Array.isArray((reportData as any).details) ? (reportData as any).details : [];
        const rows = String(mask) === 'true' ? (await import('../utils/mask')).maskPayload ? (() => { const { maskPayload } = require('../utils/mask'); return flat.map((r:any) => maskPayload(r)); })() : flat : flat;
        const xls = toXLS(rows, undefined, String(reportType || 'Relatorio'));
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio_${reportType || 'summary'}.xls`);
        res.send(xls);
        return;
      }
      res.json({
        success: true,
        data: {
          metadata: reportMetadata,
          report: (String(mask) === 'true' && Array.isArray((reportData as any).details))
            ? (() => { const { maskPayload } = require('../utils/mask'); return { ...reportData, details: (reportData as any).details.map((r:any) => maskPayload(r)) }; })()
            : reportData
        }
      });

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao gerar relatório'
      });
    }
  }

  private async generateAttendanceReport(establishmentFilter: any, startDate: Date, endDate: Date) {
    // Simular dados de atendimento - em produção viria do banco
    const mockAttendances = [
      { id: '1', type: 'consultation', status: 'completed', establishmentId: 'est1', date: new Date('2024-10-15') },
      { id: '2', type: 'emergency', status: 'completed', establishmentId: 'est1', date: new Date('2024-10-20') },
      { id: '3', type: 'consultation', status: 'completed', establishmentId: 'est2', date: new Date('2024-10-18') },
      { id: '4', type: 'procedure', status: 'completed', establishmentId: 'est1', date: new Date('2024-10-25') }
    ];

    let filteredAttendances = mockAttendances.filter(a => 
      a.date >= startDate && a.date <= endDate
    );

    if (establishmentFilter.establishmentId) {
      filteredAttendances = filteredAttendances.filter(a => 
        a.establishmentId === establishmentFilter.establishmentId
      );
    }

    const totalAttendances = filteredAttendances.length;
    const attendancesByType = filteredAttendances.reduce((acc, att) => {
      acc[att.type] = (acc[att.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const attendancesByStatus = filteredAttendances.reduce((acc, att) => {
      acc[att.status] = (acc[att.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAttendances,
      attendancesByType,
      attendancesByStatus,
      averagePerDay: totalAttendances / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
      details: filteredAttendances
    };
  }

  private async generateFinancialReport(establishmentFilter: any, startDate: Date, endDate: Date) {
    // Simular dados financeiros - em produção viria do banco
    const mockBudgets = [
      { category: 'Medicamentos', budgeted: 50000, spent: 35000, establishmentId: 'est1' },
      { category: 'Equipamentos', budgeted: 30000, spent: 15000, establishmentId: 'est2' },
      { category: 'Pessoal', budgeted: 25000, spent: 18000, establishmentId: 'est1' }
    ];

    let filteredBudgets = mockBudgets;
    if (establishmentFilter.establishmentId) {
      filteredBudgets = filteredBudgets.filter(b => 
        b.establishmentId === establishmentFilter.establishmentId
      );
    }

    const totalBudgeted = filteredBudgets.reduce((sum, b) => sum + b.budgeted, 0);
    const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
    const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      totalBudgeted,
      totalSpent,
      remainingBudget: totalBudgeted - totalSpent,
      budgetUtilization,
      budgetsByCategory: filteredBudgets.map(b => ({
        category: b.category,
        budgeted: b.budgeted,
        spent: b.spent,
        utilization: b.budgeted > 0 ? (b.spent / b.budgeted) * 100 : 0
      }))
    };
  }

  private async generateUsersReport(establishmentFilter: any) {
    // Simular dados de usuários - em produção viria do banco
    const mockUsers = [
      { profile: 'medico', establishmentId: 'est1', isActive: true },
      { profile: 'enfermeiro', establishmentId: 'est1', isActive: true },
      { profile: 'medico', establishmentId: 'est2', isActive: true },
      { profile: 'farmaceutico', establishmentId: 'est1', isActive: true },
      { profile: 'recepcionista', establishmentId: 'est1', isActive: false }
    ];

    let filteredUsers = mockUsers;
    if (establishmentFilter.establishmentId) {
      filteredUsers = filteredUsers.filter(u => 
        u.establishmentId === establishmentFilter.establishmentId
      );
    }

    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.isActive).length;
    const usersByProfile = filteredUsers.reduce((acc, user) => {
      acc[user.profile] = (acc[user.profile] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByProfile,
      activationRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    };
  }

  private async generatePerformanceReport(establishmentFilter: any, startDate: Date, endDate: Date) {
    // Simular métricas de performance - em produção viria de cálculos reais
    return {
      averageWaitTime: Math.floor(Math.random() * 60) + 15, // 15-75 minutos
      patientSatisfaction: Math.floor(Math.random() * 20) + 80, // 80-100%
      bedOccupancyRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      staffUtilization: Math.floor(Math.random() * 30) + 70, // 70-100%
      completionRate: Math.floor(Math.random() * 10) + 90, // 90-100%
      noShowRate: Math.floor(Math.random() * 10) + 5, // 5-15%
      emergencyResponseTime: Math.floor(Math.random() * 10) + 5, // 5-15 minutos
      patientTurnover: Math.floor(Math.random() * 50) + 100 // 100-150 pacientes/dia
    };
  }

  private async generateSummaryReport(establishmentFilter: any, startDate: Date, endDate: Date) {
    const attendanceReport = await this.generateAttendanceReport(establishmentFilter, startDate, endDate);
    const financialReport = await this.generateFinancialReport(establishmentFilter, startDate, endDate);
    const usersReport = await this.generateUsersReport(establishmentFilter);
    const performanceReport = await this.generatePerformanceReport(establishmentFilter, startDate, endDate);

    return {
      summary: {
        totalAttendances: attendanceReport.totalAttendances,
        totalBudget: financialReport.totalBudgeted,
        totalUsers: usersReport.totalUsers,
        averageWaitTime: performanceReport.averageWaitTime
      },
      attendance: attendanceReport,
      financial: financialReport,
      users: usersReport,
      performance: performanceReport
    };
  }

  // POST /api/admin/reports/export - Exportar relatório (para gestores)
  async exportReport(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { reportType, format = 'pdf', startDate, endDate } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'reports:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para exportar relatórios'
        });
      }

      // Simular exportação de relatório
      const exportId = `export_${Date.now()}`;
      const fileName = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`;

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'export_report',
          resource: 'report',
          details: {
            reportType,
            format,
            exportId,
            fileName,
            establishmentId: user.establishmentId
          }
        }
      });

      res.json({
        success: true,
        data: {
          exportId,
          fileName,
          format,
          status: 'processing',
          estimatedTime: '2-5 minutos',
          downloadUrl: `/api/admin/reports/download/${exportId}`
        },
        message: 'Relatório sendo processado para exportação'
      });

    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao exportar relatório'
      });
    }
  }

  // GET /api/admin/epidemiology - Listar notificações epidemiológicas (para gestores)
  async getEpidemiologyNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { 
        page = 1, 
        limit = 20, 
        diseaseCode, 
        status, 
        startDate, 
        endDate,
        epidemiologicalWeek,
        epidemiologicalYear
      } = req.query;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:epidemiologia') ||
                       hasPermission(user.permissions, 'diretor_local:read') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para acessar dados epidemiológicos'
        });
      }

      // Construir filtros
      const isGestorGeral = user.profile === 'gestor_geral' || user.profile === 'system_master';
      let whereClause: any = {};

      // Filtro por estabelecimento
      if (!isGestorGeral) {
        whereClause.establishmentId = user.establishmentId;
      }

      // Filtros adicionais
      if (diseaseCode) whereClause.diseaseCode = diseaseCode;
      if (status) whereClause.investigationStatus = status;
      if (epidemiologicalWeek) whereClause.epidemiologicalWeek = parseInt(epidemiologicalWeek as string);
      if (epidemiologicalYear) whereClause.epidemiologicalYear = parseInt(epidemiologicalYear as string);

      // Filtro por período
      if (startDate || endDate) {
        whereClause.notificationDate = {};
        if (startDate) whereClause.notificationDate.gte = new Date(startDate as string);
        if (endDate) whereClause.notificationDate.lte = new Date(endDate as string);
      }

      // Paginação
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [notifications, total] = await Promise.all([
        this.prisma.diseaseNotification.findMany({
          where: whereClause,
          include: {
            establishment: {
              select: { name: true, type: true }
            },
            patient: {
              select: { name: true, cpf: true, birthDate: true, gender: true }
            },
            notifier: {
              select: { name: true, profile: true }
            },
            investigator: {
              select: { name: true, profile: true }
            }
          },
          orderBy: { notificationDate: 'desc' },
          skip,
          take
        }),
        this.prisma.diseaseNotification.count({ where: whereClause })
      ]);

      res.json({
        success: true,
        data: notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error: any) {
      console.error('Erro ao listar notificações epidemiológicas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao listar notificações epidemiológicas'
      });
    }
  }

  // POST /api/admin/epidemiology - Criar notificação epidemiológica (para gestores)
  async createEpidemiologyNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const {
        establishmentId,
        patientId,
        diseaseCode,
        diseaseName,
        symptomOnsetDate,
        diagnosisDate,
        notificationType,
        severity,
        patientAge,
        patientGender,
        patientCity,
        patientNeighborhood,
        riskFactors,
        symptoms,
        notes
      } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:epidemiologia') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para criar notificações epidemiológicas'
        });
      }

      // Validações básicas
      if (!establishmentId || !diseaseCode || !diseaseName) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'Estabelecimento, código da doença e nome da doença são obrigatórios'
        });
      }

      // Diretor local só pode criar notificações no seu estabelecimento
      if (user.profile === 'diretor_local' && establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Diretor local só pode criar notificações no seu estabelecimento'
        });
      }

      // Calcular semana epidemiológica
      const notificationDate = new Date();
      const epidemiologicalWeek = this.getEpidemiologicalWeek(notificationDate);
      const epidemiologicalYear = notificationDate.getFullYear();

      // Criar notificação
      const newNotification = await this.prisma.diseaseNotification.create({
        data: {
          establishmentId,
          patientId,
          diseaseCode,
          diseaseName,
          symptomOnsetDate: symptomOnsetDate ? new Date(symptomOnsetDate) : null,
          diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : null,
          notificationType: notificationType || 'compulsory',
          severity,
          epidemiologicalWeek,
          epidemiologicalYear,
          patientAge,
          patientGender,
          patientCity,
          patientNeighborhood,
          riskFactors: riskFactors || [],
          symptoms: symptoms || [],
          notes,
          notifiedBy: user.id
        },
        include: {
          establishment: {
            select: { name: true, type: true }
          },
          patient: {
            select: { name: true, cpf: true }
          },
          notifier: {
            select: { name: true, profile: true }
          }
        }
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'create_epidemiology_notification',
          resource: 'disease_notification',
          details: {
            notificationId: newNotification.id,
            establishmentId,
            diseaseCode,
            diseaseName,
            epidemiologicalWeek,
            epidemiologicalYear
          }
        }
      });

      res.status(201).json({
        success: true,
        data: newNotification,
        message: 'Notificação epidemiológica criada com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao criar notificação epidemiológica:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao criar notificação epidemiológica'
      });
    }
  }

  // PUT /api/admin/epidemiology/:id - Atualizar notificação epidemiológica (para gestores)
  async updateEpidemiologyNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { id } = req.params;
      const {
        investigationStatus,
        outcome,
        labResults,
        treatmentGiven,
        contactTracing,
        investigatedBy,
        notes
      } = req.body;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:epidemiologia') ||
                       hasPermission(user.permissions, 'diretor_local:write') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para atualizar notificações epidemiológicas'
        });
      }

      // Verificar se a notificação existe
      const existingNotification = await this.prisma.diseaseNotification.findUnique({
        where: { id }
      });

      if (!existingNotification) {
        return res.status(404).json({
          error: 'Notificação não encontrada',
          message: 'Notificação epidemiológica não existe no sistema'
        });
      }

      // Diretor local só pode editar notificações do seu estabelecimento
      if (user.profile === 'diretor_local' && existingNotification.establishmentId !== user.establishmentId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você só pode editar notificações do seu estabelecimento'
        });
      }

      // Atualizar notificação
      const updatedNotification = await this.prisma.diseaseNotification.update({
        where: { id },
        data: {
          ...(investigationStatus && { investigationStatus }),
          ...(outcome && { outcome }),
          ...(labResults && { labResults }),
          ...(treatmentGiven && { treatmentGiven }),
          ...(contactTracing !== undefined && { contactTracing }),
          ...(investigatedBy && { investigatedBy }),
          ...(notes && { notes })
        },
        include: {
          establishment: {
            select: { name: true, type: true }
          },
          patient: {
            select: { name: true, cpf: true }
          },
          notifier: {
            select: { name: true, profile: true }
          },
          investigator: {
            select: { name: true, profile: true }
          }
        }
      });

      // Log de auditoria
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'update_epidemiology_notification',
          resource: 'disease_notification',
          details: {
            notificationId: id,
            changes: { investigationStatus, outcome, contactTracing }
          }
        }
      });

      res.json({
        success: true,
        data: updatedNotification,
        message: 'Notificação epidemiológica atualizada com sucesso'
      });

    } catch (error: any) {
      console.error('Erro ao atualizar notificação epidemiológica:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao atualizar notificação epidemiológica'
      });
    }
  }

  // GET /api/admin/epidemiology/dashboard - Dashboard epidemiológico (para gestores)
  async getEpidemiologyDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user!;
      const { year, week } = req.query;

      // Verificar permissões
      const hasAccess = hasPermission(user.permissions, 'gestor_geral:epidemiologia') ||
                       hasPermission(user.permissions, 'diretor_local:read') ||
                       hasPermission(user.permissions, 'admin:full_access');

      if (!hasAccess) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Usuário não tem permissão para acessar dashboard epidemiológico'
        });
      }

      // Construir filtros
      const isGestorGeral = user.profile === 'gestor_geral' || user.profile === 'system_master';
      let whereClause: any = {};

      // Filtro por estabelecimento
      if (!isGestorGeral) {
        whereClause.establishmentId = user.establishmentId;
      }

      // Filtros por período
      const currentYear = parseInt(year as string) || new Date().getFullYear();
      const currentWeek = parseInt(week as string) || this.getEpidemiologicalWeek(new Date());

      whereClause.epidemiologicalYear = currentYear;

      // Buscar dados epidemiológicos
      const [
        totalNotifications,
        notificationsByDisease,
        notificationsByWeek,
        notificationsByStatus,
        recentNotifications
      ] = await Promise.all([
        this.prisma.diseaseNotification.count({ where: whereClause }),
        this.prisma.diseaseNotification.groupBy({
          by: ['diseaseCode', 'diseaseName'],
          _count: { diseaseCode: true },
          where: whereClause,
          orderBy: { _count: { diseaseCode: 'desc' } },
          take: 10
        }),
        this.prisma.diseaseNotification.groupBy({
          by: ['epidemiologicalWeek'],
          _count: { epidemiologicalWeek: true },
          where: whereClause,
          orderBy: { epidemiologicalWeek: 'asc' }
        }),
        this.prisma.diseaseNotification.groupBy({
          by: ['investigationStatus'],
          _count: { investigationStatus: true },
          where: whereClause
        }),
        this.prisma.diseaseNotification.findMany({
          where: whereClause,
          include: {
            establishment: { select: { name: true } },
            patient: { select: { name: true } }
          },
          orderBy: { notificationDate: 'desc' },
          take: 5
        })
      ]);

      const dashboardData = {
        summary: {
          totalNotifications,
          currentWeek,
          currentYear,
          scope: isGestorGeral ? 'all_establishments' : 'local_establishment'
        },
        notificationsByDisease: notificationsByDisease.map(item => ({
          diseaseCode: item.diseaseCode,
          diseaseName: item.diseaseName,
          count: item._count.diseaseCode
        })),
        notificationsByWeek: notificationsByWeek.map(item => ({
          week: item.epidemiologicalWeek,
          count: item._count.epidemiologicalWeek
        })),
        notificationsByStatus: notificationsByStatus.reduce((acc, item) => {
          acc[item.investigationStatus] = item._count.investigationStatus;
          return acc;
        }, {} as Record<string, number>),
        recentNotifications
      };

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error: any) {
      console.error('Erro ao obter dashboard epidemiológico:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Falha ao obter dashboard epidemiológico'
      });
    }
  }

  private getEpidemiologicalWeek(date: Date): number {
    // Implementação simplificada da semana epidemiológica
    // Em produção, usar biblioteca específica para cálculo correto
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  }
}
