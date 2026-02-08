/* floatFx – gentle floating shapes (tranquilou, pas-de-dodo) */
import { Fx, Particle, mp, pick, rand, TAU } from '../shared';

export function floatFx(
  colors: string[], shape: 'diamond' | 'z' | 'feather',
  spd: number, cnt: number,
): Fx {
  let ps: Particle[] = [];
  return {
    init(w, h) {
      ps = [];
      for (let i = 0; i < cnt; i++)
        ps.push(mp({
          x: rand(0, w), y: rand(0, h), vx: rand(-spd, spd), vy: rand(-spd, spd),
          life: rand(0, 1), maxLife: rand(3, 8), size: rand(3, 9),
          color: pick(colors), a: rand(0, TAU), rot: rand(0, TAU), rv: rand(-0.5, 0.5),
        }));
    },
    frame(ctx, w, h, t, dt) {
      for (const p of ps) {
        p.x += p.vx * dt + Math.sin(t * 0.5 + p.a) * 12 * dt;
        p.y += p.vy * dt + Math.cos(t * 0.3 + p.a) * 10 * dt;
        p.rot += p.rv * dt;
        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          p.x = rand(0, w); p.y = rand(0, h);
          p.life = 1; p.maxLife = rand(3, 8); p.color = pick(colors);
        }
        const pulse = (Math.sin(t * 2 + p.a) + 1) * 0.25 + 0.5;
        const al = Math.min(p.life * 3, 1) * pulse;
        ctx.save(); ctx.globalAlpha = al;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (shape === 'z') {
          ctx.font = `bold ${p.size * 3}px monospace`;
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8;
          ctx.fillText('Z', 0, 0);
        } else if (shape === 'feather') {
          ctx.strokeStyle = p.color; ctx.lineWidth = 1.5;
          ctx.shadowColor = p.color; ctx.shadowBlur = 5;
          ctx.beginPath(); ctx.moveTo(-p.size * 1.5, 0);
          ctx.quadraticCurveTo(0, -p.size * 2, p.size * 1.5, 0);
          ctx.quadraticCurveTo(0, p.size * 0.5, -p.size * 1.5, 0);
          ctx.stroke();
        } else {
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 15;
          const s = p.size * pulse;
          ctx.beginPath();
          ctx.moveTo(0, -s); ctx.lineTo(s, 0);
          ctx.lineTo(0, s); ctx.lineTo(-s, 0);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
    },
  };
}
