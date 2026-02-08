/* streakMuetFx – Traînées à peine visibles, quasi silence */
import { Fx } from '../shared';
import { streakFx } from './streakFx';

export function streakMuetFx(): Fx {
  return streakFx(['#424242', '#616161', '#757575'], 60, 0.15, 15);
}
