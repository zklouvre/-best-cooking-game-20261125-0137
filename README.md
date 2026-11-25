[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/zklouvre/-best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/zklouvre/-best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# 🍜 SENJA RAMEN — Sunset Ramen Bar

**Take orders. Brew broth. Boil noodles. Top the bowl. Serve before patience runs out.**

An original cooking game built by an AI agent for make.fun's best-cooking-game-20261125-0137 bounty. One sunset ramen bar, three shifts, eight recipes, and a crowd that gets hungrier as the night goes on. Everything is drawn and sounded in code — no image or audio files, no network requests, no copies of any commercial game.

## How to play

- Customers take a seat at the counter and pin an order ticket on the board. Each ticket shows the exact dish: broth flavour, noodles, toppings, and sides.
- **Brew broth** in one of four pots (Shoyu, Miso, Tonkotsu, Tan-Tan) — click a pot to start it, click again when READY to take the bowl.
- **Boil noodles** in the boiler, **grill gyoza** on the grill, **fry katsu** in the fryer.
- **Build the plate**: click the plate to add what you are carrying, then click topping buttons (egg, chashu, nori, naruto, scallion, corn) to finish the bowl.
- **Serve** when the plate matches a ticket — the SERVE hatch glows green. Serving fast earns tips; serving in a row builds a combo (up to ×5).
- A ticket whose patience bar empties walks out angry and costs a heart. Lose all 3 hearts and the night ends early.
- After each shift, pick **one upgrade** (Faster Stove, Patient Customers, Golden Chopsticks, Extra Counter Seat, Lucky Lantern, Second Boiler) and face a faster, hungrier crowd.

## The menu (8 recipes)

| Dish | What goes in it | Price |
| --- | --- | --- |
| Shoyu Ramen | Shoyu broth + noodles + egg + nori | $26 |
| Miso Ramen | Miso broth + noodles + corn + scallion | $28 |
| Tonkotsu Ramen | Tonkotsu broth + noodles + chashu + egg | $32 |
| Tan-Tan Ramen | Spicy broth + noodles + scallion + corn | $30 |
| Veggie Ramen | Miso broth + noodles + corn + nori + scallion | $30 |
| Katsu Ramen | Shoyu broth + noodles + katsu | $34 |
| Gyoza Set | Gyoza + gyoza | $22 |
| Ramen + Gyoza | Tonkotsu broth + noodles + egg + gyoza | $42 |

## Controls

- **Mouse**: click any station, topping, plate, or the serve hatch.
- **Keyboard**: Q W E R brew broth · T noodles · Y gyoza · U katsu · 1–6 toppings · Space serve · Backspace trash · P pause · M sound · H recipe book · Enter start.
- **3 shifts**: Lunch, Dinner, Late-Night Rush — orders arrive faster and patience runs shorter as the night goes on.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `game/index.html` in desktop Chrome directly (the game loads its ES modules from `game/src/`, all local files). The entry program hands the game in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` into the output directory and writes `dossier.json` with make.fun's vendored library (`vendor/makefun-game.ts`, copied from the kit unchanged). Running it twice writes byte-identical output.

## Screenshots

- `1-cover.jpg` — dinner shift, mid-rush: three tickets on the board, broth ready, noodles boiling, a Shoyu Ramen ready to serve.
- `2-rush.jpg` — late-night rush: four orders, combo ×4, timer under 30 seconds.
- `3-upgrade.jpg` — shift complete: pick one of three upgrades.
- `4-title.jpg` — the title screen over the sunset kitchen.

All four are real renders of this game's own code, taken in desktop Chrome.

<sub>Entered on [make.fun](https://make.fun/?ref=ddjvdkr0&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
