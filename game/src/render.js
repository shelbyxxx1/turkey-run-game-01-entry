import { W, H, GROUND, COLORS as C } from './config.js';
import { farmerX } from './farmer.js';
import { parallax } from './world.js';

export function rounded(ctx, x, y, width, height, radius, fill, stroke = null) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}
export function ellipse(ctx, x, y, rx, ry, fill, stroke = null) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}
export function line(ctx, points, color, width = 2) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) ctx.lineTo(point[0], point[1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}
export function polygon(ctx, points, fill, stroke = null, width = 2) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) ctx.lineTo(point[0], point[1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
export function text(ctx, value, x, y, size = 16, color = C.ink, font = 'sans', weight = '500', align = 'left') {
  ctx.font = `${weight} ${size}px ${font === 'serif' ? 'Georgia, serif' : '"Trebuchet MS", Arial, sans-serif'}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(String(value), x, y);
}
function leaf(ctx, x, y, scale, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-28, -15, -18, -34, 0, -52);
  ctx.bezierCurveTo(18, -30, 25, -12, 0, 0);
  ctx.fillStyle = color;
  ctx.fill();
  line(ctx, [[0, -5], [0, -40]], '#fff1cf55', 1.5);
  ctx.restore();
}
export function feather(ctx, x, y, scale = 1, color = C.gold, angle = 0.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, 21);
  ctx.bezierCurveTo(-27, 2, -17, -28, 3, -39);
  ctx.bezierCurveTo(25, -19, 20, 6, 0, 21);
  ctx.fillStyle = color;
  ctx.fill();
  line(ctx, [[-5, 31], [5, -28]], C.cream, 2.5);
  for (let index = 0; index < 4; index++) line(ctx, [[-1 + index, 12 - index * 9], [11, 4 - index * 9]], '#94622e88', 1.2);
  ctx.restore();
}

function cloud(ctx, x, y, scale, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ellipse(ctx, x, y, 62 * scale, 13 * scale, C.cream);
  ellipse(ctx, x - 22 * scale, y - 12 * scale, 28 * scale, 18 * scale, C.cream);
  ellipse(ctx, x + 14 * scale, y - 19 * scale, 33 * scale, 25 * scale, C.cream);
  ctx.restore();
}
function hill(ctx, offset, baseline, height, width, color) {
  ctx.beginPath();
  ctx.moveTo(-width, H);
  ctx.lineTo(-width, baseline);
  for (let x = -width + offset; x < W + width; x += width) {
    ctx.quadraticCurveTo(x + width * 0.5, baseline - height, x + width, baseline);
  }
  ctx.lineTo(W + width, H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
function barn(ctx, x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  rounded(ctx, -94, -144, 188, 144, 2, '#a65837');
  polygon(ctx, [[-115, -143], [0, -232], [115, -143]], '#65483b');
  polygon(ctx, [[-98, -143], [0, -219], [98, -143]], '#c57343');
  for (let index = -80; index < 90; index += 21) line(ctx, [[index, -135], [index, -3]], '#df9b5b66', 2);
  rounded(ctx, -43, -96, 86, 96, 0, '#664734', '#e6b77a');
  line(ctx, [[0, -94], [0, 0]], '#e6b77a', 5);
  line(ctx, [[-40, -89], [39, -5]], '#e6b77a', 5);
  line(ctx, [[40, -89], [-39, -5]], '#e6b77a', 5);
  rounded(ctx, -24, -181, 48, 31, 2, '#705443', '#edc38b');
  line(ctx, [[0, -180], [0, -152]], '#edc38b', 3);
  rounded(ctx, 66, -245, 46, 244, 14, '#ac9970');
  ellipse(ctx, 89, -240, 24, 11, '#74664a');
  for (let index = -212; index < -10; index += 36) line(ctx, [[68, index], [109, index]], '#807859', 2);
  ctx.restore();
}
function fence(ctx, x, ground, width = 220, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  for (let post = 0; post <= width; post += 80) {
    polygon(ctx, [[x + post - 5, ground], [x + post - 5, ground - 80], [x + post, ground - 87], [x + post + 6, ground - 80], [x + post + 6, ground]], '#b9854b');
  }
  rounded(ctx, x, ground - 67, width, 10, 2, '#dfb976');
  rounded(ctx, x, ground - 35, width, 9, 2, '#d5a666');
  for (let post = 0; post <= width; post += 80) ellipse(ctx, x + post + 1, ground - 62, 2, 2, '#866442');
  ctx.restore();
}
function cornStalk(ctx, x, y, height, color, ears = false) {
  ctx.save(); ctx.translate(x, y);
  line(ctx, [[0, 0], [-5, -height * 0.5], [1, -height]], color, 4);
  for (let index = 0; index < 4; index++) {
    const level = -height * (0.22 + index * 0.16);
    const side = index % 2 ? 1 : -1;
    ctx.beginPath(); ctx.moveTo(-2, level + 24);
    ctx.quadraticCurveTo(46 * side, level - 23, 65 * side, level - 28);
    ctx.quadraticCurveTo(28 * side, level + 11, -2, level + 24);
    ctx.fillStyle = color; ctx.fill();
  }
  for (let index = -2; index <= 2; index++) line(ctx, [[0, -height + 10], [index * 7, -height - 17 + Math.abs(index) * 6]], color, 2);
  if (ears) {
    ctx.save(); ctx.translate(5, -height * 0.54); ctx.rotate(0.38);
    ellipse(ctx, 0, 0, 10, 28, '#e6b855');
    for (let index = -3; index <= 3; index++) line(ctx, [[-6, index * 6], [6, index * 6]], '#bc8236', 1);
    ctx.restore();
  }
  ctx.restore();
}
function tree(ctx, x, y, scale, green = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  polygon(ctx, [[-9, 0], [-7, -130], [2, -150], [11, 0]], '#675438');
  line(ctx, [[0, -86], [-44, -145]], '#675438', 7);
  line(ctx, [[2, -118], [42, -161]], '#675438', 6);
  const colors = green ? ['#667748', '#7e8850', '#5f7349'] : ['#ca7c39', '#d29440', '#b96c34'];
  ellipse(ctx, -32, -149, 57, 51, colors[0]);
  ellipse(ctx, 35, -165, 55, 59, colors[1]);
  ellipse(ctx, -4, -203, 62, 57, colors[2]);
  ellipse(ctx, -20, -213, 37, 30, green ? '#8f9857' : '#dda34b');
  ctx.restore();
}
function outdoor(ctx, game, stage) {
  const scroll = game.world.scroll;
  const sky = ctx.createLinearGradient(0, 80, 0, 640);
  sky.addColorStop(0, '#f8e2b1'); sky.addColorStop(0.65, '#e9b969'); sky.addColorStop(1, '#d29448');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const sunX = stage === 1 ? 955 : 1010;
  ellipse(ctx, sunX, 268, 105, 105, '#f8dca15e');
  ellipse(ctx, sunX, 268, 75, 75, '#ffedbb');
  for (let index = 0; index < 5; index++) cloud(ctx, ((index * 350 + parallax(scroll, 0.09, 1750) + 1750) % 1750) - 180, 225 + index % 2 * 59, 0.65 + index % 3 * 0.2, 0.55);
  hill(ctx, parallax(scroll, 0.10, 500), 461, 105, 500, '#a5a268');
  hill(ctx, parallax(scroll, 0.17, 430), 502, 98, 430, '#8c9158');
  for (let index = 0; index < 4; index++) tree(ctx, index * 490 + parallax(scroll, 0.19, 1960), 494, 0.66, true);
  barn(ctx, 195 + parallax(scroll, 0.13, 1700), 489, stage === 0 ? 1 : 0.74);
  if (stage === 0) {
    tree(ctx, 1030 + parallax(scroll, 0.24, 1650), 543, 1.16);
    for (let index = -1; index < 7; index++) fence(ctx, index * 240 + parallax(scroll, 0.4, 240), 560, 240, 0.8);
  } else {
    ctx.fillStyle = '#929652'; ctx.fillRect(0, 473, W, 90);
    for (let index = -1; index < 31; index++) cornStalk(ctx, index * 51 + parallax(scroll, 0.23, 51), 545, 100 + Math.sin(index * 5) * 20, '#8e914e');
    for (let index = -1; index < 23; index++) cornStalk(ctx, index * 68 + parallax(scroll, 0.42, 68), 572, 126 + Math.sin(index * 9) * 15, index % 2 ? '#b2a24f' : '#9c994b', true);
    rounded(ctx, 0, 560, W, 28, 0, '#9d8d48');
  }
  const path = ctx.createLinearGradient(0, 565, 0, 760);
  path.addColorStop(0, '#d8a666'); path.addColorStop(0.28, '#e5bb7b'); path.addColorStop(1, '#bd884c');
  ctx.fillStyle = path; ctx.fillRect(0, 581, W, 219);
  line(ctx, [[0, 585], [W, 585]], '#edcb8c', 4);
  line(ctx, [[0, 642], [W, 642]], '#a77b4544', 2);
  for (let index = 0; index < 61; index++) {
    const x = ((index * 79 + parallax(scroll, 1, 4900)) % 1450 + 1450) % 1450 - 80;
    const y = 600 + (index * 43 % 112);
    line(ctx, [[x, y], [x + 9 + index % 13, y]], index % 2 ? '#9d713c55' : '#f2d09699', 2);
  }
  if (stage === 1) {
    cornStalk(ctx, -14, 713, 183, '#66713d', true);
    cornStalk(ctx, 1269, 722, 167, '#69733e', true);
  }
  for (let index = 0; index < 10; index++) {
    const x = (index * 163 + scroll * 0.23 + game.time * 16) % 1360 - 30;
    leaf(ctx, x, 272 + index * 37 % 290 + Math.sin(game.time + index) * 14, 0.18 + index % 3 * 0.05, game.time * 0.25 + index, index % 2 ? '#c77d3e99' : '#e5b35caa');
  }
}
function pan(ctx, x, y, size, angle = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  rounded(ctx, -4, 0, 8, 66, 3, '#8b8c6b', '#202e26');
  ellipse(ctx, 0, 92, size, size * 1.08, '#243e33', '#d6b77d');
  ellipse(ctx, -3, 89, size * 0.76, size * 0.81, '#344d3c', '#718267');
  line(ctx, [[-size * 0.45, 78], [-size * 0.3, 69]], '#9c9e73', 3);
  ctx.restore();
}
function kitchen(ctx, game) {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#263f34'); gradient.addColorStop(1, '#627055');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H);
  for (let index = 0; index < 16; index++) {
    const x = index * 100 + parallax(game.world.scroll, 0.1, 100);
    line(ctx, [[x, 170], [x, 498]], '#9eaa7b1c', 2);
    line(ctx, [[x + 5, 170], [x + 5, 498]], '#101e2225', 2);
  }
  const windowX = 135 + parallax(game.world.scroll, 0.09, 1900);
  rounded(ctx, windowX - 12, 213, 240, 217, 4, '#a57f4a', '#1b332a');
  rounded(ctx, windowX, 225, 216, 193, 1, '#edc581');
  ellipse(ctx, windowX + 150, 270, 36, 36, '#ffe6a9');
  polygon(ctx, [[windowX, 390], [windowX + 37, 300], [windowX + 76, 390], [windowX + 115, 315], [windowX + 170, 390], [windowX + 216, 345], [windowX + 216, 418], [windowX, 418]], '#87955b');
  line(ctx, [[windowX + 108, 226], [windowX + 108, 418]], '#b18a52', 9);
  line(ctx, [[windowX, 319], [windowX + 216, 319]], '#b18a52', 9);
  polygon(ctx, [[windowX + 8, 226], [windowX + 60, 226], [windowX + 31, 330], [windowX + 2, 344]], '#c86a3f');
  polygon(ctx, [[windowX + 158, 226], [windowX + 213, 226], [windowX + 215, 344], [windowX + 186, 330]], '#c86a3f');
  for (let index = 0; index < 8; index++) pan(ctx, 420 + index * 151 + parallax(game.world.scroll, 0.13, 151), 225, 24 + index % 3 * 5, Math.sin(index * 3) * 0.13);
  line(ctx, [[325, 235], [1280, 235]], '#b49962', 7);
  for (let row = 0; row < 3; row++) for (let col = -1; col < 22; col++) {
    const x = col * 68 + (row % 2) * 34 + parallax(game.world.scroll, 0.2, 68);
    rounded(ctx, x, 430 + row * 35, 66, 33, 2, row % 2 === col % 2 ? '#c7c097' : '#bcb68d', '#8e9674');
  }
  rounded(ctx, 0, 526, W, 14, 0, '#b28d56');
  rounded(ctx, 0, 540, W, 46, 0, '#3d5540');
  for (let index = -1; index < 10; index++) {
    const x = index * 170 + parallax(game.world.scroll, 0.24, 170);
    rounded(ctx, x + 9, 549, 152, 31, 3, '#435b43', '#7b8860');
    rounded(ctx, x + 64, 558, 42, 5, 2, '#c4ad78');
  }
  ctx.fillStyle = '#bfa477'; ctx.fillRect(0, 586, W, 214);
  for (let row = 0; row < 4; row++) for (let col = -1; col < 18; col++) {
    const x = col * 90 + parallax(game.world.scroll, 1, 180);
    polygon(ctx, [[x, 586 + row * 43], [x + 88, 586 + row * 43], [x + 106, 627 + row * 43], [x + 18, 627 + row * 43]], (col + row) % 2 ? '#c3ac82' : '#7f8a66');
  }
  line(ctx, [[0, 587], [W, 587]], '#e1cc9d', 4);
  const heat = ctx.createLinearGradient(1010, 300, 1010, 670);
  heat.addColorStop(0, '#e9ad4400'); heat.addColorStop(1, '#e97e2824');
  ctx.fillStyle = heat; ctx.fillRect(870, 280, 410, 430);
}
function pine(ctx, x, y, size, color) {
  ctx.fillStyle = '#4b4a32'; ctx.fillRect(x - size * 0.04, y - size, size * 0.08, size);
  for (let index = 0; index < 4; index++) {
    const bottom = y - size * (0.12 + index * 0.18);
    polygon(ctx, [[x - size * (0.33 - index * 0.05), bottom], [x, bottom - size * 0.5], [x + size * (0.33 - index * 0.05), bottom]], color);
  }
}
export function forest(ctx, game) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#e5cf99'); sky.addColorStop(0.65, '#8c9a67'); sky.addColorStop(1, '#405a3f');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ellipse(ctx, 928, 245, 117, 117, '#fce5a591');
  for (let layer = 0; layer < 3; layer++) for (let index = 0; index < 12; index++) {
    pine(ctx, index * 145 - layer * 36, 600 + layer * 48, 270 + layer * 65 + index % 3 * 37, ['#8c9969', '#6a8158', '#486a4d'][layer]);
  }
  ctx.fillStyle = '#355740'; ctx.fillRect(0, 647, W, 153);
  ctx.beginPath(); ctx.moveTo(480, 800); ctx.quadraticCurveTo(1190, 615, 886, 478); ctx.quadraticCurveTo(1330, 616, 1200, 800); ctx.closePath(); ctx.fillStyle = '#bda574'; ctx.fill();
  for (let index = 0; index < 28; index++) leaf(ctx, index * 103 % W, 750 - index * 27 % 154, 0.25, index, index % 3 ? '#baa154' : '#d0813d');
  pine(ctx, 1230, 780, 630, '#244a37');
  pine(ctx, 36, 800, 580, '#294d37');
}

export function drawTurkey(ctx, x, y, scale = 1, time = 0, options = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  const run = options.still ? 0 : Math.sin(time * 19);
  const sliding = options.slide;
  if (options.shield) {
    ctx.save(); ctx.globalAlpha = 0.22 + Math.sin(time * 3) * 0.05;
    ellipse(ctx, 0, -62, 73, 75, '#ffe1a3');
    ctx.lineWidth = 2; ellipse(ctx, 0, -62, 72, 74, null, '#fff2b0');
    ctx.restore();
    for (let index = 0; index < 4; index++) {
      const angle = index * Math.PI / 2 + time * 0.7;
      star(ctx, Math.cos(angle) * 69, -63 + Math.sin(angle) * 72, 3, '#fff2bb');
    }
  }
  if (options.dash) {
    for (let index = 0; index < 4; index++) line(ctx, [[-85 - index * 13, -85 + index * 26], [-135 - index * 15, -85 + index * 26]], '#ffe6ab', 4 - index * 0.5);
  }
  if (sliding) { ctx.translate(0, -1); ctx.scale(1.22, 0.49); }
  const squash = options.squash || 0;
  ctx.scale(1 + squash * 0.35, 1 - squash * 0.4);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 2.5;
  const tail = ['#8f3f2c', '#a74e2c', '#d18a3d', '#ae4d2d', '#d89b46', '#b65c32', '#88412c'];
  for (let index = 0; index < 7; index++) {
    const angle = -1.45 + index * 0.36;
    ctx.save(); ctx.translate(-27, -46); ctx.rotate(angle - 0.63 + run * 0.02);
    ellipse(ctx, 0, -36, 16, 45, tail[index], '#5c3b2c');
    ctx.beginPath(); ctx.ellipse(0, -45, 12, 29, 0, Math.PI, Math.PI * 2); ctx.lineWidth = 5; ctx.strokeStyle = '#e8ba67'; ctx.stroke();
    line(ctx, [[0, -6], [0, -64]], '#f1c87f88', 1.3);
    ctx.restore();
  }
  const legAngle = options.air ? -0.7 : run * 0.7;
  for (let index = 0; index < 2; index++) {
    const side = index ? 1 : -1;
    const foot = side * legAngle * 24;
    line(ctx, [[-7 + index * 22, -29], [-2 + index * 17 + foot * 0.4, -12], [-5 + index * 20 + foot, -1]], '#9b5026', 6);
    line(ctx, [[-6 + index * 20 + foot, -1], [9 + index * 20 + foot, -1]], '#e0a43c', 4);
    line(ctx, [[-3 + index * 20 + foot, -3], [10 + index * 20 + foot, -7]], '#e0a43c', 3);
  }
  ellipse(ctx, 0, -49, 41, 33, '#73452e', '#4d3428');
  ellipse(ctx, 15, -47, 23, 27, '#985d35');
  ctx.save(); ctx.translate(-7, -50); ctx.rotate(-0.25 + run * 0.07);
  ellipse(ctx, 0, 0, 29, 18, '#b07840', '#663d29');
  for (let index = 0; index < 3; index++) line(ctx, [[-18, -3 + index * 7], [8 + index * 3, -6 + index * 7]], '#dc9c54', 2);
  ctx.restore();
  ctx.beginPath(); ctx.moveTo(19, -58); ctx.quadraticCurveTo(33, -81, 30, -99); ctx.quadraticCurveTo(33, -119, 48, -113); ctx.quadraticCurveTo(66, -109, 53, -89); ctx.lineTo(48, -55); ctx.closePath(); ctx.fillStyle = '#bc6e3c'; ctx.fill(); ctx.strokeStyle = '#603925'; ctx.lineWidth = 2.5; ctx.stroke();
  ellipse(ctx, 44, -100, 18, 19, '#c88a50', '#603925');
  ellipse(ctx, 48, -104, 9, 11, '#fff5d7');
  ellipse(ctx, 52, -104, 3.6, 5, '#263d31');
  ellipse(ctx, 53, -106, 1.1, 1.5, '#fffaf0');
  polygon(ctx, [[59, -101], [78, -96], [59, -89]], '#eab348', '#89502a', 2);
  ellipse(ctx, 57, -81, 6, 13, '#b4402b');
  ellipse(ctx, 38, -118, 5, 6, '#ba432c');
  ellipse(ctx, 45, -121, 5, 7, '#c04b2d');
  ellipse(ctx, 52, -117, 5, 6, '#b4402b');
  ctx.beginPath(); ctx.moveTo(48, -117); ctx.quadraticCurveTo(66, -117, 61, -101); ctx.strokeStyle = '#c34e31'; ctx.lineWidth = 5; ctx.stroke();
  line(ctx, [[43, -118], [54, -115]], '#5d3926', 2);
  if (options.victory) {
    ctx.save(); ctx.translate(28, -146); ctx.rotate(-0.1);
    polygon(ctx, [[-18, 10], [-22, -9], [-10, -1], [-1, -19], [8, -1], [21, -12], [17, 11]], '#e6b14f', '#f9dfa0', 2);
    star(ctx, -1, 1, 4, '#fff0b7'); ctx.restore();
  }
  ctx.restore();
}
export function drawFarmer(ctx, x, y, scale = 1, time = 0, state = 'chasing') {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const searching = state === 'searching' || state === 'suspicious';
  const run = searching ? 0 : Math.sin(time * 13);
  ctx.rotate(searching ? -0.02 : 0.09);
  for (let index = 0; index < 2; index++) {
    const side = index ? 1 : -1;
    const foot = side * run * 28;
    line(ctx, [[index * 15 - 10, -61], [index * 14 - 12 + foot * 0.7, -32], [index * 10 - 15 + foot, -8]], index ? '#40595a' : '#304c49', 19);
    rounded(ctx, index * 10 - 25 + foot, -12, 33, 13, 4, '#3b3026');
    line(ctx, [[index * 10 - 21 + foot, -1], [index * 10 + 7 + foot, -1]], '#b58a54', 3);
  }
  ctx.save(); ctx.translate(17, -112); ctx.rotate(run * 0.45);
  line(ctx, [[0, 0], [26, 28], [53, 13]], '#9d5834', 17);
  ellipse(ctx, 55, 13, 9, 10, '#d49a65'); ctx.restore();
  rounded(ctx, -28, -129, 57, 75, 14, '#ae6237', '#503e2c');
  polygon(ctx, [[-22, -117], [-12, -113], [-10, -85], [15, -85], [18, -115], [28, -113], [25, -57], [-24, -57]], '#4d6961', '#324e47');
  line(ctx, [[-11, -119], [-8, -86]], '#aab082', 3);
  line(ctx, [[18, -118], [15, -86]], '#aab082', 3);
  rounded(ctx, -7, -82, 21, 16, 2, '#62796c', '#344f46');
  ellipse(ctx, -8, -89, 3, 3, '#dec685'); ellipse(ctx, 15, -89, 3, 3, '#dec685');
  line(ctx, [[-22, -114], [-38 - run * 7, -82], [-5 + run * 13, -81]], '#ba7040', 17);
  ellipse(ctx, -5 + run * 13, -81, 9, 10, '#d8a06e');
  rounded(ctx, -15, -173, 45, 47, 14, '#d09a68', '#674931');
  ellipse(ctx, -18, -149, 8, 11, '#c38b5b', '#674931');
  polygon(ctx, [[24, -153], [40, -143], [24, -140]], '#dba777');
  ellipse(ctx, 17, -153, 2.5, 3, '#24392d');
  line(ctx, [[10, -160], [24, -158]], '#5f472e', 4);
  ctx.beginPath(); ctx.moveTo(4, -139); ctx.quadraticCurveTo(15, -150, 24, -137); ctx.quadraticCurveTo(13, -130, 4, -139); ctx.fillStyle = '#6c583c'; ctx.fill();
  line(ctx, [[17, -130], [27, -130]], '#865a3e', 2);
  rounded(ctx, -18, -201, 45, 37, 9, '#7f6e43', '#423d2b');
  rounded(ctx, -20, -178, 50, 11, 2, '#ac7b39');
  ellipse(ctx, 3, -167, 46, 9, '#99834d', '#4e452e');
  ctx.save(); ctx.translate(51, -72); ctx.rotate(0.18 + run * 0.025);
  line(ctx, [[0, 36], [0, -132]], '#855a33', 6);
  line(ctx, [[-17, -156], [-17, -136], [0, -126], [17, -136], [17, -156]], '#c7c7a3', 4);
  line(ctx, [[0, -126], [0, -162]], '#c7c7a3', 4);
  ctx.restore();
  if (searching || state === 'sprinting') {
    ellipse(ctx, -3, -238, 22, 23, '#fff0c9', '#7d693c');
    text(ctx, state === 'searching' ? '?' : '!', -3, -229, 29, C.rust, 'serif', 'bold', 'center');
  }
  ctx.restore();
}
export function star(ctx, x, y, radius, color) {
  polygon(ctx, [[x, y - radius * 1.7], [x + radius * 0.38, y - radius * 0.38], [x + radius * 1.4, y], [x + radius * 0.38, y + radius * 0.38], [x, y + radius * 1.7], [x - radius * 0.38, y + radius * 0.38], [x - radius * 1.4, y], [x - radius * 0.38, y - radius * 0.38]], color);
}

function drawBale(ctx, x, y, width, height, hide = false) {
  ctx.save(); ctx.translate(x, y); ctx.lineWidth = 2;
  if (hide) {
    ctx.beginPath(); ctx.moveTo(-width / 2, 0); ctx.quadraticCurveTo(-width / 2 + 10, -height * 0.7, -8, -height); ctx.quadraticCurveTo(45, -height * 0.6, width / 2, 0); ctx.closePath(); ctx.fillStyle = '#d7ab4e'; ctx.fill(); ctx.strokeStyle = '#8e6f35'; ctx.stroke();
    for (let index = -5; index <= 5; index++) line(ctx, [[index * 10, -4], [index * 6 - 4, -height + Math.abs(index) * 13]], '#f2cf73', 2);
    line(ctx, [[-45, -15], [35, -59]], '#b98b3e', 2);
    line(ctx, [[-30, -59], [45, -16]], '#eac465', 2);
    ellipse(ctx, 0, -17, 24, 17, '#8d6a35');
  } else {
    rounded(ctx, -width / 2, -height, width, height, 10, '#d7aa4f', '#916932');
    rounded(ctx, -width / 2 + 5, -height + 6, width - 10, height - 12, 8, null, '#f0c875');
    for (let row = 0; row < 6; row++) for (let col = 0; col < 4; col++) line(ctx, [[-width / 2 + 8 + col * 18, -height + 11 + row * 9], [-width / 2 + 17 + col * 18, -height + 8 + row * 9]], row % 2 ? '#edc76c' : '#bb8e3f', 1.5);
    for (const side of [-1, 1]) { rounded(ctx, side * width * 0.26 - 3, -height, 6, height, 1, '#95703c'); line(ctx, [[side * width * 0.26, -height + 2], [side * width * 0.26, -2]], '#bd9050', 1); }
  }
  ctx.restore();
}
function drawOven(ctx, x, y, time) {
  ctx.save(); ctx.translate(x, y);
  rounded(ctx, -55, -93, 110, 90, 8, '#3c4b3e', '#233b30');
  rounded(ctx, -60, -96, 120, 17, 4, '#a2a38b', '#374b3e');
  for (let index = -1; index <= 1; index++) ellipse(ctx, index * 32, -86, 5, 5, '#ded7b8', '#364534');
  rounded(ctx, -44, -70, 88, 58, 4, '#422e20', '#d99a42');
  const glow = ctx.createRadialGradient(0, -25, 4, 0, -25, 47);
  glow.addColorStop(0, '#ffd172'); glow.addColorStop(0.6, '#e77f2d'); glow.addColorStop(1, '#9e4325');
  rounded(ctx, -38, -64, 76, 49, 2, glow);
  for (let index = -2; index <= 2; index++) line(ctx, [[index * 13, -23], [index * 13 + 7, -50]], '#ffdc88', 3);
  polygon(ctx, [[-45, -12], [45, -12], [64, 9], [-62, 9]], '#758071', '#324d3e', 3);
  rounded(ctx, -23, -7, 46, 5, 2, '#c9c8a7');
  for (let index = 0; index < 3; index++) {
    ctx.beginPath();
    ctx.moveTo(-31 + index * 29, -111);
    ctx.bezierCurveTo(-51 + index * 29 + Math.sin(time * 3 + index) * 7, -133, -9 + index * 29, -143, -30 + index * 29, -169);
    ctx.strokeStyle = '#f9d49b88'; ctx.lineWidth = 3; ctx.stroke();
  }
  text(ctx, 'HOT!', 0, -33, 11, '#6b3d24', 'sans', 'bold', 'center');
  ctx.restore();
}
export function drawHazard(ctx, hazard, time) {
  if (hazard.removed) return;
  const { x, y, type, w, h } = hazard;
  ctx.save();
  if (hazard.hit) ctx.globalAlpha = 0.42;
  if (!['knife', 'fallingCorn', 'scarecrow'].includes(type)) ellipse(ctx, x + 4, GROUND + 5, w * 0.62, 8, '#65442f33');
  if (type === 'bale' || type === 'haystack') drawBale(ctx, x, y, w, h, type === 'haystack');
  if (type === 'fence') {
    fence(ctx, x - w / 2 + 4, y, w - 9);
    line(ctx, [[x - 27, y - 56], [x + 28, y - 17]], '#a16a3c', 7);
  }
  if (type === 'mud' || type === 'gravy') {
    ellipse(ctx, x, y - 3, w / 2, 9, type === 'mud' ? '#795437' : '#925a2e', '#6a4a2b');
    ellipse(ctx, x - 13, y - 5, w * 0.26, 3, '#d5a46488');
    ellipse(ctx, x + 29, y - 3, 8, 2, '#d6b27a88');
    if (type === 'gravy') { ellipse(ctx, x - 30, y - 8, 5, 5, '#b08147'); ellipse(ctx, x + 6, y - 9, 3, 4, '#b08147'); }
  }
  if (type === 'cornrow') {
    cornStalk(ctx, x - 21, y, 82, '#6e783c', true);
    cornStalk(ctx, x + 14, y, 90, '#808444', true);
  }
  if (type === 'scarecrow') {
    line(ctx, [[x, GROUND], [x, y - 95]], '#85603a', 8);
    line(ctx, [[x - 57, y - 40], [x + 56, y - 40]], '#8b6238', 7);
    polygon(ctx, [[x - 15, y - 70], [x + 17, y - 70], [x + 53, y - 47], [x + 44, y - 25], [x + 21, y - 39], [x + 20, y], [x - 22, y], [x - 18, y - 38], [x - 44, y - 27], [x - 52, y - 45]], '#aa5939', '#70472d');
    line(ctx, [[x - 11, y - 63], [x + 8, y - 7]], '#d08b55', 3);
    ellipse(ctx, x + 3, y - 87, 23, 22, '#ddad65', '#805333');
    for (const side of [-1, 1]) { line(ctx, [[x + side * 10 - 3, y - 92], [x + side * 10 + 3, y - 86]], '#65442f', 2); line(ctx, [[x + side * 10 + 3, y - 92], [x + side * 10 - 3, y - 86]], '#65442f', 2); }
    line(ctx, [[x - 7, y - 76], [x + 10, y - 75]], '#805333', 2);
    polygon(ctx, [[x - 30, y - 104], [x - 13, y - 132], [x + 15, y - 123], [x + 22, y - 104]], '#8b713e', '#6e562f');
    ellipse(ctx, x, y - 105, 40, 7, '#b49754', '#7d6439');
    for (let index = 0; index < 4; index++) line(ctx, [[x - 45, y - 36], [x - 58, y - 26 + index * 4]], '#dcb568', 2);
  }
  if (type === 'fallingCorn') {
    ctx.save(); ctx.translate(x, y - 25); ctx.rotate(time * 2);
    ellipse(ctx, 0, 0, 13, 27, '#e6b34a', '#94743a');
    for (let row = -3; row <= 3; row++) for (let col = -1; col <= 1; col++) ellipse(ctx, col * 7, row * 6, 3, 2.4, row % 2 ? '#f8d477' : '#f1c460');
    polygon(ctx, [[-4, 29], [-22, -7], [-9, 1], [0, 18], [11, -4], [20, -13], [8, 28]], '#879447', '#66743a', 1.5);
    ctx.restore();
    line(ctx, [[x - 10, y - 76], [x - 7, y - 65]], '#f7dd9d', 2);
  }
  if (type === 'oven') drawOven(ctx, x, y, time);
  if (type === 'knife') {
    line(ctx, [[x - 28, 235], [x, y - 111]], '#bca97b', 2);
    ctx.save(); ctx.translate(x, y - 36); ctx.rotate(Math.sin(time * 3.1 + hazard.phase) * 0.22);
    rounded(ctx, -6, -95, 15, 48, 5, '#76462f', '#392f25');
    for (let index = 0; index < 3; index++) ellipse(ctx, 1, -84 + index * 12, 2, 2, '#d8c38d');
    polygon(ctx, [[-7, -49], [17, -49], [28, 29], [8, 35], [-9, 22]], '#d6dbbd', '#425349', 2.5);
    polygon(ctx, [[8, -44], [17, -46], [26, 28], [17, 30]], '#fff4d9');
    line(ctx, [[-10, -49], [20, -49]], '#b4ac87', 5);
    ctx.restore();
    line(ctx, [[x + 43, y - 48], [x + 50, y - 30]], '#d5cba578', 2);
  }
  if (type === 'pin') {
    ctx.save(); ctx.translate(x, y - 17); ctx.rotate(Math.sin(time * 9) * 0.07);
    rounded(ctx, -w / 2 - 7, -5, w + 14, 10, 5, '#8d5c32', '#734a2a');
    rounded(ctx, -w / 2 + 7, -17, w - 14, 34, 12, '#d8ab68', '#855e36');
    line(ctx, [[-25, -8], [25, -8]], '#edc98c', 3);
    line(ctx, [[-18, 8], [21, 8]], '#b88b51', 2);
    ctx.restore();
  }
  ctx.restore();
}
export function drawKernel(ctx, x, y, scale = 1, phase = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.2 + Math.sin(phase) * 0.12); ctx.scale(scale, scale);
  ellipse(ctx, 0, 0, 9, 12, '#f7c456', '#ac7734');
  ellipse(ctx, -2.5, -3, 3, 5, '#ffe69b');
  ctx.restore();
}
export function drawPickup(ctx, pickup, time) {
  const y = pickup.y + Math.sin(time * 3 + pickup.phase) * 5;
  if (pickup.type === 'corn') {
    ellipse(ctx, pickup.x, y, 16, 19, '#ffe5a62a');
    drawKernel(ctx, pickup.x, y, 1, time + pickup.phase);
  } else if (pickup.type === 'feather') {
    ellipse(ctx, pickup.x, y - 5, 31, 36, '#fcebb63b');
    feather(ctx, pickup.x, y, 0.67);
    star(ctx, pickup.x + 28, y - 15, 4, '#fff5cc');
    star(ctx, pickup.x - 25, y + 8, 3, '#fff5cc');
  } else {
    ellipse(ctx, pickup.x, y + 15, 25, 5, '#fff4cb88');
    polygon(ctx, [[pickup.x - 20, y - 1], [pickup.x + 18, y - 15], [pickup.x + 19, y + 11], [pickup.x - 20, y + 15]], '#b9652f', '#8e512e');
    polygon(ctx, [[pickup.x - 20, y - 1], [pickup.x + 18, y - 15], [pickup.x + 21, y - 7], [pickup.x - 19, y + 5]], '#e4a44d');
    ellipse(ctx, pickup.x + 1, y - 5, 8, 6, '#fff2d1');
    ellipse(ctx, pickup.x + 2, y - 10, 5, 4, '#fff7de');
  }
}
export function renderScene(ctx, game) {
  ctx.save();
  if (game.shake > 0 && !game.shot) ctx.translate(Math.sin(game.time * 92) * game.shake * 8, Math.cos(game.time * 73) * game.shake * 5);
  if (game.mode === 'escaped') forest(ctx, game);
  else if (game.stage === 2 && game.mode !== 'title') kitchen(ctx, game);
  else outdoor(ctx, game, game.mode === 'title' ? 0 : game.stage);
  if (game.mode === 'playing' || game.mode === 'paused' || game.mode === 'caught') {
    const turkey = game.turkey;
    for (const hazard of game.world.hazards) if (hazard.type === 'haystack' && !turkey.hidden) drawHazard(ctx, hazard, game.time);
    ellipse(ctx, turkey.x, GROUND + 6, turkey.grounded ? 51 : 37, 9, '#5e472c3d');
    ellipse(ctx, farmerX(game.farmer), GROUND + 8, 44, 8, '#5e472c3d');
    drawFarmer(ctx, farmerX(game.farmer), GROUND, 0.91, game.time, game.farmer.state === 'chasing' && game.farmer.sprint > 0 ? 'sprinting' : game.farmer.state);
    for (const hazard of game.world.hazards) if (hazard.type !== 'haystack') drawHazard(ctx, hazard, game.time);
    for (const pickup of game.world.pickups) drawPickup(ctx, pickup, game.time);
    for (const particle of game.particles) {
      ctx.globalAlpha = Math.min(1, particle.life * 2);
      if (particle.label) text(ctx, particle.label, particle.x, particle.y, 19, particle.color, 'sans', 'bold', 'center');
      else ellipse(ctx, particle.x, particle.y, particle.size, particle.size * 0.68, particle.color);
    }
    ctx.globalAlpha = 1;
    if (!turkey.hidden) {
      if (turkey.invulnerable > 0 && Math.floor(game.time * 18) % 2 === 0) ctx.globalAlpha = 0.45;
      drawTurkey(ctx, turkey.x, turkey.y, 1.07, game.time, { slide: turkey.slide > 0, air: !turkey.grounded, squash: turkey.squash, shield: turkey.shield, dash: turkey.dash > 0 });
      ctx.globalAlpha = 1;
    } else {
      for (const hazard of game.world.hazards) if (hazard.type === 'haystack') drawHazard(ctx, hazard, game.time);
      text(ctx, 'shhh…', turkey.x, GROUND - 123, 21, C.cream, 'serif', 'italic', 'center');
    }
    if (turkey.dash > 0) text(ctx, 'WHOOSH!', turkey.x - 25, turkey.y - 147, 21, C.cream, 'sans', 'bold', 'center');
  }
  ctx.restore();
  if (game.flash > 0) { ctx.globalAlpha = game.flash * 0.25; ctx.fillStyle = C.cream; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
