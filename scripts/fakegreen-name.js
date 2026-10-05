#!/usr/bin/env node
/**
 * fakegreen randomized-name generator
 *
 * Generates a unique random codename for fakegreen products, checks
 * registry.json for collisions, and optionally appends the next
 * fakegreenNN entry with --assign.
 *
 * Usage:
 *   node scripts/fakegreen-name.js              # suggest next id + codename
 *   node scripts/fakegreen-name.js --assign     # append next product stub
 *   node scripts/fakegreen-name.js --json       # machine-readable output
 *   node scripts/fakegreen-name.js --help
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomInt } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REGISTRY_PATH = join(ROOT, "registry.json");
const WORDS_PATH = join(__dirname, "fakegreen-words.json");
const MD_PATH = join(ROOT, "FAKEGREEN-REGISTRY.md");

const args = new Set(process.argv.slice(2));
const wantHelp = args.has("--help") || args.has("-h");
const wantAssign = args.has("--assign");
const wantJson = args.has("--json");

if (wantHelp) {
  console.log(`fakegreen-name — unique random codenames for fakegreen products

Usage:
  npm run fakegreen:name              Suggest next id + codename (no write)
  npm run fakegreen:name -- --assign  Append next fakegreenNN stub to registry
  npm run fakegreen:name -- --json    Print JSON only

Fields printed:
  id         fakegreenNN (zero-padded, next free or suggested)
  codename   joined word pair, e.g. embercoil
  full       fakegreen-<codename>
  slug       fakegreenNN-<codename>

Codename words come from scripts/fakegreen-words.json (tech/engine/green vibe).
Collisions against registry id / codename / full / aliases are rejected.
`);
  process.exit(0);
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function usedNames(registry) {
  const used = new Set();
  for (const p of registry.products ?? []) {
    if (p.id) used.add(String(p.id).toLowerCase());
    if (p.codename) used.add(String(p.codename).toLowerCase());
    if (p.full) used.add(String(p.full).toLowerCase());
    if (p.slug) used.add(String(p.slug).toLowerCase());
    for (const a of p.aliases ?? []) used.add(String(a).toLowerCase());
  }
  return used;
}

function nextNumericId(registry) {
  let max = 0;
  for (const p of registry.products ?? []) {
    const m = /^fakegreen(\d+)$/i.exec(p.id ?? "");
    if (m) max = Math.max(max, Number(m[1]));
  }
  const n = max + 1;
  return `fakegreen${String(n).padStart(2, "0")}`;
}

function isForbidden(word, forbidden) {
  const w = word.toLowerCase();
  return forbidden.some((f) => w.includes(f.toLowerCase()));
}

function generateCodename(words, used, maxAttempts = 500) {
  const left = words.left;
  const right = words.right;
  const forbidden = words.forbidden ?? [];

  for (let i = 0; i < maxAttempts; i++) {
    const a = left[randomInt(left.length)];
    const b = right[randomInt(right.length)];
    if (a === b) continue;
    const codename = `${a}${b}`.toLowerCase();
    if (isForbidden(codename, forbidden)) continue;
    if (used.has(codename)) continue;
    const full = `fakegreen-${codename}`;
    if (used.has(full)) continue;
    return { codename, full };
  }
  throw new Error("Could not find a unique codename after many attempts");
}

function buildSuggestion(registry, words) {
  const used = usedNames(registry);
  const id = nextNumericId(registry);
  const { codename, full } = generateCodename(words, used);
  const slug = `${id}-${codename}`;
  return { id, codename, full, slug };
}

function printHuman(s) {
  console.log("Suggested fakegreen name");
  console.log("───────────────────────");
  console.log(`  id:       ${s.id}`);
  console.log(`  codename: ${s.codename}`);
  console.log(`  full:     ${s.full}`);
  console.log(`  slug:     ${s.slug}`);
  console.log("");
  console.log("Dry run only — registry unchanged.");
  console.log("To append a stub for this id: npm run fakegreen:name -- --assign");
}

function appendMarkdownRow(id, codename, full) {
  let md = readFileSync(MD_PATH, "utf8");
  const row = `| \`${id}\` | *(untitled — fill in)* | *(repo TBD)* | Codename \`${codename}\` (\`${full}\`). Replace this stub. |`;
  // Insert before the "### Aliases" or "### Related" section, after the table
  const marker = /\n### /;
  if (marker.test(md)) {
    md = md.replace(marker, `\n${row}\n\n### `);
  } else {
    md = md.trimEnd() + `\n${row}\n`;
  }
  // Also add a short aliases note for the new id near the end of alias sections
  const aliasBlock = `\n### Aliases for ${id}\n\n- \`${full}\` (kebab / full)\n- \`${id}-${codename}\` (id-codename slug)\n`;
  if (!md.includes(`### Aliases for ${id}`)) {
    const related = md.indexOf("### Related");
    if (related !== -1) {
      md = md.slice(0, related) + aliasBlock + "\n" + md.slice(related);
    } else {
      md = md.trimEnd() + "\n" + aliasBlock;
    }
  }
  writeFileSync(MD_PATH, md);
}

function assign(registry, suggestion) {
  const entry = {
    id: suggestion.id,
    codename: suggestion.codename,
    full: suggestion.full,
    slug: suggestion.slug,
    name: "(untitled — fill in)",
    repo: "",
    site: "",
    description: `Codename ${suggestion.codename}. Replace this stub with a real project.`,
    aliases: [suggestion.full, suggestion.slug],
  };
  registry.products.push(entry);
  registry.convention =
    "See NAMING.md — id fakegreenNN + random codename → full fakegreen-<codename>, slug fakegreenNN-<codename>";
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + "\n");
  appendMarkdownRow(suggestion.id, suggestion.codename, suggestion.full);
  return entry;
}

const registry = loadJson(REGISTRY_PATH);
const words = loadJson(WORDS_PATH);
const suggestion = buildSuggestion(registry, words);

if (wantAssign) {
  const entry = assign(registry, suggestion);
  if (wantJson) {
    console.log(JSON.stringify(entry, null, 2));
  } else {
    console.log("Assigned new fakegreen product stub");
    console.log("──────────────────────────────────");
    console.log(`  id:       ${entry.id}`);
    console.log(`  codename: ${entry.codename}`);
    console.log(`  full:     ${entry.full}`);
    console.log(`  slug:     ${entry.slug}`);
    console.log("");
    console.log(`Updated ${REGISTRY_PATH}`);
    console.log(`Updated ${MD_PATH}`);
    console.log("Fill in name / repo / description before shipping.");
  }
} else if (wantJson) {
  console.log(JSON.stringify(suggestion, null, 2));
} else {
  printHuman(suggestion);
}
