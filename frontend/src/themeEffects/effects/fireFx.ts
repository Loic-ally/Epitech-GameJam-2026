/* fireFx – rising flame particles (tchetchene, gourmand) */
import { Fx, Particle, mp, pick, rand, TAU } from '../shared';

export function fireFx(colors: string[], intensity: number, wide: boolean): Fx {
  let ps: Particle[] = []; let tm = 0;
  return {
    init() { ps = []; tm = 0; },
    frame(ctx, w, h, t, dt) {
      tm += dt;
      if (tm > 0.018 / intensity && ps.length < 280) {
        tm = 0;
        const xr = wide ? [w * 0.05, w * 0.95] : [w * 0.25, w * 0.75];
        for (let i = 0; i < 2; i++)
          ps.push(mp({
            x: rand(xr[0], xr[1]), y: h + rand(0, 15),
            vx: rand(-35, 35), vy: rand(-220, -60) * intensity,
            life: 1, maxLife: rand(0.4, 1.3), size: rand(3, 12),
            color: pick(colors), a: rand(0, TAU),
          }));
      }
      if (ps.length > 280) ps.splice(0, 30);
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0) return false;
        p.x += p.vx * dt + Math.sin(t * 10 + p.a) * 25 * dt;
        p.y += p.vy * dt; p.vy -= 60 * dt;
        const al = Math.pow(p.life, 1.5);
        const s = p.size * (0.2 + p.life * 0.8);
        ctx.save(); ctx.globalAlpha = al;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - s * 2);
        ctx.lineTo(p.x - s * 0.8, p.y + s);
        ctx.lineTo(p.x + s * 0.8, p.y + s);
        ctx.closePath(); ctx.fill(); ctx.restore();
        return true;
      });
    },
  };
}
