/* glitchChinoisFx – Néon urbain flashy */
import { Fx } from '../shared';
import { glitchFx } from './glitchFx';

export function glitchChinoisFx(): Fx {
  return glitchFx(['#fff', '#eee', '#ddd', '#ccc'], true);
}
