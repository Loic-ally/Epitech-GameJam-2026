/* Thème: magrehb-united – Pluie de caractères style Matrix, vert/or */
import { Fx, withImageOverlay } from '../shared';
import { matrixFx } from '../effects/matrixFx';
import mag1Img from '../pics-for-themes/magrehb-united-1.png';
import mag2Img from '../pics-for-themes/magrehb-united-2.png';

export default function magrehbUnited(): Fx {
  return withImageOverlay(
    matrixFx(
      ['#fff', '#eee', '#ddd', '#ccc'],
      'ABCDEFGHJKLMNPQRSTUVWXYZابتثجحخدذرزسشصضطظعغفقكلمنهوي0123456789★♦●',
    ),
    [mag1Img, mag2Img], 'cascade',
  );
}
