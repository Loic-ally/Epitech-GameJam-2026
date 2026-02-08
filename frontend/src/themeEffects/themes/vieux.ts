/* Thème: vieux – Film vintage, grain, poussière sépia */
import { Fx } from '../shared';
import { dustFx } from '../effects/dustFx';

export default function vieux(): Fx {
  return dustFx(['#d4c5a9', '#b8a88a', '#8d7b6a', '#c4b396']);
}
