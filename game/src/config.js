// SENJA RAMEN — config: every tunable value, recipe, station and layout rect.
// One source of truth shared by world, render and input so the three always agree.
export const W = 1280;
export const H = 720;

export const SHIFT_TIME = 150; // seconds per shift
export const MAX_HEARTS = 3;
export const MAX_SEATS = 4;

export const SHIFTS = [
  { name: 'LUNCH', sub: 'Shift 1 of 3', spawnEvery: 6.0, patience: 46, cookMul: 1.0 },
  { name: 'DINNER', sub: 'Shift 2 of 3', spawnEvery: 5.0, patience: 39, cookMul: 1.0 },
  { name: 'LATE-NIGHT RUSH', sub: 'Shift 3 of 3', spawnEvery: 4.0, patience: 33, cookMul: 1.15 },
];

// Broth pots: four flavours, each brews in its own pot.
export const BROTHS = [
  { id: 'shoyu', name: 'Shoyu', color: '#7a4a21', light: '#a9713a', key: 'Q', brew: 3.0 },
  { id: 'miso', name: 'Miso', color: '#b5771f', light: '#d99a35', key: 'W', brew: 3.0 },
  { id: 'tonkotsu', name: 'Tonkotsu', color: '#e9dcbc', light: '#f6ecd2', key: 'E', brew: 3.5 },
  { id: 'spicy', name: 'Tan-Tan', color: '#b3271e', light: '#d94b33', key: 'R', brew: 3.0 },
];

export const NOODLE_BREW = 2.5; // seconds in the boiler
export const GYOZA_GRILL = 4.0; // seconds on the grill
export const KATSU_FRY = 4.0; // seconds in the fryer

// Toppings go straight onto the plate (no hand needed).
export const TOPPINGS = [
  { id: 'egg', name: 'Egg', color: '#ffd94d', key: '1' },
  { id: 'chashu', name: 'Chashu', color: '#d98a6a', key: '2' },
  { id: 'nori', name: 'Nori', color: '#2e5d33', key: '3' },
  { id: 'naruto', name: 'Naruto', color: '#f5efe0', key: '4' },
  { id: 'scallion', name: 'Scallion', color: '#58b368', key: '5' },
  { id: 'corn', name: 'Corn', color: '#ffe14d', key: '6' },
];

// A recipe is a multiset of components. broth/noodles are components too.
// gyoza / katsu are sides cooked on the grill / fryer.
export const RECIPES = [
  { id: 'shoyu', name: 'Shoyu Ramen', needs: ['broth:shoyu', 'noodles', 'egg', 'nori'], price: 26 },
  { id: 'miso', name: 'Miso Ramen', needs: ['broth:miso', 'noodles', 'corn', 'scallion'], price: 28 },
  { id: 'tonkotsu', name: 'Tonkotsu Ramen', needs: ['broth:tonkotsu', 'noodles', 'chashu', 'egg'], price: 32 },
  { id: 'tantan', name: 'Tan-Tan Ramen', needs: ['broth:spicy', 'noodles', 'scallion', 'corn'], price: 30 },
  { id: 'veggie', name: 'Veggie Ramen', needs: ['broth:miso', 'noodles', 'corn', 'nori', 'scallion'], price: 30 },
  { id: 'katsu', name: 'Katsu Ramen', needs: ['broth:shoyu', 'noodles', 'katsu'], price: 34 },
  { id: 'gyoza', name: 'Gyoza Set', needs: ['gyoza', 'gyoza'], price: 22 },
  { id: 'combo', name: 'Ramen + Gyoza', needs: ['broth:tonkotsu', 'noodles', 'egg', 'gyoza'], price: 42 },
];

export const UPGRADES = [
  { id: 'stove', name: 'FASTER STOVE', desc: 'All cooking 25% faster', icon: '🔥' },
  { id: 'patient', name: 'PATIENT CUSTOMERS', desc: 'Patience lasts 30% longer', icon: '😊' },
  { id: 'tips', name: 'GOLDEN CHOPSTICKS', desc: 'Tips worth 50% more', icon: '🥢' },
  { id: 'seat', name: 'EXTRA COUNTER SEAT', desc: 'One more customer at a time', icon: '🪑' },
  { id: 'heart', name: 'LUCKY LANTERN', desc: 'Restore one heart', icon: '🏮' },
  { id: 'noodle', name: 'SECOND BOILER', desc: 'Noodles cook twice as fast', icon: '🍜' },
];

