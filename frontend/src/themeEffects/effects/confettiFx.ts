/* confettiFx – falling rotating shapes (nain) */
import { Fx, Particle, mp, pick, rand, TAU } from '../shared';

export function confettiFx(colors: string[], small: boolean): Fx {
  let ps: Particle[] = []; let tm = 0;
  return {
    init() { ps = []; tm = 0; },
    frame(ctx, w, h, t, dt) {
      tm += dt;
      if (tm > 0.06 && ps.length < 120) {
        tm = 0;
        ps.push(mp({
          x: rand(0, w), y: -10,
          vx: rand(-40, 40), vy: rand(50, 200),
          life: 1, maxLife: rand(2, 5),
          size: small ? rand(2, 5) : rand(4, 10),
          color: pick(colors), rot: rand(0, TAU), rv: rand(-3, 3),
          a: rand(0.5, 1.5), b: rand(0.3, 1),
        }));
      }
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0 || p.y > h + 20) return false;
        p.vy += 100 * dt;
        p.x += p.vx * dt + Math.sin(t * 3 + p.a) * 15 * dt;
        p.y += p.vy * dt; p.rot += p.rv * dt;
        ctx.save(); ctx.globalAlpha = Math.min(p.life * 2, 1) * 0.8;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 4;
        ctx.fillRect(-p.size * p.a / 2, -p.size * p.b / 2, p.size * p.a, p.size * p.b);
        ctx.restore(); return true;
      });
    },
  };
}
