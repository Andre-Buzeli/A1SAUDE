import { Router } from 'express';
import { icuService } from '../services/ICUService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await icuService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting ICU dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get ventilation modes
router.get('/ventilation-modes', async (req, res) => {
  try {
    const modes = icuService.getVentilationModes();
    res.json({ success: true, data: modes });
  } catch (error) {
    console.error('Error getting ventilation modes:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get sedation levels
router.get('/sedation-levels', async (req, res) => {
  try {
    const levels = icuService.getSedationLevels();
    res.json({ success: true, data: levels });
  } catch (error) {
    console.error('Error getting sedation levels:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get active admissions
router.get('/active', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const admissions = await icuService.getActiveAdmissions(establishmentId as string);
    res.json({ success: true, data: admissions });
  } catch (error) {
    console.error('Error getting active ICU admissions:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get occupied beds
router.get('/occupied-beds', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const beds = await icuService.getOccupiedBeds(establishmentId as string);
    res.json({ success: true, data: beds });
  } catch (error) {
    console.error('Error getting occupied ICU beds:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List
router.get('/', async (req, res) => {
  try {
    const { establishmentId, patientId, status, admissionFrom, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await icuService.list({
      establishmentId: establishmentId as string,
      patientId: patientId as string,
      status: status as string,
      admissionFrom: admissionFrom as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing ICU admissions:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await icuService.getById(id);
    if (!admission) {
      return res.status(404).json({ success: false, error: { message: 'Admissão não encontrada' } });
    }
    res.json({ success: true, data: admission });
  } catch (error) {
    console.error('Error getting ICU admission:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const admission = await icuService.create(req.body);
    res.status(201).json({ success: true, data: admission });
  } catch (error) {
    console.error('Error creating ICU admission:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await icuService.update(id, req.body);
    res.json({ success: true, data: admission });
  } catch (error) {
    console.error('Error updating ICU admission:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update clinical status
router.put('/:id/clinical-status', async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await icuService.updateClinicalStatus(id, req.body);
    res.json({ success: true, data: admission });
  } catch (error) {
    console.error('Error updating ICU clinical status:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Change bed
router.post('/:id/change-bed', async (req, res) => {
  try {
    const { id } = req.params;
    const { newBedId, reason } = req.body;
    const admission = await icuService.changeBed(id, newBedId, reason);
    res.json({ success: true, data: admission });
  } catch (error) {
    console.error('Error changing ICU bed:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Discharge
router.post('/:id/discharge', async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await icuService.discharge(id, req.body);
    res.json({ success: true, data: admission });
  } catch (error) {
    console.error('Error discharging from ICU:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Transfer
router.post('/:id/transfer', async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await icuService.transfer(id, req.body);
    res.json({ success: true, data: admission });
  } catch (error) {
    console.error('Error transferring from ICU:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

