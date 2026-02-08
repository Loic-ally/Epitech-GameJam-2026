/* Thème: moche – Glitch cassé, distorsion, erreurs */
import { Fx, withImageOverlay } from '../shared';
import { glitchMocheFx } from '../effects/glitchMocheFx';
import mocheImg from '../pics-for-themes/moche.png';

export default function moche(): Fx {
  return withImageOverlay(glitchMocheFx(), [mocheImg], 'glitch');
}