export const CUSTOMERS = [
  { name: 'Ayu', skin: '#f2c29b', shirt: '#c0392b', hair: '#2b1a12' },
  { name: 'Kenji', skin: '#e8b98a', shirt: '#2471a3', hair: '#1a1a1a' },
  { name: 'Mei', skin: '#f6d3a8', shirt: '#8e44ad', hair: '#3d2b1f' },
  { name: 'Budi', skin: '#d9a066', shirt: '#229954', hair: '#141414' },
  { name: 'Sari', skin: '#eec39a', shirt: '#d35400', hair: '#241610' },
  { name: 'Hana', skin: '#f7d7ae', shirt: '#16a085', hair: '#4a2c14' },
];

// Layout rects (x, y, w, h). Shared by world/render/input.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 58 },
  board: { x: 12, y: 66, w: 238, h: 490 },
  counter: { x: 262, y: 66, w: 1006, h: 130 },
  stationsA: { x: 262, y: 208, w: 1006, h: 104 },
  stationsB: { x: 262, y: 324, w: 1006, h: 142 },
  lane: { x: 262, y: 478, w: 1006, h: 82 },
  bottom: { x: 12, y: 568, w: 1256, h: 68 },
  footer: { x: 12, y: 644, w: 1256, h: 64 },
};

// Row A stations: 4 broth pots + noodles + grill + fryer.
export function stationRectsA() {
  const a = LAYOUT.stationsA;
  const n = 7;
  const gap = 9;
  const w = (a.w - gap * (n - 1)) / n;
  const defs = [
    { id: 'broth:shoyu', label: 'SHOYU', sub: 'broth · Q', kind: 'broth', broth: 'shoyu' },
    { id: 'broth:miso', label: 'MISO', sub: 'broth · W', kind: 'broth', broth: 'miso' },
    { id: 'broth:tonkotsu', label: 'TONKOTSU', sub: 'broth · E', kind: 'broth', broth: 'tonkotsu' },
    { id: 'broth:spicy', label: 'TAN-TAN', sub: 'broth · R', kind: 'broth', broth: 'spicy' },
    { id: 'noodles', label: 'NOODLES', sub: 'boiler · T', kind: 'noodles' },
    { id: 'grill', label: 'GRILL', sub: 'gyoza · Y', kind: 'grill' },
    { id: 'fryer', label: 'FRYER', sub: 'katsu · U', kind: 'fryer' },
  ];
  return defs.map((d, i) => ({ ...d, x: a.x + i * (w + gap), y: a.y, w, h: a.h }));
}

// Row B: topping bar (6 buttons) + plate + serve + trash.
export function stationRectsB() {
  const b = LAYOUT.stationsB;
  const toppings = TOPPINGS.map((t, i) => ({
    id: 'top:' + t.id, label: t.name.toUpperCase(), sub: 'key ' + t.key,
    kind: 'topping', topping: t.id, color: t.color,
    x: b.x + i * 64, y: b.y, w: 58, h: 96,
  }));
  const plate = { id: 'plate', label: 'PLATE', sub: 'build the dish', kind: 'plate', x: b.x + 6 * 64 + 12, y: b.y, w: 300, h: b.h };
  const serve = { id: 'serve', label: 'SERVE', sub: 'Space', kind: 'serve', x: plate.x + plate.w + 12, y: b.y, w: 148, h: b.h };
  const trash = { id: 'trash', label: 'TRASH', sub: 'clear plate', kind: 'trash', x: serve.x + serve.w + 12, y: b.y, w: b.x + b.w - (serve.x + serve.w + 12), h: b.h };
  return { toppings, plate, serve, trash };
}

export function allStationRects() {
  const b = stationRectsB();
  return [...stationRectsA(), ...b.toppings, b.plate, b.serve, b.trash];
}

// Seats along the counter (customers sit here).
export function seatPositions(count) {
  const c = LAYOUT.counter;
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = c.x + 90 + (i * (c.w - 180)) / Math.max(1, count - 1);
    out.push({ x, y: c.y + 84 });
  }
  return out;
}
