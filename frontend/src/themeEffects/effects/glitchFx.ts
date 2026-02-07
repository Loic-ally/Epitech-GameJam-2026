/* glitchFx – screen tearing + RGB split (moche, chinois) */
import { Fx, pick, rand } from '../shared';

export function glitchFx(colors: string[], neon: boolean): Fx {
  let blocks: { y: number; h: number; dx: number; color: string; life: number }[] = [];
  let tm = 0;
  return {
    init() { blocks = []; tm = 0; },
    frame(ctx, w, h, t, dt) {
      tm += dt;
      if (tm > 0.04 && blocks.length < 25) {
        tm = 0;
        blocks.push({
          y: rand(0, h), h: rand(2, h * 0.06), dx: rand(-50, 50),
          color: pick(colors), life: rand(0.03, 0.15),
        });
      }
      blocks = blocks.filter(b => {
        b.life -= dt; if (b.life <= 0) return false;
        ctx.save(); ctx.globalAlpha = neon ? 0.35 : 0.18;
        ctx.fillStyle = b.color;
        if (neon) { ctx.shadowColor = b.color; ctx.shadowBlur = 25; }
        ctx.fillRect(b.dx, b.y, w, b.h); ctx.restore();
        return true;
      });
      for (let i = 0; i < 6; i++) {
        const ly = rand(0, h);
        ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = pick(colors);
        ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(0, ly); ctx.lineTo(w, ly); ctx.stroke(); ctx.restore();
      }
      if (Math.random() < 0.08) {
        const txt = neon
          ? pick(['ネオン', '光', '電気', 'NEON', '街'])
          : pick(['ERR', 'GLITCH', '404', 'NULL', 'BRK']);
        const fx = rand(0, w), fy = rand(0, h);
        ctx.save(); ctx.font = `${rand(10, 22)}px monospace`; ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#f00'; ctx.fillText(txt, fx - 2, fy);
        ctx.fillStyle = '#0f0'; ctx.fillText(txt, fx + 2, fy + 1);
        ctx.fillStyle = '#00f'; ctx.fillText(txt, fx, fy - 1);
        ctx.restore();
      }
      // Occasional horizontal tear
      if (Math.random() < 0.06) {
        const ty = rand(0, h), th = rand(5, 30);
        ctx.save(); ctx.globalAlpha = 0.15;
        ctx.drawImage(ctx.canvas, 0, ty, w, th, rand(-20, 20), ty, w, th);
        ctx.restore();
      }
    },
  };
}
