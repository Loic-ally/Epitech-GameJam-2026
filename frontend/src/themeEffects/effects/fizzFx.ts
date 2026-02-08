/* fizzFx – upward effervescent sparks (zesti) */
import { Fx, Particle, mp, pick, rand, TAU } from '../shared';

export function fizzFx(colors: string[]): Fx {
  let ps: Particle[] = []; let tm = 0;
  return {
    init() { ps = []; tm = 0; },
    frame(ctx, w, h, t, dt) {
      tm += dt;
      if (tm > 0.03 && ps.length < 160) {
        tm = 0;
        for (let i = 0; i < 3; i++)
          ps.push(mp({
            x: rand(w * 0.1, w * 0.9), y: h + 5,
            vx: rand(-25, 25), vy: rand(-280, -80),
            life: 1, maxLife: rand(0.5, 1.8), size: rand(1, 4),
            color: pick(colors), a: rand(0, TAU),
          }));
      }
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0) return false;
        p.x += p.vx * dt + Math.sin(t * 12 + p.a) * 10 * dt;
        p.y += p.vy * dt;
        ctx.save(); ctx.globalAlpha = p.life * 0.8;
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.5;
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.sin(t * 20 + p.a) * 5, p.y + 8);
        ctx.lineTo(p.x - Math.sin(t * 20 + p.a) * 5, p.y + 16);
        ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 6;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        ctx.restore(); return true;
      });
    },
  };
}
