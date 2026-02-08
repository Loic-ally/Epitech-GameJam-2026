/* streakFx – horizontal speed lines (aer, muet) */
import { Fx, Particle, mp, pick, rand } from '../shared';

export function streakFx(colors: string[], speed: number, alpha: number, count: number): Fx {
  let ps: Particle[] = [];
  return {
    init(w, h) {
      ps = [];
      for (let i = 0; i < count; i++)
        ps.push(mp({
          x: rand(0, w), y: rand(0, h),
          vx: rand(speed * 0.6, speed), vy: rand(-8, 8),
          life: 1, maxLife: rand(0.4, 1.8), size: rand(0.5, 2.5),
          color: pick(colors), a: rand(60, 280),
        }));
    },
    frame(ctx, w, h, _t, dt) {
      for (const p of ps) {
        p.x += p.vx * dt; p.y += p.vy * dt * 2;
        p.life -= dt / p.maxLife;
        if (p.life <= 0 || p.x > w + p.a + 10) {
          p.x = -p.a; p.y = rand(0, h); p.life = 1;
          p.maxLife = rand(0.4, 1.8); p.color = pick(colors); p.a = rand(60, 280);
        }
        ctx.save(); ctx.globalAlpha = Math.min(p.life, 1) * alpha;
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size;
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.a, p.y);
        ctx.stroke(); ctx.restore();
      }
    },
  };
}
