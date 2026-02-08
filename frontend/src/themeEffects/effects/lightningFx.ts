/* lightningFx – electric bolts (crack, zesti-variant, fou) */
import { Fx, Bolt, mkBolt, drawBolt } from '../shared';

export function lightningFx(colors: string[], rate: number, burstCount: number): Fx {
  let bolts: Bolt[] = []; let flash = 0; let tm = 0; let burst = burstCount;
  return {
    init() { bolts = []; flash = 0; tm = 0; burst = burstCount; },
    frame(ctx, w, h, _t, dt) {
      if (burst > 0) {
        burst--;
        bolts.push(mkBolt(w, h, colors));
        flash = 0.2;
      }
      tm += dt;
      if (tm > rate) {
        tm = 0;
        bolts.push(mkBolt(w, h, colors));
        flash = 0.12 + Math.random() * 0.08;
      }
      if (flash > 0.005) {
        ctx.fillStyle = `rgba(200,220,255,${flash})`;
        ctx.fillRect(0, 0, w, h);
        flash *= 0.82;
      }
      const now = performance.now();
      bolts = bolts.filter(b => {
        const age = now - b.birth;
        if (age > b.lifetime) return false;
        const t2 = age / b.lifetime;
        const a = t2 < 0.08 ? t2 / 0.08 : Math.pow(1 - (t2 - 0.08) / 0.92, 2.5);
        drawBolt(ctx, b, a); return true;
      });
    },
  };
}
