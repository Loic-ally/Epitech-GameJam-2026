/* burstFx – big bang explosion (bdg) */
import { Fx, Particle, mp, pick, rand, TAU } from '../shared';

export function burstFx(colors: string[]): Fx {
  let ps: Particle[] = [];
  let rings: { r: number; life: number; c: string }[] = [];
  let started = false; let startT = 0;
  return {
    init() { ps = []; rings = []; started = false; },
    frame(ctx, w, h, t, dt) {
      const cx = w / 2, cy = h / 2;
      if (!started) {
        started = true; startT = t;
        for (let i = 0; i < 150; i++) {
          const ang = rand(0, TAU), spd = rand(100, 900);
          ps.push(mp({
            x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            life: 1, maxLife: rand(0.6, 2.5), size: rand(1, 5), color: pick(colors),
          }));
        }
        rings.push({ r: 0, life: 1, c: '#fff' });
        rings.push({ r: 0, life: 1, c: pick(colors) });
      }
      const age = t - startT;
      if (age < 0.3) {
        ctx.save(); ctx.globalAlpha = 0.6 * (1 - age / 0.3);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.restore();
      }
      rings = rings.filter(r => {
        r.life -= dt * 1.2; r.r += dt * 1400;
        if (r.life <= 0) return false;
        ctx.save(); ctx.globalAlpha = r.life * 0.5;
        ctx.strokeStyle = r.c; ctx.lineWidth = 3 + r.life * 4;
        ctx.shadowColor = r.c; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(cx, cy, r.r, 0, TAU); ctx.stroke();
        ctx.restore(); return true;
      });
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0) return false;
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.save(); ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        const s = p.size * p.life;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        ctx.restore(); return true;
      });
    },
  };
}
