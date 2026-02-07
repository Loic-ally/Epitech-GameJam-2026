/* bassFx – deep frequency visualization (voix-grave) */
import { Fx, pick } from '../shared';

export function bassFx(colors: string[]): Fx {
  return {
    init() {},
    frame(ctx, w, h, t, _dt) {
      const cy = h / 2;
      for (let l = 0; l < 5; l++) {
        const freq = 0.005 + l * 0.003;
        const amp = 30 + l * 15;
        const phase = t * (1 + l * 0.3);
        const col = colors[l % colors.length];
        ctx.save(); ctx.globalAlpha = 0.3 - l * 0.04;
        ctx.strokeStyle = col; ctx.lineWidth = 3 - l * 0.4;
        ctx.shadowColor = col; ctx.shadowBlur = 15;
        ctx.beginPath();
        for (let x = 0; x < w; x += 3) {
          const y = cy + Math.sin(x * freq + phase) * amp * Math.sin(t * 0.5 + l);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.restore();
      }
      // Pulsing center bar
      const pulse = Math.abs(Math.sin(t * 3));
      ctx.save(); ctx.globalAlpha = pulse * 0.1;
      ctx.fillStyle = pick(colors);
      ctx.fillRect(0, cy - 2, w, 4); ctx.restore();
    },
  };
}
