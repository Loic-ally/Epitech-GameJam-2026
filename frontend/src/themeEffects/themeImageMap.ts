/* ══════════════════════════════════════════════════════════════
   themeImageMap.ts – PNG-only animations (no particle base)
   Maps each theme that has images to its srcs + display style.
   ══════════════════════════════════════════════════════════════ */
import { type Fx, type ImgStyle, nullFx, withImageOverlay } from './shared';

/* ── Image imports ── */
import aer1      from './pics-for-themes/aer-1.png';
import aer2      from './pics-for-themes/aer-2.png';
import bavard    from './pics-for-themes/bavard.png';
import bdg       from './pics-for-themes/bdg.png';
import calvasse  from './pics-for-themes/calvasse.png';
import chinois   from './pics-for-themes/chinois-de-la-caille.png';
import coupe     from './pics-for-themes/coupe-supecte.png';
import fou       from './pics-for-themes/fou.png';
import gourmand  from './pics-for-themes/gourmand.png';
import jamais    from './pics-for-themes/jamais-a-tek.png';
import lunette   from './pics-for-themes/lunette.png';
import mag1      from './pics-for-themes/magrehb-united-1.png';
import mag2      from './pics-for-themes/magrehb-united-2.png';
import menteur   from './pics-for-themes/menteur.png';
import moche     from './pics-for-themes/moche.png';
import muet      from './pics-for-themes/muet.png';
import nain      from './pics-for-themes/nain.png';
import pasDeDodo from './pics-for-themes/pas-de-dodo.png';
import tchetchen from './pics-for-themes/tchetchen.png';
import tranquilou from './pics-for-themes/tranquilou.png';
import travail   from './pics-for-themes/travail.png';
import vieux     from './pics-for-themes/vieux.png';
import voixGrave from './pics-for-themes/voix-grave.png';
import zesti     from './pics-for-themes/zesti.png';

/* ── Config per image-theme ── */
export interface ImgTheme {
  srcs: string[];
  style: ImgStyle;
}

export const IMAGE_THEMES: ImgTheme[] = [
  { srcs: [aer1, aer2],  style: 'streak'  },
  { srcs: [bavard],      style: 'pulse'   },
  { srcs: [bdg],         style: 'explode' },
  { srcs: [calvasse],    style: 'shimmer' },
  { srcs: [chinois],     style: 'neon'    },
  { srcs: [coupe],       style: 'drop'    },
  { srcs: [fou],         style: 'chaos'   },
  { srcs: [gourmand],    style: 'rise'    },
  { srcs: [jamais],      style: 'cluster' },
  { srcs: [lunette],     style: 'flare'   },
  { srcs: [mag1, mag2],  style: 'cascade' },
  { srcs: [menteur],     style: 'grow'    },
  { srcs: [moche],       style: 'glitch'  },
  { srcs: [muet],        style: 'faint'   },
  { srcs: [nain],        style: 'bounce'  },
  { srcs: [pasDeDodo],   style: 'drowsy'  },
  { srcs: [tchetchen],   style: 'shake'   },
  { srcs: [tranquilou],  style: 'sway'    },
  { srcs: [travail],     style: 'drop'    },
  { srcs: [vieux],       style: 'sepia'   },
  { srcs: [voixGrave],   style: 'bass'    },
  { srcs: [zesti],       style: 'fizz'    },
];

/** Pick a random image-theme config */
export function pickImageTheme(): ImgTheme {
  return IMAGE_THEMES[Math.floor(Math.random() * IMAGE_THEMES.length)];
}

/** Create an Fx that only renders the PNG overlay – no particles */
export function imageOnlyFx(theme: ImgTheme): Fx {
  return withImageOverlay(nullFx(), theme.srcs, theme.style);
}
