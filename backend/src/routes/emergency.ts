import { Router } from 'express';
import { emergencyService } from '../services/EmergencyService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await emergencyService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting emergency dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get Manchester colors
router.get('/manchester-colors', async (req, res) => {
  try {
    const colors = emergencyService.getManchesterColors();
    res.json({ success: true, data: colors });
  } catch (error) {
    console.error('Error getting manchester colors:', error);
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
    const queue = await emergencyService.getQueue(establishmentId as string);
    res.json({ success: true, data: queue });
  } catch (error) {
    console.error('Error getting emergency queue:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get waiting by priority
router.get('/waiting-by-priority', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const waiting = await emergencyService.getWaitingByPriority(establishmentId as string);
    res.json({ success: true, data: waiting });
  } catch (error) {
    console.error('Error getting waiting by priority:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get observation patients
router.get('/observation', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const patients = await emergencyService.getObservation(establishmentId as string);
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error('Error getting observation patients:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List
router.get('/', async (req, res) => {
  try {
    const { establishmentId, patientId, manchesterColor, status, disposition, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await emergencyService.list({
      establishmentId: establishmentId as string,
      patientId: patientId as string,
      manchesterColor: manchesterColor as string,
      status: status as string,
      disposition: disposition as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing emergency attendances:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await emergencyService.getById(id);
    if (!attendance) {
      return res.status(404).json({ success: false, error: { message: 'Atendimento não encontrado' } });
    }
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error getting emergency attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const attendance = await emergencyService.create(req.body);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error creating emergency attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await emergencyService.update(id, req.body);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error updating emergency attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Start triage
router.post('/:id/start-triage', async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await emergencyService.startTriage(id);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error starting triage:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Complete triage
router.post('/:id/complete-triage', async (req, res) => {
  try {
    const { id } = req.params;
    const { manchesterColor } = req.body;
    const attendance = await emergencyService.completeTriage(id, manchesterColor);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error completing triage:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Start medical attendance
router.post('/:id/start-medical', async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await emergencyService.startMedicalAttendance(id);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error starting medical attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Move to observation
router.post('/:id/observation', async (req, res) => {
  try {
    const { id } = req.params;
    const { bedId } = req.body;
    const attendance = await emergencyService.moveToObservation(id, bedId);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error moving to observation:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Complete attendance
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { disposition, notes } = req.body;
    const attendance = await emergencyService.completeAttendance(id, disposition, notes);
    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error completing attendance:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

