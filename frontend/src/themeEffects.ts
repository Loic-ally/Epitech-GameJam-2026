/* ══════════════════════════════════════════════════════════════
   themeEffects.ts – 23 unique theme animations for card reveal
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
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const TAU = Math.PI * 2;

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
  rot: number; rv: number;
  a: number; b: number;
  txt: string;
}

const mp = (o: Partial<Particle> = {}): Particle => ({
  x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1, size: 1,
  color: '#fff', rot: 0, rv: 0, a: 0, b: 0, txt: '', ...o,
});

interface Fx {
  init(w: number, h: number): void;
  frame(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number): void;
}

/* ══════════════════════════════════════
   LIGHTNING PRIMITIVES (crack / zesti / fou)
   ══════════════════════════════════════ */
interface BoltPt { x: number; y: number }
interface Bolt {
  pts: BoltPt[]; branches: BoltPt[][];
  color: string; birth: number; lifetime: number;
}

function zigzag(
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

function mkBranches(main: BoltPt[], jit: number): BoltPt[][] {
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

function mkBolt(w: number, h: number, colors: string[]): Bolt {
  const x1 = w * (0.1 + Math.random() * 0.8), y1 = Math.random() * h * 0.08;
  const x2 = x1 + (Math.random() - 0.5) * w * 0.5, y2 = h * (0.5 + Math.random() * 0.5);
  const segs = 8 + Math.floor(Math.random() * 12), jit = 20 + Math.random() * 60;
  const main = zigzag(x1, y1, x2, y2, segs, jit);
  return {
    pts: main, branches: mkBranches(main, jit),
    color: pick(colors), birth: performance.now(), lifetime: 120 + Math.random() * 180,
  };
}

function drawPath(
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

function drawBolt(ctx: CanvasRenderingContext2D, b: Bolt, a: number) {
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
   EFFECT FACTORIES
   ══════════════════════════════════════════════════════════════ */

/* ── 1. STREAK – horizontal speed lines (aer, muet) ────────── */
function streakFx(colors: string[], speed: number, alpha: number, count: number): Fx {
  let ps: Particle[] = [];
  return {
    init(w, h) {
      ps = [];
      for (let i = 0; i < count; i++)
        ps.push(mp({
          x: rand(0, w), y: rand(0, h),
          vx: rand(speed * 0.6, speed), vy: rand(-8, 8),
          life: 1, maxLife: rand(0.4, 1.8), size: rand(0.5, 2.5),
          color: pick(colors), a: rand(60, 280),
        }));
    },
    frame(ctx, w, h, _t, dt) {
      for (const p of ps) {
        p.x += p.vx * dt; p.y += p.vy * dt * 2;
        p.life -= dt / p.maxLife;
        if (p.life <= 0 || p.x > w + p.a + 10) {
          p.x = -p.a; p.y = rand(0, h); p.life = 1;
          p.maxLife = rand(0.4, 1.8); p.color = pick(colors); p.a = rand(60, 280);
        }
        ctx.save(); ctx.globalAlpha = Math.min(p.life, 1) * alpha;
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size;
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.a, p.y);
        ctx.stroke(); ctx.restore();
      }
    },
  };
}

/* ── 2. SPARKLE – twinkling cross-flares (lunette, calvasse) ── */
function sparkleFx(colors: string[], intensity: number): Fx {
  let ps: Particle[] = [];
  return {
    init(w, h) {
      ps = [];
      for (let i = 0; i < Math.floor(35 * intensity); i++)
        ps.push(mp({
          x: rand(0, w), y: rand(0, h), vx: rand(-8, 8), vy: rand(-8, 8),
          life: rand(0, 1), maxLife: rand(0.8, 2.5), size: rand(3, 8),
          color: pick(colors), a: rand(0, TAU),
        }));
    },
    frame(ctx, w, h, t, dt) {
      for (const p of ps) {
        p.life -= dt / p.maxLife; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life <= 0) {
          p.x = rand(0, w); p.y = rand(0, h); p.life = 1;
          p.maxLife = rand(0.8, 2.5); p.color = pick(colors); p.size = rand(3, 8);
        }
        const pulse = (Math.sin(t * 5 + p.a) + 1) * 0.5;
        const al = pulse * Math.min(p.life * 3, 1) * intensity;
        const fl = p.size * (0.5 + pulse * 0.5) * 3;
        ctx.save(); ctx.globalAlpha = al;
        ctx.strokeStyle = p.color; ctx.lineWidth = 1.5;
        ctx.shadowColor = p.color; ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(p.x - fl, p.y); ctx.lineTo(p.x + fl, p.y);
        ctx.moveTo(p.x, p.y - fl); ctx.lineTo(p.x, p.y + fl);
        const df = fl * 0.5;
        ctx.moveTo(p.x - df, p.y - df); ctx.lineTo(p.x + df, p.y + df);
        ctx.moveTo(p.x + df, p.y - df); ctx.lineTo(p.x - df, p.y + df);
        ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 4;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        ctx.restore();
      }
    },
  };
}

/* ── 3. SPARKS – falling with gravity (travail, coupe) ──────── */
function sparksFx(colors: string[], gravity: number, spread: number): Fx {
  let ps: Particle[] = []; let tm = 0;
  return {
    init() { ps = []; tm = 0; },
    frame(ctx, w, h, _t, dt) {
      tm += dt;
      if (tm > 0.025 && ps.length < 200) {
        tm = 0;
        for (let i = 0; i < 3; i++)
          ps.push(mp({
            x: rand(w * 0.15, w * 0.85), y: rand(0, h * 0.08),
            vx: rand(-spread, spread), vy: rand(20, 80),
            life: 1, maxLife: rand(1, 2.5), size: rand(1, 3), color: pick(colors),
          }));
      }
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0) return false;
        p.vy += gravity * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.save(); ctx.globalAlpha = Math.min(p.life * 2, 1);
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.6;
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * dt * 4, p.y - p.vy * dt * 4);
        ctx.stroke();
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
        ctx.restore();
        return true;
      });
    },
  };
}

