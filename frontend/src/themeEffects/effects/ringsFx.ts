/* ringsFx – expanding speech / bass arcs (bavard, voix-grave) */
import { Fx, pick, rand, TAU } from '../shared';

export function ringsFx(colors: string[], thick: number, rate: number, centered: boolean): Fx {
  let rings: { x: number; y: number; r: number; life: number; color: string; w: number }[] = [];
  let tm = 0;
  return {
    init() { rings = []; tm = 0; },
    frame(ctx, w, h, _t, dt) {
      tm += dt;
      if (tm > rate && rings.length < 25) {
        tm = 0;
        const ox = centered ? w / 2 + rand(-30, 30) : rand(w * 0.15, w * 0.85);
        const oy = centered ? h / 2 + rand(-30, 30) : rand(h * 0.15, h * 0.85);
        rings.push({ x: ox, y: oy, r: 5, life: 1, color: pick(colors), w: thick });
      }
      rings = rings.filter(r => {
        r.life -= dt * 0.7; r.r += dt * 250;
        if (r.life <= 0) return false;
        ctx.save(); ctx.globalAlpha = r.life * 0.6;
        ctx.strokeStyle = r.color; ctx.lineWidth = r.w * r.life;
        ctx.shadowColor = r.color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.stroke();
        ctx.restore(); return true;
      });
    },
  };
}
