/**
 * Rotas de Exames de Imagem
 * Sistema A1 Saúde
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ImagingService } from '../services/ImagingService';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();
const imagingService = new ImagingService(prisma);

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ==================== DASHBOARD ====================

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    const data = await imagingService.getDashboardData(establishmentId as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { establishmentId, startDate, endDate } = req.query;
    const stats = await imagingService.getStats(
      establishmentId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REFERÊNCIAS ====================

router.get('/exam-types', async (_req: Request, res: Response) => {
  try {
    const types = imagingService.getExamTypes();
    res.json({ success: true, data: types });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/body-regions', async (_req: Request, res: Response) => {
  try {
    const regions = imagingService.getBodyRegions();
    res.json({ success: true, data: regions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== WORKLISTS ====================

router.get('/worklist', async (req: Request, res: Response) => {
  try {
    const { establishmentId, examType } = req.query;
    const worklist = await imagingService.getPendingWorklist(
      establishmentId as string,
      examType as string
    );
    res.json({ success: true, data: worklist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/pending-reports', async (req: Request, res: Response) => {
  try {
    const { establishmentId, reportedById } = req.query;
    const reports = await imagingService.getPendingReports(
      establishmentId as string,
      reportedById as string
    );
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CRUD ====================

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      patientId: req.query.patientId as string,
      requestedById: req.query.requestedById as string,
      establishmentId: req.query.establishmentId as string,
      examType: req.query.examType as string,
      status: req.query.status as string,
      urgency: req.query.urgency as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20
    };

    const result = await imagingService.searchExams(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/today', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    const exams = await imagingService.getTodayExams(establishmentId as string);
    res.json({ success: true, data: exams });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const exam = await imagingService.getExamById(req.params.id);
    res.json({ success: true, data: exam });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const exam = await imagingService.requestExam(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const exam = await imagingService.cancelExam(req.params.id, reason);
    res.json({ success: true, data: exam });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== WORKFLOW ====================

router.post('/:id/schedule', async (req: Request, res: Response) => {
  try {
    const { scheduledFor, room } = req.body;
    const exam = await imagingService.scheduleExam(
      req.params.id,
      new Date(scheduledFor),
      room
    );
    res.json({ success: true, data: exam });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { performedById } = req.body;
    const exam = await imagingService.startExam(req.params.id, performedById);
    res.json({ success: true, data: exam });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { imagesCount, technicalNotes, imagesUrls } = req.body;
    const exam = await imagingService.completeExam(
      req.params.id,
      imagesCount,
      technicalNotes,
      imagesUrls
    );
    res.json({ success: true, data: exam });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/:id/report', async (req: Request, res: Response) => {
  try {
    const exam = await imagingService.reportExam(req.params.id, req.body);
    res.json({ success: true, data: exam });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;

