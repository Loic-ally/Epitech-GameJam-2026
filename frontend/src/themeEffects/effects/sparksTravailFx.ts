/* sparksTravailFx – Étincelles industrielles/soudure tombantes */
import { Fx } from '../shared';
import { sparksFx } from './sparksFx';

export function sparksTravailFx(): Fx {
  return sparksFx(['#fff', '#eee', '#ddd', '#ccc'], 300, 120);
}
