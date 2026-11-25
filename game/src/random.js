// SENJA RAMEN — seeded random: deterministic for screenshot staging (?seed=N),
// unpredictable in normal play (seeded from Math.random).
export function createRandom(seed) {
  let a = seed >>> 0;
  if (a === 0) a = 0x9e3779b9;
  return {
    next() {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(n) { return Math.floor(this.next() * n); },
    pick(arr) { return arr[this.int(arr.length)]; },
    range(lo, hi) { return lo + this.next() * (hi - lo); },
  };
}