/* ── 4. BURST – big bang explosion (bdg) ────────────────────── */
function burstFx(colors: string[]): Fx {
  let ps: Particle[] = [];
  let rings: { r: number; life: number; c: string }[] = [];
  let started = false; let startT = 0;
  return {
    init() { ps = []; rings = []; started = false; },
    frame(ctx, w, h, t, dt) {
      const cx = w / 2, cy = h / 2;
      if (!started) {
        started = true; startT = t;
        for (let i = 0; i < 150; i++) {
          const ang = rand(0, TAU), spd = rand(100, 900);
          ps.push(mp({
            x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
            life: 1, maxLife: rand(0.6, 2.5), size: rand(1, 5), color: pick(colors),
          }));
        }
        rings.push({ r: 0, life: 1, c: '#fff' });
        rings.push({ r: 0, life: 1, c: pick(colors) });
      }
      const age = t - startT;
      if (age < 0.3) {
        ctx.save(); ctx.globalAlpha = 0.6 * (1 - age / 0.3);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.restore();
      }
      rings = rings.filter(r => {
        r.life -= dt * 1.2; r.r += dt * 1400;
        if (r.life <= 0) return false;
        ctx.save(); ctx.globalAlpha = r.life * 0.5;
        ctx.strokeStyle = r.c; ctx.lineWidth = 3 + r.life * 4;
        ctx.shadowColor = r.c; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(cx, cy, r.r, 0, TAU); ctx.stroke();
        ctx.restore(); return true;
      });
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0) return false;
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.save(); ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        const s = p.size * p.life;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        ctx.restore(); return true;
      });
    },
  };
}

