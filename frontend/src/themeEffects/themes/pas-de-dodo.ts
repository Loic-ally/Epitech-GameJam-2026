/* Thème: pas-de-dodo – Z flottants lourds, atmosphère sombre/nuit */
import { Fx } from '../shared';
import { floatFx } from '../effects/floatFx';

export default function pasDeDodo(): Fx {
  return floatFx(['#1a237e', '#3949ab', '#7986cb', '#9fa8da'], 'z', 10, 30);
}
