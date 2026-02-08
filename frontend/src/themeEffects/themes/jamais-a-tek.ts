/* Thème: jamais-a-tek – Groupes de particules se déplaçant ensemble */
import { Fx, withImageOverlay } from '../shared';
import { crowdFx } from '../effects/crowdFx';
import jamaisImg from '../pics-for-themes/jamais-a-tek.png';

export default function jamaisATek(): Fx {
  return withImageOverlay(
    crowdFx(['#fff', '#eee', '#ddd', '#ccc', '#bbb']),
    [jamaisImg], 'cluster',
  );
}
