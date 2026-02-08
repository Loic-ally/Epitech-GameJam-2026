/* Thème: lunette – Reflets de lentille scintillants, doré */
import { Fx } from '../shared';
import { sparkleFx } from '../effects/sparkleFx';

export default function lunette(): Fx {
  return sparkleFx(['#ffd700', '#fff8dc', '#ffeb3b', '#ffffff'], 1);
}
