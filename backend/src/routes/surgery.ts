/**
 * Rotas de Centro Cirúrgico
 * Sistema A1 Saúde - Hospital
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SurgeryService } from '../services/SurgeryService';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();
const surgeryService = new SurgeryService(prisma);

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ==================== DASHBOARD ====================

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'establishmentId é obrigatório' 
      });
    }
    const data = await surgeryService.getDashboardData(establishmentId as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { establishmentId, startDate, endDate } = req.query;
    const stats = await surgeryService.getStats(
      establishmentId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== SALAS ====================

router.get('/rooms/status', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'establishmentId é obrigatório' 
      });
    }
    const status = await surgeryService.getRoomsStatus(establishmentId as string);
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CRUD ====================

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      patientId: req.query.patientId as string,
      surgeonId: req.query.surgeonId as string,
      establishmentId: req.query.establishmentId as string,
      status: req.query.status as string,
      procedureType: req.query.procedureType as string,
      roomNumber: req.query.roomNumber as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await surgeryService.searchSurgeries(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/today', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    const surgeries = await surgeryService.getTodaySurgeries(establishmentId as string);
    res.json({ success: true, data: surgeries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const surgery = await surgeryService.getSurgeryById(req.params.id);
    res.json({ success: true, data: surgery });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const surgery = await surgeryService.createSurgery(req.body);
    res.status(201).json({ success: true, data: surgery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const surgery = await surgeryService.updateSurgery(req.params.id, req.body);
    res.json({ success: true, data: surgery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const surgery = await surgeryService.cancelSurgery(req.params.id, reason);
    res.json({ success: true, data: surgery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== WORKFLOW ====================

router.post('/:id/confirm-preop', async (req: Request, res: Response) => {
  try {
    const { consentSigned, fastingConfirmed } = req.body;
    const surgery = await surgeryService.confirmPreOp(
      req.params.id,
      consentSigned,
      fastingConfirmed
    );
    res.json({ success: true, data: surgery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const surgery = await surgeryService.startSurgery(req.params.id);
    res.json({ success: true, data: surgery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const surgery = await surgeryService.completeSurgery(req.params.id, req.body);
    res.json({ success: true, data: surgery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/recovery', async (req: Request, res: Response) => {
  try {
    const { recoveryNotes } = req.body;
    const surgery = await surgeryService.moveToRecovery(req.params.id, recoveryNotes);
    res.json({ success: true, data: surgery });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;

