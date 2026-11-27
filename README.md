# turkey-run-game-01-entry

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/shelbyxxx1/turkey-run-game-01-entry/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/shelbyxxx1/turkey-run-game-01-entry/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Gobble Run: The Great Thanksgiving Escape** — Dinner is cancelled.

An original, single-player Canvas 2D escape runner. Play as Tom, a turkey with excellent survival instincts and absolutely no intention of being lunch. Outrun the gruff Farmer Bram across 2,400 metres of farmyard fences, golden cornfields, and a very ill-advised shortcut through the kitchen. Make it to the forest to get off the menu forever.

Everything you see is drawn in code: fanned feathers, Bram’s pitchfork, parallax barns and corn, hanging pans, swinging knives, glowing ovens, and a deep-green forest. Everything you hear is synthesized with WebAudio. No libraries, downloaded art, audio files, build step, remote requests, or persistent browser storage. Best distance is kept only for the current page session.

## Run it

Requires Node.js 22.18+ (or a newer Node.js release).

```sh
node serve.ts
# Open http://localhost:8080
```

## Keep your feathers on

| Action | Keyboard | Mouse / touch |
| --- | --- | --- |
| Start | Enter | Click “Let’s Fly” |
| Jump | Space / Up / W | Tap the scene or Jump |
| Slide / hide | Down / S | Click Slide / Hide |
| Dash | Shift | Click Dash |
| Pause / resume | P / Escape | Pause button / Back to the Chase |
| Mute | M | Speaker button |
| Restart | R / Enter on end screen | Restart / Victory Lap |

- **Keep a head start:** the gap meter tracks Bram. Clean running and dashing widen it; stumbling and his sprints shrink it. Zero gap or zero hearts means caught.
- **Three hearts:** a hit costs a heart and ground. A golden feather absorbs one hit. After a hit, a brief invulnerability window lets you recover.
- **Hide in hay:** press Down near a haystack to duck inside. Bram stops, searches (`?`), then realizes (`!`). It costs 8 metres but cancels his sprint and delays the next one.
- **Score:** distance + corn kernels (10) + rare pumpkin pie (50) + near misses (15) + stage-clear bonuses (200 each) + an escape bonus (500).
- **Dash thoughtfully:** a burst smashes one obstacle, then recharges. Jump low hazards; slide under scarecrows and knives.

## The route

1. **Farmyard · 0–700 m:** fences, hay bales, mud puddles, and haystack hideaways.
2. **Cornfield · 700–1,500 m:** dense corn, scarecrows, falling ears, and a quicker chase.
3. **Kitchen Gauntlet · 1,500–2,400 m:** open ovens, swinging carving knives, rolling pins, and gravy spills.
4. **Freedom:** the forest, a victory fanfare, final score, and escape time.

## Verification and submission

```sh
node tests/run-tests.mjs
node tests/browser-check.mjs
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The browser check starts its own static server and the installed Chromium headless shell; set `CHROME_BIN` if it lives elsewhere. The game itself has no dependencies. Pure logic tests run without a DOM. `main.ts` packages `game/` and the four JPEGs into `out/` with the canonical make.fun dossier. The vendored make.fun packager is unchanged.

Deterministic, frozen screenshot scenes at 1280 × 800: `?shot=play&seed=1`, `?shot=start&seed=1`, `?shot=kitchen&seed=1`, and `?shot=end&seed=1`. Playing or restarting exits the frozen scene. The first screenshot is the cornfield chase cover.

All game source and artwork were created from scratch for this entry. Only the supplied submission wrapper, static server, and unchanged packaging library come from the kit. The starter game was not read or used. Licensed under MIT.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
