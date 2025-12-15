import { Router } from 'express';
import { dentalService } from '../services/DentalService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await dentalService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting dental dashboard:', error);
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
    const queue = await dentalService.getQueue(establishmentId as string);
    res.json({ success: true, data: queue });
  } catch (error) {
    console.error('Error getting dental queue:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List attendances
router.get('/', async (req, res) => {
  try {
    const { establishmentId, patientId, attendanceType, status, urgency, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await dentalService.list({
      establishmentId: establishmentId as string,
      patientId: patientId as string,
      attendanceType: attendanceType as string,
      status: status as string,
      urgency: urgency as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing dental attendances:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient history
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const history = await dentalService.getPatientHistory(patientId);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error getting patient dental history:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient odontogram
router.get('/patient/:patientId/odontogram', async (req, res) => {
  try {
    const { patientId } = req.params;
    const odontogram = await dentalService.getPatientOdontogram(patientId);
    res.json({ success: true, data: odontogram });
  } catch (error) {
    console.error('Error getting patient odontogram:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await dentalService.getById(id);
    if (!attendance) {
      return res.status(404).json({ success: false, error: { message: 'Atendimento não encontrado' } });
    }
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error getting dental attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create attendance
router.post('/', async (req, res) => {
  try {
    const attendance = await dentalService.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error creating dental attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update attendance
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await dentalService.update(id, req.body);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error updating dental attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Add procedure
router.post('/:id/procedures', async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await dentalService.addProcedure(id, req.body);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error adding dental procedure:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Delete attendance
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dentalService.delete(id);
    res.json({ success: true, message: 'Atendimento removido com sucesso' });
  } catch (error) {
    console.error('Error deleting dental attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

