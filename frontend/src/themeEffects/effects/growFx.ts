/* growFx – extending zigzag lines (menteur) */
import { Fx, BoltPt, drawPath, pick, rand, TAU } from '../shared';

export function growFx(colors: string[]): Fx {
  let lines: {
    pts: BoltPt[]; growth: number; maxLen: number;
    color: string; dir: number; life: number;
  }[] = [];
  let tm = 0;
  return {
    init() { lines = []; tm = 0; },
    frame(ctx, w, h, _t, dt) {
      const cx = w / 2, cy = h / 2;
      tm += dt;
      if (tm > 0.3 && lines.length < 15) {
        tm = 0;
        const dir = rand(0, TAU), maxLen = rand(100, 400);
        lines.push({ pts: [{ x: cx, y: cy }], growth: 0, maxLen, color: pick(colors), dir, life: 1 });
      }
      lines = lines.filter(l => {
        l.growth += dt * 300;
        while (l.pts.length < Math.floor(l.growth / 15) && l.growth < l.maxLen) {
          const last = l.pts[l.pts.length - 1];
          const jit = (Math.random() - 0.5) * 40;
          l.pts.push({
            x: last.x + Math.cos(l.dir) * 15 + Math.cos(l.dir + Math.PI / 2) * jit,
            y: last.y + Math.sin(l.dir) * 15 + Math.sin(l.dir + Math.PI / 2) * jit,
          });
        }
        if (l.growth >= l.maxLen) { l.life -= dt * 0.8; }
        if (l.life <= 0) return false;
        if (l.pts.length < 2) return true;
        const al = Math.min(l.life, 1);
        drawPath(ctx, l.pts, 4, l.color, 20, al * 0.2);
        drawPath(ctx, l.pts, 1.5, '#fff', 8, al * 0.7);
        return true;
      });
    },
  };
}
