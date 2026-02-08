/* Thème: zesti – Fizz électrique citron, pétillant montant */
import { Fx, withImageOverlay } from '../shared';
import { fizzFx } from '../effects/fizzFx';
import zestiImg from '../pics-for-themes/zesti.png';

export default function zesti(): Fx {
  return withImageOverlay(
    fizzFx(['#fff', '#eee', '#ddd', '#ccc']),
    [zestiImg], 'fizz',
  );
}
