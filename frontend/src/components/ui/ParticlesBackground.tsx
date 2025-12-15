import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const ParticlesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth * DPR;
      canvas.height = innerHeight * DPR;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      // Reset transform before applying DPR scale to avoid compounding
      if (typeof (ctx as any).resetTransform === 'function') {
        (ctx as any).resetTransform();
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Configuração de partículas
    const PARTICLE_COUNT = Math.max(80, Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 25000)));
    const CONNECT_DISTANCE = 140; // distância para conectar linhas
    const SPEED = 0.25; // velocidade suave

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
    }));

    const step = () => {
      // Clear in CSS pixel space (accounting for DPR transform)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Atualiza e desenha partículas
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap suave nas bordas
        if (p.x < -5) p.x = window.innerWidth + 5;
        if (p.x > window.innerWidth + 5) p.x = -5;
        if (p.y < -5) p.y = window.innerHeight + 5;
        if (p.y > window.innerHeight + 5) p.y = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Conexões entre partículas próximas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DISTANCE) {
            const alpha = (CONNECT_DISTANCE - dist) / CONNECT_DISTANCE;
            ctx.strokeStyle = `rgba(255,255,255,${0.12 * alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-70"
    />
  );
};

export default ParticlesBackground;
