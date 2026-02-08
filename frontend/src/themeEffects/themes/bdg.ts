/* Thème: bdg – Explosion massive depuis le centre */
import { Fx, withImageOverlay } from '../shared';
import { burstFx } from '../effects/burstFx';
import bdgImg from '../pics-for-themes/bdg.png';

export default function bdg(): Fx {
  return withImageOverlay(
    burstFx(['#fff', '#eee', '#ddd', '#ccc']),
    [bdgImg], 'explode',
  );
}
