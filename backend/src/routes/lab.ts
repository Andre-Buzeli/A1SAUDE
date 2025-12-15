import { Router } from 'express';
import { labService } from '../services/LabService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await labService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting lab dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get exam categories
router.get('/categories', async (req, res) => {
  try {
    const categories = labService.getExamCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error getting exam categories:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get worklist
router.get('/worklist', async (req, res) => {
  try {
    const { establishmentId, status } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const worklist = await labService.getWorklist(establishmentId as string, status as string);
    res.json({ success: true, data: worklist });
  } catch (error) {
    console.error('Error getting lab worklist:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get critical alerts
router.get('/critical-alerts', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const alerts = await labService.getCriticalAlerts(establishmentId as string);
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error getting critical alerts:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List exams
router.get('/', async (req, res) => {
  try {
    const { establishmentId, patientId, examCategory, status, isCritical, startDate, endDate, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await labService.list({
      establishmentId: establishmentId as string,
      patientId: patientId as string,
      examCategory: examCategory as string,
      status: status as string,
      isCritical: isCritical === 'true' ? true : isCritical === 'false' ? false : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing lab exams:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient history
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { examCategory } = req.query;
    const history = await labService.getPatientHistory(patientId, examCategory as string);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error getting patient lab history:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await labService.getById(id);
    if (!exam) {
      return res.status(404).json({ success: false, error: { message: 'Exame não encontrado' } });
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error getting lab exam:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create exam request
router.post('/', async (req, res) => {
  try {
    const exam = await labService.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    console.error('Error creating lab exam:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update exam
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await labService.update(id, req.body);
    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error updating lab exam:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Schedule exam
router.post('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledFor } = req.body;
    const exam = await labService.schedule(id, new Date(scheduledFor));
    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error scheduling lab exam:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Collect sample
router.post('/:id/collect', async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await labService.collect(id, req.body);
    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error collecting lab sample:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Start processing
router.post('/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await labService.process(id);
    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error processing lab exam:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Add results
router.post('/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await labService.addResults(id, req.body);
    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error adding lab results:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Validate results
router.post('/:id/validate', async (req, res) => {
  try {
    const { id } = req.params;
    const { validatedBy } = req.body;
    const exam = await labService.validate(id, validatedBy);
    res.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error validating lab exam:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Delete exam
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await labService.delete(id);
    res.json({ success: true, message: 'Exame removido com sucesso' });
  } catch (error) {
    console.error('Error deleting lab exam:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

