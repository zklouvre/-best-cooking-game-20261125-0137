// SENJA RAMEN — the entry program for make.fun's best-cooking-game-20261125-0137.
//
// What it does, in plain words: it hands the game in. The game itself is the plain
// static files under game/ (game/index.html plus its ES modules, no library, no
// network request), and the screenshots under screenshots/ are real renders of that
// game. This program copies both folders into the output directory and writes
// dossier.json there — the summary the judge reads — using make.fun's vendored
// library (vendor/makefun-game.ts, copied from the kit unchanged).
//
// It runs under Node 22 with the standard library only: no flags, no build step,
// no install.
//
//   Serve the game locally with `node serve.ts`, then open http://localhost:8080.
//   Hand it in outside the grader with:
//     mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//   and check that out/dossier.json exists and that a second run writes the
//   exact same bytes (the dossier must be byte-identical across runs).
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function countFiles(dir) {
  let n = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    n += statSync(p).isDirectory() ? countFiles(p) : 1;
  }
  return n;
}

function fail(msg) {
  console.error('main.ts: ' + msg);
  process.exit(1);
}

// Refuse to hand in a broken entry instead of silently shipping one.
const gameDir = join(repoRoot, 'game');
if (!existsSync(join(gameDir, 'index.html'))) fail('game/index.html is missing');
const shotsDir = join(repoRoot, 'screenshots');
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shots = readdirSync(shotsDir).filter((f) => !f.startsWith('.'));
if (shots.length < 3 || shots.length > 4) fail('expected 3 or 4 screenshots, found ' + shots.length);

// Copy the entry into the output directory, fresh each run.
mkdirSync(outDir, { recursive: true });
cpSync(gameDir, join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// The dossier caps mirror the bounty scorer's own limits: at most 4 screenshots
// of 256 KiB, at most 993 game files totalling 48 MiB, and the dossier text
// itself capped at 160 KiB. The scorer re-runs this same library on what we
// hand in and requires the dossier to match byte for byte.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log('main.ts: handed in ' + countFiles(join(outDir, 'game')) + ' game files and '
  + shots.length + ' screenshots; dossier.json is ' + dossier.length + ' bytes');
