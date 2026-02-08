/* streakAerFx – Vent, traînées horizontales rapides bleu/blanc */
import { Fx } from '../shared';
import { streakFx } from './streakFx';

export function streakAerFx(): Fx {
  return streakFx(['#fff', '#eee', '#ddd', '#ccc'], 400, 0.7, 60);
}
