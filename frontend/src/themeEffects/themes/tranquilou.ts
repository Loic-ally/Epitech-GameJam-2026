/* Thème: tranquilou – Plumes paisibles dérivantes */
import { Fx, withImageOverlay } from '../shared';
import { floatTranquilouFx } from '../effects/floatTranquilouFx';
import tranquilouImg from '../pics-for-themes/tranquilou.png';

export default function tranquilou(): Fx {
  return withImageOverlay(floatTranquilouFx(), [tranquilouImg], 'sway');
}
