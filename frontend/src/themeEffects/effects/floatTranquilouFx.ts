/* floatTranquilouFx – Plumes paisibles dérivantes */
import { Fx } from '../shared';
import { floatFx } from './floatFx';

export function floatTranquilouFx(): Fx {
  return floatFx(['#fff', '#eee', '#ddd', '#ccc'], 'feather', 8, 25);
}
