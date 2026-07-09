#!/usr/bin/env node
/**
 * Artifact-graph config check (zero-dependency, per ADR-003).
 *
 * Validates registries/artifact-graph.yaml against schemas/artifact-graph.schema.yaml
 * (governed by APR-013):
 *   - `version` is an integer; `node-types` / `edge-types` are non-empty, each a slug;
 *   - every `roots` entry is a declared node-type (graph entry points);
 *   - `include` is a non-empty glob list.
 *
 * Pure deterministic check — no LLM, no network, no deps (a small line parser, same
 * philosophy as tools/registry/check-registry.ts). Node >= 23.6 strips the types
 * natively:  `node check-graph.ts`  or  `npm run check:graph`.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // tools/graph/
const CONFIG = join(SCRIPT_DIR, "..", "..", "registries", "artifact-graph.yaml");

const SLUG = /^[a-z][a-z0-9-]*$/;

const stripComment = (line: string): string => {
  const i = line.indexOf(" #");
  return (i >= 0 ? line.slice(0, i) : line).replace(/\s+$/, "");
};

/** Parse an inline YAML list `[a, "b/**", c]` into string[] (quotes stripped). */
const inlineList = (v: string | undefined): string[] =>
  (v ?? "").replace(/^\[|\]$/g, "").split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);

const lines = readFileSync(CONFIG, "utf8").split("\n").map(stripComment);

const top: Record<string, string> = {};
const edgeTypes: string[] = [];
const nodeAttrs: string[] = [];
let section: string | null = null; // "edge-types" | "node-attributes"

for (const raw of lines) {
  if (raw === "") continue;
  const t = raw.match(/^([\w-]+):\s*(.*)$/); // top-level key
  if (t) {
    section = t[1] === "edge-types" || t[1] === "node-attributes" ? t[1] : null;
    top[t[1]] = t[2];
    continue;
  }
  if (section) {
    const e = raw.match(/^\s+([\w-]+):/);
    if (e) (section === "edge-types" ? edgeTypes : nodeAttrs).push(e[1]);
  }
}

const nodeTypes = inlineList(top["node-types"]);
const roots = inlineList(top["roots"]);
const include = inlineList(top["include"]);

const errors: string[] = [];

if (!/^\d+$/.test((top["version"] ?? "").trim())) errors.push(`version must be an integer (got '${top["version"] ?? ""}')`);
if (nodeTypes.length === 0) errors.push("node-types is empty");
for (const n of nodeTypes) if (!SLUG.test(n)) errors.push(`node-type '${n}' is not a lowercase slug`);
if (edgeTypes.length === 0) errors.push("edge-types is empty");
for (const e of edgeTypes) if (!SLUG.test(e)) errors.push(`edge-type '${e}' is not a lowercase slug`);
if (nodeAttrs.length === 0) errors.push("node-attributes is empty");
for (const req of ["id", "container-id", "type", "title"]) if (!nodeAttrs.includes(req)) errors.push(`node-attributes missing mandatory identity attribute '${req}'`);
if (roots.length === 0) errors.push("roots is empty");
const nodeSet = new Set(nodeTypes);
for (const r of roots) if (!nodeSet.has(r)) errors.push(`root '${r}' is not a declared node-type`);
if (include.length === 0) errors.push("include is empty");

if (errors.length) {
  console.error(`\n✗ artifact-graph config check failed (${errors.length} problem(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ artifact-graph config OK — ${nodeTypes.length} node-types, ${edgeTypes.length} edge-types, ${nodeAttrs.length} node-attributes, ${roots.length} root(s), all valid`);
