import { Router } from 'express';
import axios from 'axios';
import { optionalAuth } from '../middlewares/auth';

const router = Router();

router.use(optionalAuth);

router.get('/viacep/:cep', async (req, res) => {
  try {
    const cep = String(req.params.cep).replace(/\D/g, '');
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    res.json({ success: true, data });
  } catch (error) {
    res.status(502).json({ error: 'Falha na integração ViaCEP' });
  }
});

router.get('/ibge/municipios', async (req, res) => {
  try {
    const uf = String(req.query.uf || '').toUpperCase();
    const { data } = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    const municipios = Array.isArray(data) ? data.map((m: any) => ({ id: m.id, nome: m.nome })) : [];
    res.json({ success: true, data: municipios });
  } catch (error) {
    res.status(502).json({ error: 'Falha na integração IBGE' });
  }
});

router.post('/whatsapp/send', async (req, res) => {
  try {
    const { to, message } = req.body || {};
    if (!to || !message) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }
    res.json({ success: true, data: { to, status: 'queued' } });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao enviar mensagem' });
  }
});

export default router;

// ====== Advanced health integrations (stubs) ======
router.post('/sisreg/transfer', async (req, res) => {
  try {
    const { patientId, destination, priority, documents } = req.body || {};
    if (!patientId || !destination) return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes' });
    res.json({ success: true, data: { protocol: `SR-${Date.now()}`, status: 'submitted', destination, priority, documents } });
  } catch {
    res.status(500).json({ error: 'Falha SISREG (stub)' });
  }
});

router.get('/gal/orders', async (_req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch {
    res.status(500).json({ error: 'Falha GAL (stub)' });
  }
});

router.post('/gal/push-result', async (req, res) => {
  try {
    const { orderId, results } = req.body || {};
    if (!orderId || !results) return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes' });
    res.json({ success: true, data: { orderId, accepted: true } });
  } catch {
    res.status(500).json({ error: 'Falha GAL (stub)' });
  }
});

router.get('/cnes/profissionais', async (_req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch {
    res.status(500).json({ error: 'Falha CNES (stub)' });
  }
});

router.get('/cnes/estrutura', async (_req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch {
    res.status(500).json({ error: 'Falha CNES (stub)' });
  }
});

router.get('/sipni/vacinas', async (_req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch {
    res.status(500).json({ error: 'Falha SI-PNI (stub)' });
  }
});

router.post('/sipni/registro', async (req, res) => {
  try {
    const { patientId, vaccineCode, dose, date } = req.body || {};
    if (!patientId || !vaccineCode || !dose) return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes' });
    res.json({ success: true, data: { receipt: `PNI-${Date.now()}`, patientId, vaccineCode, dose, date: date || new Date().toISOString() } });
  } catch {
    res.status(500).json({ error: 'Falha SI-PNI (stub)' });
  }
});
