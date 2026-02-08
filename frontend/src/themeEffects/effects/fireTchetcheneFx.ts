/* fireTchetcheneFx – Flammes agressives, guerrier */
import { Fx } from '../shared';
import { fireFx } from './fireFx';

export function fireTchetcheneFx(): Fx {
  return fireFx(['#fff', '#eee', '#ddd', '#ccc'], 1.2, false);
}
