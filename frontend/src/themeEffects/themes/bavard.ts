/* Thème: bavard – Ondes sonores multiples qui émanent */
import { Fx, withImageOverlay } from '../shared';
import { ringsFx } from '../effects/ringsFx';
import bavardImg from '../pics-for-themes/bavard.png';

export default function bavard(): Fx {
  return withImageOverlay(
    ringsFx(['#fff', '#eee', '#ddd', '#ccc'], 2.5, 0.18, false),
    [bavardImg], 'pulse',
  );
}
