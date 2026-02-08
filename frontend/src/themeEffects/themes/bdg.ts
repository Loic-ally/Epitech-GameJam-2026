/* Thème: bdg – Explosion massive depuis le centre */
import { Fx } from '../shared';
import { burstFx } from '../effects/burstFx';

export default function bdg(): Fx {
  return burstFx(['#ff4444', '#ff8800', '#ffcc00', '#ffffff']);
}
