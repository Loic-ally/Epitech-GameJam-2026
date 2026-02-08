/* floatPasDeDodoFx – Z flottants lourds, atmosphère sombre/nuit */
import { Fx } from '../shared';
import { floatFx } from './floatFx';

export function floatPasDeDodoFx(): Fx {
  return floatFx(['#fff', '#eee', '#ddd', '#ccc'], 'z', 10, 30);
}
