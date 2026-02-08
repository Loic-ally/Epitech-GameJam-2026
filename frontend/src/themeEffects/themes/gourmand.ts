/* Thème: gourmand – Vapeur chaude dorée montante */
import { Fx, withImageOverlay } from '../shared';
import { fireGourmandFx } from '../effects/fireGourmandFx';
import gourmandImg from '../pics-for-themes/gourmand.png';

export default function gourmand(): Fx {
  return withImageOverlay(fireGourmandFx(), [gourmandImg], 'rise');
}
