/* Thème: lunette – Reflets de lentille scintillants, doré */
import { Fx, withImageOverlay } from '../shared';
import { sparkleLunetteFx } from '../effects/sparkleLunetteFx';
import lunetteImg from '../pics-for-themes/lunette.png';

export default function lunette(): Fx {
  return withImageOverlay(sparkleLunetteFx(), [lunetteImg], 'flare');
}
