import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { UBSController } from '../controllers/UBSController';
import { UBSService } from '../services/UBSService';
import { authenticateToken, requireEstablishmentType, requireAnyPermission } from '../middlewares/auth.middleware';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const ubsService = new UBSService(prisma);
const ubsController = new UBSController(ubsService);

// All routes require authentication and UBS establishment
router.use(authenticateToken);
router.use(requireEstablishmentType(['ubs']));

// Agendamentos
router.post('/appointments',
  requireAnyPermission(['manage_attendances']),
  ubsController.createAppointment
);

router.get('/appointments',
  requireAnyPermission(['manage_attendances']),
  ubsController.getAppointments
);

router.put('/appointments/:id/status',
  requireAnyPermission(['manage_attendances']),
  ubsController.updateAppointmentStatus
);

router.put('/appointments/:id/cancel',
  requireAnyPermission(['manage_attendances']),
  ubsController.cancelAppointment
);

// Lembretes via WhatsApp (stub)
router.post('/appointments/:id/reminders',
  requireAnyPermission(['manage_attendances']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { to, type = 'pre24h', message } = req.body || {};
      if (!to) return res.status(400).json({ error: 'Destinatário obrigatório' });
      const text = message || (type === 'pre24h' ? 'Lembrete de consulta em 24h' : type === 'confirm' ? 'Confirme sua presença' : 'Obrigado pela consulta');
      // Em produção, integraria com provedor WhatsApp; aqui usamos stub do endpoint /integrations/whatsapp
      const axios = require('axios');
      await axios.post(`${process.env.API_BASE_URL || 'http://localhost:6001'}/api/v1/integrations/whatsapp/send`, { to, message: text });
      res.json({ success: true, data: { appointmentId: id, to, type, status: 'queued' } });
    } catch (error) {
      res.status(500).json({ error: 'Falha ao agendar lembrete' });
    }
  }
);

// Vacinações
router.post('/vaccinations',
  requireAnyPermission(['manage_attendances']),
  ubsController.recordVaccination
);

router.get('/vaccinations/history/:patientId',
  requireAnyPermission(['manage_attendances']),
  ubsController.getVaccinationHistory
);

router.get('/vaccinations/card/:patientId',
  requireAnyPermission(['manage_attendances']),
  ubsController.getVaccinationCard
);

router.get('/vaccinations/upcoming',
  requireAnyPermission(['medico:read', 'enfermeiro:read']),
  ubsController.getUpcomingVaccinations
);

// Estatísticas
router.get('/stats',
  requireAnyPermission(['medico:read', 'enfermeiro:read', 'gestor_geral:read']),
  ubsController.getUBSStats
);

export default router;
