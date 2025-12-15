import { Router } from 'express';
import { healthProgramService } from '../services/HealthProgramService';

const router = Router();

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const stats = await healthProgramService.getDashboardStats(establishmentId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting health programs dashboard:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// List programs
router.get('/', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const programs = await healthProgramService.getPrograms(establishmentId as string);
    res.json({ success: true, data: programs });
  } catch (error) {
    console.error('Error listing health programs:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get program by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const program = await healthProgramService.getProgramById(id);
    if (!program) {
      return res.status(404).json({ success: false, error: { message: 'Programa não encontrado' } });
    }
    res.json({ success: true, data: program });
  } catch (error) {
    console.error('Error getting health program:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Create program
router.post('/', async (req, res) => {
  try {
    const program = await healthProgramService.createProgram(req.body);
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    console.error('Error creating health program:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update program
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const program = await healthProgramService.updateProgram(id, req.body);
    res.json({ success: true, data: program });
  } catch (error) {
    console.error('Error updating health program:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// ============================================================================
// ENROLLMENTS
// ============================================================================

// List enrollments
router.get('/enrollments/list', async (req, res) => {
  try {
    const { establishmentId, programId, status, riskLevel, page, limit } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const result = await healthProgramService.listEnrollments({
      establishmentId: establishmentId as string,
      programId: programId as string,
      status: status as string,
      riskLevel: riskLevel as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error listing enrollments:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get pending visits
router.get('/enrollments/pending-visits', async (req, res) => {
  try {
    const { establishmentId, programId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const pending = await healthProgramService.getPendingVisits(
      establishmentId as string,
      programId as string
    );
    res.json({ success: true, data: pending });
  } catch (error) {
    console.error('Error getting pending visits:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get patient programs
router.get('/enrollments/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const programs = await healthProgramService.getPatientPrograms(patientId);
    res.json({ success: true, data: programs });
  } catch (error) {
    console.error('Error getting patient programs:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Enroll patient
router.post('/enrollments', async (req, res) => {
  try {
    const enrollment = await healthProgramService.enrollPatient(req.body);
    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    console.error('Error enrolling patient:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Get enrollment by ID
router.get('/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await healthProgramService.getEnrollmentById(id);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: { message: 'Inscrição não encontrada' } });
    }
    res.json({ success: true, data: enrollment });
  } catch (error) {
    console.error('Error getting enrollment:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Update enrollment
router.put('/enrollments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await healthProgramService.updateEnrollment(id, req.body);
    res.json({ success: true, data: enrollment });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// ============================================================================
// SPECIFIC PROGRAMS
// ============================================================================

// Hiperdia data
router.get('/hiperdia', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const data = await healthProgramService.getHiperdiaData(establishmentId as string);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting hiperdia data:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Prenatal data
router.get('/prenatal', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const data = await healthProgramService.getPrenatalData(establishmentId as string);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting prenatal data:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Childcare data
router.get('/childcare', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const data = await healthProgramService.getChildcareData(establishmentId as string);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting childcare data:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

// Elderly data
router.get('/elderly', async (req, res) => {
  try {
    const { establishmentId } = req.query;
    if (!establishmentId) {
      return res.status(400).json({ success: false, error: { message: 'establishmentId é obrigatório' } });
    }
    const data = await healthProgramService.getElderlyData(establishmentId as string);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error getting elderly data:', error);
    res.status(500).json({ success: false, error: { message: 'Erro interno do servidor' } });
  }
});

export default router;

