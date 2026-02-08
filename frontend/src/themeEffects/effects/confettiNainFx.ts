/* confettiNainFx – Petits confettis compacts bondissants */
import { Fx } from '../shared';
import { confettiFx } from './confettiFx';

export function confettiNainFx(): Fx {
  return confettiFx(['#fff', '#eee', '#ddd', '#ccc', '#bbb'], true);
}
