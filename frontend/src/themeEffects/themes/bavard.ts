/* Thème: bavard – Ondes sonores multiples qui émanent */
import { Fx } from '../shared';
import { ringsFx } from '../effects/ringsFx';

export default function bavard(): Fx {
  return ringsFx(['#00e676', '#69f0ae', '#00bcd4', '#80deea'], 2.5, 0.18, false);
}
