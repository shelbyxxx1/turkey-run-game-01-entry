export const W = 1280;
export const H = 800;
export const GROUND = 618;
export const FINISH = 2400;
export const PLAYER_X = 424;
export const COLORS = Object.freeze({
  ink: '#263c31', deep: '#19382d', green: '#405a3b', cream: '#fff1cf',
  paper: '#f3dfb1', gold: '#e9ad44', orange: '#d87938', rust: '#a8462d',
  brown: '#643c2b', dark: '#202f27', muted: '#a2ad87', white: '#fff9e9',
});
export const STAGES = Object.freeze([
  { name: 'Farmyard', subtitle: 'THE BREAKOUT', start: 0, end: 700, speed: 305, spawn: 1.68, color: '#e2a54d' },
  { name: 'Cornfield', subtitle: 'LOST IN THE STALKS', start: 700, end: 1500, speed: 355, spawn: 1.42, color: '#d77e35' },
  { name: 'Kitchen Gauntlet', subtitle: 'OUT OF THE FRYING PAN', start: 1500, end: 2400, speed: 405, spawn: 1.24, color: '#b85834' },
]);
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const stageIndex = distance => distance < 700 ? 0 : distance < 1500 ? 1 : 2;
export const scoreFor = (distance, bonuses = 0) => Math.floor(clamp(distance, 0, FINISH)) + bonuses;
export const remaining = distance => Math.max(0, Math.ceil(FINISH - distance));
export const stageBonus = index => index > 0 ? 200 : 0;
