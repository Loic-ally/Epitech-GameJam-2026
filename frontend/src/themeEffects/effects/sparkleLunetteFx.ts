/* sparkleLunetteFx – Reflets de lentille scintillants, doré */
import { Fx } from '../shared';
import { sparkleFx } from './sparkleFx';

export function sparkleLunetteFx(): Fx {
  return sparkleFx(['#fff', '#f0f0f0', '#eee', '#ddd'], 1);
}
