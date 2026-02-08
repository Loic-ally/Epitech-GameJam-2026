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

/* ══════════════════════════════════════════════════════════════
   IMAGE OVERLAY COMPOSITING
   ══════════════════════════════════════════════════════════════ */

export type ImgStyle =
  | 'shake' | 'rise' | 'streak' | 'faint' | 'flare' | 'shimmer'
  | 'glitch' | 'neon' | 'drop' | 'sway' | 'drowsy'
  | 'explode' | 'pulse' | 'bounce' | 'grow' | 'cascade'
  | 'chaos' | 'sepia' | 'cluster' | 'fizz' | 'bass';

/** Empty Fx – does nothing. Useful as base for image-only overlays. */
export function nullFx(): Fx {
  return { init() {}, frame() {} };
}

function loadImg(src: string): HTMLImageElement {
  const img = new Image();
  img.src = src;
  return img;
}

function imgDims(img: HTMLImageElement, w: number, h: number): [number, number] {
  const maxSz = Math.min(w, h) * 0.38;
  const r = img.naturalWidth / img.naturalHeight;
  return r >= 1 ? [maxSz, maxSz / r] : [maxSz * r, maxSz];
}

/** Compose a base Fx with themed image overlay(s) */
export function withImageOverlay(base: Fx, srcs: string[], style: ImgStyle): Fx {
  const imgs = srcs.map(loadImg);
  return {
    init(w, h) { base.init(w, h); },
    frame(ctx, w, h, t, dt) {
      base.frame(ctx, w, h, t, dt);
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        if (!img.complete || !img.naturalWidth) continue;
        renderStyledImg(ctx, img, w, h, t, style, i, imgs.length);
      }
    },
  };
}