/* ── 5. RINGS – expanding speech / bass arcs (bavard, voix-grave) */
function ringsFx(colors: string[], thick: number, rate: number, centered: boolean): Fx {
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

/* ── 6. MATRIX – falling character columns (magrehb-united) ─── */
function matrixFx(colors: string[], chars: string): Fx {
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

/* ── 7. FLOAT – gentle floating shapes (tranquilou, pas-de-dodo) */
function floatFx(
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

/* ── 8. GLITCH – screen tearing + RGB split (moche, chinois) ── */
function glitchFx(colors: string[], neon: boolean): Fx {
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

/* ── 9. FIRE – rising flame particles (tchetchene, gourmand) ── */
function fireFx(colors: string[], intensity: number, wide: boolean): Fx {
  let ps: Particle[] = []; let tm = 0;
  return {
    init() { ps = []; tm = 0; },
    frame(ctx, w, h, t, dt) {
      tm += dt;
      if (tm > 0.018 / intensity && ps.length < 280) {
        tm = 0;
        const xr = wide ? [w * 0.05, w * 0.95] : [w * 0.25, w * 0.75];
        for (let i = 0; i < 2; i++)
          ps.push(mp({
            x: rand(xr[0], xr[1]), y: h + rand(0, 15),
            vx: rand(-35, 35), vy: rand(-220, -60) * intensity,
            life: 1, maxLife: rand(0.4, 1.3), size: rand(3, 12),
            color: pick(colors), a: rand(0, TAU),
          }));
      }
      if (ps.length > 280) ps.splice(0, 30);
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0) return false;
        p.x += p.vx * dt + Math.sin(t * 10 + p.a) * 25 * dt;
        p.y += p.vy * dt; p.vy -= 60 * dt;
        const al = Math.pow(p.life, 1.5);
        const s = p.size * (0.2 + p.life * 0.8);
        ctx.save(); ctx.globalAlpha = al;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - s * 2);
        ctx.lineTo(p.x - s * 0.8, p.y + s);
        ctx.lineTo(p.x + s * 0.8, p.y + s);
        ctx.closePath(); ctx.fill(); ctx.restore();
        return true;
      });
    },
  };
}

/* ── 10. DUST – vintage film grain + motes (vieux) ─────────── */
function dustFx(colors: string[]): Fx {
  let motes: Particle[] = [];
  return {
    init(w, h) {
      motes = [];
      for (let i = 0; i < 50; i++)
        motes.push(mp({
          x: rand(0, w), y: rand(0, h), vx: rand(-6, 6), vy: rand(-12, -2),
          life: rand(0, 1), maxLife: rand(4, 12), size: rand(0.5, 2),
          color: pick(colors), a: rand(0, TAU),
        }));
    },
    frame(ctx, w, h, t, dt) {
      // Sepia overlay
      ctx.save(); ctx.globalAlpha = 0.04;
      ctx.fillStyle = '#704214'; ctx.fillRect(0, 0, w, h); ctx.restore();
      // Sparse noise grain
      ctx.save();
      for (let i = 0; i < 80; i++) {
        ctx.globalAlpha = rand(0.02, 0.08);
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        ctx.fillRect(rand(0, w), rand(0, h), 1, 1);
      }
      ctx.restore();
      // Film scratches
      if (Math.random() < 0.08) {
        ctx.save(); ctx.globalAlpha = 0.12;
        ctx.strokeStyle = '#d4c5a9'; ctx.lineWidth = 0.5;
        const sx = rand(0, w);
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + rand(-8, 8), h);
        ctx.stroke(); ctx.restore();
      }
      // Vignette corners
      if (Math.random() < 0.03) {
        ctx.save(); ctx.globalAlpha = 0.06;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w * 0.15, h);
        ctx.fillRect(w * 0.85, 0, w * 0.15, h);
        ctx.restore();
      }
      // Motes
      for (const m of motes) {
        m.x += m.vx * dt + Math.sin(t + m.a) * 4 * dt;
        m.y += m.vy * dt;
        m.life -= dt / m.maxLife;
        if (m.life <= 0) { m.x = rand(0, w); m.y = h + 10; m.life = 1; m.maxLife = rand(4, 12); }
        ctx.save(); ctx.globalAlpha = Math.min(m.life * 2, 1) * 0.45;
        ctx.fillStyle = m.color;
        ctx.fillRect(m.x, m.y, m.size, m.size);
        ctx.restore();
      }
    },
  };
}

