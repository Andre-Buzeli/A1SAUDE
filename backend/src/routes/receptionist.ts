import { Router } from 'express';
import { ReceptionistService } from '../services/ReceptionistService';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { checkAnyPermission } from '../middleware/permissions';

const router = Router();
const prisma = new PrismaClient();
const receptionistService = new ReceptionistService(prisma);

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Métricas do dashboard
router.get('/dashboard-metrics', checkAnyPermission(['view_dashboard']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const metrics = await receptionistService.getDashboardMetrics(userId);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
});

// Compromissos de hoje
router.get('/today-appointments', checkAnyPermission(['view_dashboard']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const appointments = await receptionistService.getTodayAppointments(userId);
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
});

// Fila atual
router.get('/current-queue', checkAnyPermission(['view_dashboard']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const queue = await receptionistService.getCurrentQueue(userId);
    res.json({
      success: true,
      data: queue
    });
  } catch (error) {
    next(error);
  }
});

// Alertas ativos
router.get('/active-alerts', checkAnyPermission(['view_dashboard']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const alerts = await receptionistService.getActiveAlerts(userId);
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
});

// Check-in do paciente
router.post('/check-in/:appointmentId', checkAnyPermission(['manage_attendances']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;
    
    await receptionistService.checkInPatient(userId, appointmentId);
    res.json({
      success: true,
      message: 'Check-in realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Check-out do paciente
router.post('/check-out/:appointmentId', checkAnyPermission(['manage_attendances']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;
    
    await receptionistService.checkOutPatient(userId, appointmentId);
    res.json({
      success: true,
      message: 'Check-out realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar status do compromisso
router.patch('/appointment-status/:appointmentId', checkAnyPermission(['manage_attendances']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      throw new Error('Status é obrigatório');
    }
    
    await receptionistService.updateAppointmentStatus(userId, appointmentId, status);
    res.json({
      success: true,
      message: 'Status atualizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Registrar paciente sem horário marcado
router.post('/walk-in-patient', checkAnyPermission(['manage_attendances']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const patientData = req.body;
    
    if (!patientData.name || !patientData.cpf || !patientData.specialty || !patientData.priority || !patientData.reason) {
      throw new Error('Dados incompletos do paciente');
    }
    
    const appointment = await receptionistService.registerWalkInPatient(userId, patientData);
    res.json({
      success: true,
      data: appointment,
      message: 'Paciente sem horário registrado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Relatório diário
router.get('/daily-report/:date', checkAnyPermission(['view_reports']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    
    if (!date) {
      throw new Error('Data é obrigatória');
    }
    
    const report = await receptionistService.getDailyReport(userId, new Date(date));
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
});

// Agenda semanal
router.get('/weekly-schedule', checkAnyPermission(['view_dashboard']), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const schedule = await receptionistService.getWeeklySchedule(userId);
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
});

export default router;
