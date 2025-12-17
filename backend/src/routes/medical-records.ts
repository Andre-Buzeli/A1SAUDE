import { Router } from 'express';
import { MedicalRecordsController } from '../controllers/MedicalRecordsController';
import { authenticateToken } from '../middleware/auth';
import { checkAnyPermission } from '../middleware/permissions';

const router = Router();
const controller = new MedicalRecordsController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/v1/medical-records/evolution - Salvar evolução SOAP
router.post('/evolution',
  checkAnyPermission(['medico:write', 'enfermeiro:write']),
  async (req, res) => {
    try {
      const result = await controller.saveEvolution(req.body, req.user!);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Evolução salva com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao salvar evolução:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Erro ao salvar evolução',
          code: 'EVOLUTION_SAVE_FAILED'
        }
      });
    }
  }
);

// GET /api/v1/medical-records/:patientId/history - Obter histórico de atendimentos
router.get('/:patientId/history',
  checkAnyPermission(['medico:read', 'enfermeiro:read', 'recepcionista:read']),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await controller.getPatientHistory(
        patientId,
        req.user!,
        { page: Number(page), limit: Number(limit) }
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Histórico obtido com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao obter histórico:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Erro ao obter histórico',
          code: 'HISTORY_FETCH_FAILED'
        }
      });
    }
  }
);

// GET /api/v1/medical-records/:patientId/prescriptions - Obter prescrições ativas
router.get('/:patientId/prescriptions',
  checkAnyPermission(['medico:read', 'enfermeiro:read', 'farmaceutico:read']),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const prescriptions = await controller.getActivePrescriptions(patientId, req.user!);

      res.status(200).json({
        success: true,
        data: prescriptions,
        message: 'Prescrições obtidas com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao obter prescrições:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Erro ao obter prescrições',
          code: 'PRESCRIPTIONS_FETCH_FAILED'
        }
      });
    }
  }
);

// GET /api/v1/medical-records/:patientId/exams - Obter exames solicitados/resultados
router.get('/:patientId/exams',
  checkAnyPermission(['medico:read', 'enfermeiro:read']),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const exams = await controller.getPatientExams(patientId, req.user!);

      res.status(200).json({
        success: true,
        data: exams,
        message: 'Exames obtidos com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao obter exames:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Erro ao obter exames',
          code: 'EXAMS_FETCH_FAILED'
        }
      });
    }
  }
);

// GET /api/v1/medical-records/:patientId/documents - Obter documentos/anexos
router.get('/:patientId/documents',
  checkAnyPermission(['medico:read', 'enfermeiro:read', 'recepcionista:read']),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const documents = await controller.getPatientDocuments(patientId, req.user!);

      res.status(200).json({
        success: true,
        data: documents,
        message: 'Documentos obtidos com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao obter documentos:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Erro ao obter documentos',
          code: 'DOCUMENTS_FETCH_FAILED'
        }
      });
    }
  }
);

// POST /api/v1/medical-records/prescription - Criar prescrição
router.post('/prescription',
  checkAnyPermission(['medico:write']),
  async (req, res) => {
    try {
      const result = await controller.createPrescription(req.body, req.user!);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Prescrição criada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao criar prescrição:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Erro ao criar prescrição',
          code: 'PRESCRIPTION_CREATE_FAILED'
        }
      });
    }
  }
);

// POST /api/v1/medical-records/exam-request - Solicitar exame
router.post('/exam-request',
  checkAnyPermission(['medico:write']),
  async (req, res) => {
    try {
      const result = await controller.requestExam(req.body, req.user!);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Exame solicitado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao solicitar exame:', error);
      res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Erro ao solicitar exame',
          code: 'EXAM_REQUEST_FAILED'
        }
      });
    }
  }
);

export default router;









