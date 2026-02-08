/* Thème: muet – Traînées à peine visibles, quasi silence */
import { Fx, withImageOverlay } from '../shared';
import { streakMuetFx } from '../effects/streakMuetFx';
import muetImg from '../pics-for-themes/muet.png';

export default function muet(): Fx {
  return withImageOverlay(streakMuetFx(), [muetImg], 'faint');
}
