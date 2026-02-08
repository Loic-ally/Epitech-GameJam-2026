import type { ThemeName, Fx } from './shared';
import aer from './themes/aer';
import lunette from './themes/lunette';
import travail from './themes/travail';
import bdg from './themes/bdg';
import bavard from './themes/bavard';
import magrehbUnited from './themes/magrehb-united';
import pasDeDodo from './themes/pas-de-dodo';
import tranquilou from './themes/tranquilou';
import moche from './themes/moche';
import calvasse from './themes/calvasse';
import chinoisDeLaCaille from './themes/chinois-de-la-caille';
import fou from './themes/fou';
import gourmand from './themes/gourmand';
import vieux from './themes/vieux';
import coupeDeCheveuXSupecte from './themes/coupe-de-cheveux-supecte';
import nain from './themes/nain';
import menteur from './themes/menteur';
import muet from './themes/muet';
import jamaisATek from './themes/jamais-a-tek';
import zesti from './themes/zesti';
import crack from './themes/crack';
import voixGrave from './themes/voix-grave';
import tchetchene from './themes/tchetchene';
export type { ThemeName, Fx } from './shared';

/* ══════════════════════════════════════════════════════════════
   THEME MAP – one animation per unique theme
   ══════════════════════════════════════════════════════════════ */
const THEME_MAP: Record<ThemeName, () => Fx> = {
  'aer': aer,
  'lunette': lunette,
  'travail': travail,
  'bdg': bdg,
  'bavard': bavard,
  'magrehb-united': magrehbUnited,
  'pas-de-dodo': pasDeDodo,
  'tranquilou': tranquilou,
  'moche': moche,
  'calvasse': calvasse,
  'chinois-de-la-caille': chinoisDeLaCaille,
  'fou': fou,
  'gourmand': gourmand,
  'vieux': vieux,
  'coupe-de-cheveux-supecte': coupeDeCheveuXSupecte,
  'nain': nain,
  'menteur': menteur,
  'muet': muet,
  'jamais-a-tek': jamaisATek,
  'zesti': zesti,
  'crack': crack,
  'voix-grave': voixGrave,
  'tchetchene': tchetchene,
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
