import { FINISH, STAGES, stageIndex, GROUND } from './config.js';
import { createHazard } from './hazards.js';
import { createPickup } from './pickups.js';
import { range } from './random.js';

export const progress = distance => Math.min(1, Math.max(0, distance / FINISH));
export const stageAt = distance => STAGES[stageIndex(distance)];
export const parallax = (distance, factor, width) => -((distance * factor) % width);
export function createWorld() {
  return { hazards: [], pickups: [], spawnTimer: 1.1, spawnCount: 0, scroll: 0, wind: [] };
}
export function spawnPattern(world, stage, random) {
  const sets = [
    ['fence', 'bale', 'mud', 'haystack', 'fence', 'bale'],
    ['cornrow', 'scarecrow', 'fallingCorn', 'haystack', 'cornrow', 'scarecrow'],
    ['oven', 'knife', 'pin', 'gravy', 'knife', 'oven'],
  ];
  const count = world.spawnCount++;
  const type = sets[stage][count % sets[stage].length];
  const hazard = createHazard(type, 1390, range(random, 0, 6));
  if (type === 'fallingCorn') hazard.y = GROUND - 190;
  world.hazards.push(hazard);
  if (type === 'haystack') {
    world.pickups.push(createPickup('feather', 1470, GROUND - 150));
  } else {
    const overhead = type === 'knife' || type === 'scarecrow';
    for (let index = 0; index < 5; index++) {
      const height = overhead ? 28 : 105 + Math.sin(index / 4 * Math.PI) * 65;
      world.pickups.push(createPickup('corn', 1300 + index * 46, GROUND - height));
    }
    if (count % 7 === 5) world.pickups.push(createPickup('pie', 1620, GROUND - 100));
    if (count % 8 === 2) world.pickups.push(createPickup('feather', 1660, GROUND - 128));
  }
}
