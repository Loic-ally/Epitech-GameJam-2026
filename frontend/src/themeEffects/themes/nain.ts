/* Thème: nain – Petits confettis compacts bondissants */
import { Fx, withImageOverlay } from '../shared';
import { confettiNainFx } from '../effects/confettiNainFx';
import nainImg from '../pics-for-themes/nain.png';

export default function nain(): Fx {
  return withImageOverlay(confettiNainFx(), [nainImg], 'bounce');
}
