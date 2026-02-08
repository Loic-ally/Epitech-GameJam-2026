/* Thème: pas-de-dodo – Z flottants lourds, atmosphère sombre/nuit */
import { Fx, withImageOverlay } from '../shared';
import { floatPasDeDodoFx } from '../effects/floatPasDeDodoFx';
import pasDeDodoImg from '../pics-for-themes/pas-de-dodo.png';

export default function pasDeDodo(): Fx {
  return withImageOverlay(floatPasDeDodoFx(), [pasDeDodoImg], 'drowsy');
}