/* ── 11. CONFETTI – falling rotating shapes (nain) ─────────── */
function confettiFx(colors: string[], small: boolean): Fx {
  let ps: Particle[] = []; let tm = 0;
  return {
    init() { ps = []; tm = 0; },
    frame(ctx, w, h, t, dt) {
      tm += dt;
      if (tm > 0.06 && ps.length < 120) {
        tm = 0;
        ps.push(mp({
          x: rand(0, w), y: -10,
          vx: rand(-40, 40), vy: rand(50, 200),
          life: 1, maxLife: rand(2, 5),
          size: small ? rand(2, 5) : rand(4, 10),
          color: pick(colors), rot: rand(0, TAU), rv: rand(-3, 3),
          a: rand(0.5, 1.5), b: rand(0.3, 1),
        }));
      }
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0 || p.y > h + 20) return false;
        p.vy += 100 * dt;
        p.x += p.vx * dt + Math.sin(t * 3 + p.a) * 15 * dt;
        p.y += p.vy * dt; p.rot += p.rv * dt;
        ctx.save(); ctx.globalAlpha = Math.min(p.life * 2, 1) * 0.8;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 4;
        ctx.fillRect(-p.size * p.a / 2, -p.size * p.b / 2, p.size * p.a, p.size * p.b);
        ctx.restore(); return true;
      });
    },
  };
}

/* ── 12. FIZZ – upward effervescent sparks (zesti) ─────────── */
function fizzFx(colors: string[]): Fx {
  let ps: Particle[] = []; let tm = 0;
  return {
    init() { ps = []; tm = 0; },
    frame(ctx, w, h, t, dt) {
      tm += dt;
      if (tm > 0.03 && ps.length < 160) {
        tm = 0;
        for (let i = 0; i < 3; i++)
          ps.push(mp({
            x: rand(w * 0.1, w * 0.9), y: h + 5,
            vx: rand(-25, 25), vy: rand(-280, -80),
            life: 1, maxLife: rand(0.5, 1.8), size: rand(1, 4),
            color: pick(colors), a: rand(0, TAU),
          }));
      }
      ps = ps.filter(p => {
        p.life -= dt / p.maxLife; if (p.life <= 0) return false;
        p.x += p.vx * dt + Math.sin(t * 12 + p.a) * 10 * dt;
        p.y += p.vy * dt;
        ctx.save(); ctx.globalAlpha = p.life * 0.8;
        ctx.strokeStyle = p.color; ctx.lineWidth = p.size * 0.5;
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.sin(t * 20 + p.a) * 5, p.y + 8);
        ctx.lineTo(p.x - Math.sin(t * 20 + p.a) * 5, p.y + 16);
        ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 6;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        ctx.restore(); return true;
      });
    },
  };
}

