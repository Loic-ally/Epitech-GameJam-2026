/* Thème: voix-grave – Ondes basses profondes */
import { Fx, withImageOverlay } from '../shared';
import { bassFx } from '../effects/bassFx';
import voixImg from '../pics-for-themes/voix-grave.png';

export default function voixGrave(): Fx {
  return withImageOverlay(
    bassFx(['#fff', '#eee', '#ddd', '#ccc', '#bbb']),
    [voixImg], 'bass',
  );
}
