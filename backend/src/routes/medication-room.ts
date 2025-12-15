import { Router } from 'express';
import { medicationRoomService } from '../services/MedicationRoomService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await medicationRoomService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting medication room dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get queue
router.get('/queue', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const queue = await medicationRoomService.getQueue(establishmentId as string);
    res.json({ success: true, data: queue });
  } catch (error) {
    console.error('Error getting medication room queue:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List
router.get('/', async (req, res) => {
  try {
    const { establishmentId, patientId, status, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await medicationRoomService.list({
      establishmentId: establishmentId as string,
      patientId: patientId as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing medication room records:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient pending
router.get('/patient/:patientId/pending', async (req, res) => {
  try {
    const { patientId } = req.params;
    const pending = await medicationRoomService.getPendingForPatient(patientId);
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Error getting patient pending medications:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await medicationRoomService.getById(id);
    if (!record) {
      return res.status(404).json({ success: false, error: { message: 'Registro não encontrado' } });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error getting medication room record:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const record = await medicationRoomService.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('Error creating medication room record:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await medicationRoomService.update(id, req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error updating medication room record:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Start administration
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const { performedBy } = req.body;
    const record = await medicationRoomService.startAdministration(id, performedBy);
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error starting medication administration:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Complete administration
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await medicationRoomService.completeAdministration(id, req.body);
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error completing medication administration:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Cancel
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const record = await medicationRoomService.cancelAdministration(id, reason);
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error cancelling medication administration:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Patient refused
router.post('/:id/refuse', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const record = await medicationRoomService.refuseAdministration(id, reason);
    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Error refusing medication administration:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await medicationRoomService.delete(id);
    res.json({ success: true, message: 'Registro removido com sucesso' });
  } catch (error) {
    console.error('Error deleting medication room record:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

