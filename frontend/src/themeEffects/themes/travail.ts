/* Thème: travail – Étincelles industrielles/soudure tombantes */
import { Fx, withImageOverlay } from '../shared';
import { sparksTravailFx } from '../effects/sparksTravailFx';
import travailImg from '../pics-for-themes/travail.png';

export default function travail(): Fx {
  return withImageOverlay(sparksTravailFx(), [travailImg], 'drop');
}
