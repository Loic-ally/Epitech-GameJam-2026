/* Thème: muet – Traînées à peine visibles, quasi silence */
import { Fx } from '../shared';
import { streakFx } from '../effects/streakFx';

export default function muet(): Fx {
  return streakFx(['#424242', '#616161', '#757575'], 60, 0.15, 15);
}