/* ── 13. GROW – extending zigzag lines (menteur) ──────────── */
function growFx(colors: string[]): Fx {
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

/* ── 14. CROWD – grouped cluster streams (jamais-a-tek) ────── */
function crowdFx(colors: string[]): Fx {
  let groups: { ps: Particle[]; cx: number; cy: number; vx: number; vy: number }[] = [];
  return {
    init(w, h) {
      groups = [];
      for (let g = 0; g < 6; g++) {
        const gcx = rand(0, w), gcy = rand(0, h);
        const gvx = rand(-40, 40), gvy = rand(-40, 40);
        const grp: typeof groups[0] = { ps: [], cx: gcx, cy: gcy, vx: gvx, vy: gvy };
        const c = pick(colors);
        for (let i = 0; i < 8; i++)
          grp.ps.push(mp({
            x: gcx + rand(-30, 30), y: gcy + rand(-30, 30),
            vx: rand(-10, 10), vy: rand(-10, 10),
            life: rand(0, 1), maxLife: rand(2, 6), size: rand(2, 5), color: c, a: rand(0, TAU),
          }));
        groups.push(grp);
      }
    },
    frame(ctx, w, h, t, dt) {
      for (const g of groups) {
        g.cx += g.vx * dt; g.cy += g.vy * dt;
        if (g.cx < 0 || g.cx > w) g.vx *= -1;
        if (g.cy < 0 || g.cy > h) g.vy *= -1;
        for (const p of g.ps) {
          p.x += (g.cx + Math.sin(t + p.a) * 20 - p.x) * dt * 2 + p.vx * dt;
          p.y += (g.cy + Math.cos(t + p.a) * 20 - p.y) * dt * 2 + p.vy * dt;
          p.life -= dt / p.maxLife;
          if (p.life <= 0) { p.life = 1; p.maxLife = rand(2, 6); }
          const al = Math.min(p.life * 3, 1) * 0.7;
          ctx.save(); ctx.globalAlpha = al;
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s, p.y);
          ctx.lineTo(p.x, p.y + s); ctx.lineTo(p.x - s, p.y);
          ctx.closePath(); ctx.fill(); ctx.restore();
        }
        // Connections within group
        ctx.save(); ctx.globalAlpha = 0.15;
        ctx.strokeStyle = g.ps[0]?.color || '#fff'; ctx.lineWidth = 0.5;
        for (let i = 0; i < g.ps.length; i++) {
          for (let j = i + 1; j < g.ps.length; j++) {
            const d = Math.hypot(g.ps[i].x - g.ps[j].x, g.ps[i].y - g.ps[j].y);
            if (d < 80) {
              ctx.beginPath();
              ctx.moveTo(g.ps[i].x, g.ps[i].y);
              ctx.lineTo(g.ps[j].x, g.ps[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }
    },
  };
}

/* ── 15. LIGHTNING wrapper (crack, zesti-variant, fou) ──────── */
function lightningFx(colors: string[], rate: number, burstCount: number): Fx {
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

/* ── 16. BASS WAVES – deep frequency visualization (voix-grave) */
function bassFx(colors: string[]): Fx {
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

/* ── 17. CHAOS – multi-effect madness (fou) ────────────────── */
function chaosFx(): Fx {
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

/* ══════════════════════════════════════════════════════════════
   THEME MAP – one animation per unique theme
   ══════════════════════════════════════════════════════════════ */
const THEME_MAP: Record<ThemeName, () => Fx> = {
  /* Vent – traînées horizontales rapides, bleu/blanc */
  'aer': () => streakFx(['#a8d8ea', '#e0f7ff', '#ffffff', '#7ec8e3'], 400, 0.7, 60),

  /* Lunettes – reflets de lentille scintillants, doré */
  'lunette': () => sparkleFx(['#ffd700', '#fff8dc', '#ffeb3b', '#ffffff'], 1),

  /* Travail – étincelles industrielles/soudure tombantes */
  'travail': () => sparksFx(['#ff8c00', '#ffb347', '#ffd700', '#ff6600'], 300, 120),

  /* BDG – explosion massive depuis le centre */
  'bdg': () => burstFx(['#ff4444', '#ff8800', '#ffcc00', '#ffffff']),

  /* Bavard – ondes sonores multiples qui émanent */
  'bavard': () => ringsFx(['#00e676', '#69f0ae', '#00bcd4', '#80deea'], 2.5, 0.18, false),

  /* Magrehb United – pluie de caractères style Matrix, vert/or */
  'magrehb-united': () => matrixFx(
    ['#00ff41', '#39ff14', '#ccff00', '#ffab00'],
    'ABCDEFGHJKLMNPQRSTUVWXYZابتثجحخدذرزسشصضطظعغفقكلمنهوي0123456789★♦●',
  ),

  /* Pas de dodo – Z flottants lourds, atmosphère sombre/nuit */
  'pas-de-dodo': () => floatFx(['#1a237e', '#3949ab', '#7986cb', '#9fa8da'], 'z', 10, 30),

  /* Tranquilou – plumes paisibles dérivantes */
  'tranquilou': () => floatFx(['#a5d6a7', '#c8e6c9', '#e8f5e9', '#ffffff'], 'feather', 8, 25),

  /* Moche – glitch cassé, distorsion, erreurs */
  'moche': () => glitchFx(['#555', '#888', '#ff0000', '#333'], false),

  /* Calvasse – éclat chromé brillant */
  'calvasse': () => sparkleFx(['#e0e0e0', '#ffffff', '#b0bec5', '#cfd8dc'], 1.2),

  /* Chinois de la caillé – néon urbain flashy */
  'chinois-de-la-caille': () => glitchFx(['#ff00ff', '#00ffff', '#ff0066', '#00ff99'], true),

  /* Fou – chaos total, multi-effets, arc-en-ciel */
  'fou': () => chaosFx(),

  /* Gourmand – vapeur chaude dorée montante */
  'gourmand': () => fireFx(['#ffb300', '#ff8f00', '#ffd54f', '#ffe082'], 0.8, true),

  /* Vieux – film vintage, grain, poussière sépia */
  'vieux': () => dustFx(['#d4c5a9', '#b8a88a', '#8d7b6a', '#c4b396']),

  /* Coupe de cheveux suspecte – mèches colorées tombantes */
  'coupe-de-cheveux-supecte': () => sparksFx(['#e040fb', '#ea80fc', '#ce93d8', '#f48fb1'], 200, 180),

  /* Nain – petits confettis compacts bondissants */
  'nain': () => confettiFx(['#ff5252', '#448aff', '#69f0ae', '#ffd740', '#e040fb'], true),

  /* Menteur – lignes rouges qui grandissent depuis le centre */
  'menteur': () => growFx(['#d50000', '#ff1744', '#ff5252', '#b71c1c']),

  /* Muet – traînées à peine visibles, quasi silence */
  'muet': () => streakFx(['#424242', '#616161', '#757575'], 60, 0.15, 15),

  /* Jamais à tek – groupes de particules se déplaçant ensemble */
  'jamais-a-tek': () => crowdFx(['#7c4dff', '#536dfe', '#448aff', '#40c4ff', '#18ffff']),

  /* Zesti – fizz électrique citron, pétillant montant */
  'zesti': () => fizzFx(['#aeea00', '#eeff41', '#ffff00', '#76ff03']),

  /* Crack – éclairs électriques style neural */
  'crack': () => lightningFx(['#4a9eff', '#6ec6ff', '#ffd966', '#ffe599'], 0.25, 5),

  /* Voix grave – ondes basses profondes */
  'voix-grave': () => bassFx(['#4a148c', '#6a1b9a', '#8e24aa', '#7b1fa2', '#e1bee7']),

  /* Tchétchène – flammes agressives, guerrier */
  'tchetchene': () => fireFx(['#ff3d00', '#ff6e40', '#ff9100', '#dd2c00'], 1.2, false),
};

/* ══════════════════════════════════════════════════════════════
   ANIMATION ENGINE
   ══════════════════════════════════════════════════════════════ */
export function startThemeAnimation(
  canvas: HTMLCanvasElement,
  theme: ThemeName,
): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const factory = THEME_MAP[theme] || THEME_MAP['crack'];
  const fx = factory();
  fx.init(canvas.width, canvas.height);

  let raf = 0;
  let last = performance.now();

  const loop = () => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05); // cap dt to avoid jumps
    last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fx.frame(ctx, canvas.width, canvas.height, now / 1000, dt);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}

/** All available theme names */
export const ALL_THEMES: ThemeName[] = Object.keys(THEME_MAP) as ThemeName[];