function renderStyledImg(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement,
  w: number, h: number, t: number,
  style: ImgStyle, idx: number, total: number,
) {
  const [iw, ih] = imgDims(img, w, h);
  let x = (w - iw) / 2;
  let y = (h - ih) / 2;

  if (total > 1) {
    const gap = iw * 0.15;
    const totalW = total * iw + (total - 1) * gap;
    x = (w - totalW) / 2 + idx * (iw + gap);
  }

  ctx.save();

  switch (style) {
    case 'shake':
      x += Math.sin(t * 30) * 10;
      y += Math.cos(t * 25) * 8;
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 25 + Math.sin(t * 10) * 12;
      ctx.drawImage(img, x, y, iw, ih);
      break;

    case 'rise': {
      const c = (t * 0.25 + idx * 0.3) % 1;
      y = h * (1.1 - c * 1.3);
      ctx.globalAlpha = Math.sin(c * Math.PI) * 0.75;
      ctx.drawImage(img, x, y, iw, ih);
      break;
    }

    case 'streak': {
      const sx = ((t * 350 + idx * w * 0.5) % (w + iw * 2)) - iw;
      ctx.globalAlpha = 0.75;
      ctx.shadowColor = '#88ddff'; ctx.shadowBlur = 18;
      ctx.drawImage(img, sx, y, iw, ih);
      break;
    }

    case 'faint':
      ctx.globalAlpha = 0.12 + Math.sin(t * 1.5) * 0.06;
      ctx.drawImage(img, x, y, iw, ih);
      break;

    case 'flare':
      ctx.globalAlpha = 0.75 + Math.sin(t * 3) * 0.2;
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 35 + Math.sin(t * 4) * 18;
      ctx.drawImage(img, x, y, iw, ih);
      break;

    case 'shimmer': {
      const sh = Math.sin(t * 6) * 0.3 + 0.65;
      ctx.globalAlpha = sh;
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 25 + Math.sin(t * 8) * 12;
      x += Math.sin(t * 2) * 3;
      ctx.drawImage(img, x, y, iw, ih);
      break;
    }

    case 'glitch': {
      const off = Math.random() < 0.2 ? rand(-20, 20) : 0;
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.25;
      ctx.drawImage(img, x + off - 5, y, iw, ih);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.85;
      ctx.drawImage(img, x + off, y, iw, ih);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.2;
      ctx.drawImage(img, x + off + 5, y + 2, iw, ih);
      break;
    }

    case 'neon':
      ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 45;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, x, y, iw, ih);
      ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 30;
      ctx.globalAlpha = 0.3;
      ctx.drawImage(img, x, y, iw, ih);
      break;

    case 'drop': {
      const dc = (t * 0.4 + idx * 0.4) % 1;
      y = -ih + dc * (h + ih * 2);
      ctx.globalAlpha = Math.sin(dc * Math.PI) * 0.8;
      ctx.drawImage(img, x, y, iw, ih);
      break;
    }

    case 'sway':
      x += Math.sin(t * 0.7) * 35;
      y += Math.cos(t * 0.4) * 25;
      ctx.globalAlpha = 0.55 + Math.sin(t) * 0.2;
      ctx.translate(x + iw / 2, y + ih / 2);
      ctx.rotate(Math.sin(t * 0.5) * 0.1);
      ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      break;

    case 'drowsy': {
      const d = (Math.sin(t * 0.4) + 1) * 0.5;
      ctx.globalAlpha = d * 0.45;
      y += Math.sin(t * 0.25) * 20;
      ctx.drawImage(img, x, y, iw, ih);
      break;
    }

    case 'explode': {
      const age = t % 3.5;
      const s = age < 0.3 ? 0.2 + (age / 0.3) * 1.8
        : age < 1 ? 2 - (age - 0.3)
        : 1 + Math.sin(t * 2) * 0.05;
      ctx.globalAlpha = age < 0.1 ? age * 10 : age < 3 ? 0.9 : Math.max(0, (3.5 - age) * 2);
      ctx.translate(w / 2, h / 2);
      ctx.scale(s, s);
      if (age < 0.4) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 60; }
      ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      break;
    }

    case 'pulse': {
      const ps = 1 + Math.sin(t * 4) * 0.1;
      ctx.globalAlpha = 0.65 + Math.sin(t * 4) * 0.25;
      ctx.shadowColor = '#00e676'; ctx.shadowBlur = 18 + Math.sin(t * 4) * 12;
      ctx.translate(x + iw / 2, y + ih / 2);
      ctx.scale(ps, ps);
      ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      break;
    }

    case 'bounce': {
      const bt = t * 2.5;
      const by = Math.abs(Math.sin(bt)) * h * 0.25;
      y = h * 0.55 - by - ih;
      const sq = 1 + Math.cos(bt) * 0.12;
      ctx.globalAlpha = 0.85;
      ctx.translate(x + iw / 2, y + ih);
      ctx.scale(1 / sq, sq);
      ctx.drawImage(img, -iw / 2, -ih, iw, ih);
      break;
    }

    case 'grow': {
      const gs = Math.min(t * 0.4, 1.15);
      ctx.globalAlpha = Math.min(t * 0.7, 0.85);
      ctx.shadowColor = '#ff1744'; ctx.shadowBlur = 18;
      ctx.translate(w / 2, h / 2);
      ctx.scale(gs, gs);
      ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      break;
    }

    case 'cascade': {
      const cy = ((t * 90 + idx * 250) % (h + ih * 2)) - ih;
      const cx = w * (0.25 + idx * 0.25);
      ctx.globalAlpha = 0.7;
      ctx.shadowColor = '#00ff41'; ctx.shadowBlur = 12;
      ctx.drawImage(img, cx, cy, iw * 0.8, ih * 0.8);
      break;
    }

    case 'chaos': {
      const cx = (Math.sin(t * 7 + idx * 3) * 0.5 + 0.5) * (w - iw);
      const cy = (Math.cos(t * 5 + idx * 2) * 0.5 + 0.5) * (h - ih);
      ctx.globalAlpha = 0.75 + Math.sin(t * 10) * 0.2;
      ctx.translate(cx + iw / 2, cy + ih / 2);
      ctx.rotate(t * 2);
      ctx.shadowColor = `hsl(${(t * 120) % 360},100%,50%)`; ctx.shadowBlur = 30;
      ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      break;
    }

    case 'sepia':
      ctx.globalAlpha = 0.55 + Math.sin(t * 0.4) * 0.15;
      x += Math.sin(t * 0.15) * 3;
      ctx.drawImage(img, x, y, iw, ih);
      break;

    case 'cluster': {
      const ang = t * 0.5 + idx * TAU / Math.max(total, 1);
      const rad = Math.min(w, h) * 0.12;
      const cx2 = w / 2 + Math.cos(ang) * rad - iw / 2;
      const cy2 = h / 2 + Math.sin(ang) * rad - ih / 2;
      ctx.globalAlpha = 0.8;
      ctx.shadowColor = '#7c4dff'; ctx.shadowBlur = 14;
      ctx.drawImage(img, cx2, cy2, iw, ih);
      break;
    }

    case 'fizz': {
      const fc = (t * 0.35 + idx * 0.4) % 1;
      y = h * (1.05 - fc * 1.2);
      x += Math.sin(t * 12) * 10;
      ctx.globalAlpha = Math.sin(fc * Math.PI) * 0.8;
      ctx.shadowColor = '#c6ff00'; ctx.shadowBlur = 16;
      ctx.drawImage(img, x, y, iw, ih);
      break;
    }

    case 'bass': {
      const bs = 1 + Math.sin(t * 3) * 0.18;
      ctx.globalAlpha = 0.6 + Math.abs(Math.sin(t * 3)) * 0.35;
      ctx.shadowColor = '#8e24aa'; ctx.shadowBlur = 25 + Math.sin(t * 3) * 18;
      ctx.translate(x + iw / 2, y + ih / 2);
      ctx.scale(bs, bs);
      ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      break;
    }

    default:
      ctx.globalAlpha = 0.7;
      ctx.drawImage(img, x, y, iw, ih);
  }

  ctx.restore();
}
