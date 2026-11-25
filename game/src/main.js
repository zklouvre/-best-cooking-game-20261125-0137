// SENJA RAMEN — main: boot, the one loop, and the screens.
// Input is read every frame; the world advances in fixed 1/60 s steps (several in a
// slow frame, none in a fast one); the renderer paints what is there.
// ?seed=N fixes the random pattern. ?shot=cover|rush|upgrade|title (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { W, H } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { createRenderer, SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_UPGRADE, SCREEN_OVER } from './render.js';
import { createInput } from './input.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;
const STEP = 1 / 60;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
world.muted = false;
world.best = 0;
// Debug/verification handle: lets a test driver read the live game state.
// (Harmless in play; the game never reads it.)
window.__senja = world;
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem('senja-ramen-best') ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}
function saveBest(value) {
  try {
    window.localStorage.setItem('senja-ramen-best', String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  world.best = scene.best;
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, world, {
    start() {
      if (world.screen === SCREEN_TITLE || world.screen === SCREEN_OVER) {
        world.startGame();
      }
    },
  });
  void input;
  world.best = readBest();
  let screen = SCREEN_TITLE;
  let accumulator = 0;
  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    const elapsed = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    let steps = 0;
    while (accumulator >= STEP && steps < 5) {
      world.update(STEP);
      accumulator -= STEP;
      steps += 1;
    }
    if (world.screen !== screen) {
      screen = world.screen;
      if (screen === SCREEN_OVER) {
        if (world.score > world.best) {
          world.best = world.score;
          saveBest(world.best);
        }
      }
    }
    renderer.draw(world, world.screen, world.best);
    status.textContent = world.screen === SCREEN_PLAY
      ? 'Shift ' + (world.shiftIndex + 1) + ' · ' + world.served + ' served · ' + world.coins + ' coins'
      : world.screen === SCREEN_TITLE
        ? 'SENJA RAMEN — press Enter or click to start'
        : world.screen === SCREEN_UPGRADE
          ? 'Shift complete — pick an upgrade'
          : world.screen === SCREEN_OVER
            ? 'Closing time — ' + world.score + ' coins'
            : 'Paused';
  }
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
