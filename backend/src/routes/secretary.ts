import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { SecretaryService } from '../services/SecretaryService';
import { authenticateToken } from '../middleware/auth';
import { checkAnyPermission } from '../middleware/permissions';

const router = Router();
const prisma = new PrismaClient();
const secretaryService = new SecretaryService(prisma);

/**
 * @route GET /api/v1/secretary/dashboard/metrics
 * @desc Get secretary dashboard metrics
 * @access Private (Secretary)
 */
router.get('/dashboard/metrics',
  authenticateToken,
  checkAnyPermission(['view_dashboard']),
  async (req, res) => {
    try {
      const secretaryId = req.user.id;
      const metrics = await secretaryService.getSecretaryMetrics(secretaryId);
      
      res.status(200).json({
        success: true,
        data: metrics,
        message: 'Métricas do dashboard obtidas com sucesso'
      });
    } catch (error) {
      console.error('Error fetching secretary metrics:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao buscar métricas do secretário',
          code: 'FETCH_METRICS_ERROR'
        }
      });
    }
  }
);

/**
 * @route GET /api/v1/secretary/appointments
 * @desc Get appointments
 * @access Private (Secretary)
 */
router.get('/appointments',
  authenticateToken,
  checkAnyPermission(['view_dashboard']),
  async (req, res) => {
    try {
      const secretaryId = req.user.id;
      const { date, status } = req.query;
      const appointments = await secretaryService.getAppointments(secretaryId, date as string, status as string);
      
      res.status(200).json({
        success: true,
        data: appointments,
        message: 'Compromissos obtidos com sucesso'
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao buscar compromissos',
          code: 'FETCH_APPOINTMENTS_ERROR'
        }
      });
    }
  }
);

/**
 * @route POST /api/v1/secretary/appointments
 * @desc Create new appointment
 * @access Private (Secretary)
 */
router.post('/appointments',
  authenticateToken,
  checkAnyPermission(['view_dashboard']),
  async (req, res) => {
    try {
      const secretaryId = req.user.id;
      const appointmentData = req.body;
      const newAppointment = await secretaryService.createAppointment(secretaryId, appointmentData);
      
      res.status(201).json({
        success: true,
        data: newAppointment,
        message: 'Compromisso criado com sucesso'
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao criar compromisso',
          code: 'CREATE_APPOINTMENT_ERROR'
        }
      });
    }
  }
);

/**
 * @route PUT /api/v1/secretary/appointments/:appointmentId/status
 * @desc Update appointment status
 * @access Private (Secretary)
 */
router.put('/appointments/:appointmentId/status',
  authenticateToken,
  checkAnyPermission(['view_dashboard']),
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { status } = req.body;
      const updatedAppointment = await secretaryService.updateAppointmentStatus(appointmentId, status);
      
      res.status(200).json({
        success: true,
        data: updatedAppointment,
        message: 'Status do compromisso atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao atualizar status do compromisso',
          code: 'UPDATE_APPOINTMENT_STATUS_ERROR'
        }
      });
    }
  }
);

/**
 * @route GET /api/v1/secretary/documents
 * @desc Get documents
 * @access Private (Secretary)
 */
router.get('/documents',
  authenticateToken,
  checkAnyPermission(['view_dashboard']),
  async (req, res) => {
    try {
      const secretaryId = req.user.id;
      const { status, type } = req.query;
      const documents = await secretaryService.getDocuments(secretaryId, status as string, type as string);
      
      res.status(200).json({
        success: true,
        data: documents,
        message: 'Documentos obtidos com sucesso'
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao buscar documentos',
          code: 'FETCH_DOCUMENTS_ERROR'
        }
      });
    }
  }
);

/**
 * @route GET /api/v1/secretary/alerts
 * @desc Get alerts
 * @access Private (Secretary)
 */
router.get('/alerts',
  authenticateToken,
  checkAnyPermission(['view_dashboard']),
  async (req, res) => {
    try {
      const secretaryId = req.user.id;
      const alerts = await secretaryService.getAlerts(secretaryId);
      
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
 * @route PUT /api/v1/secretary/alerts/:alertId/read
 * @desc Mark alert as read
 * @access Private (Secretary)
 */
router.put('/alerts/:alertId/read',
  authenticateToken,
  checkAnyPermission(['view_dashboard']),
  async (req, res) => {
    try {
      const { alertId } = req.params;
      await secretaryService.markAlertAsRead(alertId);
      
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

export default router;