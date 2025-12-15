import { Request, Response } from 'express';
import { AdminUserService } from '../services/AdminUserService';

export class AdminUserController {
  constructor(private adminUserService: AdminUserService) {}

  // Listar usuários com filtros e paginação
  getUsers = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const filters = req.query;

      const result = await this.adminUserService.getUsers(establishmentId, filters as any);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Usuários obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'USERS_FETCH_FAILED'
        }
      });
    }
  };

  // Obter usuário por ID
  getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = await this.adminUserService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Usuário não encontrado',
            code: 'USER_NOT_FOUND'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: user,
        message: 'Usuário encontrado'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'USER_FETCH_FAILED'
        }
      });
    }
  };

  // Criar novo usuário
  createUser = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const userData = req.body;

      const user = await this.adminUserService.createUser(userData, establishmentId);

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário criado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'USER_CREATION_FAILED'
        }
      });
    }
  };

  // Atualizar usuário
  updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userData = req.body;

      const user = await this.adminUserService.updateUser(id, userData);

      res.status(200).json({
        success: true,
        data: user,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'USER_UPDATE_FAILED'
        }
      });
    }
  };

  // Desativar/reativar usuário
  toggleUserStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const user = await this.adminUserService.toggleUserStatus(id, isActive);

      res.status(200).json({
        success: true,
        data: user,
        message: `Usuário ${isActive ? 'reativado' : 'desativado'} com sucesso`
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'USER_STATUS_UPDATE_FAILED'
        }
      });
    }
  };

  // Resetar senha do usuário
  resetUserPassword = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const user = await this.adminUserService.resetUserPassword(id, newPassword);

      res.status(200).json({
        success: true,
        data: user,
        message: 'Senha resetada com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(400).json({
        success: false,
        error: {
          message,
          code: 'PASSWORD_RESET_FAILED'
        }
      });
    }
  };

  // Obter estatísticas de usuários
  getUserStats = async (req: Request, res: Response) => {
    try {
      const { establishmentId } = req.user!;

      const stats = await this.adminUserService.getUserStats(establishmentId);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estatísticas de usuários obtidas com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'USER_STATS_FETCH_FAILED'
        }
      });
    }
  };

  // Obter perfis disponíveis
  getAvailableProfiles = async (req: Request, res: Response) => {
    try {
      const profiles = await this.adminUserService.getAvailableProfiles();

      res.status(200).json({
        success: true,
        data: profiles,
        message: 'Perfis disponíveis obtidos com sucesso'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';

      res.status(500).json({
        success: false,
        error: {
          message,
          code: 'PROFILES_FETCH_FAILED'
        }
      });
    }
  };
}
