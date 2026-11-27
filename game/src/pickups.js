import { GROUND } from './config.js';

export const PICKUP_VALUES = Object.freeze({ corn: 10, pie: 50, feather: 0 });
export const pickupValue = type => PICKUP_VALUES[type] ?? 0;
export const createPickup = (type, x, y = GROUND - 90) => ({ type, x, y, taken: false, phase: x * 0.01 });
export function collectPickup(pickup, turkey) {
  if (pickup.taken) return { score: 0, collected: false };
  pickup.taken = true;
  if (pickup.type === 'feather') turkey.shield = true;
  return { score: pickupValue(pickup.type), collected: true };
}
export function updatePickups(pickups, dx) {
  for (const pickup of pickups) pickup.x -= dx;
  return pickups.filter(pickup => pickup.x > -50 && !pickup.taken);
}
