/* ══════════════════════════════════════════════════════════════
   shared.ts – Types, helpers & lightning primitives
   ══════════════════════════════════════════════════════════════ */

export type ThemeName =
  | 'aer' | 'lunette' | 'travail' | 'bdg' | 'bavard'
  | 'magrehb-united' | 'pas-de-dodo' | 'tranquilou'
  | 'moche' | 'calvasse' | 'chinois-de-la-caille'
  | 'fou' | 'gourmand' | 'vieux'
  | 'coupe-de-cheveux-supecte' | 'nain' | 'menteur'
  | 'muet' | 'jamais-a-tek' | 'zesti' | 'crack'
  | 'voix-grave' | 'tchetchene';

/* ── helpers ─────────────────────────── */
export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
export const TAU = Math.PI * 2;

export interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
  rot: number; rv: number;
  a: number; b: number;
  txt: string;
}

export const mp = (o: Partial<Particle> = {}): Particle => ({
  x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1, size: 1,
  color: '#fff', rot: 0, rv: 0, a: 0, b: 0, txt: '', ...o,
});

export interface Fx {
  init(w: number, h: number): void;
  frame(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number): void;
}

/* ══════════════════════════════════════
   LIGHTNING PRIMITIVES
   ══════════════════════════════════════ */
export interface BoltPt { x: number; y: number }
export interface Bolt {
  pts: BoltPt[]; branches: BoltPt[][];
  color: string; birth: number; lifetime: number;
}

export function zigzag(
  x1: number, y1: number, x2: number, y2: number,
  segs: number, jit: number,
): BoltPt[] {
  const pts: BoltPt[] = [{ x: x1, y: y1 }];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const t = i / segs, off = (Math.random() - 0.5) * 2 * jit;
    pts.push({ x: x1 + dx * t + nx * off, y: y1 + dy * t + ny * off });
  }
  pts.push({ x: x2, y: y2 });
  return pts;
}

export function mkBranches(main: BoltPt[], jit: number): BoltPt[][] {
  const out: BoltPt[][] = [];
  for (let i = 2; i < main.length - 1; i++) {
    if (Math.random() > 0.35) continue;
    const p = main[i];
    const ang = (Math.random() - 0.5) * Math.PI * 0.8 + Math.PI / 2;
    const length = 20 + Math.random() * 90;
    const sub = zigzag(p.x, p.y, p.x + Math.cos(ang) * length,
      p.y + Math.sin(ang) * length, 3 + Math.floor(Math.random() * 4), jit * 0.4);
    out.push(sub);
    if (Math.random() < 0.3 && sub.length > 2) {
      const sp = sub[Math.floor(sub.length / 2)];
      const sa = ang + (Math.random() - 0.5) * 1.2;
      const sl = 10 + Math.random() * 40;
      out.push(zigzag(sp.x, sp.y, sp.x + Math.cos(sa) * sl,
        sp.y + Math.sin(sa) * sl, 2 + Math.floor(Math.random() * 2), jit * 0.2));
    }
  }
  return out;
}

export function mkBolt(w: number, h: number, colors: string[]): Bolt {
  const x1 = w * (0.1 + Math.random() * 0.8), y1 = Math.random() * h * 0.08;
  const x2 = x1 + (Math.random() - 0.5) * w * 0.5, y2 = h * (0.5 + Math.random() * 0.5);
  const segs = 8 + Math.floor(Math.random() * 12), jit = 20 + Math.random() * 60;
  const main = zigzag(x1, y1, x2, y2, segs, jit);
  return {
    pts: main, branches: mkBranches(main, jit),
    color: pick(colors), birth: performance.now(), lifetime: 120 + Math.random() * 180,
  };
}

export function drawPath(
  ctx: CanvasRenderingContext2D, pts: BoltPt[],
  w: number, c: string, blur: number, a: number,
) {
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = c;
  ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = c; ctx.shadowBlur = blur;
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke(); ctx.restore();
}

export function drawBolt(ctx: CanvasRenderingContext2D, b: Bolt, a: number) {
  drawPath(ctx, b.pts, 14, b.color, 50, a * 0.12);
  drawPath(ctx, b.pts, 6, b.color, 25, a * 0.35);
  drawPath(ctx, b.pts, 2.5, '#fff', 12, a * 0.95);
  drawPath(ctx, b.pts, 1, '#fff', 4, a);
  for (const br of b.branches) {
    drawPath(ctx, br, 5, b.color, 20, a * 0.1);
    drawPath(ctx, br, 2, b.color, 10, a * 0.3);
    drawPath(ctx, br, 0.7, '#fff', 6, a * 0.65);
  }
}
