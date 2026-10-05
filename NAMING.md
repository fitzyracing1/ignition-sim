# fakegreen naming convention

Everything under the **fakegreen** umbrella gets a product code so related
projects stay discoverable without colliding with the original
[fakegreen](https://github.com/fitzyracing1/fakegreen) CLI.

Each product has **both** a stable numeric id **and** a unique random
**codename** drawn from a curated tech / engine / green-ish word list
(no OEM trademarks).

## Forms

| Form | Pattern | Example | Use for |
|------|---------|---------|---------|
| **Numeric id** | `fakegreen` + zero-padded integer (≥ 2 digits) | `fakegreen01`, `fakegreen02` | Canonical product codes, npm package names when numbered |
| **Codename** | joined word pair (lowercase, no hyphen) | `apexchain`, `embercoil` | Human-friendly random label; unique across the registry |
| **Full** | `fakegreen-` + codename | `fakegreen-apexchain` | Kebab slug / primary named alias |
| **Slug** | `fakegreenNN-` + codename | `fakegreen01-apexchain` | Id + codename together (docs, badges) |
| **Named (legacy kebab)** | `fakegreen-` + descriptive words | `fakegreen-ignition` | Optional extra alias when a word helps |
| **Named (camel)** | `fakegreen` + PascalCase word(s) | `fakegreenIgnition` | Optional JS/TS identifiers |

Rules:

1. **Prefix is always lowercase `fakegreen`** — never `FakeGreen`, `fake_green`, etc.
2. **Numeric IDs are zero-padded** to at least two digits (`01`, not `1`).
3. **One canonical registry id per product.** Prefer the numeric form
   (`fakegreen01`). Codename and full/slug are fields on that same entry —
   not a second product.
4. **Codenames are unique** across `codename`, `full`, `slug`, and `aliases`
   in [`registry.json`](./registry.json). Generate them with the script below;
   do not hand-pick collisions.
5. **Human title stays readable.** Product code ≠ marketing title.
   Example: id `fakegreen01`, codename `apexchain`, title “Ignition simulator”.
6. **Repos stay descriptive when useful.** The GitHub repo may keep a clear name
   (e.g. `ignition-sim`) while the product code is `fakegreen01` /
   `fakegreen-apexchain`. Mention id + codename in the README and on the site.
7. **Register every product** in [`FAKEGREEN-REGISTRY.md`](./FAKEGREEN-REGISTRY.md)
   and [`registry.json`](./registry.json).

## This project

| Field | Value |
|-------|--------|
| Product id | **fakegreen01** |
| Codename | **apexchain** |
| Full | **fakegreen-apexchain** |
| Slug | **fakegreen01-apexchain** |
| Human title | Ignition simulator |
| Extra aliases | `fakegreen-ignition`, `fakegreenIgnition` |
| Repo | https://github.com/fitzyracing1/ignition-sim |
| Site | https://fitzyracing1.github.io/ignition-sim/ |

## Generating names

```sh
npm run fakegreen:name              # print suggested next id + codename
npm run fakegreen:name -- --json    # machine-readable
npm run fakegreen:name -- --assign  # append next fakegreenNN stub to registry
```

The script (`scripts/fakegreen-name.js`):

1. Picks the next free numeric id (`fakegreen02`, …).
2. Draws a random left+right pair from `scripts/fakegreen-words.json`.
3. Rejects collisions against existing registry ids / codenames / full / aliases.
4. Prints `id`, `codename`, `full`, and `slug`.
5. With `--assign`, appends a stub product (fill in name / repo / description).

Do **not** invent placeholder projects except via `--assign` when you actually
need the next slot. Updating an existing entry’s codename (as done for
`fakegreen01`) is fine.

## Adding the next product

1. Run `npm run fakegreen:name -- --assign` (or suggest first, then assign).
2. Fill in `name`, `repo`, `site`, and `description` in `registry.json` and
   `FAKEGREEN-REGISTRY.md`.
3. Put **id + codename** in the README hero / package metadata and on any public site.
4. Keep safety / purpose disclaimers accurate for that product.

The original **fakegreen** CLI (detecting fake-green test diffs) is the umbrella
brand; it is not itself numbered as `fakegreen00`. Numbered / named entries are
sibling projects under the same brand.
