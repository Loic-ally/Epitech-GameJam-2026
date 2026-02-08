/* crowdFx – grouped cluster streams (jamais-a-tek) */
import { Fx, Particle, mp, pick, rand, TAU } from '../shared';

export function crowdFx(colors: string[]): Fx {
  let groups: { ps: Particle[]; cx: number; cy: number; vx: number; vy: number }[] = [];
  return {
    init(w, h) {
      groups = [];
      for (let g = 0; g < 6; g++) {
        const gcx = rand(0, w), gcy = rand(0, h);
        const gvx = rand(-40, 40), gvy = rand(-40, 40);
        const grp: typeof groups[0] = { ps: [], cx: gcx, cy: gcy, vx: gvx, vy: gvy };
        const c = pick(colors);
        for (let i = 0; i < 8; i++)
          grp.ps.push(mp({
            x: gcx + rand(-30, 30), y: gcy + rand(-30, 30),
            vx: rand(-10, 10), vy: rand(-10, 10),
            life: rand(0, 1), maxLife: rand(2, 6), size: rand(2, 5), color: c, a: rand(0, TAU),
          }));
        groups.push(grp);
      }
    },
    frame(ctx, w, h, t, dt) {
      for (const g of groups) {
        g.cx += g.vx * dt; g.cy += g.vy * dt;
        if (g.cx < 0 || g.cx > w) g.vx *= -1;
        if (g.cy < 0 || g.cy > h) g.vy *= -1;
        for (const p of g.ps) {
          p.x += (g.cx + Math.sin(t + p.a) * 20 - p.x) * dt * 2 + p.vx * dt;
          p.y += (g.cy + Math.cos(t + p.a) * 20 - p.y) * dt * 2 + p.vy * dt;
          p.life -= dt / p.maxLife;
          if (p.life <= 0) { p.life = 1; p.maxLife = rand(2, 6); }
          const al = Math.min(p.life * 3, 1) * 0.7;
          ctx.save(); ctx.globalAlpha = al;
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s, p.y);
          ctx.lineTo(p.x, p.y + s); ctx.lineTo(p.x - s, p.y);
          ctx.closePath(); ctx.fill(); ctx.restore();
        }
        // Connections within group
        ctx.save(); ctx.globalAlpha = 0.15;
        ctx.strokeStyle = g.ps[0]?.color || '#fff'; ctx.lineWidth = 0.5;
        for (let i = 0; i < g.ps.length; i++) {
          for (let j = i + 1; j < g.ps.length; j++) {
            const d = Math.hypot(g.ps[i].x - g.ps[j].x, g.ps[i].y - g.ps[j].y);
            if (d < 80) {
              ctx.beginPath();
              ctx.moveTo(g.ps[i].x, g.ps[i].y);
              ctx.lineTo(g.ps[j].x, g.ps[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }
    },
  };
}
