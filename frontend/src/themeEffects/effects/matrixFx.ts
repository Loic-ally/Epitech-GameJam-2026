/* matrixFx – falling character columns (magrehb-united) */
import { Fx, pick, rand } from '../shared';

export function matrixFx(colors: string[], chars: string): Fx {
  let cols: { x: number; drops: { ch: string; y: number; spd: number; a: number }[] }[] = [];
  return {
    init(w, h) {
      cols = [];
      const cw = 18, nc = Math.ceil(w / cw);
      for (let i = 0; i < nc; i++) {
        const c: typeof cols[0] = { x: i * cw + cw / 2, drops: [] };
        for (let j = 0; j < Math.floor(rand(2, 12)); j++)
          c.drops.push({
            ch: chars[Math.floor(Math.random() * chars.length)],
            y: rand(-h, h), spd: rand(80, 280), a: rand(0.2, 1),
          });
        cols.push(c);
      }
    },
    frame(ctx, w, h, _t, dt) {
      ctx.font = '15px monospace'; ctx.textAlign = 'center';
      for (const col of cols) {
        for (const d of col.drops) {
          d.y += d.spd * dt;
          if (d.y > h + 20) {
            d.y = -20;
            d.ch = chars[Math.floor(Math.random() * chars.length)];
            d.a = rand(0.2, 1);
          }
          if (Math.random() < 0.02)
            d.ch = chars[Math.floor(Math.random() * chars.length)];
          ctx.save(); ctx.globalAlpha = d.a;
          ctx.fillStyle = pick(colors); ctx.shadowColor = pick(colors);
          ctx.shadowBlur = 6; ctx.fillText(d.ch, col.x, d.y);
          ctx.restore();
        }
      }
    },
  };
}
