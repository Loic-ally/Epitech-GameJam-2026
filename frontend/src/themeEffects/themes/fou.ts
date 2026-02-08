/* Thème: fou – Chaos total, multi-effets, arc-en-ciel */
import { Fx, withImageOverlay } from '../shared';
import { chaosFx } from '../effects/chaosFx';
import fouImg from '../pics-for-themes/fou.png';

export default function fou(): Fx {
  return withImageOverlay(chaosFx(), [fouImg], 'chaos');
}
