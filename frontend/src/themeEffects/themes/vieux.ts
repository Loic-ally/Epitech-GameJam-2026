/* Thème: vieux – Film vintage, grain, poussière sépia */
import { Fx, withImageOverlay } from '../shared';
import { dustFx } from '../effects/dustFx';
import vieuxImg from '../pics-for-themes/vieux.png';

export default function vieux(): Fx {
  return withImageOverlay(
    dustFx(['#fff', '#eee', '#ddd', '#ccc']),
    [vieuxImg], 'sepia',
  );
}
