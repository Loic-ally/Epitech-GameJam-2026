/* sparkleFx – twinkling cross-flares (lunette, calvasse) */
import { Fx, Particle, mp, pick, rand, TAU } from '../shared';

export function sparkleFx(colors: string[], intensity: number): Fx {
  let ps: Particle[] = [];
  return {
    init(w, h) {
      ps = [];
      for (let i = 0; i < Math.floor(35 * intensity); i++)
        ps.push(mp({
          x: rand(0, w), y: rand(0, h), vx: rand(-8, 8), vy: rand(-8, 8),
          life: rand(0, 1), maxLife: rand(0.8, 2.5), size: rand(3, 8),
          color: pick(colors), a: rand(0, TAU),
        }));
    },
    frame(ctx, w, h, t, dt) {
      for (const p of ps) {
        p.life -= dt / p.maxLife; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life <= 0) {
          p.x = rand(0, w); p.y = rand(0, h); p.life = 1;
          p.maxLife = rand(0.8, 2.5); p.color = pick(colors); p.size = rand(3, 8);
        }
        const pulse = (Math.sin(t * 5 + p.a) + 1) * 0.5;
        const al = pulse * Math.min(p.life * 3, 1) * intensity;
        const fl = p.size * (0.5 + pulse * 0.5) * 3;
        ctx.save(); ctx.globalAlpha = al;
        ctx.strokeStyle = p.color; ctx.lineWidth = 1.5;
        ctx.shadowColor = p.color; ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(p.x - fl, p.y); ctx.lineTo(p.x + fl, p.y);
        ctx.moveTo(p.x, p.y - fl); ctx.lineTo(p.x, p.y + fl);
        const df = fl * 0.5;
        ctx.moveTo(p.x - df, p.y - df); ctx.lineTo(p.x + df, p.y + df);
        ctx.moveTo(p.x + df, p.y - df); ctx.lineTo(p.x - df, p.y + df);
        ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 4;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        ctx.restore();
      }
    },
  };
}
