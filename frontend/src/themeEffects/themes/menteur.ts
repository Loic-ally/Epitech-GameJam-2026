/* Thème: menteur – Lignes rouges qui grandissent depuis le centre */
import { Fx, withImageOverlay } from '../shared';
import { growFx } from '../effects/growFx';
import menteurImg from '../pics-for-themes/menteur.png';

export default function menteur(): Fx {
  return withImageOverlay(
    growFx(['#fff', '#eee', '#ddd', '#ccc']),
    [menteurImg], 'grow',
  );
}
