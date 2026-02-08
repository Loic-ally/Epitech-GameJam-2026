/* Thème: coupe-de-cheveux-supecte – Mèches colorées tombantes */
import { Fx, withImageOverlay } from '../shared';
import { sparksCoupeFx } from '../effects/sparksCoupeFx';
import coupeImg from '../pics-for-themes/coupe-supecte.png';

export default function coupeDeCheveuXSupecte(): Fx {
  return withImageOverlay(sparksCoupeFx(), [coupeImg], 'drop');
}
