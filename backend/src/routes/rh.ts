/**
 * Rotas de Gestão de RH / Pessoas
 * Sistema A1 Saúde
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RHService } from '../services/RHService';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();
const rhService = new RHService(prisma);

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// ==================== DASHBOARD ====================

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    const data = await rhService.getDashboardData(establishmentId as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.query;
    const stats = await rhService.getEmployeeStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EMPLOYEES ====================

router.get('/employees', async (req: Request, res: Response) => {
  try {
    const filters = {
      query: req.query.query as string,
      establishmentId: req.query.establishmentId as string,
      department: req.query.department as string,
      contractType: req.query.contractType as string,
      position: req.query.position as string,
      isActive: req.query.isActive !== 'false',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      sortBy: req.query.sortBy as string || 'name',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    };

    const result = await rhService.searchEmployees(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/employees/:id', async (req: Request, res: Response) => {
  try {
    const employee = await rhService.getEmployeeById(req.params.id);
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});

router.post('/employees', async (req: Request, res: Response) => {
  try {
    const employee = await rhService.createEmployee(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/employees/:id', async (req: Request, res: Response) => {
  try {
    const employee = await rhService.updateEmployee(req.params.id, req.body);
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/employees/:id/terminate', async (req: Request, res: Response) => {
  try {
    const { reason, terminationDate } = req.body;
    const employee = await rhService.terminateEmployee(
      req.params.id,
      reason,
      new Date(terminationDate)
    );
    res.json({ success: true, data: employee });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== TIME RECORDS ====================

router.get('/time-records', async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'employeeId, startDate e endDate são obrigatórios'
      });
    }

    const records = await rhService.getTimeRecords(
      employeeId as string,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/time-records/clock-in', async (req: Request, res: Response) => {
  try {
    const { employeeId, timestamp } = req.body;
    const record = await rhService.clockIn(
      employeeId,
      timestamp ? new Date(timestamp) : undefined
    );
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/time-records/clock-out', async (req: Request, res: Response) => {
  try {
    const { employeeId, timestamp } = req.body;
    const record = await rhService.clockOut(
      employeeId,
      timestamp ? new Date(timestamp) : undefined
    );
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/time-records/:id/approve', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const record = await rhService.approveTimeRecord(req.params.id, userId);
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/time-records/:id/justify', async (req: Request, res: Response) => {
  try {
    const { justification } = req.body;
    const record = await rhService.justifyTimeRecord(req.params.id, justification);
    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== VACATIONS ====================

router.get('/vacations', async (req: Request, res: Response) => {
  try {
    const filters = {
      employeeId: req.query.employeeId as string,
      status: req.query.status as string,
      year: req.query.year ? parseInt(req.query.year as string) : undefined
    };
    const vacations = await rhService.getVacations(filters);
    res.json({ success: true, data: vacations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/vacations', async (req: Request, res: Response) => {
  try {
    const vacation = await rhService.requestVacation(req.body);
    res.status(201).json({ success: true, data: vacation });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/vacations/:id/approve', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const vacation = await rhService.approveVacation(req.params.id, userId);
    res.json({ success: true, data: vacation });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/vacations/:id/reject', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const vacation = await rhService.rejectVacation(req.params.id, reason);
    res.json({ success: true, data: vacation });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== LEAVES ====================

router.get('/leaves', async (req: Request, res: Response) => {
  try {
    const filters = {
      employeeId: req.query.employeeId as string,
      status: req.query.status as string,
      leaveType: req.query.leaveType as string
    };
    const leaves = await rhService.getLeaves(filters);
    res.json({ success: true, data: leaves });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leaves', async (req: Request, res: Response) => {
  try {
    const leave = await rhService.createLeave(req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/leaves/:id/end', async (req: Request, res: Response) => {
  try {
    const { actualReturn } = req.body;
    const leave = await rhService.endLeave(req.params.id, new Date(actualReturn));
    res.json({ success: true, data: leave });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== SCHEDULES ====================

router.get('/schedules', async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.workSchedule.findMany({
      where: {
        isActive: true,
        establishmentId: req.query.establishmentId as string || undefined
      },
      orderBy: { startDate: 'desc' }
    });
    res.json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/schedules', async (req: Request, res: Response) => {
  try {
    const schedule = await rhService.createSchedule(req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/schedules/:id/assignments', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate e endDate são obrigatórios'
      });
    }

    const assignments = await rhService.getScheduleAssignments(
      req.params.id,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/schedules/:id/assign', async (req: Request, res: Response) => {
  try {
    const { employeeId, date, shift } = req.body;
    const assignment = await rhService.assignToSchedule(
      req.params.id,
      employeeId,
      new Date(date),
      shift
    );
    res.status(201).json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/schedules/swap', async (req: Request, res: Response) => {
  try {
    const { assignment1Id, assignment2Id } = req.body;
    const result = await rhService.swapShifts(assignment1Id, assignment2Id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;

