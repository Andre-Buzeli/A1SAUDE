import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth';

const router = Router();
router.use(optionalAuth);

function zScore(series: number[]) {
  const n = series.length;
  if (!n) return { mean: 0, std: 0, z: [] };
  const mean = series.reduce((a,b)=>a+b,0) / n;
  const variance = series.reduce((a,b)=> a + Math.pow(b-mean,2), 0) / n;
  const std = Math.sqrt(variance);
  const z = series.map(x => std ? (x-mean)/std : 0);
  return { mean, std, z };
}

function estimateRt(incidence: number[], window = 7) {
  const rt: number[] = [];
  for (let t = window; t < incidence.length; t++) {
    const prev = incidence.slice(t-window, t).reduce((a,b)=>a+b,0) / window;
    const curr = incidence.slice(t-window+1, t+1).reduce((a,b)=>a+b,0) / window;
    rt.push(prev > 0 ? curr / prev : 0);
  }
  return rt;
}

router.get('/metrics', (req, res) => {
  const { series } = req.query as any;
  const arr = String(series || '').split(',').map(s => parseFloat(s)).filter(n => !isNaN(n));
  const z = zScore(arr);
  const rt = estimateRt(arr);
  res.json({ success: true, data: { z, rt } });
});

export default router;
