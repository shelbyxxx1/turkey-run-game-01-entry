import { COLORS as C, W, H, STAGES, FINISH, remaining, scoreFor } from './config.js';
import { rounded, text, line, ellipse, polygon, feather, drawTurkey, drawFarmer, star } from './render.js';

function tracked(ctx, value, x, y, size = 11, color = C.ink, spacing = 2) {
  ctx.font = `bold ${size}px "Trebuchet MS", Arial, sans-serif`;
  ctx.fillStyle = color; ctx.textAlign = 'left';
  for (const character of value) {
    ctx.fillText(character, x, y);
    x += ctx.measureText(character).width + spacing;
  }
}
function heart(ctx, x, y, full) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-30, -6, -11, -27, 0, -13);
  ctx.bezierCurveTo(11, -27, 30, -6, 0, 10);
  ctx.fillStyle = full ? '#ae4e35' : '#cfbc98'; ctx.fill();
  if (full) { ctx.beginPath(); ctx.arc(-6, -9, 4, 3.6, 5.4); ctx.strokeStyle = '#e89a6a'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
}
function button(ctx, game, label, x, y, width, height, action, style = 'green', subtitle = '') {
  const hover = game.pointer.x >= x && game.pointer.x <= x + width && game.pointer.y >= y && game.pointer.y <= y + height;
  const primary = style === 'orange';
  const pale = style === 'pale';
  const fill = primary ? hover ? '#ef9b51' : '#d67738' : pale ? hover ? '#fff5d9' : '#eddfbd' : hover ? '#45624a' : '#294b39';
  rounded(ctx, x, y + 4, width, height, 9, primary ? '#9f4a29' : pale ? '#c7b58f' : '#183426');
  rounded(ctx, x, y, width, height, 9, fill, primary ? '#edb56b' : pale ? '#c3b38c' : '#627a52');
  text(ctx, label, x + width / 2, y + height / 2 + (subtitle ? -2 : 6), subtitle ? 14 : 17, pale ? C.ink : C.cream, 'sans', 'bold', 'center');
  if (subtitle) text(ctx, subtitle, x + width / 2, y + height / 2 + 16, 10, pale ? '#697251' : '#d4d6ad', 'sans', '500', 'center');
  game.buttons.push({ x, y, w: width, h: height, action });
}
function iconButton(ctx, game, type, x, y, action) {
  const hover = Math.hypot(game.pointer.x - x, game.pointer.y - y) < 22;
  ellipse(ctx, x, y, 21, 21, hover ? '#e4c992' : '#e9d5aa', '#c4b088');
  if (type === 'pause') {
    rounded(ctx, x - 6, y - 8, 4, 16, 1, C.ink);
    rounded(ctx, x + 3, y - 8, 4, 16, 1, C.ink);
  } else {
    polygon(ctx, [[x - 10, y - 4], [x - 5, y - 4], [x + 1, y - 10], [x + 1, y + 10], [x - 5, y + 4], [x - 10, y + 4]], C.ink);
    if (game.audio.muted) line(ctx, [[x + 6, y - 6], [x + 13, y + 6]], C.rust, 2);
    else { ctx.beginPath(); ctx.arc(x, y, 11, -0.8, 0.8); ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke(); }
  }
  game.buttons.push({ x: x - 22, y: y - 22, w: 44, h: 44, action });
}
function frame(ctx) {
  ctx.lineWidth = 1;
  rounded(ctx, 10.5, 10.5, W - 21, H - 21, 14, null, '#f9e2ac77');
}
function masthead(ctx, game, ending = false) {
  feather(ctx, 48, 51, 0.47, ending ? C.gold : C.rust, 0.5);
  tracked(ctx, 'GOBBLE RUN', 77, 51, 15, ending ? C.cream : C.deep, 2.5);
  tracked(ctx, ending ? 'THE GREAT THANKSGIVING ESCAPE' : 'A THANKSGIVING GETAWAY', 78, 72, 9, ending ? '#dfd6ac' : '#75633e', 1.5);
  if (!ending) {
    text(ctx, 'ORIGINAL RECIPE. FREE-RANGE CHAOS.', 1219, 53, 10, '#695c3f', 'sans', 'bold', 'right');
    text(ctx, 'EST. THANKSGIVING MORNING', 1219, 72, 9, '#8e7950', 'sans', '500', 'right');
  }
  iconButton(ctx, game, 'sound', ending ? 1200 : 1240, ending ? 54 : 115, 'mute');
}
function titleScreen(ctx, game) {
  const veil = ctx.createLinearGradient(0, 0, 1090, 0);
  veil.addColorStop(0, '#fae9c7ff'); veil.addColorStop(0.5, '#f9e6bded'); veil.addColorStop(0.81, '#f4d59624'); veil.addColorStop(1, '#f4d59600');
  ctx.fillStyle = veil; ctx.fillRect(0, 0, W, H);
  masthead(ctx, game);
  rounded(ctx, 81, 147, 202, 29, 14, '#e5c991', '#c8aa73');
  tracked(ctx, 'THE FLOCK STOPS HERE.', 99, 166, 9, '#7d5637', 1.1);
  text(ctx, 'GOBBLE', 75, 284, 106, C.deep, 'serif', 'bold');
  text(ctx, 'RUN', 75, 387, 121, C.rust, 'serif', 'bold');
  line(ctx, [[365, 355], [506, 355]], '#b48c52', 1);
  tracked(ctx, 'THE GREAT', 367, 328, 10, '#705b38', 2);
  tracked(ctx, 'THANKSGIVING', 367, 351, 10, '#705b38', 1.35);
  tracked(ctx, 'ESCAPE', 367, 376, 13, C.rust, 4);
  text(ctx, 'Dinner is cancelled.', 82, 438, 28, C.ink, 'serif', 'italic');
  text(ctx, 'One turkey. Three bad places. Zero plans to be lunch.', 83, 469, 16, '#6f6649');
  button(ctx, game, 'LET’S FLY (SORT OF)   →', 82, 507, 284, 61, 'start', 'orange');
  button(ctx, game, 'How to play', 383, 507, 151, 61, 'help', 'pale');
  text(ctx, 'or press ENTER to make a break for it', 83, 595, 12, '#8a7750');
  ctx.save();
  ctx.translate(947, 494);
  const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 250);
  glow.addColorStop(0, '#fff0ba88'); glow.addColorStop(1, '#ffe4a900');
  ctx.fillStyle = glow; ctx.fillRect(-280, -280, 560, 560);
  ctx.restore();
  ellipse(ctx, 947, 628, 151, 19, '#805c3533');
  drawTurkey(ctx, 936, 617, 2.72, game.time * 0.65, { still: true });
  drawFarmer(ctx, 1177, 580, 0.42, game.time, 'searching');
  feather(ctx, 727, 343, 0.65, '#b95e34', -0.6);
  star(ctx, 1102, 286, 9, '#fff1bc');
  star(ctx, 1090, 319, 4, '#fff1bc');
  line(ctx, [[1120, 416], [1140, 409]], '#a9743c', 3);
  line(ctx, [[1125, 435], [1153, 435]], '#a9743c', 3);
  rounded(ctx, 810, 662, 269, 31, 15, '#f3dfb3dd', '#ac8c55');
  tracked(ctx, 'TOM · DEFINITELY NOT DINNER', 831, 682, 9, '#745435', 1.3);
  rounded(ctx, 65, 647, 552, 66, 11, '#fff0d0b8', '#d4b57b');
  const keys = [['SPACE', 'Jump the trouble'], ['↓ / S', 'Slide & hide'], ['SHIFT', 'Make a dash']];
  keys.forEach((item, index) => {
    const x = 84 + index * 180;
    rounded(ctx, x, 662, 58, 21, 4, '#e5cf9e', '#c9ac73');
    text(ctx, item[0], x + 29, 677, 10, C.ink, 'sans', 'bold', 'center');
    text(ctx, item[1], x, 700, 11, '#7c6944');
  });
  line(ctx, [[66, 737], [1214, 737]], '#bda27488', 1);
  tracked(ctx, 'A LITTLE BRAVERY. A LOT OF FEATHERS.', 81, 762, 9, '#79643f', 1.7);
  text(ctx, `PERSONAL BEST  ${Math.floor(game.bestDistance).toLocaleString('en-US')} / 2,400 m`, 1205, 762, 11, C.ink, 'sans', 'bold', 'right');
  frame(ctx);
}
function gapMeter(ctx, game) {
  const x = 918, width = 270;
  const danger = game.farmer.gap < 30;
  text(ctx, game.turkey.hidden ? 'BRAM IS SEARCHING…' : danger ? 'HE’S RIGHT BEHIND YOU!' : 'KEEP BRAM AT BAY', 883, 163, 10, danger ? '#ffe6bc' : '#e5dfb5', 'sans', 'bold', 'right');
  rounded(ctx, x, 150, width, 13, 7, '#152c24', '#708363');
  rounded(ctx, x + 2, 152, Math.max(3, (width - 4) * game.farmer.gap / 100), 9, 5, danger ? '#e18b52' : '#dcb45e');
  for (let index = 1; index < 5; index++) line(ctx, [[x + index * width / 5, 153], [x + index * width / 5, 161]], '#344b3888', 1);
  const farmerPos = x + 8;
  ellipse(ctx, farmerPos, 177, 6, 7, '#d3a773');
  ellipse(ctx, farmerPos, 171, 11, 3, '#c7aa65');
  const turkeyPos = x + width * game.farmer.gap / 100;
  ellipse(ctx, turkeyPos, 177, 8, 6, '#d99a49');
  ellipse(ctx, turkeyPos + 7, 172, 4, 5, '#f0c781');
  text(ctx, `${Math.round(game.farmer.gap)} m GAP`, 1208, 181, 10, '#f5e6bb', 'sans', 'bold', 'right');
}
function gameHud(ctx, game) {
  ctx.lineWidth = 1;
  rounded(ctx, 24, 24, 1232, 97, 13, '#faeac8', '#bfa375');
  feather(ctx, 56, 64, 0.47, C.rust);
  text(ctx, 'GOBBLE RUN', 79, 65, 21, C.deep, 'serif', 'bold');
  tracked(ctx, 'DINNER IS CANCELLED.', 80, 84, 8, '#8e744d', 1.3);
  line(ctx, [[259, 44], [259, 100]], '#cbb58c', 1);
  const columns = [291, 462, 650, 815, 966];
  ['SCORE', 'FOREST IN', 'HOLD ON TO', 'SPEED', 'FEATHER SHIELD'].forEach((label, index) => tracked(ctx, label, columns[index], 51, 9, '#8d7752', 1.5));
  text(ctx, scoreFor(game.distance, game.bonuses).toLocaleString('en-US'), 290, 91, 34, C.deep, 'serif', 'bold');
  text(ctx, remaining(game.distance).toLocaleString('en-US'), 460, 91, 34, C.deep, 'serif', 'bold');
  text(ctx, 'm', 569, 90, 15, '#8c7954');
  for (let index = 0; index < 3; index++) heart(ctx, 667 + index * 35, 82, game.hearts > index);
  text(ctx, (STAGES[game.stage].speed * (game.turkey.dash > 0 ? 1.65 : 1) * 0.105).toFixed(1), 814, 91, 31, C.deep, 'serif', 'bold');
  text(ctx, 'km/h', 890, 89, 11, '#8c7954');
  feather(ctx, 977, 86, 0.35, game.turkey.shield ? '#c29035' : '#baac87');
  text(ctx, game.turkey.shield ? 'READY' : 'EMPTY', 998, 88, 11, game.turkey.shield ? '#5e7748' : '#988462', 'sans', 'bold');
  iconButton(ctx, game, 'sound', 1141, 72, 'mute');
  iconButton(ctx, game, 'pause', 1205, 72, 'pause');
  rounded(ctx, 24, 133, 1232, 62, 10, '#294735ed', '#96a16d');
  text(ctx, `0${game.stage + 1}`, 46, 176, 29, '#e2b25b', 'serif', 'bold');
  line(ctx, [[92, 147], [92, 181]], '#7b8b5d', 1);
  tracked(ctx, STAGES[game.stage].name.toUpperCase(), 109, 158, 12, '#fff0c8', 1.4);
  tracked(ctx, STAGES[game.stage].subtitle, 109, 178, 8, '#b5be8c', 1.5);
  const routeX = 420, routeWidth = 218;
  line(ctx, [[routeX, 162], [routeX + routeWidth, 162]], '#798960', 3);
  line(ctx, [[routeX, 162], [routeX + routeWidth * Math.min(1, game.distance / FINISH), 162]], '#e5b255', 3);
  [0, 700 / FINISH, 1500 / FINISH, 1].forEach((fraction, index) => {
    ellipse(ctx, routeX + routeWidth * fraction, 162, 4, 4, game.distance / FINISH >= fraction ? '#efc56b' : '#5d744e', '#b6be8a');
    if (index < 3) text(ctx, ['FARM', 'CORN', 'KITCHEN'][index], routeX + routeWidth * fraction, 181, 7, '#cbd0a3', 'sans', 'bold', 'center');
  });
  gapMeter(ctx, game);
  rounded(ctx, 24, 713, 1232, 63, 11, '#243f30f5', '#829062');
  button(ctx, game, '↑  JUMP', 38, 724, 150, 40, 'jump', 'green', 'SPACE / W / TAP');
  button(ctx, game, '↓  SLIDE / HIDE', 200, 724, 169, 40, 'slide', 'green', 'DOWN / S');
  button(ctx, game, '»  DASH', 381, 724, 163, 40, 'dash', game.turkey.dashCooldown > 0 ? 'green' : 'orange', game.turkey.dashCooldown > 0 ? `READY IN ${game.turkey.dashCooldown.toFixed(1)}s` : 'SHIFT · BREAK ONE OBSTACLE');
  line(ctx, [[566, 726], [566, 761]], '#7b8a5c', 1);
  feather(ctx, 597, 748, 0.28, '#dab15d');
  text(ctx, game.turkey.hidden ? 'Stay small. Think invisible.' : 'Hide in hay. Buy yourself a little hope.', 622, 742, 12, '#f1e4b9', 'serif', 'italic');
  text(ctx, 'CORN +10   ·   PIE +50   ·   NEAR MISS +15', 622, 760, 9, '#aeb98b');
  text(ctx, 'P  PAUSE     M  SOUND     R  RESTART', 1231, 750, 10, '#c9cba0', 'sans', 'bold', 'right');
  if (game.toast?.life > 0) {
    ctx.globalAlpha = Math.min(1, game.toast.life * 2);
    if (game.toast.kind === 'quiet') {
      const baseline = game.stage === 2 ? 391 : 247;
      tracked(ctx, game.toast.text, 449, baseline, 12, game.stage === 2 ? '#f3d8a1' : '#6e633f', 2);
      tracked(ctx, game.toast.sub || '', 450, baseline + 21, 8, game.stage === 2 ? '#bcc49b' : '#8a774d', 1.5);
    } else {
      const width = Math.max(330, game.toast.text.length * 17);
      rounded(ctx, W / 2 - width / 2, 223, width, 70, 10, game.toast.kind === 'danger' ? '#a74e33ee' : '#294a35ee', '#f3d28d');
      text(ctx, game.toast.text, W / 2, 253, 25, C.cream, 'serif', 'bold', 'center');
      text(ctx, game.toast.sub || '', W / 2, 276, 11, '#efd8a6', 'sans', '500', 'center');
    }
    ctx.globalAlpha = 1;
  }
  const nearbyHay = game.world.hazards.find(hazard => hazard.type === 'haystack' && Math.abs(hazard.x - game.turkey.x) < 135);
  if (nearbyHay && !game.turkey.hidden) {
    rounded(ctx, nearbyHay.x - 72, 451, 144, 32, 7, C.deep, C.gold);
    text(ctx, '↓  HIDE IN THE HAY', nearbyHay.x, 472, 11, C.cream, 'sans', 'bold', 'center');
  }
  frame(ctx);
}
function endScreen(ctx, game) {
  const escaped = game.mode === 'escaped';
  if (!escaped) {
    ctx.fillStyle = '#1b3029b8'; ctx.fillRect(0, 0, W, H);
  } else {
    const shade = ctx.createLinearGradient(0, 0, W, 0);
    shade.addColorStop(0, '#153529d9'); shade.addColorStop(0.57, '#15352980'); shade.addColorStop(1, '#15352900');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, W, H);
  }
  masthead(ctx, game, true);
  rounded(ctx, 75, 181, 644, 489, 16, '#faeac8', '#c8a467');
  rounded(ctx, 93, 199, 608, 453, 10, null, '#d6bc86');
  rounded(ctx, 116, 220, 184, 27, 14, '#e0d3a5');
  tracked(ctx, escaped ? 'OFF THE MENU. FOREVER.' : 'A FOWL TURN OF EVENTS.', 132, 238, 8, '#677147', 1.3);
  text(ctx, escaped ? 'ESCAPED!' : 'CAUGHT!', 111, 333, escaped ? 76 : 84, escaped ? C.deep : C.rust, 'serif', 'bold');
  text(ctx, escaped ? 'Wild at heart. Home for dinner? Never.' : 'Bram got the better of your drumsticks.', 117, 373, 21, '#695b3f', 'serif', 'italic');
  line(ctx, [[118, 399], [672, 399]], '#d4bc8a', 1);
  tracked(ctx, 'FINAL SCORE', 119, 431, 10, '#8a7048', 1.5);
  text(ctx, scoreFor(game.distance, game.bonuses).toLocaleString('en-US'), 116, 486, 51, C.deep, 'serif', 'bold');
  tracked(ctx, escaped ? 'ESCAPE TIME' : 'DISTANCE RUN', 390, 431, 10, '#8a7048', 1.5);
  const elapsed = `${Math.floor(game.elapsed / 60)}:${String(Math.floor(game.elapsed % 60)).padStart(2, '0')}`;
  text(ctx, escaped ? elapsed : `${Math.floor(game.distance)} m`, 388, 486, 42, C.deep, 'serif', 'bold');
  text(ctx, escaped ? `${game.hearts} hearts intact · 3 stages conquered · 1 very lucky turkey` : `${remaining(game.distance)} m from freedom. There’s always another sunrise.`, 119, 520, 13, '#8b7953');
  button(ctx, game, escaped ? 'ONE MORE VICTORY LAP   →' : 'MAKE ANOTHER BREAK   →', 117, 553, 346, 58, 'start', 'orange');
  button(ctx, game, 'Title', 480, 553, 185, 58, 'title', 'pale');
  text(ctx, 'ENTER / R to run again', 119, 639, 11, '#998158');
  if (escaped) {
    ellipse(ctx, 982, 692, 143, 19, '#172f2566');
    drawTurkey(ctx, 973, 673, 2.3, game.time, { still: true, victory: true });
    for (let index = 0; index < 12; index++) {
      const angle = index * 2.4;
      star(ctx, 969 + Math.cos(angle) * (147 + index % 3 * 22), 409 + Math.sin(angle) * 122, 3 + index % 3, '#f4d48d');
    }
    rounded(ctx, 838, 714, 280, 32, 16, '#183c2d', '#a9b67d');
    tracked(ctx, 'WELCOME TO THE WILD, TOM.', 856, 735, 9, '#e9dbac', 1.4);
  }
  tracked(ctx, escaped ? 'THE BEST THANKSGIVING IS THE ONE YOU GET AWAY FROM.' : 'A LITTLE BRAVER. A LITTLE FASTER. TRY AGAIN.', 82, 755, 10, '#eadbb2', 1.2);
  frame(ctx);
}
function pauseScreen(ctx, game) {
  ctx.fillStyle = '#18372bc4'; ctx.fillRect(0, 0, W, H);
  rounded(ctx, 377, 211, 526, 385, 15, C.cream, '#c3a66a');
  tracked(ctx, 'TIME OUT. TURKEY IN.', 430, 260, 10, '#8f764a', 2);
  text(ctx, 'Take a breather.', 429, 318, 44, C.deep, 'serif', 'bold');
  text(ctx, 'Bram can wait. Your escape is right here.', 431, 352, 16, '#8d7850', 'serif', 'italic');
  button(ctx, game, 'BACK TO THE CHASE   →', 429, 387, 422, 56, 'pause', 'orange');
  button(ctx, game, 'How to play', 429, 463, 201, 47, 'help', 'pale');
  button(ctx, game, 'Restart', 650, 463, 201, 47, 'start', 'pale');
  button(ctx, game, 'Return to title', 429, 532, 422, 36, 'title', 'green');
}
function helpScreen(ctx, game) {
  ctx.fillStyle = '#18372be6'; ctx.fillRect(0, 0, W, H);
  rounded(ctx, 220, 92, 840, 623, 16, C.cream, '#c7aa74');
  tracked(ctx, 'THE ART OF NOT BECOMING DINNER', 266, 138, 10, '#8b7249', 2);
  text(ctx, 'A field guide to freedom.', 264, 191, 42, C.deep, 'serif', 'bold');
  const rules = [
    ['SPACE / ↑ / W / TAP', 'Jump', 'Clear fences, hay bales, corn, ovens and rolling pins.'],
    ['↓ / S', 'Slide & hide', 'Duck under scarecrows and knives. Near hay? Hide instead.'],
    ['SHIFT', 'Dash', 'A quick burst smashes one obstacle. Recharges in 4 seconds.'],
    ['P / M / R', 'Pause / sound / restart', 'The on-screen buttons work with a mouse or a thumb.'],
  ];
  rules.forEach((rule, index) => {
    const y = 237 + index * 74;
    rounded(ctx, 266, y, 175, 36, 5, '#e6d2a8', '#c8b084');
    text(ctx, rule[0], 354, y + 23, 12, C.ink, 'sans', 'bold', 'center');
    text(ctx, rule[1], 464, y + 8, 18, C.deep, 'serif', 'bold');
    text(ctx, rule[2], 464, y + 33, 12, '#82704e');
  });
  line(ctx, [[266, 537], [1015, 537]], '#cbb587', 1);
  text(ctx, 'THE PLAN', 266, 567, 11, C.rust, 'sans', 'bold');
  text(ctx, 'Reach the forest at 2,400 m with a heart and a head start.', 372, 568, 15, C.deep, 'serif', 'bold');
  text(ctx, 'Corn +10 · Pie +50 · Near miss +15 · Stage clear +200 · Golden feather = one free hit.', 266, 595, 13, '#82704e');
  text(ctx, 'Haystacks cost 8 m but stop Bram’s sprint. Watch his ? turn into ! before you bolt.', 266, 620, 13, '#82704e');
  button(ctx, game, 'GOT IT. KEEP MY FEATHERS ON.   →', 266, 645, 748, 42, 'closeHelp', 'green');
}
export function renderHud(ctx, game) {
  game.buttons = [];
  if (game.mode === 'title') titleScreen(ctx, game);
  else if (game.mode === 'caught' || game.mode === 'escaped') endScreen(ctx, game);
  else {
    gameHud(ctx, game);
    if (game.mode === 'paused') { game.buttons = []; pauseScreen(ctx, game); }
  }
  if (game.help) { game.buttons = []; helpScreen(ctx, game); }
}
