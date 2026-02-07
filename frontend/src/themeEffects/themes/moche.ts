/* Thème: moche – Glitch cassé, distorsion, erreurs */
import { Fx } from '../shared';
import { glitchFx } from '../effects/glitchFx';

export default function moche(): Fx {
  return glitchFx(['#555', '#888', '#ff0000', '#333'], false);
}
