/* Thème: tchetchene – Flammes agressives, guerrier */
import { Fx, withImageOverlay } from '../shared';
import { fireTchetcheneFx } from '../effects/fireTchetcheneFx';
import tchetImg from '../pics-for-themes/tchetchen.png';

export default function tchetchene(): Fx {
  return withImageOverlay(fireTchetcheneFx(), [tchetImg], 'shake');
}
