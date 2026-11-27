import { GROUND, PLAYER_X } from './config.js';

export const HAZARDS = Object.freeze({
  fence: { w: 74, h: 77 }, bale: { w: 84, h: 65 }, mud: { w: 102, h: 12 },
  haystack: { w: 126, h: 104, safe: true }, cornrow: { w: 64, h: 74 },
  scarecrow: { w: 88, h: 54, overhead: 52 }, fallingCorn: { w: 34, h: 54 },
  oven: { w: 106, h: 86 }, knife: { w: 43, h: 68, overhead: 50 },
  pin: { w: 83, h: 33 }, gravy: { w: 108, h: 10 },
});
export function createHazard(type, x, phase = 0) {
  const definition = HAZARDS[type];
  return { type, x, y: GROUND - (definition.overhead || 0), ...definition, phase, hit: false, passed: false, close: false, removed: false };
}
export function hazardBounds(hazard) {
  if (hazard.type === 'mud' || hazard.type === 'gravy') return { x: hazard.x - hazard.w / 2 + 7, y: GROUND - 14, w: hazard.w - 14, h: 16 };
  return { x: hazard.x - hazard.w / 2 + 7, y: hazard.y - hazard.h + 7, w: hazard.w - 14, h: hazard.h - 9 };
}
export const overlap = (first, second) => first.x < second.x + second.w && first.x + first.w > second.x && first.y < second.y + second.h && first.y + first.h > second.y;
export function isNearMiss(first, second) {
  const horizontal = first.x < second.x + second.w && first.x + first.w > second.x;
  const verticalGap = Math.max(second.y - (first.y + first.h), first.y - (second.y + second.h));
  return horizontal && verticalGap >= 0 && verticalGap < 25;
}
export function updateHazards(hazards, dx, time, dt) {
  for (const hazard of hazards) {
    hazard.x -= dx;
    if (hazard.type === 'knife') hazard.y = GROUND - 61 + Math.sin(time * 3.1 + hazard.phase) * 12;
    if (hazard.type === 'fallingCorn' && hazard.x < PLAYER_X + 260) hazard.y = Math.min(GROUND, hazard.y + dt * 205);
  }
  return hazards.filter(hazard => hazard.x > -160 && !hazard.removed);
}
