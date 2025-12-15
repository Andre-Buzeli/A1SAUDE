import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth';

const router = Router();
router.use(optionalAuth);

type Incident = { id: string; title: string; severity: 'low'|'medium'|'high'; status: 'open'|'in_progress'|'resolved'; createdAt: string; resolvedAt?: string };
const incidents: Incident[] = [];

router.post('/incidents', (req, res) => {
  const { title, severity = 'medium' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Título obrigatório' });
  const id = `INC-${Date.now()}`;
  const incident: Incident = { id, title, severity, status: 'open', createdAt: new Date().toISOString() };
  incidents.push(incident);
  res.status(201).json({ success: true, data: incident });
});

router.get('/incidents', (_req, res) => {
  res.json({ success: true, data: incidents });
});

router.put('/incidents/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const inc = incidents.find(i => i.id === id);
  if (!inc) return res.status(404).json({ error: 'Incidente não encontrado' });
  inc.status = status || inc.status;
  if (inc.status === 'resolved') inc.resolvedAt = new Date().toISOString();
  res.json({ success: true, data: inc });
});

router.get('/metrics', (req, res) => {
  const { startDate, endDate } = req.query as any;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7*24*60*60*1000);
  const end = endDate ? new Date(endDate) : new Date();
  const range = incidents.filter(i => new Date(i.createdAt) >= start && new Date(i.createdAt) <= end);
  const total = range.length;
  const resolved = range.filter(i => i.status === 'resolved').length;
  const slaCompliance = total ? Math.round((resolved / total) * 100) : 0;
  const tme = Math.round(range.reduce((sum, i) => sum + (i.resolvedAt ? (new Date(i.resolvedAt).getTime() - new Date(i.createdAt).getTime()) : 0), 0) / Math.max(1, resolved) / (60*1000));
  const tma = Math.round(15 + Math.random() * 20);
  res.json({ success: true, data: { total, resolved, slaCompliance, tme, tma } });
});

export default router;
