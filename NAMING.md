# fakegreen naming convention

Everything under the **fakegreen** umbrella gets a product code so related
projects stay discoverable without colliding with the original
[fakegreen](https://github.com/fitzyracing1/fakegreen) CLI.

## Forms

| Form | Pattern | Example | Use for |
|------|---------|---------|---------|
| **Numeric** (preferred for registry IDs) | `fakegreen` + zero-padded integer (≥ 2 digits) | `fakegreen01`, `fakegreen02` | Canonical product codes, npm package names when numbered |
| **Named (kebab)** | `fakegreen-` + lowercase words | `fakegreen-ignition` | Repos, URLs, docs when a word helps |
| **Named (camel)** | `fakegreen` + PascalCase word(s) | `fakegreenIgnition` | Optional JS/TS identifiers matching a named product |

Rules:

1. **Prefix is always lowercase `fakegreen`** — never `FakeGreen`, `fake_green`, etc.
2. **Numeric IDs are zero-padded** to at least two digits (`01`, not `1`).
3. **One canonical registry id per product.** Prefer the numeric form
   (`fakegreen01`). A named form may be listed as an *alias*, not a second id.
4. **Human title stays readable.** Product code ≠ marketing title.
   Example: code `fakegreen01`, title “Ignition simulator”.
5. **Repos stay descriptive when useful.** The GitHub repo may keep a clear name
   (e.g. `ignition-sim`) while the product code is `fakegreen01`. Mention both
   in the README and on the site.
6. **Register every product** in [`FAKEGREEN-REGISTRY.md`](./FAKEGREEN-REGISTRY.md)
   and [`registry.json`](./registry.json) (id, name, repo URL, one-line description).

## This project

| Field | Value |
|-------|--------|
| Product code | **fakegreen01** |
| Human title | Ignition simulator |
| Named aliases (optional) | `fakegreen-ignition`, `fakegreenIgnition` |
| Repo | https://github.com/fitzyracing1/ignition-sim |
| Site | https://fitzyracing1.github.io/ignition-sim/ |

## Adding the next product

1. Pick the next free numeric id (`fakegreen02`, …) **or** a kebab name if the
   product is better known by a word.
2. Add a row to `FAKEGREEN-REGISTRY.md` and an object to `registry.json`.
3. Put the product code in the README hero / package metadata and on any public site.
4. Keep safety / purpose disclaimers accurate for that product.

The original **fakegreen** CLI (detecting fake-green test diffs) is the umbrella
brand; it is not itself numbered as `fakegreen00`. Numbered / named entries are
sibling projects under the same brand.
