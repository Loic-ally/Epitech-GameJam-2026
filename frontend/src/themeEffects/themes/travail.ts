/* Thème: travail – Étincelles industrielles/soudure tombantes */
import { Fx } from '../shared';
import { sparksFx } from '../effects/sparksFx';

export default function travail(): Fx {
  return sparksFx(['#ff8c00', '#ffb347', '#ffd700', '#ff6600'], 300, 120);
}
