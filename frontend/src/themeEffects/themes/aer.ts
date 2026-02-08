/* Thème: aer – Vent, traînées horizontales rapides bleu/blanc */
import { Fx } from '../shared';
import { streakFx } from '../effects/streakFx';

export default function aer(): Fx {
  return streakFx(['#a8d8ea', '#e0f7ff', '#ffffff', '#7ec8e3'], 400, 0.7, 60);
}
