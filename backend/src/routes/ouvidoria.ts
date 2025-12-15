import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth';

const router = Router();
router.use(optionalAuth);

type Manifestation = { id: string; type: 'complaint'|'suggestion'|'praise'; rating?: number; comment?: string; createdAt: string };
const manifestations: Manifestation[] = [];

router.post('/manifestations', (req, res) => {
  const { type = 'complaint', rating, comment } = req.body || {};
  const id = `OUV-${Date.now()}`;
  const m: Manifestation = { id, type, rating, comment, createdAt: new Date().toISOString() };
  manifestations.push(m);
  res.status(201).json({ success: true, data: m });
});

router.get('/manifestations', (_req, res) => {
  res.json({ success: true, data: manifestations });
});

router.get('/metrics', (_req, res) => {
  const total = manifestations.length;
  const ratings = manifestations.map(m => m.rating).filter(r => typeof r === 'number') as number[];
  const npsPromoters = ratings.filter(r => r >= 9).length;
  const npsDetractors = ratings.filter(r => r <= 6).length;
  const nps = Math.round(((npsPromoters - npsDetractors) / Math.max(1, ratings.length)) * 100);
  const sp = Math.round((ratings.reduce((a,b)=>a+b,0) / Math.max(1, ratings.length)) * 10) / 10;
  const tmr = Math.round(60 + Math.random() * 120); // minutos
  res.json({ success: true, data: { total, nps, sp, tmr } });
});

export default router;
