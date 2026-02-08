/* Thème: nain – Petits confettis compacts bondissants */
import { Fx } from '../shared';
import { confettiFx } from '../effects/confettiFx';

export default function nain(): Fx {
  return confettiFx(['#ff5252', '#448aff', '#69f0ae', '#ffd740', '#e040fb'], true);
}
