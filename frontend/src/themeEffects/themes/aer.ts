/* Thème: aer – Vent, traînées horizontales rapides bleu/blanc */
import { Fx, withImageOverlay } from '../shared';
import { streakAerFx } from '../effects/streakAerFx';
import aer1Img from '../pics-for-themes/aer-1.png';
import aer2Img from '../pics-for-themes/aer-2.png';

export default function aer(): Fx {
  return withImageOverlay(streakAerFx(), [aer1Img, aer2Img], 'streak');
}
