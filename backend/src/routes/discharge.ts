import { Router } from 'express';
import { dischargeService } from '../services/DischargeService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await dischargeService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting discharge dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get discharge types
router.get('/types', async (req, res) => {
  try {
    const types = dischargeService.getDischargeTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('Error getting discharge types:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient conditions
router.get('/conditions', async (req, res) => {
  try {
    const conditions = dischargeService.getPatientConditions();
    res.json({ success: true, data: conditions });
  } catch (error) {
    console.error('Error getting patient conditions:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get pending discharges
router.get('/pending', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const pending = await dischargeService.getPending(establishmentId as string);
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Error getting pending discharges:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get today discharges
router.get('/today', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const discharges = await dischargeService.getTodayDischarges(establishmentId as string);
    res.json({ success: true, data: discharges });
  } catch (error) {
    console.error('Error getting today discharges:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List
router.get('/', async (req, res) => {
  try {
    const { establishmentId, patientId, dischargeType, patientCondition, status, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await dischargeService.list({
      establishmentId: establishmentId as string,
      patientId: patientId as string,
      dischargeType: dischargeType as string,
      patientCondition: patientCondition as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing discharges:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient history
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const history = await dischargeService.getPatientHistory(patientId);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error getting patient discharge history:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const discharge = await dischargeService.getById(id);
    if (!discharge) {
      return res.status(404).json({ success: false, error: { message: 'Alta não encontrada' } });
    }
    res.json({ success: true, data: discharge });
  } catch (error) {
    console.error('Error getting discharge:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const discharge = await dischargeService.create(req.body);
    res.status(201).json({ success: true, data: discharge });
  } catch (error) {
    console.error('Error creating discharge:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const discharge = await dischargeService.update(id, req.body);
    res.json({ success: true, data: discharge });
  } catch (error) {
    console.error('Error updating discharge:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Complete discharge
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const discharge = await dischargeService.complete(id);
    res.json({ success: true, data: discharge });
  } catch (error) {
    console.error('Error completing discharge:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Cancel discharge
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const discharge = await dischargeService.cancel(id, reason);
    res.json({ success: true, data: discharge });
  } catch (error) {
    console.error('Error cancelling discharge:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dischargeService.delete(id);
    res.json({ success: true, message: 'Alta removida com sucesso' });
  } catch (error) {
    console.error('Error deleting discharge:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

