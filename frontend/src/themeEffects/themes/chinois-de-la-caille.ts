/* Thème: chinois-de-la-caille – Néon urbain flashy */
import { Fx, withImageOverlay } from '../shared';
import { glitchChinoisFx } from '../effects/glitchChinoisFx';
import chinoisImg from '../pics-for-themes/chinois-de-la-caille.png';

export default function chinoisDeLaCaille(): Fx {
  return withImageOverlay(glitchChinoisFx(), [chinoisImg], 'neon');
}
