import { Router } from 'express';
import { PhysiotherapistController } from '../controllers/PhysiotherapistController';
import { authenticateToken as authenticate } from '../middleware/auth';

const router = Router();
const physiotherapistController = new PhysiotherapistController();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// Dashboard
router.get('/dashboard/:establishmentType', (req, res) => 
  physiotherapistController.getDashboard(req, res)
);

// Pacientes
router.get('/patients', (req, res) => 
  physiotherapistController.getPatients(req, res)
);

// Sessões
router.get('/sessions', (req, res) => 
  physiotherapistController.getSessions(req, res)
);

// Avaliações
router.get('/evaluations', (req, res) => 
  physiotherapistController.getEvaluations(req, res)
);

router.post('/evaluations', (req, res) => 
  physiotherapistController.createEvaluation(req, res)
);

// Alertas de Reabilitação
router.get('/rehabilitation-alerts', (req, res) => 
  physiotherapistController.getRehabilitationAlerts(req, res)
);

// Relatórios
router.get('/reports', (req, res) => 
  physiotherapistController.getPhysiotherapyReports(req, res)
);

export default router;