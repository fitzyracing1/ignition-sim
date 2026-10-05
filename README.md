# ignition-sim

**Pure software ignition-timing simulator for learning and demos.**

> **SAFETY DISCLAIMER — READ THIS FIRST**
>
> This project is a **software model only**. It does **not** control engines,
> vehicles, ECUs, ignition coils, spark plugs, or any hardware.
>
> - **Do not** wire this to a real ignition system, coil driver, or ECU.
> - **Do not** use its outputs as calibration for a street or race vehicle.
> - Formulas are **simple educational approximations**, not proprietary OEM maps
>   (not Ford, not any manufacturer flash/tune data).
> - Misusing ignition timing on a real engine can destroy the engine and create
>   fire / injury hazards. This repo exists for classroom-style demos only.

If you need real engine control, use certified tools and follow manufacturer
and legal requirements. This library is intentionally hardware-free.

## What it models

Given an engine operating point:

| Input | Meaning |
|-------|---------|
| `rpm` | Engine speed (rev/min) |
| `load` | Normalized load in `[0, 1]` (0 = light / closed throttle, 1 = full load) |

it returns:

| Output | Meaning |
|--------|---------|
| `dwellMs` | Coil charge time (ms) |
| `advanceDeg` | Spark advance in degrees **BTDC** |
| `sparkDurationMs` | Fixed demo spark-event duration (ms) |

Battery voltage is assumed constant. There is no knock sensor, no IAT/CLT
compensation, and no proprietary map import.

## Install

```sh
npm install
npm test
npm run build
```

Node.js 18+ required.

## Usage

```ts
import { computeIgnition } from "ignition-sim";

const { dwellMs, advanceDeg, sparkDurationMs } = computeIgnition({
  rpm: 2500,
  load: 0.4,
});

console.log({ dwellMs, advanceDeg, sparkDurationMs });
```

Optional: pass a custom `IgnitionConfig` as the second argument to override
the demo defaults (still educational — not an OEM tune).

```ts
import { computeIgnition, DEFAULT_CONFIG } from "ignition-sim";

const result = computeIgnition(
  { rpm: 4000, load: 0.7 },
  { ...DEFAULT_CONFIG, baseAdvanceDeg: 12 },
);
```

## Equations used

All angles in degrees BTDC; times in milliseconds. Defaults live in
`src/config.ts`.

### Spark advance

```
rpmAdder      = lerp(rpmBreakpoints, rpmAdvanceAddersDeg, rpm)
loadCorrection = (0.5 - load) * loadGainDeg
advanceDeg     = clamp(baseAdvanceDeg + rpmAdder + loadCorrection,
                       minAdvanceDeg, maxAdvanceDeg)
```

- **RPM table**: piecewise-linear interpolation between breakpoints
  (idle → climb → mid-range plateau). Not a copied OEM surface.
- **Load correction**: light load (`load → 0`) *increases* advance; heavy load
  (`load → 1`) *retards* it — a common teaching model for knock avoidance
  under load.

Default breakpoints (illustrative only):

| RPM  | Advance adder (°) |
|------|-------------------|
| 800  | 0                 |
| 1500 | 8                 |
| 2500 | 16                |
| 4000 | 22                |
| 5500 | 24                |
| 7000 | 22                |

With `baseAdvanceDeg = 10` and `loadGainDeg = 8`.

### Dwell

```
dwellMs = clamp(
  dwellAtRefMs * (dwellRefRpm / max(rpm, 1))^dwellExponent,
  minDwellMs,
  maxDwellMs
)
```

Higher RPM → less time per revolution → shorter dwell (within clamps).
Defaults: `dwellRefRpm = 1000`, `dwellAtRefMs = 3.5`, `dwellExponent = 0.55`,
clamped to `[1.2, 4.5]` ms.

### Spark duration

Fixed demo constant (`sparkDurationMs = 1.0`). Real arcs vary with gap,
mixture, and coil energy; we do not model that here.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm test` | Run Vitest unit tests |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run lint` | Typecheck only (`tsc --noEmit`) |
| `npm run fakegreen` | Scan local git diff for fake-green patterns ([fakegreen](https://github.com/fitzyracing1/fakegreen)) |

## CI

GitHub Actions (`.github/workflows/ci.yml`) on push and pull request:

1. Install → lint → test → build
2. On pull requests, run **fakegreen** against the PR base to catch skipped
   tests, weakened assertions, deleted test files, and `\|\| true` CI tricks.

### fakegreen

[fakegreen](https://github.com/fitzyracing1/fakegreen) is a deterministic
diff scanner (no LLM) that flags agents faking a green build.

Locally (after you have commits / a dirty tree):

```sh
npx fakegreen                 # uncommitted + staged vs HEAD
npx fakegreen --last-commit   # HEAD~1..HEAD
npm run fakegreen             # same as npx with --fail-on high
```

In CI we use the composite action:

```yaml
- uses: fitzyracing1/fakegreen@v0.1.1
  with:
    fail-on: high
```

(See also `npx fakegreen install github-action` upstream.)

## Project layout

```
src/
  index.ts        # public API
  compute.ts      # computeIgnition + dwell/advance helpers
  config.ts       # DEFAULT_CONFIG
  interpolate.ts  # lerp + clamp
  types.ts        # IgnitionInput / IgnitionResult / IgnitionConfig
test/
  compute.test.ts
  interpolate.test.ts
.github/workflows/ci.yml
```

## License

MIT © Joshua Almeida
