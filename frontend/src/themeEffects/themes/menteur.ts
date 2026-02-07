/* Thème: menteur – Lignes rouges qui grandissent depuis le centre */
import { Fx } from '../shared';
import { growFx } from '../effects/growFx';

export default function menteur(): Fx {
  return growFx(['#d50000', '#ff1744', '#ff5252', '#b71c1c']);
}
