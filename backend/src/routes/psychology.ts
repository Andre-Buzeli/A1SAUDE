import { Router } from 'express';
import { PsychologyController } from '../controllers/PsychologyController';
import { authenticateToken as authenticate } from '../middleware/auth';

const router = Router();
const psychologyController = new PsychologyController();

// Aplicar autenticação em todas as rotas
router.use(authenticate);

// Dashboard
router.get('/dashboard/:establishmentType', (req, res) => 
  psychologyController.getDashboard(req, res)
);

// Pacientes
router.get('/patients', (req, res) => 
  psychologyController.getPatients(req, res)
);

// Sessões
router.get('/sessions', (req, res) => 
  psychologyController.getSessions(req, res)
);

// Avaliações
router.get('/evaluations', (req, res) => 
  psychologyController.getEvaluations(req, res)
);

router.post('/evaluations', (req, res) => 
  psychologyController.createEvaluation(req, res)
);

// Alertas de Saúde Mental
router.get('/mental-health-alerts', (req, res) => 
  psychologyController.getMentalHealthAlerts(req, res)
);

// Relatórios
router.get('/reports', (req, res) => 
  psychologyController.getPsychologyReports(req, res)
);

export default router;