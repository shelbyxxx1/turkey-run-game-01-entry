import { clamp } from './config.js';

export const hitGap = (gap, shield = false) => clamp(gap - (shield ? 5 : 22), 0, 100);
export function gapStep(gap, dt, { sprint = false, dash = false, hidden = false } = {}) {
  return clamp(gap + dt * (hidden ? 7 : dash ? 22 : sprint ? -3.2 : 1.1), 0, 100);
}
export function createFarmer() {
  return { gap: 67, sprintTimer: 10, sprint: 0, search: 0, state: 'chasing', resetCount: 0 };
}
export function beginSearch(farmer) {
  farmer.search = 1.8;
  farmer.state = 'searching';
  farmer.sprint = 0;
  farmer.sprintTimer = 12;
  farmer.resetCount++;
}
export function updateFarmer(farmer, turkey, dt, stage) {
  let spotted = false;
  if (farmer.search > 0) {
    farmer.search = Math.max(0, farmer.search - dt);
    farmer.state = farmer.search > 0.55 ? 'searching' : 'suspicious';
    if (farmer.search === 0) {
      turkey.hidden = false;
      farmer.state = 'chasing';
      spotted = true;
    }
  } else {
    farmer.sprintTimer -= dt;
    farmer.sprint = Math.max(0, farmer.sprint - dt);
    if (farmer.sprintTimer <= 0) {
      farmer.sprint = 3.3 + stage * 0.55;
      farmer.sprintTimer = 13 - stage;
      spotted = true;
    }
    farmer.state = farmer.sprint > 0 ? 'sprinting' : 'chasing';
  }
  farmer.gap = gapStep(farmer.gap, dt, { sprint: farmer.sprint > 0, dash: turkey.dash > 0, hidden: turkey.hidden });
  return spotted;
}
export const farmerX = farmer => 322 - farmer.gap * 2.2;
