/* fireGourmandFx – Vapeur chaude dorée montante */
import { Fx } from '../shared';
import { fireFx } from './fireFx';

export function fireGourmandFx(): Fx {
  return fireFx(['#fff', '#eee', '#ddd', '#ccc'], 0.8, true);
}
