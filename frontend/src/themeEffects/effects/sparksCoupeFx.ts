/* sparksCoupeFx – Mèches colorées tombantes */
import { Fx } from '../shared';
import { sparksFx } from './sparksFx';

export function sparksCoupeFx(): Fx {
  return sparksFx(['#fff', '#eee', '#ddd', '#ccc'], 200, 180);
}
