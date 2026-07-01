#!/usr/bin/env node
/**
 * Component-metadata registry check (zero-dependency, per ADR-003).
 *
 * Validates registries/component-metadata.yaml against the constraints in
 * schemas/component-metadata.schema.yaml that matter for governance:
 *   - field names are unique across the registry (collision policy, APR-014);
 *   - every field's `cluster` is a declared cluster;
 *   - every `owner` is an APR id (APR-NNN); cluster `owners` likewise;
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

const TYPES = new Set(["enum", "list", "ref-list", "object", "string", "number"]);
const STATUSES = new Set(["active", "provisional", "deprecated", "reserved"]);
const APR = /^APR-\d{3,}$/;

/** Drop a trailing " # ..." inline comment (no registry value contains " #"). */
const stripComment = (line: string): string => {
  const i = line.indexOf(" #");
  return (i >= 0 ? line.slice(0, i) : line).replace(/\s+$/, "");
};

type Item = Record<string, string>;

function parse(text: string): { clusters: Item[]; fields: Item[] } {
  const clusters: Item[] = [];
  const fields: Item[] = [];
  let section: "clusters" | "fields" | null = null;
  let cur: Item | null = null;

  for (const raw of text.split("\n").map(stripComment)) {
    if (raw === "") continue;
    if (/^clusters:\s*$/.test(raw)) { section = "clusters"; cur = null; continue; }
    if (/^fields:\s*$/.test(raw)) { section = "fields"; cur = null; continue; }
    if (/^\S/.test(raw)) { section = null; cur = null; continue; } // other top-level key/comment
    if (!section) continue;

    const item = raw.match(/^\s*-\s+([\w-]+):\s*(.*)$/);
    if (item) {
      cur = {};
      (section === "clusters" ? clusters : fields).push(cur);
      cur[item[1]] = item[2];
      continue;
    }
    const kv = raw.match(/^\s+([\w-]+):\s*(.*)$/);
    if (kv && cur) cur[kv[1]] = kv[2];
  }
  return { clusters, fields };
}

const { clusters, fields } = parse(readFileSync(REGISTRY, "utf8"));
const errors: string[] = [];

const clusterNames = new Set(clusters.map((c) => c.name).filter(Boolean));
if (clusterNames.size === 0) errors.push("no clusters declared");

for (const c of clusters) {
  const owners = (c.owners ?? "").replace(/[[\]]/g, "").split(",").map((s) => s.trim()).filter(Boolean);
  if (owners.length === 0) errors.push(`cluster '${c.name}': no owners`);
  for (const o of owners) if (!APR.test(o)) errors.push(`cluster '${c.name}': owner '${o}' is not an APR id`);
}

const seen = new Set<string>();
for (const f of fields) {
  const id = f.name ?? "(unnamed)";
  if (!f.name) { errors.push("field with no name"); continue; }
  if (seen.has(f.name)) errors.push(`duplicate field name: '${f.name}'`);
  seen.add(f.name);
  if (!clusterNames.has(f.cluster)) errors.push(`${id}: cluster '${f.cluster ?? ""}' is not a declared cluster`);
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

console.log(`✓ registry OK — ${fields.length} fields across ${clusterNames.size} clusters, names unique, owners + clusters + types + statuses valid`);
