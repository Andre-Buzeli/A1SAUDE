import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { SupervisorService } from '../services/SupervisorService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const supervisorService = new SupervisorService(prisma);

/**
 * @route GET /api/v1/supervisor/dashboard/metrics
 * @desc Get supervisor dashboard metrics
 * @access Private (Supervisor)
 */
router.get('/dashboard/metrics',
  authenticateToken,
  async (req, res) => {
    try {
      const supervisorId = req.user.id;
      const metrics = await supervisorService.getDashboardMetrics(supervisorId);
      
      res.status(200).json({
        success: true,
        data: metrics,
        message: 'Métricas do dashboard obtidas com sucesso'
      });
    } catch (error) {
      console.error('Error fetching supervisor metrics:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao buscar métricas do supervisor',
          code: 'FETCH_METRICS_ERROR'
        }
      });
    }
  }
);

/**
 * @route GET /api/v1/supervisor/team
 * @desc Get team members
 * @access Private (Supervisor)
 */
router.get('/team',
  authenticateToken,
  async (req, res) => {
    try {
      const supervisorId = req.user.id;
      const teamMembers = await supervisorService.getTeamMembers(supervisorId);
      
      res.status(200).json({
        success: true,
        data: teamMembers,
        message: 'Membros da equipe obtidos com sucesso'
      });
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao buscar membros da equipe',
          code: 'FETCH_TEAM_ERROR'
        }
      });
    }
  }
);

/**
 * @route GET /api/v1/supervisor/tasks
 * @desc Get tasks
 * @access Private (Supervisor)
 */
router.get('/tasks',
  authenticateToken,
  async (req, res) => {
    try {
      const supervisorId = req.user.id;
      const { status } = req.query;
      const tasks = await supervisorService.getTasks(supervisorId, status as string);
      
      res.status(200).json({
        success: true,
        data: tasks,
        message: 'Tarefas obtidas com sucesso'
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao buscar tarefas',
          code: 'FETCH_TASKS_ERROR'
        }
      });
    }
  }
);

/**
 * @route POST /api/v1/supervisor/tasks
 * @desc Create new task
 * @access Private (Supervisor)
 */
router.post('/tasks',
  authenticateToken,
  async (req, res) => {
    try {
      const supervisorId = req.user.id;
      const taskData = req.body;
      const newTask = await supervisorService.createTask(supervisorId, taskData);
      
      res.status(201).json({
        success: true,
        data: newTask,
        message: 'Tarefa criada com sucesso'
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao criar tarefa',
          code: 'CREATE_TASK_ERROR'
        }
      });
    }
  }
);

/**
 * @route PUT /api/v1/supervisor/tasks/:taskId/status
 * @desc Update task status
 * @access Private (Supervisor)
 */
router.put('/tasks/:taskId/status',
  authenticateToken,
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
      const updatedTask = await supervisorService.updateTaskStatus(taskId, status);
      
      res.status(200).json({
        success: true,
        data: updatedTask,
        message: 'Status da tarefa atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao atualizar status da tarefa',
          code: 'UPDATE_TASK_STATUS_ERROR'
        }
      });
    }
  }
);

/**
 * @route GET /api/v1/supervisor/alerts
 * @desc Get alerts
 * @access Private (Supervisor)
 */
router.get('/alerts',
  authenticateToken,
  async (req, res) => {
    try {
      const supervisorId = req.user.id;
      const alerts = await supervisorService.getAlerts(supervisorId);
      
      res.status(200).json({
        success: true,
        data: alerts,
        message: 'Alertas obtidos com sucesso'
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao buscar alertas',
          code: 'FETCH_ALERTS_ERROR'
        }
      });
    }
  }
);

/**
 * @route PUT /api/v1/supervisor/alerts/:alertId/read
 * @desc Mark alert as read
 * @access Private (Supervisor)
 */
router.put('/alerts/:alertId/read',
  authenticateToken,
  async (req, res) => {
    try {
      const { alertId } = req.params;
      await supervisorService.markAlertAsRead(alertId);
      
      res.status(200).json({
        success: true,
        message: 'Alerta marcado como lido'
      });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao marcar alerta como lido',
          code: 'MARK_ALERT_READ_ERROR'
        }
      });
    }
  }
);

/**
 * @route GET /api/v1/supervisor/performance
 * @desc Get performance data
 * @access Private (Supervisor)
 */
router.get('/performance',
  authenticateToken,
  async (req, res) => {
    try {
      const supervisorId = req.user.id;
      const { period = 'month' } = req.query;
      const performanceData = await supervisorService.getPerformanceData(supervisorId, period as string as 'week' | 'month' | 'quarter');
      
      res.status(200).json({
        success: true,
        data: performanceData,
        message: 'Dados de performance obtidos com sucesso'
      });
    } catch (error) {
      console.error('Error fetching performance data:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao buscar dados de performance',
          code: 'FETCH_PERFORMANCE_ERROR'
        }
      });
    }
  }
);

export default router;