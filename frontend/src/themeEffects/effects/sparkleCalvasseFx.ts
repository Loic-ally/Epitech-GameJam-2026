/* sparkleCalvasseFx – Éclat chromé brillant */
import { Fx } from '../shared';
import { sparkleFx } from './sparkleFx';

export function sparkleCalvasseFx(): Fx {
  return sparkleFx(['#fff', '#f0f0f0', '#e0e0e0', '#d0d0d0'], 1.2);
}
