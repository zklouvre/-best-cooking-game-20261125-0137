// SENJA RAMEN — sounds: every effect is synthesised with WebAudio in code.
// No audio files, no network. Created lazily on first user gesture (browser policy).
let ctx = null;
let muted = false;

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, slideTo) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(vol || 0.12, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noiseBurst(dur, vol, cutoff) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = cutoff || 3200;
  f.Q.value = 0.8;
  const g = c.createGain();
  g.gain.value = vol || 0.1;
  src.connect(f).connect(g).connect(c.destination);
  src.start();
}

export const sfx = {
  click() { tone(660, 0.06, 'triangle', 0.08); },
  startCook() { noiseBurst(0.25, 0.06, 2600); tone(220, 0.12, 'sine', 0.06, 330); },
  ready() { tone(880, 0.1, 'sine', 0.1); setTimeout(() => tone(1174, 0.12, 'sine', 0.1), 90); },
  add() { tone(520, 0.07, 'triangle', 0.09, 780); },
  serve() { tone(523, 0.1, 'triangle', 0.12); setTimeout(() => tone(659, 0.1, 'triangle', 0.12), 80); setTimeout(() => tone(784, 0.16, 'triangle', 0.12), 160); },
  coin() { tone(988, 0.08, 'square', 0.05); setTimeout(() => tone(1319, 0.14, 'square', 0.05), 70); },
  error() { tone(160, 0.16, 'sawtooth', 0.07, 110); },
  fail() { tone(392, 0.18, 'sawtooth', 0.08, 196); setTimeout(() => tone(262, 0.3, 'sawtooth', 0.08, 131), 140); },
  shift() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'triangle', 0.1), i * 90)); },
  upgrade() { [392, 523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'sine', 0.1), i * 70)); },
  tick() { tone(1200, 0.04, 'square', 0.04); },
};
