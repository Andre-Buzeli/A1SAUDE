import { Router } from 'express';
import { vaccinationService } from '../services/VaccinationService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await vaccinationService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting vaccination dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List vaccinations
router.get('/', async (req, res) => {
  try {
    const { establishmentId, patientId, vaccineName, status, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await vaccinationService.list({
      establishmentId: establishmentId as string,
      patientId: patientId as string,
      vaccineName: vaccineName as string,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing vaccinations:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient history
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const history = await vaccinationService.getPatientHistory(patientId);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error getting patient vaccination history:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get pending vaccinations for patient
router.get('/patient/:patientId/pending', async (req, res) => {
  try {
    const { patientId } = req.params;
    const pending = await vaccinationService.getPendingVaccinations(patientId);
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Error getting pending vaccinations:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get adverse reactions
router.get('/adverse-reactions', async (req, res) => {
  try {
    const { establishmentId, startDate, endDate } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const reactions = await vaccinationService.getAdverseReactions(
      establishmentId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    res.json({ success: true, data: reactions });
  } catch (error) {
    console.error('Error getting adverse reactions:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vaccination = await vaccinationService.getById(id);
    if (!vaccination) {
      return res.status(404).json({ success: false, error: { message: 'Vacinação não encontrada' } });
    }
    res.json({ success: true, data: vaccination });
  } catch (error) {
    console.error('Error getting vaccination:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create vaccination
router.post('/', async (req, res) => {
  try {
    const vaccination = await vaccinationService.create(req.body);
    res.status(201).json({ success: true, data: vaccination });
  } catch (error) {
    console.error('Error creating vaccination:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update vaccination
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vaccination = await vaccinationService.update(id, req.body);
    res.json({ success: true, data: vaccination });
  } catch (error) {
    console.error('Error updating vaccination:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Report adverse reaction
router.post('/:id/adverse-reaction', async (req, res) => {
  try {
    const { id } = req.params;
    const vaccination = await vaccinationService.reportAdverseReaction(id, req.body);
    res.json({ success: true, data: vaccination });
  } catch (error) {
    console.error('Error reporting adverse reaction:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Delete vaccination
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await vaccinationService.delete(id);
    res.json({ success: true, message: 'Vacinação removida com sucesso' });
  } catch (error) {
    console.error('Error deleting vaccination:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

