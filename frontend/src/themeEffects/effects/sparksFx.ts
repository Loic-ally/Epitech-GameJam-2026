/* sparksFx – falling sparks with gravity (travail, coupe) */
import { Fx, Particle, mp, pick, rand } from '../shared';

export function sparksFx(colors: string[], gravity: number, spread: number): Fx {
  let ps: Particle[] = []; let tm = 0;
  return {
    init() { ps = []; tm = 0; },
    frame(ctx, w, h, _t, dt) {
      tm += dt;
      if (tm > 0.025 && ps.length < 200) {
        tm = 0;
        for (let i = 0; i < 3; i++)
          ps.push(mp({
            x: rand(w * 0.15, w * 0.85), y: rand(0, h * 0.08),
            vx: rand(-spread, spread), vy: rand(20, 80),
            life: 1, maxLife: rand(1, 2.5), size: rand(1, 3), color: pick(colors),
          }));
      }
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0) return false;
        p.vy += gravity * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.save(); ctx.globalAlpha = Math.min(p.life * 2, 1);
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.6;
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * dt * 4, p.y - p.vy * dt * 4);
        ctx.stroke();
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
        ctx.restore();
        return true;
      });
    },
  };
}
