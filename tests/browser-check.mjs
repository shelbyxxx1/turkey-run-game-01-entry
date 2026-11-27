import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const chromePath = process.env.CHROME_BIN || '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1148/chrome-linux/headless_shell';
const profile = await mkdtemp(join(tmpdir(), 'gobble-browser-'));
const port = 8100 + process.pid % 1000;
const debugPort = port + 1001;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['serve.ts', '--port', String(port)], { cwd: root, stdio: 'ignore' });
const browser = spawn(chromePath, ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required', `--user-data-dir=${profile}`, `--remote-debugging-port=${debugPort}`, '--window-size=1280,800', 'about:blank'], { stdio: 'ignore' });
const sleep = milliseconds => new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));
let socket;
let passed = 0;
async function waitFor(url) {
  for (let attempt = 0; attempt < 100; attempt++) {
    try { const response = await fetch(url); if (response.ok) return response; } catch {}
    await sleep(60);
  }
  throw new Error(`Timed out starting ${url}`);
}
try {
  await waitFor(origin);
  const response = await waitFor(`http://127.0.0.1:${debugPort}/json/list`);
  const targets = await response.json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolvePromise, reject) => { socket.onopen = resolvePromise; socket.onerror = reject; });
  let nextId = 1;
  const pending = new Map();
  const errors = [];
  const requests = [];
  const badResponses = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const callback = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callback?.reject(new Error(JSON.stringify(message.error)));
      else callback?.resolvePromise(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(JSON.stringify(message.params.args));
    if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) badResponses.push(message.params.response.url);
  };
  function command(method, params = {}) {
    const id = nextId++;
    return new Promise((resolvePromise, reject) => {
      pending.set(id, { resolvePromise, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
  async function load(query = '') {
    await command('Page.navigate', { url: `${origin}/${query}` });
    await sleep(170);
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate('Boolean(window.__gobble && document.readyState === "complete")')) break;
      await sleep(30);
    }
    await sleep(50);
  }
  async function key(code, keyValue = code) {
    await command('Input.dispatchKeyEvent', { type: 'keyDown', code, key: keyValue });
    await command('Input.dispatchKeyEvent', { type: 'keyUp', code, key: keyValue });
  }
  async function click(x, y) {
    await sleep(40);
    await command('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
    await sleep(40);
  }
  function check(name, condition) {
    assert.ok(condition, name);
    passed++;
    console.log(`✓ ${name}`);
  }
  await command('Runtime.enable');
  await command('Network.enable');
  await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  for (const shot of ['start', 'play', 'kitchen', 'end']) {
    const hashes = [];
    for (let iteration = 0; iteration < 2; iteration++) {
      await load(`?shot=${shot}&seed=1`);
      const scene = await evaluate('({shot:__gobble.state.shot,mode:__gobble.state.mode,stage:__gobble.state.stage,canvas:document.querySelector("canvas").toDataURL()})');
      check(`${shot} scene load ${iteration + 1} renders the expected state`, scene.shot === shot && scene.canvas.length > 50000);
      hashes.push(createHash('sha256').update(scene.canvas).digest('hex'));
      if (iteration === 1) {
        await sleep(140);
        const later = await evaluate('document.querySelector("canvas").toDataURL()');
        check(`${shot} frozen scene stays pixel-identical across later frames`, hashes[1] === createHash('sha256').update(later).digest('hex'));
      }
    }
    check(`${shot} scene is pixel-deterministic across two loads`, hashes[0] === hashes[1]);
  }
  await load('?seed=1');
  await click(450, 535);
  check('How to play is mouse-clickable', await evaluate('__gobble.state.help'));
  await click(640, 665);
  check('Instructions close button is mouse-clickable', !await evaluate('__gobble.state.help'));
  await key('Enter', 'Enter');
  check('Enter starts a real run', await evaluate('__gobble.state.mode === "playing" && __gobble.state.audio.context !== null'));
  await key('Space', ' ');
  check('Space jumps immediately', await evaluate('!__gobble.state.turkey.grounded'));
  await evaluate('__gobble.advance(1)');
  await key('ArrowDown', 'ArrowDown');
  check('Down slides', await evaluate('__gobble.state.turkey.slide > 0'));
  await key('ShiftLeft', 'Shift');
  check('Shift dashes with one smash charge', await evaluate('__gobble.state.turkey.dash > 0 && __gobble.state.turkey.dashCharge === 1'));
  await click(1205, 72);
  const pausedDistance = await evaluate('__gobble.state.distance');
  await sleep(100);
  check('Pause button freezes the run', await evaluate('__gobble.state.mode') === 'paused' && await evaluate('__gobble.state.distance') === pausedDistance);
  await click(640, 410);
  check('Resume button continues the run', await evaluate('__gobble.state.mode') === 'playing');
  await key('KeyM', 'm');
  check('M toggles mute', await evaluate('__gobble.state.audio.muted'));
  await key('KeyR', 'r');
  check('R restarts with full hearts', await evaluate('__gobble.state.hearts === 3 && __gobble.state.distance < 10'));
  const collision = await evaluate(`(() => {
    const state = __gobble.state;
    state.world.hazards = [{type:'bale',x:424,y:618,w:84,h:65,phase:0,hit:false,passed:false,close:false,removed:false}];
    __gobble.advance(0.01);
    return {hearts:state.hearts,gap:state.farmer.gap,invulnerable:state.turkey.invulnerable};
  })()`);
  check('An actual collision costs one heart, gap and grants recovery', collision.hearts === 2 && collision.gap < 50 && collision.invulnerable > 1);
  const shield = await evaluate(`(() => {
    const state = __gobble.state;
    state.turkey.invulnerable=0; state.turkey.shield=true;
    state.world.hazards = [{type:'bale',x:424,y:618,w:84,h:65,phase:0,hit:false,passed:false,close:false,removed:false}];
    __gobble.advance(0.01);
    return state.hearts===2 && !state.turkey.shield;
  })()`);
  check('Golden feather absorbs one real collision', shield);
  const smash = await evaluate(`(() => {
    const state=__gobble.state;
    state.turkey.invulnerable=0;state.turkey.dashCooldown=0;
    state.world.hazards=[{type:'oven',x:424,y:618,w:106,h:86,phase:0,hit:false,passed:false,close:false,removed:false}];
    __gobble.action('dash');__gobble.advance(0.01);
    return !state.world.hazards.some(hazard=>hazard.type==='oven' && !hazard.removed) && state.hearts===2 && state.turkey.dashCharge===0;
  })()`);
  check('Dash smashes exactly one real obstacle without losing a heart', smash);
  const pickup = await evaluate(`(() => {
    __gobble.action('start'); const state=__gobble.state;
    state.world.pickups=[{type:'corn',x:424,y:575,taken:false,phase:0},{type:'pie',x:424,y:575,taken:false,phase:0},{type:'feather',x:424,y:575,taken:false,phase:0}];
    __gobble.advance(0.01);
    return state.bonuses===60 && state.turkey.shield;
  })()`);
  check('Corn, rare pie and feather pickups work during play', pickup);
  const nearMiss = await evaluate(`(() => {
    const state=__gobble.state;state.world.pickups=[];
    state.turkey.y=520;state.turkey.grounded=false;state.turkey.vy=0;
    state.world.hazards=[{type:'bale',x:424,y:618,w:84,h:65,phase:0,hit:false,passed:false,close:false,removed:false}];
    __gobble.advance(0.01);
    state.turkey.y=545;state.turkey.vy=0;
    __gobble.advance(0.01);
    state.world.hazards[0].x=345;__gobble.advance(0.01);
    return state.bonuses===75 && state.slow>0 && state.flash>0;
  })()`);
  check('Near misses award +15 with slow motion and a flash', nearMiss);
  await evaluate('__gobble.action("start");__gobble.advance(0.4)');
  const hiding = await evaluate(`(() => {
    const state = __gobble.state;
    state.world.hazards=[{type:'haystack',x:474,y:618,w:126,h:104,safe:true}];
    state.turkey.grounded=true; state.turkey.y=618;
    const distance = state.distance;
    __gobble.action('slide');
    const hidden = state.turkey.hidden && state.farmer.search>0 && state.distance<distance;
    __gobble.advance(1.4);
    const suspicious=state.farmer.state==='suspicious';
    __gobble.advance(0.5);
    return hidden && suspicious && !state.turkey.hidden && state.farmer.sprint===0;
  })()`);
  check('Hay hiding costs distance, searches, spots, and resets sprint', hiding);
  const stage = await evaluate(`(() => {
    __gobble.action('start'); const state=__gobble.state;
    state.distance=699.9; __gobble.advance(0.02);
    const corn=state.stage===1 && state.bonuses===200;
    state.distance=1499.9; __gobble.advance(0.02);
    return corn && state.stage===2 && state.bonuses===400;
  })()`);
  check('Live stage transitions award bonuses and increase difficulty', stage);
  const victory = await evaluate('__gobble.state.distance=2399.9;__gobble.advance(0.02);({mode:__gobble.state.mode,score:__gobble.state.bonuses})');
  check('Reaching the forest gives an escaped screen and finish bonus', victory.mode === 'escaped' && victory.score === 900);
  await key('Enter', 'Enter');
  await evaluate('__gobble.state.farmer.gap=0;__gobble.advance(0.01)');
  check('Zero gap triggers the caught screen', await evaluate('__gobble.state.mode') === 'caught');
  await click(300, 580);
  check('Caught screen restart is mouse-clickable', await evaluate('__gobble.state.mode') === 'playing');
  await evaluate('__gobble.state.hearts=0;__gobble.advance(0.01)');
  check('Zero hearts also triggers the caught screen', await evaluate('__gobble.state.mode') === 'caught');
  await click(550, 580);
  check('End screen Title button returns to the title', await evaluate('__gobble.state.mode') === 'title');
  await click(220, 536);
  check('Title start button is mouse-clickable', await evaluate('__gobble.state.mode') === 'playing');
  const bot = await evaluate(`(() => {
    __gobble.action('start');
    let jumps=0,slides=0;
    for(let frame=0;frame<16000 && __gobble.state.mode==='playing';frame++) {
      const state=__gobble.state;
      const turkey=state.turkey;
      const upcoming=state.world.hazards.filter(hazard=>!hazard.safe && !hazard.hit && !hazard.removed && hazard.x+hazard.w/2>turkey.x-25).sort((first,second)=>first.x-second.x)[0];
      if(upcoming) {
        const distance=upcoming.x-turkey.x;
        if(['knife','scarecrow'].includes(upcoming.type)) {
          if(distance<135 && distance>-95) {__gobble.action('slide');slides++;}
        } else if(distance<145 && distance>0 && turkey.grounded) {
          __gobble.action('jump');jumps++;
        }
      }
      __gobble.advance(1/120);
    }
    const state=__gobble.state;
    return {mode:state.mode,distance:state.distance,hearts:state.hearts,score:Math.floor(state.distance)+state.bonuses,jumps,slides,elapsed:state.elapsed};
  })()`);
  console.log('Full-run keyboard-action bot:', JSON.stringify(bot));
  check('A full, unmodified 2400-metre run is winnable using normal actions', bot.mode === 'escaped' && bot.hearts > 0 && bot.jumps > 10 && bot.slides > 0);
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await load('?shot=start&seed=1');
  const mobile = await evaluate('(()=>{const r=document.querySelector("canvas").getBoundingClientRect();return {width:r.width,height:r.height,overflow:document.documentElement.scrollWidth>innerWidth}})()');
  check('Canvas fits a narrow mobile viewport without overflow', mobile.width <= 390 && !mobile.overflow);
  check('Browser console and runtime have no errors', errors.length === 0);
  check('All loaded resources return successful responses', badResponses.length === 0);
  check('No external network requests occur', requests.every(url => url.startsWith(origin + '/')));
  console.log(`\n${passed} browser checks passed. ${requests.length} local requests; 0 external; 0 console errors.`);
} finally {
  socket?.close();
  browser.kill('SIGTERM'); server.kill('SIGTERM');
  await sleep(150);
  await rm(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 100 });
}

let referenceCount = 0;
async function audit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) { await audit(file); continue; }
    const source = await readFile(file, 'utf8');
    assert.ok(!/\b(?:fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|localStorage|sessionStorage|serviceWorker|eval\s*\(|new\s+Function\b)|\bdocument\.cookie|data:/i.test(source), `Forbidden API in ${file}`);
    const references = [...source.matchAll(/(?:\b(?:src|href)\s*=\s*["']([^"']+)["']|\bfrom\s*['"]([^'"]+)['"])/g)].map(match => match[1] || match[2]);
    for (const reference of references) {
      assert.ok(reference.startsWith('./') || reference.startsWith('../'), `Non-relative reference ${reference}`);
      assert.ok(resolve(dirname(file), reference).startsWith(join(root, 'game') + '/'), `Escaping reference ${reference}`);
      await readFile(resolve(dirname(file), reference));
      referenceCount++;
    }
  }
}
await audit(join(root, 'game'));
console.log(`✓ Static game audit: ${referenceCount} relative, existing references; no forbidden APIs or data URIs.`);
