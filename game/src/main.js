import { W, H, GROUND, FINISH, STAGES, stageIndex, stageBonus, scoreFor } from './config.js';
import { createRandom } from './random.js';
import { createWorld, spawnPattern } from './world.js';
import { createTurkey, jump, slide, dash, updateTurkey, turkeyBounds } from './turkey.js';
import { createFarmer, updateFarmer, beginSearch, hitGap } from './farmer.js';
import { updateHazards, hazardBounds, overlap, isNearMiss } from './hazards.js';
import { updatePickups, collectPickup } from './pickups.js';
import { AudioEngine } from './audio.js';
import { renderScene } from './render.js';
import { renderHud } from './hud.js';
import { applyShot } from './shots.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const query = new URLSearchParams(location.search);
const seed = Number(query.get('seed')) || 1741;
const audio = new AudioEngine();
let random = createRandom(seed);
let bestDistance = 0;
const held = new Set();

function freshGame() {
  return {
    mode: 'title', help: false, time: 0, elapsed: 0, distance: 0, stage: 0, bonuses: 0, hearts: 3,
    turkey: createTurkey(), farmer: createFarmer(), world: createWorld(), audio,
    particles: [], buttons: [], pointer: { x: -100, y: -100 }, toast: null,
    shake: 0, flash: 0, slow: 0, stumble: 0, bestDistance, shot: null,
  };
}
let game = freshGame();
applyShot(game, query.get('shot'));

