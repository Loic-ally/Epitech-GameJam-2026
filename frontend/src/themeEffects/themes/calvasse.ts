/* Thème: calvasse – Éclat chromé brillant */
import { Fx, withImageOverlay } from '../shared';
import { sparkleCalvasseFx } from '../effects/sparkleCalvasseFx';
import calvasseImg from '../pics-for-themes/calvasse.png';

export default function calvasse(): Fx {
  return withImageOverlay(sparkleCalvasseFx(), [calvasseImg], 'shimmer');
}
