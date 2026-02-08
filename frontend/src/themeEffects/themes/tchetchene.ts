/* Thème: tchetchene – Flammes agressives, guerrier */
import { Fx } from '../shared';
import { fireFx } from '../effects/fireFx';

export default function tchetchene(): Fx {
  return fireFx(['#ff3d00', '#ff6e40', '#ff9100', '#dd2c00'], 1.2, false);
}
