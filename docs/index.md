# Ignition simulator (`fakegreen01`, codename `apexchain`)

This is a pure-software, educational ignition-timing simulator in TypeScript. **It does not control any hardware.** Do not wire it to a real ignition system or use its numbers to calibrate a vehicle (see the README safety disclaimer). Naming is explained in `NAMING.md` and `FAKEGREEN-REGISTRY.md`.

Given `{ rpm, load }` (load in [0, 1]), it returns `dwellMs`, `advanceDeg` (BTDC) and `sparkDurationMs`. Battery voltage is held constant, and the model has no knock sensing, temperature compensation or map import.

## Getting started

Requires Node.js 22+.

```sh
npm install
npm test          # vitest run
npm run build     # tsc
npm run lint      # tsc --noEmit
```

```ts
import { computeIgnition, DEFAULT_CONFIG } from "fakegreen01";
computeIgnition({ rpm: 2500, load: 0.4 });
computeIgnition({ rpm: 4000, load: 0.7 }, { ...DEFAULT_CONFIG, baseAdvanceDeg: 12 });
```

## Files

| Path | Role |
|---|---|
| `src/compute.ts` | `computeIgnition` (advance, dwell, spark duration) |
| `src/config.ts` | `DEFAULT_CONFIG` (breakpoints, gains, limits) |
| `src/interpolate.ts` | piecewise-linear `lerp` and clamping |
| `src/types.ts`, `src/index.ts` | types and exports |
| `test/*.test.ts` | vitest tests |
| `scripts/fakegreen-name.js`, `registry.json` | product naming registry |
| `docs/` | site |

The equations are listed in the README under "Equations used".

CI (`ci.yml`) runs `npm ci`, lint, test and build. A run is **lit** when all of them pass and **dark** otherwise.

MIT License. Copyright (c) 2026 Joshua Almeida