function announce(message) { status.textContent = message; }
function toast(message, sub = '', kind = 'good', life = 1.7) {
  game.toast = { text: message, sub, kind, life };
  announce(message + ' ' + sub);
}
function particles(x, y, count = 8, color = '#efd4a2') {
  for (let index = 0; index < count; index++) game.particles.push({ x, y, vx: -50 - random() * 120, vy: -20 - random() * 115, size: 3 + random() * 6, life: 0.3 + random() * 0.4, color });
}
function floating(label, x, y, color = '#fff3c5') {
  game.particles.push({ x, y, vx: 8, vy: -42, size: 0, life: 0.9, color, label });
}
function start() {
  bestDistance = Math.max(bestDistance, game.bestDistance, game.distance);
  const pointer = game.pointer;
  game = freshGame();
  game.pointer = pointer;
  random = createRandom(seed);
  game.mode = 'playing';
  game.farmer.sprintTimer = 8;
  held.clear();
  audio.unlock(); audio.play('gobble');
  toast('RUN, TOM. RUN!', 'THE FOREST IS 2,400 METRES AWAY', 'good', 2.7);
  canvas.focus({ preventScroll: true });
}
function finish(mode) {
  game.mode = mode;
  bestDistance = Math.max(bestDistance, game.distance);
  game.bestDistance = bestDistance;
  if (mode === 'escaped') { game.bonuses += 500; audio.play('escape'); }
  else audio.play('caught');
  announce(`${mode === 'escaped' ? 'ESCAPED! You reached the forest.' : 'CAUGHT! Farmer Bram caught up.'} Score ${scoreFor(game.distance, game.bonuses)}. Press Enter to restart.`);
}
function pause() {
  if (game.mode === 'playing') { game.mode = 'paused'; announce('Paused. Press P to resume.'); }
  else if (game.mode === 'paused') { game.mode = 'playing'; game.help = false; announce('The chase continues.'); }
}
function duck() {
  const turkey = game.turkey;
  if (turkey.hidden) return;
  const hay = game.world.hazards.find(hazard => hazard.type === 'haystack' && Math.abs(hazard.x - turkey.x) < 135);
  if (hay && turkey.grounded) {
    turkey.hidden = true;
    hay.x = turkey.x;
    game.distance = Math.max(STAGES[game.stage].start, game.distance - 8);
    beginSearch(game.farmer);
    audio.hiss(0.16, 850);
    toast('NOTHING BUT HAY…', 'BRAM’S SPRINT HAS BEEN RESET', 'good', 1.7);
  } else slide(turkey);
}
function action(name) {
  audio.unlock();
  if (name === 'start') return start();
  if (name === 'mute') { audio.toggle(); return; }
  if (name === 'help') { game.help = true; return; }
  if (name === 'closeHelp') { game.help = false; return; }
  if (name === 'title') {
    bestDistance = Math.max(bestDistance, game.distance, game.bestDistance);
    game = freshGame(); held.clear(); return;
  }
  if (name === 'pause') return pause();
  if (game.help || game.mode !== 'playing') return;
  if (game.shot) { game.shot = null; game.toast = null; }
  if (name === 'jump' && jump(game.turkey)) audio.play('jump');
  if (name === 'slide') duck();
  if (name === 'dash' && dash(game.turkey)) { audio.play('dash'); particles(game.turkey.x - 20, game.turkey.y - 20, 10); }
}
function hit(hazard) {
  const turkey = game.turkey;
  hazard.hit = true;
  if (turkey.shield) {
    turkey.shield = false;
    turkey.invulnerable = 1.3;
    game.farmer.gap = hitGap(game.farmer.gap, true);
    particles(turkey.x, turkey.y - 65, 18, '#ffe7a7');
    toast('FEATHER SAVE!', 'YOUR SHIELD TOOK THE HIT');
    audio.play('feather');
    return;
  }
  game.hearts--;
  turkey.invulnerable = 1.7;
  game.farmer.gap = hitGap(game.farmer.gap);
  game.stumble = 0.7;
  game.shake = 0.7;
  game.flash = 0.65;
  turkey.squash = 0.4;
  audio.play('hit');
  particles(turkey.x, turkey.y - 38, 15, '#a87646');
  toast('HIT!', 'BRAM IS GAINING GROUND!', 'danger');
}
function update(dt) {
  game.time += dt;
  if (game.mode !== 'playing' || game.help) return;
  if (game.hearts <= 0 || game.farmer.gap <= 0) { finish('caught'); return; }
  game.elapsed += dt;
  const slow = game.slow > 0 ? 0.32 : 1;
  const step = dt * slow;
  game.slow = Math.max(0, game.slow - dt);
  game.shake = Math.max(0, game.shake - dt * 2);
  game.flash = Math.max(0, game.flash - dt * 2);
  game.stumble = Math.max(0, game.stumble - step);
  if (game.toast) game.toast.life -= dt;
  const turkey = game.turkey;
  const landed = updateTurkey(turkey, step, held.has('ArrowDown') || held.has('KeyS'));
  if (landed) { particles(turkey.x - 10, GROUND - 3, 9); audio.hiss(0.08, 550, 0.2); }
  const hidden = turkey.hidden;
  const speed = STAGES[game.stage].speed * (turkey.dash > 0 ? 1.7 : 1) * (game.stumble > 0 ? 0.58 : 1);
  const dx = hidden ? 0 : speed * step;
  game.world.scroll += dx;
  game.distance = Math.min(FINISH, game.distance + dx * 0.095);
  const nextStage = stageIndex(game.distance);
  if (nextStage !== game.stage) {
    game.stage = nextStage;
    game.bonuses += stageBonus(nextStage);
    game.world.hazards = [];
    game.world.pickups = [];
    game.world.spawnTimer = 0.7;
    game.world.spawnCount = 0;
    game.farmer.gap = Math.min(100, game.farmer.gap + 8);
    audio.play('stage');
    toast(`${STAGES[nextStage].name.toUpperCase()}`, 'STAGE CLEAR +200 · KEEP THOSE FEET MOVING', 'good', 2.6);
  }
  if (updateFarmer(game.farmer, turkey, step, game.stage)) toast('SPOTTED!', hidden ? 'THE HAY TRICK BOUGHT YOU TIME. NOW RUN!' : 'BRAM IS MAKING A BREAK FOR YOU!', 'danger', 1.5);
  if (!hidden) {
    game.world.spawnTimer -= step;
    if (game.world.spawnTimer <= 0) {
      spawnPattern(game.world, game.stage, random);
      game.world.spawnTimer = STAGES[game.stage].spawn + random() * 0.22;
    }
    game.world.hazards = updateHazards(game.world.hazards, dx, game.time, step);
    game.world.pickups = updatePickups(game.world.pickups, dx);
    const playerBox = turkeyBounds(turkey);
    for (const hazard of game.world.hazards) {
      if (hazard.safe || hazard.hit || hazard.removed) continue;
      const bounds = hazardBounds(hazard);
      if (hazard.type === 'knife' && !hazard.sounded && hazard.x < turkey.x + 150) { audio.play('knife'); hazard.sounded = true; }
      if (overlap(playerBox, bounds) && turkey.invulnerable <= 0) {
        if (turkey.dash > 0 && turkey.dashCharge > 0) {
          hazard.removed = true;
          turkey.dashCharge = 0;
          turkey.invulnerable = 0.18;
          particles(hazard.x, hazard.y - 30, 16, '#e6b66a');
          floating('SMASH!', hazard.x, hazard.y - 80);
          audio.hiss(0.16, 700, 0.5);
        } else hit(hazard);
      } else if (isNearMiss(playerBox, bounds)) hazard.close = true;
      if (!hazard.passed && hazard.x + hazard.w / 2 < turkey.x - 26) {
        hazard.passed = true;
        if (hazard.close && !hazard.hit) {
          game.bonuses += 15;
          game.slow = 0.2;
          game.flash = 0.35;
          floating('WHISKER CLOSE! +15', turkey.x + 24, turkey.y - 140, '#fff3c5');
          audio.play('near');
        }
      }
    }
    for (const pickup of game.world.pickups) {
      if (overlap(playerBox, { x: pickup.x - 16, y: pickup.y - 20, w: 32, h: 40 })) {
        const result = collectPickup(pickup, turkey);
        game.bonuses += result.score;
        audio.play(pickup.type);
        if (result.score) floating(`+${result.score}`, pickup.x, pickup.y - 20);
        else { floating('SHIELD UP!', turkey.x, turkey.y - 145); particles(pickup.x, pickup.y, 10, '#ffe6a8'); }
      }
    }
    if (turkey.grounded && turkey.slide <= 0 && random() < dt * 12) particles(turkey.x - 30, GROUND, 1, '#d8b77e');
  }
  for (const particle of game.particles) {
    particle.x += particle.vx * step;
    particle.y += particle.vy * step;
    if (!particle.label) particle.vy += 200 * step;
    particle.life -= step;
  }
  game.particles = game.particles.filter(particle => particle.life > 0);
  audio.tick(game.time, !turkey.hidden && turkey.grounded, game.stage);
  if (game.hearts <= 0 || game.farmer.gap <= 0) finish('caught');
  else if (game.distance >= FINISH) finish('escaped');
}
function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * W / rect.width, y: (event.clientY - rect.top) * H / rect.height };
}
canvas.addEventListener('pointermove', event => {
  game.pointer = pointerPosition(event);
  canvas.style.cursor = game.buttons.some(button => game.pointer.x >= button.x && game.pointer.x <= button.x + button.w && game.pointer.y >= button.y && game.pointer.y <= button.y + button.h) ? 'pointer' : 'default';
});
canvas.addEventListener('pointerdown', event => {
  event.preventDefault();
  game.pointer = pointerPosition(event);
  const button = [...game.buttons].reverse().find(item => game.pointer.x >= item.x && game.pointer.x <= item.x + item.w && game.pointer.y >= item.y && game.pointer.y <= item.y + item.h);
  if (button) action(button.action);
  else if (!game.help && game.mode === 'playing') action('jump');
});
document.addEventListener('keydown', event => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'Enter', 'KeyW', 'KeyS', 'ShiftLeft', 'ShiftRight', 'KeyP', 'KeyM', 'KeyR', 'Escape'].includes(event.code)) event.preventDefault();
  held.add(event.code);
  if (event.repeat) return;
  if (event.code === 'KeyM') return action('mute');
  if (event.code === 'KeyR') return action('start');
  if (event.code === 'KeyP' || event.code === 'Escape') {
    if (game.help) game.help = false;
    else action('pause');
    return;
  }
  if (event.code === 'Enter') {
    if (game.help) game.help = false;
    else if (game.mode === 'title' || game.mode === 'caught' || game.mode === 'escaped') action('start');
    else if (game.mode === 'paused') action('pause');
    return;
  }
  if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) action('jump');
  if (['ArrowDown', 'KeyS'].includes(event.code)) action('slide');
  if (event.code.startsWith('Shift')) action('dash');
});
document.addEventListener('keyup', event => held.delete(event.code));
window.addEventListener('blur', () => { held.clear(); if (game.mode === 'playing' && !game.shot) pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && game.mode === 'playing' && !game.shot) pause(); });
document.querySelector('#accessible-start').addEventListener('click', () => action('start'));
document.querySelector('#accessible-pause').addEventListener('click', () => action('pause'));
document.querySelector('#accessible-mute').addEventListener('click', () => action('mute'));
let previous = 0;
function frame(timestamp) {
  const dt = previous ? Math.min(0.033, (timestamp - previous) / 1000) : 0;
  previous = timestamp;
  if (!game.shot && game.mode !== 'paused' && !game.help) update(dt);
  ctx.save();
  renderScene(ctx, game);
  renderHud(ctx, game);
  ctx.restore();
  requestAnimationFrame(frame);
}
window.__gobble = {
  get state() { return game; },
  action,
  advance(seconds) { const frames = Math.ceil(seconds * 120); for (let index = 0; index < frames; index++) update(1 / 120); },
};
requestAnimationFrame(frame);
