// SENJA RAMEN — input: mouse clicks and keyboard, both drive the same actions.
import { allStationRects } from './config.js';
import { sfx, setMuted, isMuted } from './audio.js';

const KEY_TO_STATION = {
  q: 'broth:shoyu', w: 'broth:miso', e: 'broth:tonkotsu', r: 'broth:spicy',
  t: 'noodles', y: 'grill', u: 'fryer',
  1: 'top:egg', 2: 'top:chashu', 3: 'top:nori', 4: 'top:naruto', 5: 'top:scallion', 6: 'top:corn',
};

export function createInput(canvas, world, hooks) {
  function hitStation(x, y) {
    for (const s of allStationRects()) {
      if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s.id;
    }
    return null;
  }
  function canvasPos(ev) {
    const r = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) * (canvas.width / r.width),
      y: (ev.clientY - r.top) * (canvas.height / r.height),
    };
  }

  canvas.addEventListener('click', (ev) => {
    const { x, y } = canvasPos(ev);
    if (world.screen === 'title' || world.screen === 'over') { hooks.start(); return; }
    if (world.screen === 'paused') { world.togglePause(); return; }
    if (world.showRecipes) { world.showRecipes = false; return; }
    if (world.screen === 'upgrade') {
      // Upgrade cards are laid out in render.js drawUpgrade: x 280 + i*260, y 230, w 230, h 190.
      for (let i = 0; i < 3; i++) {
        const cx = 280 + i * 260;
        if (x >= cx && x <= cx + 230 && y >= 230 && y <= 420) { world.pickUpgrade(i); return; }
      }
      return;
    }
    const id = hitStation(x, y);
    if (id) world.clickStation(id);
  });

  window.addEventListener('keydown', (ev) => {
    const k = ev.key.toLowerCase();
    if (k === 'm') { setMuted(!isMuted()); world.muted = isMuted(); sfx.click(); return; }
    if (k === 'h') { if (world.screen === 'play') { world.showRecipes = !world.showRecipes; sfx.click(); } return; }
    if (world.showRecipes) { if (k === 'h' || k === 'escape' || k === 'enter') world.showRecipes = false; return; }
    if (k === 'enter' || k === ' ') {
      if (world.screen === 'title' || world.screen === 'over') { hooks.start(); return; }
      if (world.screen === 'play' && k === ' ') { world.serve(); return; }
    }
    if (k === 'p' || k === 'escape') { world.togglePause(); return; }
    if (world.screen === 'upgrade') {
      if (k === '1' || k === '2' || k === '3') world.pickUpgrade(Number(k) - 1);
      return;
    }
    if (world.screen !== 'play') return;
    const station = KEY_TO_STATION[k];
    if (station) world.clickStation(station);
    else if (k === 'backspace' || k === 'delete') world.clickStation('trash');
  });

  return {};
}
