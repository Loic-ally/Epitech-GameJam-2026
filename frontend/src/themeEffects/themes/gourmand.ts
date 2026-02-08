/* Thème: gourmand – Vapeur chaude dorée montante */
import { Fx } from '../shared';
import { fireFx } from '../effects/fireFx';

export default function gourmand(): Fx {
  return fireFx(['#ffb300', '#ff8f00', '#ffd54f', '#ffe082'], 0.8, true);
}
