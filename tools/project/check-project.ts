#!/usr/bin/env node
/**
 * Project manifest check (zero-dependency, per ADR-003).
 *
 * Validates project.yaml against schemas/project.schema.yaml (governed by APR-019):
 *   - `project.id` is present and reverse-DNS (the node-id namespace);
 *   - `project.title` and `project.owner` are present (identity + accountability);
 *   - every `dependencies` entry is a reverse-DNS project id.
 *
 * Pure deterministic check — no LLM, no network, no deps (a small line parser, same
 * philosophy as tools/registry/check-registry.ts). Node >= 23.6 strips the types
 * natively:  `node check-project.ts`  or  `npm run check:project`.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // tools/project/
const MANIFEST = join(SCRIPT_DIR, "..", "..", "project.yaml");

const RDNS = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/; // reverse-DNS, ≥2 segments

const stripComment = (l: string): string => {
  const i = l.indexOf(" #");
  return (i >= 0 ? l.slice(0, i) : l).replace(/\s+$/, "");
};
const unquote = (v: string): string => v.trim().replace(/^["']|["']$/g, "");
const inlineList = (v: string | undefined): string[] =>
  (v ?? "").replace(/^\[|\]$/g, "").split(",").map(unquote).filter(Boolean);

const lines = readFileSync(MANIFEST, "utf8").split("\n").map(stripComment);
const p: Record<string, string> = {};
let inProject = false;
for (const raw of lines) {
  if (raw === "") continue;
  if (/^project:\s*$/.test(raw)) { inProject = true; continue; }
  if (/^\S/.test(raw)) { inProject = false; continue; } // other top-level key/comment
  if (!inProject) continue;
  const kv = raw.match(/^\s+([\w-]+):\s*(.*)$/);
  if (kv) p[kv[1]] = kv[2];
}

const errors: string[] = [];
const id = unquote(p.id ?? "");
if (!id) errors.push("project.id is missing");
else if (!RDNS.test(id)) errors.push(`project.id '${id}' is not a reverse-DNS id (e.g. works.promptware.promptarch)`);
if (!unquote(p.title ?? "")) errors.push("project.title is missing");
if (!unquote(p.owner ?? "")) errors.push("project.owner is missing");
const deps = inlineList(p.dependencies);
for (const d of deps) if (!RDNS.test(d)) errors.push(`dependency '${d}' is not a reverse-DNS project id`);

if (errors.length) {
  console.error(`\n✗ project manifest check failed (${errors.length} problem(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ project manifest OK — id '${id}', title + owner present, ${deps.length} dependencies, all valid`);
