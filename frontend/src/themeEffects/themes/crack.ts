/* Thème: crack – Éclairs électriques style neural */
import { Fx } from '../shared';
import { lightningFx } from '../effects/lightningFx';

export default function crack(): Fx {
  return lightningFx(['#4a9eff', '#6ec6ff', '#ffd966', '#ffe599'], 0.25, 5);
}
