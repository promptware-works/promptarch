#!/usr/bin/env node
/**
 * Component-metadata registry check (zero-dependency, per ADR-003).
 *
 * Validates registries/component-metadata.yaml against the constraints in
 * schemas/component-metadata.schema.yaml that matter for governance:
 *   - the full key `path + "." + name` is unique (collision policy, APR-014);
 *   - every field's `path` first segment is a declared namespace, and a 2nd segment
 *     (if present) is a declared cluster of that namespace;
 *   - every `owner` is an APR id (APR-NNN); namespace `owner` likewise;
 *   - `type` and `status` are from their allowed sets;
 *   - `type: enum` fields carry a non-empty `values` list.
 *
 * Pure deterministic check — no LLM, no network, no deps (a small line parser,
 * same philosophy as tools/digests/check-digests.ts). Node >= 23.6 strips the
 * types natively:  `node check-registry.ts`  or  `npm run check:registry`.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // tools/registry/
const REGISTRY = join(SCRIPT_DIR, "..", "..", "registries", "component-metadata.yaml");

const TYPES = new Set(["enum", "list", "ref-list", "object", "string", "number", "boolean"]);
const STATUSES = new Set(["active", "provisional", "deprecated", "reserved"]);
const APR = /^APR-\d{3,}$/;

/** Drop a trailing " # ..." inline comment (no registry value contains " #"). */
const stripComment = (line: string): string => {
  const i = line.indexOf(" #");
  return (i >= 0 ? line.slice(0, i) : line).replace(/\s+$/, "");
};

/** Parse a YAML inline list "[a, b, c]" into string[]. */
const parseList = (v: string | undefined): string[] =>
  (v ?? "").replace(/[[\]]/g, "").split(",").map((s) => s.trim()).filter(Boolean);

type Item = Record<string, string>;

function parse(text: string): { namespaces: Item[]; fields: Item[] } {
  const namespaces: Item[] = [];
  const fields: Item[] = [];
  let section: "namespaces" | "fields" | null = null;
  let cur: Item | null = null;

  for (const raw of text.split("\n").map(stripComment)) {
    if (raw === "") continue;
    if (/^namespaces:\s*$/.test(raw)) { section = "namespaces"; cur = null; continue; }
    if (/^fields:\s*$/.test(raw)) { section = "fields"; cur = null; continue; }
    if (/^\S/.test(raw)) { section = null; cur = null; continue; } // other top-level key/comment
    if (!section) continue;

    const item = raw.match(/^\s*-\s+([\w-]+):\s*(.*)$/);
    if (item) {
      cur = {};
      (section === "namespaces" ? namespaces : fields).push(cur);
      cur[item[1]] = item[2];
      continue;
    }
    const kv = raw.match(/^\s+([\w-]+):\s*(.*)$/);
    if (kv && cur) cur[kv[1]] = kv[2];
  }
  return { namespaces, fields };
}

const { namespaces, fields } = parse(readFileSync(REGISTRY, "utf8"));
const errors: string[] = [];

const nsClusters = new Map<string, string[]>();
for (const n of namespaces) {
  if (!n.name) { errors.push("namespace with no name"); continue; }
  if (!APR.test(n.owner ?? "")) errors.push(`namespace '${n.name}': owner '${n.owner ?? ""}' is not an APR id`);
  nsClusters.set(n.name, parseList(n.clusters));
}
if (nsClusters.size === 0) errors.push("no namespaces declared");

const seen = new Set<string>();
for (const f of fields) {
  const id = f.name ?? "(unnamed)";
  if (!f.name) { errors.push("field with no name"); continue; }
  if (!f.path) { errors.push(`${id}: no path`); continue; }

  const full = `${f.path}.${f.name}`;
  if (seen.has(full)) errors.push(`duplicate field key: '${full}'`);
  seen.add(full);

  const segs = f.path.split(".");
  const ns = segs[0];
  if (!nsClusters.has(ns)) {
    errors.push(`${id}: path namespace '${ns}' is not declared`);
  } else if (segs.length >= 2 && !nsClusters.get(ns)!.includes(segs[1])) {
    errors.push(`${id}: cluster '${segs[1]}' is not declared in namespace '${ns}'`);
  }

  if (!APR.test(f.owner ?? "")) errors.push(`${id}: owner '${f.owner ?? ""}' is not an APR id`);
  if (!TYPES.has(f.type)) errors.push(`${id}: type '${f.type ?? ""}' is not one of ${[...TYPES].join(", ")}`);
  if (!STATUSES.has(f.status)) errors.push(`${id}: status '${f.status ?? ""}' is not one of ${[...STATUSES].join(", ")}`);
  if (f.type === "enum" && !/\[.+\]/.test(f.values ?? "")) errors.push(`${id}: type enum but no non-empty 'values' list`);
}

if (errors.length) {
  console.error(`\n✗ registry check failed (${errors.length} problem(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ registry OK — ${fields.length} fields across ${nsClusters.size} namespaces, full-path keys unique, paths + owners + types + statuses valid`);
