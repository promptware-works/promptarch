#!/usr/bin/env node
/**
 * Project manifest check (zero-dependency, per ADR-003).
 *
 * Validates the project manifest (project.yaml) against the project-metadata registry
 * (registries/project-metadata.yaml, governed by APR-019) — the single source of truth
 * for which manifest fields exist. Two layers:
 *   1. the registry itself is well-formed (unique field names, APR owners, valid
 *      type/status, values only on enum/list, format only where allowed);
 *   2. the manifest conforms: every `required` field is present, no unregistered keys,
 *      and each value satisfies its field's type / values / format (reverse-dns).
 *
 * Pure deterministic check — no LLM, no network, no deps (a small line parser, same
 * philosophy as tools/registry/check-registry.ts). Node >= 23.6 strips the types
 * natively:  `node check-project.ts`  or  `npm run check:project`.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // tools/project/
const ROOT = join(SCRIPT_DIR, "..", "..");
const MANIFEST = join(ROOT, "project.yaml");
const REGISTRY = join(ROOT, "registries", "project-metadata.yaml");

const RDNS = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/; // reverse-DNS, ≥2 segments
const APR = /^APR-\d{3,}$/;
const TYPES = new Set(["enum", "list", "ref-list", "string", "number", "boolean"]);
const STATUSES = new Set(["active", "provisional", "deprecated", "reserved"]);

const stripComment = (l: string): string => {
  const i = l.indexOf(" #");
  return (i >= 0 ? l.slice(0, i) : l).replace(/\s+$/, "");
};
const unquote = (v: string): string => v.trim().replace(/^["']|["']$/g, "");
const inlineList = (v: string | undefined): string[] =>
  (v ?? "").replace(/^\[|\]$/g, "").split(",").map(unquote).filter(Boolean);

// --- parse the field registry (a YAML list of field objects) ---------------
type Field = {
  name: string; owner: string; required: boolean; type: string;
  values: string[] | null; format: string | null; status: string;
};
const regLines = readFileSync(REGISTRY, "utf8").split("\n").map(stripComment);
const fields: Field[] = [];
let cur: Partial<Field> | null = null;
let inFields = false;
const flush = () => { if (cur && cur.name) fields.push(cur as Field); cur = null; };
for (const raw of regLines) {
  if (raw === "") continue;
  if (/^fields:\s*$/.test(raw)) { inFields = true; continue; }
  if (/^\S/.test(raw)) { flush(); inFields = false; continue; } // other top-level key
  if (!inFields) continue;
  const item = raw.match(/^\s*-\s+([\w-]+):\s*(.*)$/); // first key of a list item
  if (item) { flush(); cur = { values: null, format: null }; cur[keyOf(item[1])] = coerce(item[1], item[2]); continue; }
  const kv = raw.match(/^\s+([\w-]+):\s*(.*)$/);
  if (kv && cur) cur[keyOf(kv[1])] = coerce(kv[1], kv[2]);
}
flush();

function keyOf(k: string): keyof Field { return k as keyof Field; }
function coerce(k: string, v: string): any {
  if (k === "required") return unquote(v) === "true";
  if (k === "values") return inlineList(v);
  return unquote(v);
}

// --- parse the manifest (project.yaml) -------------------------------------
const manLines = readFileSync(MANIFEST, "utf8").split("\n").map(stripComment);
const p: Record<string, string> = {};
let inProject = false;
for (const raw of manLines) {
  if (raw === "") continue;
  if (/^project:\s*$/.test(raw)) { inProject = true; continue; }
  if (/^\S/.test(raw)) { inProject = false; continue; }
  if (!inProject) continue;
  const kv = raw.match(/^\s+([\w-]+):\s*(.*)$/);
  if (kv) p[kv[1]] = kv[2];
}

const errors: string[] = [];

// 1. registry well-formedness
const seen = new Set<string>();
for (const f of fields) {
  if (seen.has(f.name)) errors.push(`registry: duplicate field '${f.name}'`);
  seen.add(f.name);
  if (!APR.test(f.owner ?? "")) errors.push(`registry: field '${f.name}' owner '${f.owner}' is not an APR id`);
  if (!TYPES.has(f.type)) errors.push(`registry: field '${f.name}' has invalid type '${f.type}'`);
  if (!STATUSES.has(f.status)) errors.push(`registry: field '${f.name}' has invalid status '${f.status}'`);
  if (f.values && f.values.length && f.type !== "enum" && f.type !== "list")
    errors.push(`registry: field '${f.name}' has 'values' but type is '${f.type}' (only enum/list)`);
  if (f.format && f.format !== "reverse-dns")
    errors.push(`registry: field '${f.name}' has unknown format '${f.format}'`);
}

// 2. manifest conforms to the registry
const byName = new Map(fields.map((f) => [f.name, f]));
for (const f of fields)
  if (f.required && !(f.name in p)) errors.push(`project.${f.name} is required but missing`);
for (const key of Object.keys(p)) {
  const f = byName.get(key);
  if (!f) { errors.push(`project.${key} is not a registered field (register it in project-metadata.yaml)`); continue; }
  const rawv = p[key];
  if (f.type === "enum") {
    const v = unquote(rawv);
    if (v && f.values && !f.values.includes(v)) errors.push(`project.${key} '${v}' is not an allowed value ${JSON.stringify(f.values)}`);
  } else if (f.type === "list" || f.type === "ref-list") {
    for (const item of inlineList(rawv)) {
      if (f.values && f.values.length && !f.values.includes(item)) errors.push(`project.${key} item '${item}' is not an allowed value ${JSON.stringify(f.values)}`);
      if (f.format === "reverse-dns" && !RDNS.test(item)) errors.push(`project.${key} item '${item}' is not a reverse-DNS id`);
    }
  } else if (f.type === "string") {
    const v = unquote(rawv);
    if (f.required && !v) errors.push(`project.${key} is empty`);
    if (f.format === "reverse-dns" && v && !RDNS.test(v)) errors.push(`project.${key} '${v}' is not a reverse-DNS id`);
  }
}

if (errors.length) {
  console.error(`\n✗ project manifest check failed (${errors.length} problem(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const id = unquote(p.id ?? "");
const req = fields.filter((f) => f.required).length;
console.log(
  `✓ project manifest OK — id '${id}', ${fields.length} fields registered (${req} required), ` +
  `all present keys valid against the project-metadata registry`,
);
