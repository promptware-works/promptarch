#!/usr/bin/env node
/**
 * Digest staleness check — first increment of the digest tooling
 * (see tools/digest-generator.scope.md; language per ADR-003).
 *
 * Verifies every APR digest in principles/digests/ states the same version as
 * its source APR's frontmatter. Exits 1 on any of:
 *   - a source APR whose digest is missing
 *   - a digest whose stated source version != the source's `version:`
 *   - a digest that states no source version
 *   - an orphan digest with no matching source APR
 *
 * Pure deterministic check — no LLM, no network. Node >= 23.6 strips the
 * types natively, so run it directly:  `node check-digests.ts`
 * or via the package script:           `npm run check:digests`
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url)); // tools/digests/
const PRINCIPLES = join(SCRIPT_DIR, "..", "..", "principles");
const DIGESTS = join(PRINCIPLES, "digests");

const APR_FILE = /^APR-\d+.*\.md$/;

/** `version:` from a file's YAML frontmatter. */
function sourceVersion(md: string): string | null {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md);
  if (!fm) return null;
  const m = /^version:\s*["']?(\d+\.\d+\.\d+)["']?\s*$/m.exec(fm[1]);
  return m ? m[1] : null;
}

/** The source version a digest claims to reflect ("…digest of … vX.Y.Z"). */
function digestVersion(md: string): string | null {
  const m = /digest of[^\n]*?\bv(\d+\.\d+\.\d+)\b/i.exec(md);
  return m ? m[1] : null;
}

interface Row {
  apr: string;
  source: string;
  digest: string;
  ok: boolean;
  note: string;
}

const rows: Row[] = [];
const problems: string[] = [];

for (const apr of readdirSync(PRINCIPLES).filter((f) => APR_FILE.test(f)).sort()) {
  const source = sourceVersion(readFileSync(join(PRINCIPLES, apr), "utf8"));
  if (!source) {
    problems.push(`${apr}: no parseable \`version:\` in frontmatter`);
    continue;
  }
  const digestPath = join(DIGESTS, apr);
  if (!existsSync(digestPath)) {
    problems.push(`${apr}: no digest (expected principles/digests/${apr})`);
    rows.push({ apr, source, digest: "—", ok: false, note: "missing digest" });
    continue;
  }
  const claimed = digestVersion(readFileSync(digestPath, "utf8"));
  if (!claimed) {
    problems.push(`digests/${apr}: states no source version (expected "…digest of … vX.Y.Z")`);
    rows.push({ apr, source, digest: "?", ok: false, note: "no version stated" });
  } else if (claimed !== source) {
    problems.push(`digests/${apr}: STALE — reflects v${claimed} but source is v${source}; regenerate`);
    rows.push({ apr, source, digest: claimed, ok: false, note: "stale" });
  } else {
    rows.push({ apr, source, digest: claimed, ok: true, note: "" });
  }
}

// Orphan digests: a digest with no matching source APR.
if (existsSync(DIGESTS)) {
  for (const dig of readdirSync(DIGESTS).filter((f) => APR_FILE.test(f))) {
    if (!existsSync(join(PRINCIPLES, dig))) {
      problems.push(`digests/${dig}: orphan — no matching source APR`);
    }
  }
}

for (const r of rows) {
  const label = r.apr.replace(/\.md$/, "");
  console.log(
    r.ok
      ? `  ✓ ${label} — v${r.source}`
      : `  ✗ ${label} — source v${r.source} / digest ${r.digest} (${r.note})`,
  );
}

if (problems.length) {
  console.error(`\n✗ digest check failed (${problems.length} problem(s)):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`\n✓ all ${rows.length} digest(s) in sync with their source APR versions`);
