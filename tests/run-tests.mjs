import assert from 'node:assert/strict';
import { FINISH, remaining, scoreFor, stageBonus, stageIndex, GROUND } from '../game/src/config.js';
import { createRandom } from '../game/src/random.js';
import { gapStep, hitGap, createFarmer, beginSearch, updateFarmer } from '../game/src/farmer.js';
import { createTurkey, jump, slide, dash, updateTurkey, turkeyBounds } from '../game/src/turkey.js';
import { createHazard, hazardBounds, overlap, isNearMiss } from '../game/src/hazards.js';
import { pickupValue, collectPickup, createPickup } from '../game/src/pickups.js';
import { progress, stageAt, createWorld, spawnPattern } from '../game/src/world.js';

let passed = 0;
function test(name, check) {
  check();
  passed++;
  console.log(`✓ ${name}`);
}
test('distance, pickups, near misses and stage bonuses add exactly', () => {
  assert.equal(scoreFor(706.9, 10 + 50 + 15 + stageBonus(1)), 981);
  assert.equal(scoreFor(3000, 500), FINISH + 500);
  assert.equal(scoreFor(-5), 0);
});
test('forest distance and progress are clamped', () => {
  assert.equal(remaining(1082), 1318);
  assert.equal(remaining(2401), 0);
  assert.equal(progress(1200), 0.5);
  assert.equal(progress(2500), 1);
});
test('all stage boundaries are exact', () => {
  assert.equal(stageIndex(699.99), 0);
  assert.equal(stageIndex(700), 1);
  assert.equal(stageIndex(1499.99), 1);
  assert.equal(stageIndex(1500), 2);
  assert.equal(stageAt(2400).name, 'Kitchen Gauntlet');
  assert.ok(stageAt(100).speed < stageAt(800).speed);
  assert.ok(stageAt(800).speed < stageAt(1600).speed);
});
test('pickup values: corn 10, pie 50, feather shield', () => {
  assert.equal(pickupValue('corn'), 10);
  assert.equal(pickupValue('pie'), 50);
  assert.equal(pickupValue('feather'), 0);
  const turkey = createTurkey();
  const pickup = createPickup('feather', 10);
  assert.deepEqual(collectPickup(pickup, turkey), { score: 0, collected: true });
  assert.ok(turkey.shield);
  assert.equal(collectPickup(pickup, turkey).collected, false);
});
test('clean running and dash widen the gap; sprint closes it', () => {
  assert.ok(gapStep(50, 1) > 50);
  assert.ok(gapStep(50, 1, { dash: true }) > gapStep(50, 1));
  assert.ok(gapStep(50, 1, { sprint: true }) < 50);
  assert.equal(gapStep(99, 2, { dash: true }), 100);
  assert.equal(gapStep(1, 2, { sprint: true }), 0);
  assert.equal(hitGap(20), 0);
  assert.equal(hitGap(50, true), 45);
});
test('hiding stops the sprint and produces ? then ! then chase', () => {
  const farmer = createFarmer();
  const turkey = createTurkey();
  farmer.sprint = 3; turkey.hidden = true;
  beginSearch(farmer);
  updateFarmer(farmer, turkey, 1, 0);
  assert.equal(farmer.state, 'searching');
  assert.equal(farmer.sprint, 0);
  updateFarmer(farmer, turkey, 0.4, 0);
  assert.equal(farmer.state, 'suspicious');
  updateFarmer(farmer, turkey, 0.5, 0);
  assert.equal(turkey.hidden, false);
  assert.equal(farmer.state, 'chasing');
  assert.ok(farmer.sprintTimer >= 12);
});
test('jump is grounded only and lands with squash', () => {
  const turkey = createTurkey();
  assert.equal(jump(turkey), true);
  assert.equal(jump(turkey), false);
  assert.ok(turkey.vy < 0);
  for (let index = 0; index < 150; index++) updateTurkey(turkey, 1 / 120);
  assert.equal(turkey.y, GROUND);
  assert.equal(turkey.grounded, true);
});
test('slide clears overheads, dash has a cooldown and one charge', () => {
  const turkey = createTurkey();
  const standingHeight = turkeyBounds(turkey).h;
  slide(turkey);
  assert.ok(turkeyBounds(turkey).h < standingHeight);
  assert.equal(dash(turkey), true);
  assert.equal(turkey.dashCharge, 1);
  assert.equal(dash(turkey), false);
  updateTurkey(turkey, 4.3);
  assert.equal(dash(turkey), true);
});
test('fence collision and near misses use distinct hitboxes', () => {
  const hazard = hazardBounds(createHazard('fence', 424));
  assert.equal(overlap(turkeyBounds(createTurkey()), hazard), true);
  const above = { x: hazard.x, y: hazard.y - 40, w: 30, h: 30 };
  assert.equal(overlap(above, hazard), false);
  assert.equal(isNearMiss(above, hazard), true);
});
test('mud and gravy trip a grounded turkey but not an airborne one', () => {
  const turkey = createTurkey();
  for (const type of ['mud', 'gravy']) {
    const bounds = hazardBounds(createHazard(type, turkey.x));
    assert.equal(overlap(turkeyBounds(turkey), bounds), true);
    const airborne = { ...turkey, y: GROUND - 28 };
    assert.equal(overlap(turkeyBounds(airborne), bounds), false);
  }
});
test('each stage has original patterns and guaranteed hide / shield chances', () => {
  for (let stage = 0; stage < 3; stage++) {
    const world = createWorld();
    const random = createRandom(9);
    for (let index = 0; index < 9; index++) spawnPattern(world, stage, random);
    assert.ok(world.hazards.length === 9);
    assert.ok(world.pickups.some(pickup => pickup.type === 'feather'));
    assert.ok(world.pickups.some(pickup => pickup.type === 'pie'));
    if (stage < 2) assert.ok(world.hazards.some(hazard => hazard.type === 'haystack'));
  }
});
test('seeded generation is repeatable', () => {
  const first = createRandom(1), second = createRandom(1);
  for (let index = 0; index < 100; index++) {
    const value = first();
    assert.equal(value, second());
    assert.ok(value >= 0 && value < 1);
  }
});
console.log(`\n${passed} pure-logic tests passed.`);
