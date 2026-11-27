import { GROUND } from './config.js';
import { createHazard } from './hazards.js';
import { createPickup } from './pickups.js';

export function applyShot(game, name) {
  if (!['start', 'play', 'kitchen', 'end'].includes(name)) return false;
  game.shot = name;
  game.time = 8.4;
  if (name === 'start') return true;
  game.mode = 'playing';
  game.elapsed = 32.4;
  game.distance = name === 'kitchen' ? 1864 : 1082;
  game.stage = name === 'kitchen' ? 2 : 1;
  game.bonuses = name === 'kitchen' ? 1120 : 675;
  game.farmer.gap = 49;
  game.farmer.sprint = 1.8;
  game.turkey.shield = true;
  game.turkey.y = GROUND - 24;
  game.turkey.vy = -100;
  game.turkey.grounded = false;
  game.world.scroll = 820;
  if (name === 'play') {
    game.world.hazards = [createHazard('bale', 652), createHazard('scarecrow', 1035), createHazard('haystack', 1244)];
    game.world.pickups = [0, 1, 2, 3, 4].map(index => createPickup('corn', 585 + index * 53, 464 - Math.sin(index * 0.7) * 39));
    game.world.pickups.push(createPickup('feather', 882, 496), createPickup('pie', 1165, 553));
    game.toast = { text: 'DON’T LOOK BACK.', sub: 'THE FOREST IS GETTING CLOSER', life: 2, kind: 'quiet' };
  } else {
    game.world.hazards = [createHazard('pin', 635), createHazard('knife', 838, 1), createHazard('oven', 1090), createHazard('knife', 1221, 2), createHazard('gravy', 1248)];
    game.world.pickups = [0, 1, 2, 3].map(index => createPickup('corn', 595 + index * 48, 491 - Math.sin(index) * 25));
    game.world.pickups.push(createPickup('feather', 972, 455));
    game.toast = { text: 'IF YOU CAN’T STAND THE HEAT…', sub: 'DASH THROUGH THE KITCHEN', life: 2, kind: 'quiet' };
  }
  if (name === 'end') {
    game.mode = 'escaped';
    game.distance = 2400;
    game.bonuses = 1870;
    game.elapsed = 73.6;
    game.bestDistance = 2400;
    game.turkey.y = GROUND;
  }
  return true;
}
