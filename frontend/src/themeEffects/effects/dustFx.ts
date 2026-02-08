/* dustFx – vintage film grain + motes (vieux) */
import { Fx, Particle, mp, pick, rand } from '../shared';

export function dustFx(colors: string[]): Fx {
  let motes: Particle[] = [];
  return {
    init(w, h) {
      motes = [];
      for (let i = 0; i < 50; i++)
        motes.push(mp({
          x: rand(0, w), y: rand(0, h), vx: rand(-6, 6), vy: rand(-12, -2),
          life: rand(0, 1), maxLife: rand(4, 12), size: rand(0.5, 2),
          color: pick(colors), a: rand(0, Math.PI * 2),
        }));
    },
    frame(ctx, w, h, t, dt) {
      // Sepia overlay
      ctx.save(); ctx.globalAlpha = 0.04;
      ctx.fillStyle = '#704214'; ctx.fillRect(0, 0, w, h); ctx.restore();
      // Sparse noise grain
      ctx.save();
      for (let i = 0; i < 80; i++) {
        ctx.globalAlpha = rand(0.02, 0.08);
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        ctx.fillRect(rand(0, w), rand(0, h), 1, 1);
      }
      ctx.restore();
      // Film scratches
      if (Math.random() < 0.08) {
        ctx.save(); ctx.globalAlpha = 0.12;
        ctx.strokeStyle = '#d4c5a9'; ctx.lineWidth = 0.5;
        const sx = rand(0, w);
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + rand(-8, 8), h);
        ctx.stroke(); ctx.restore();
      }
      // Vignette corners
      if (Math.random() < 0.03) {
        ctx.save(); ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w * 0.15, h);
        ctx.fillRect(w * 0.85, 0, w * 0.15, h);
        ctx.restore();
      }
      // Motes
      for (const m of motes) {
        m.x += m.vx * dt + Math.sin(t + m.a) * 4 * dt;
        m.y += m.vy * dt;
        m.life -= dt / m.maxLife;
        if (m.life <= 0) { m.x = rand(0, w); m.y = h + 10; m.life = 1; m.maxLife = rand(4, 12); }
        ctx.save(); ctx.globalAlpha = Math.min(m.life * 2, 1) * 0.45;
        ctx.fillStyle = m.color;
        ctx.fillRect(m.x, m.y, m.size, m.size);
        ctx.restore();
      }
    },
  };
}
