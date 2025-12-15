import { Router } from 'express';
import { minorSurgeryService } from '../services/MinorSurgeryService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await minorSurgeryService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting minor surgery dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get procedure types
router.get('/procedure-types', async (req, res) => {
  try {
    const types = minorSurgeryService.getProcedureTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    console.error('Error getting procedure types:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get today procedures
router.get('/today', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const procedures = await minorSurgeryService.getTodayProcedures(establishmentId as string);
    res.json({ success: true, data: procedures });
  } catch (error) {
    console.error('Error getting today procedures:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List
router.get('/', async (req, res) => {
  try {
    const { establishmentId, patientId, procedureType, status, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await minorSurgeryService.list({
      establishmentId: establishmentId as string,
      patientId: patientId as string,
      procedureType: procedureType as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing minor surgeries:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient history
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const history = await minorSurgeryService.getPatientHistory(patientId);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error getting patient minor surgery history:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const surgery = await minorSurgeryService.getById(id);
    if (!surgery) {
      return res.status(404).json({ success: false, error: { message: 'Procedimento não encontrado' } });
    }
    res.json({ success: true, data: surgery });
  } catch (error) {
    console.error('Error getting minor surgery:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const surgery = await minorSurgeryService.create(req.body);
    res.status(201).json({ success: true, data: surgery });
  } catch (error) {
    console.error('Error creating minor surgery:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const surgery = await minorSurgeryService.update(id, req.body);
    res.json({ success: true, data: surgery });
  } catch (error) {
    console.error('Error updating minor surgery:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Start procedure
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const surgery = await minorSurgeryService.start(id);
    res.json({ success: true, data: surgery });
  } catch (error) {
    console.error('Error starting minor surgery:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Complete procedure
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const surgery = await minorSurgeryService.complete(id, req.body);
    res.json({ success: true, data: surgery });
  } catch (error) {
    console.error('Error completing minor surgery:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Cancel procedure
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const surgery = await minorSurgeryService.cancel(id, reason);
    res.json({ success: true, data: surgery });
  } catch (error) {
    console.error('Error cancelling minor surgery:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await minorSurgeryService.delete(id);
    res.json({ success: true, message: 'Procedimento removido com sucesso' });
  } catch (error) {
    console.error('Error deleting minor surgery:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

