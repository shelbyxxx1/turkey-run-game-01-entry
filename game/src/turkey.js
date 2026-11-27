import { GROUND, PLAYER_X } from './config.js';

export function createTurkey() {
  return { x: PLAYER_X, y: GROUND, vy: 0, grounded: true, slide: 0, dash: 0, dashCooldown: 0, dashCharge: 0, invulnerable: 0, shield: false, hidden: false, squash: 0, jumpBuffer: 0, coyote: 0.1 };
}

export function jump(turkey) {
  if (turkey.hidden) return false;
  turkey.jumpBuffer = 0.12;
  if (!turkey.grounded) return false;
  turkey.vy = -795;
  turkey.grounded = false;
  turkey.slide = 0;
  turkey.squash = -0.2;
  turkey.jumpBuffer = 0;
  return true;
}

export function slide(turkey) {
  if (turkey.hidden) return;
  turkey.slide = 0.72;
  if (!turkey.grounded) turkey.vy = Math.max(turkey.vy, 680);
}

export function dash(turkey) {
  if (turkey.dashCooldown > 0 || turkey.hidden) return false;
  turkey.dash = 0.48;
  turkey.dashCooldown = 4.2;
  turkey.dashCharge = 1;
  return true;
}

export function updateTurkey(turkey, dt, slideHeld = false) {
  const wasGrounded = turkey.grounded;
  for (const key of ['slide', 'dash', 'dashCooldown', 'invulnerable', 'jumpBuffer']) turkey[key] = Math.max(0, turkey[key] - dt);
  if (slideHeld && turkey.grounded && !turkey.hidden) turkey.slide = Math.max(turkey.slide, 0.1);
  turkey.squash *= Math.exp(-dt * 13);
  if (turkey.hidden) return false;
  turkey.vy += 1920 * dt;
  turkey.y += turkey.vy * dt;
  if (turkey.y >= GROUND) {
    turkey.y = GROUND;
    turkey.vy = 0;
    turkey.grounded = true;
    if (!wasGrounded) turkey.squash = 0.3;
  }
  if (turkey.grounded && turkey.jumpBuffer > 0) jump(turkey);
  return !wasGrounded && turkey.grounded;
}

export function turkeyBounds(turkey) {
  const height = turkey.slide > 0 ? 34 : 78;
  return { x: turkey.x - 26, y: turkey.y - height, w: 56, h: height - 7 };
}
