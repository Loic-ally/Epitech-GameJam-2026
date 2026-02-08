/* Thème: magrehb-united – Pluie de caractères style Matrix, vert/or */
import { Fx } from '../shared';
import { matrixFx } from '../effects/matrixFx';

export default function magrehbUnited(): Fx {
  return matrixFx(
    ['#00ff41', '#39ff14', '#ccff00', '#ffab00'],
    'ABCDEFGHJKLMNPQRSTUVWXYZابتثجحخدذرزسشصضطظعغفقكلمنهوي0123456789★♦●',
  );
}
