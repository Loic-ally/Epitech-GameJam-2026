/* chaosFx – multi-effect madness (fou) */
import { Fx, pick } from '../shared';
import { lightningFx } from './lightningFx';
import { sparkleFx } from './sparkleFx';
import { confettiFx } from './confettiFx';

export function chaosFx(): Fx {
  const rainbow = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0077ff', '#8800ff', '#ff00ff'];
  let subs: Fx[] = [];
  return {
    init(w, h) {
      subs = [
        lightningFx(rainbow, 0.15, 3),
        sparkleFx(rainbow, 0.8),
        confettiFx(rainbow, false),
      ];
      subs.forEach(s => s.init(w, h));
    },
    frame(ctx, w, h, t, dt) {
      const shake = Math.sin(t * 30) * 3;
      ctx.save(); ctx.translate(shake, Math.cos(t * 25) * 2);
      subs.forEach(s => s.frame(ctx, w, h, t, dt));
      ctx.restore();
      if (Math.random() < 0.05) {
        ctx.save(); ctx.globalAlpha = 0.1;
        ctx.fillStyle = pick(rainbow);
        ctx.fillRect(0, 0, w, h); ctx.restore();
      }
    },
  };
}
