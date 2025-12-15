/**
 * Rotas de Visitas Domiciliares
 * Sistema A1 Saúde - UBS
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HomeVisitService } from '../services/HomeVisitService';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();
const homeVisitService = new HomeVisitService(prisma);

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ==================== DASHBOARD ====================

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    const data = await homeVisitService.getDashboardData(establishmentId as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { establishmentId, startDate, endDate } = req.query;
    const stats = await homeVisitService.getStats(
      establishmentId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CRUD ====================

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      patientId: req.query.patientId as string,
      professionalId: req.query.professionalId as string,
      establishmentId: req.query.establishmentId as string,
      status: req.query.status as string,
      visitType: req.query.visitType as string,
      priority: req.query.priority as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await homeVisitService.searchVisits(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/today', async (req: Request, res: Response) => {
  try {
    const { professionalId, establishmentId } = req.query;
    const visits = await homeVisitService.getTodayVisits(
      professionalId as string,
      establishmentId as string
    );
    res.json({ success: true, data: visits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/pending', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    const visits = await homeVisitService.getPendingVisits(establishmentId as string);
    res.json({ success: true, data: visits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const visit = await homeVisitService.getVisitById(req.params.id);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const visit = await homeVisitService.createVisit(req.body);
    res.status(201).json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const visit = await homeVisitService.updateVisit(req.params.id, req.body);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== WORKFLOW ====================

router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const visit = await homeVisitService.startVisit(req.params.id);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const visit = await homeVisitService.completeVisit(req.params.id, req.body);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const visit = await homeVisitService.cancelVisit(req.params.id, reason);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/reschedule', async (req: Request, res: Response) => {
  try {
    const { newDate, newTime, reason } = req.body;
    const visit = await homeVisitService.rescheduleVisit(
      req.params.id,
      new Date(newDate),
      newTime,
      reason
    );
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/not-found', async (req: Request, res: Response) => {
  try {
    const { observations } = req.body;
    const visit = await homeVisitService.markNotFound(req.params.id, observations);
    res.json({ success: true, data: visit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;

