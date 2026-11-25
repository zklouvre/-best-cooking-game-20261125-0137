// SENJA RAMEN — world: the whole game state and its rules.
// Screens: title | play | paused | upgrade | over
// The plate is a multiset of components; it serves when it exactly matches an
// open order's recipe. Cook stations brew one component at a time.
import {
  BROTHS, TOPPINGS, RECIPES, UPGRADES, CUSTOMERS, SHIFTS, SHIFT_TIME,
  MAX_HEARTS, MAX_SEATS, NOODLE_BREW, GYOZA_GRILL, KATSU_FRY,
  stationRectsA, stationRectsB,
} from './config.js';
import { sfx } from './audio.js';

export const EVENT_SERVED = 'served';
export const EVENT_FAILED = 'failed';
export const EVENT_OVER = 'over';

function multiset(list) {
  const m = {};
  for (const c of list) m[c] = (m[c] || 0) + 1;
  return m;
}
function sameMultiset(a, b) {
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => a[k] === b[k]);
}

export function recipeById(id) { return RECIPES.find((r) => r.id === id); }
export function brothById(id) { return BROTHS.find((b) => b.id === id); }
export function toppingById(id) { return TOPPINGS.find((t) => t.id === id); }

export function createWorld(random) {
  const stationsA = stationRectsA();
  const stationsB = stationRectsB();

  const world = {
    screen: 'title',
    random,
    time: 0,
    shiftIndex: 0,
    shiftTimeLeft: SHIFT_TIME,
    spawnTimer: 2.5,
    coins: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    served: 0,
    failed: 0,
    tips: 0,
    hand: null, // one cooked component the chef carries, e.g. 'broth:shoyu'
    plate: [], // components on the plating counter
    orders: [], // {id, recipe, customer, seat, patience, maxPatience, price}
    customers: [], // {seat, person, orderId}
    nextOrderId: 1,
    seats: MAX_SEATS,
    cookMul: 1.0, // upgrades make cooking faster (<1)
    patienceMul: 1.0,
    tipMul: 1.0,
    noodleMul: 1.0,
    upgradeChoices: [],
    floaters: [], // {x, y, text, color, t, life}
    particles: [], // {x, y, vx, vy, t, life, size, color}
    chef: { x: 640, y: 520, tx: 640, ty: 520 },
    flash: 0, // golden flash 0..1 on combo milestones
    shake: 0,
    tickAcc: 0,
    lastTickSecond: -1,
    stations: {}, // id -> {state: 'idle'|'cooking'|'ready', t, dur, comp}
    overReason: '',
    best: 0,
  };

  for (const s of stationsA) {
    if (s.kind === 'broth') world.stations[s.id] = { state: 'idle', t: 0, dur: brothById(s.broth).brew, base: brothById(s.broth).brew, comp: 'broth:' + s.broth };
    if (s.kind === 'noodles') world.stations[s.id] = { state: 'idle', t: 0, dur: NOODLE_BREW, base: NOODLE_BREW, comp: 'noodles' };
    if (s.kind === 'grill') world.stations[s.id] = { state: 'idle', t: 0, dur: GYOZA_GRILL, base: GYOZA_GRILL, comp: 'gyoza' };
    if (s.kind === 'fryer') world.stations[s.id] = { state: 'idle', t: 0, dur: KATSU_FRY, base: KATSU_FRY, comp: 'katsu' };
  }

  // --- helpers ---------------------------------------------------------------
  function stationRect(id) {
    for (const s of stationsA) if (s.id === id) return s;
    for (const s of stationsB.toppings) if (s.id === id) return s;
    if (id === 'plate') return stationsB.plate;
    if (id === 'serve') return stationsB.serve;
    if (id === 'trash') return stationsB.trash;
    return null;
  }
  function stationCenter(id) {
    const r = stationRect(id);
    return r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : { x: 640, y: 520 };
  }
  function moveChefTo(id) {
    const c = stationCenter(id);
    world.chef.tx = c.x;
    world.chef.ty = 520; // chef walks the lane, faces the station
  }
  function addFloater(x, y, text, color) {
    world.floaters.push({ x, y, text, color: color || '#ffd94d', t: 0, life: 1.1 });
  }
  function burstSteam(x, y, n) {
    for (let i = 0; i < n; i++) {
      world.particles.push({
        x: x + (random.next() - 0.5) * 30, y,
        vx: (random.next() - 0.5) * 8, vy: -22 - random.next() * 18,
        t: 0, life: 0.9 + random.next() * 0.5, size: 3 + random.next() * 4,
        color: 'rgba(255,255,255,0.55)',
      });
    }
  }
  function freeSeat() {
    for (let i = 0; i < world.seats; i++) {
      if (!world.customers.some((c) => c.seat === i)) return i;
    }
    return -1;
  }
  function spawnOrder() {
    const seat = freeSeat();
    if (seat < 0 || world.orders.length >= world.seats) return;
    const shift = SHIFTS[world.shiftIndex];
    const recipe = random.pick(RECIPES);
    // Avoid offering the combo dish before shift 2 (keeps the early game readable).
    const finalRecipe = (recipe.id === 'combo' && world.shiftIndex === 0)
      ? RECIPES[random.int(6)] : recipe;
    const person = random.pick(CUSTOMERS);
    const patience = shift.patience * world.patienceMul;
    const order = {
      id: world.nextOrderId++, recipe: finalRecipe, customer: person,
      seat, patience, maxPatience: patience, price: finalRecipe.price,
    };
    world.orders.push(order);
    world.customers.push({ seat, person, orderId: order.id });
  }
  function matchingOrder() {
    const plateSet = multiset(world.plate);
    return world.orders.find((o) => sameMultiset(plateSet, multiset(o.recipe.needs))) || null;
  }
  function plateMatchesAny() { return matchingOrder() !== null; }

  // --- public API ------------------------------------------------------------
  world.startGame = function startGame() {
    world.screen = 'play';
    world.time = 0;
    world.shiftIndex = 0;
    world.shiftTimeLeft = SHIFT_TIME;
    world.spawnTimer = 2.0;
    world.coins = 0; world.score = 0; world.combo = 0; world.bestCombo = 0;
    world.hearts = MAX_HEARTS; world.served = 0; world.failed = 0; world.tips = 0;
    world.hand = null; world.plate = []; world.orders = []; world.customers = [];
    world.cookMul = 1.0; world.patienceMul = 1.0; world.tipMul = 1.0; world.noodleMul = 1.0;
    world.seats = MAX_SEATS;
    world.floaters = []; world.particles = [];
    world.overReason = '';
    for (const k of Object.keys(world.stations)) { world.stations[k].state = 'idle'; world.stations[k].t = 0; }
    sfx.shift();
  };

  world.clickStation = function clickStation(id) {
    if (world.screen !== 'play') return;
    moveChefTo(id);
    const st = world.stations[id];
    if (st) {
      if (st.state === 'idle') {
        if (world.hand) { sfx.error(); addFloater(world.chef.x, 470, 'Hands full!', '#ff8a7a'); return; }
        st.state = 'cooking'; st.t = 0;
        // Duration is always recomputed from the base value, so upgrades
        // never compound on repeated brews.
        st.dur = st.base * world.cookMul * (id === 'noodles' ? world.noodleMul : 1);
        sfx.startCook();
      } else if (st.state === 'ready') {
        if (world.hand) { sfx.error(); addFloater(world.chef.x, 470, 'Hands full!', '#ff8a7a'); return; }
        world.hand = st.comp;
        st.state = 'idle'; st.t = 0;
        sfx.add();
        burstSteam(stationCenter(id).x, stationCenter(id).y - 30, 4);
      } else {
        sfx.click();
      }
      return;
    }
    if (id.startsWith('top:')) {
      const top = id.slice(4);
      if (world.plate.length === 0) { sfx.error(); addFloater(world.chef.x, 470, 'Need broth + noodles first!', '#ff8a7a'); return; }
      if (!world.plate.some((c) => c === 'noodles' || c.startsWith('broth:'))) {
        sfx.error(); addFloater(world.chef.x, 470, 'Need broth + noodles first!', '#ff8a7a'); return;
      }
      if (world.plate.includes(top)) { sfx.error(); addFloater(world.chef.x, 470, 'Already on the plate', '#ff8a7a'); return; }
      world.plate.push(top);
      sfx.add();
      return;
    }
    if (id === 'plate') {
      if (!world.hand) { sfx.click(); return; }
      // One broth and one noodles portion per plate; sides stack.
      if (world.hand.startsWith('broth:') && world.plate.some((c) => c.startsWith('broth:'))) {
        sfx.error(); addFloater(world.chef.x, 470, 'Broth already in!', '#ff8a7a'); return;
      }
      if (world.hand === 'noodles' && world.plate.includes('noodles')) {
        sfx.error(); addFloater(world.chef.x, 470, 'Noodles already in!', '#ff8a7a'); return;
      }
      world.plate.push(world.hand);
      world.hand = null;
      sfx.add();
      return;
    }
    if (id === 'serve') { world.serve(); return; }
    if (id === 'trash') {
      if (world.plate.length === 0 && !world.hand) { sfx.click(); return; }
      world.plate = []; world.hand = null;
      sfx.error();
      addFloater(stationCenter('trash').x, 300, 'Cleared', '#ff8a7a');
    }
  };

  world.serve = function serve() {
    if (world.screen !== 'play') return false;
    const order = matchingOrder();
    if (!order) {
      if (world.plate.length > 0) { sfx.error(); addFloater(stationCenter('serve').x, 300, 'No order matches this dish!', '#ff8a7a'); }
      else sfx.click();
      return false;
    }
    const patienceFrac = Math.max(0, order.patience / order.maxPatience);
    const tip = Math.round(10 * patienceFrac * world.tipMul);
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    const payout = Math.round(order.price * (1 + 0.1 * (world.combo - 1))) + tip;
    world.coins += payout;
    world.score = world.coins;
    world.tips += tip;
    world.served += 1;
    const c = stationCenter('serve');
    addFloater(c.x, 300, '+' + payout + ' coins', '#ffd94d');
    if (tip > 0) addFloater(c.x, 326, 'tip +' + tip, '#9fe8a9');
    if (world.combo >= 3 && world.combo % 2 === 1) {
      world.flash = 1;
      addFloater(640, 120, 'COMBO x' + world.combo + '!', '#ffd94d');
    }
    world.plate = [];
    world.orders = world.orders.filter((o) => o.id !== order.id);
    world.customers = world.customers.filter((cu) => cu.orderId !== order.id);
    sfx.serve(); sfx.coin();
    return true;
  };

  world.pickUpgrade = function pickUpgrade(i) {
    if (world.screen !== 'upgrade') return;
    const up = world.upgradeChoices[i];
    if (!up) return;
    if (up.id === 'stove') world.cookMul *= 0.75;
    if (up.id === 'patient') world.patienceMul *= 1.3;
    if (up.id === 'tips') world.tipMul *= 1.5;
    if (up.id === 'seat') world.seats = Math.min(5, world.seats + 1);
    if (up.id === 'heart') world.hearts = Math.min(MAX_HEARTS, world.hearts + 1);
    if (up.id === 'noodle') world.noodleMul *= 0.5;
    sfx.upgrade();
    world.shiftIndex += 1;
    world.shiftTimeLeft = SHIFT_TIME;
    world.spawnTimer = 1.5;
    world.screen = 'play';
    sfx.shift();
  };

  world.togglePause = function togglePause() {
    if (world.screen === 'play') { world.screen = 'paused'; sfx.click(); }
    else if (world.screen === 'paused') { world.screen = 'play'; sfx.click(); }
  };

  world.update = function update(dt) {
    world.time += dt;
    // Chef eases toward its target.
    world.chef.x += (world.chef.tx - world.chef.x) * Math.min(1, dt * 8);
    world.chef.y += (world.chef.ty - world.chef.y) * Math.min(1, dt * 8);
    if (world.flash > 0) world.flash = Math.max(0, world.flash - dt * 1.5);
    for (const f of world.floaters) f.t += dt;
    world.floaters = world.floaters.filter((f) => f.t < f.life);
    for (const p of world.particles) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    world.particles = world.particles.filter((p) => p.t < p.life);
    if (world.screen !== 'play') return;

    // Cooking progress.
    for (const id of Object.keys(world.stations)) {
      const st = world.stations[id];
      if (st.state === 'cooking') {
        st.t += dt;
        if (st.t >= st.dur) {
          st.state = 'ready';
          st.t = st.dur;
          sfx.ready();
          const c = stationCenter(id);
          burstSteam(c.x, c.y - 30, 5);
        }
      }
    }
    // Gentle steam over anything cooking.
    for (const id of Object.keys(world.stations)) {
      const st = world.stations[id];
      if (st.state === 'cooking' && random.next() < dt * 6) {
        const c = stationCenter(id);
        burstSteam(c.x, c.y - 20, 1);
      }
    }

    // Shift timer.
    world.shiftTimeLeft -= dt;
    const sec = Math.ceil(world.shiftTimeLeft);
    if (sec !== world.lastTickSecond) {
      world.lastTickSecond = sec;
      if (sec <= 10 && sec > 0) sfx.tick();
    }
    if (world.shiftTimeLeft <= 0) {
      if (world.shiftIndex >= 2) { endGame('Shift complete — the night is done!'); return; }
      // Roll 3 distinct upgrades.
      const pool = [...UPGRADES];
      world.upgradeChoices = [];
      for (let i = 0; i < 3; i++) world.upgradeChoices.push(pool.splice(random.int(pool.length), 1)[0]);
      world.screen = 'upgrade';
      sfx.shift();
      return;
    }

    // Spawn orders.
    const shift = SHIFTS[world.shiftIndex];
    world.spawnTimer -= dt;
    if (world.spawnTimer <= 0) {
      spawnOrder();
      world.spawnTimer = shift.spawnEvery;
    }

    // Patience drains; a lost customer costs a heart.
    for (const o of [...world.orders]) {
      o.patience -= dt;
      if (o.patience <= 0) {
        world.orders = world.orders.filter((x) => x.id !== o.id);
        world.customers = world.customers.filter((cu) => cu.orderId !== o.id);
        world.failed += 1;
        world.combo = 0;
        world.hearts -= 1;
        sfx.fail();
        addFloater(640, 120, o.customer.name + ' left angry!', '#ff8a7a');
        if (world.hearts <= 0) { endGame('Out of hearts — the crowd walked out.'); return; }
      }
    }
  };

  function endGame(reason) {
    world.overReason = reason;
    world.screen = 'over';
    if (world.score > world.best) world.best = world.score;
    sfx.fail();
  }

  world.plateMatchesAny = plateMatchesAny;
  world.matchingOrder = matchingOrder;
  world.stationRect = stationRect;
  world.stationCenter = stationCenter;

  return world;
}
