/* glitchMocheFx – Glitch cassé, distorsion, erreurs */
import { Fx } from '../shared';
import { glitchFx } from './glitchFx';

export function glitchMocheFx(): Fx {
  return glitchFx(['#888', '#aaa', '#ccc', '#666'], false);
}
