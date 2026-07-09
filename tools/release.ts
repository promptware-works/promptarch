#!/usr/bin/env node
/**
 * Release helper (TypeScript/Node per ADR-003).
 *
 * PROMPTARCH's promotion path is PR-based (ADR-004; see meta/release-process.md):
 * working branch → develop via PR, then develop → main via PR. This tool runs AFTER
 * main has been promoted: it releases from a stable, already-promoted `main` — it
 * verifies main is in sync and that develop is fully merged into main, then tags
 * main, pushes the tag, and publishes the GitHub release (`--prerelease` while APRs
 * are still `Draft`). It NEVER merges develop into main or pushes commits to main;
 * that promotion is the develop → main PR's job.
 *
 * Usage (from tools/):
 *   node release.ts <version> [--prerelease] [--notes <file>] [--dry-run]
 *   npm run release -- v0.6.0 --prerelease
 *
 * Node >= 23.6 runs this .ts directly. Requires `git` and `gh` on PATH.
 */
import { execSync } from "node:child_process";

const SRC = "develop"; // working branch
const DST = "main"; // release branch

// ---- arg parsing ----
const argv = process.argv.slice(2);
const flag = (name: string): boolean => {
  const i = argv.indexOf(name);
  if (i >= 0) { argv.splice(i, 1); return true; }
  return false;
};
const opt = (name: string): string | undefined => {
  const i = argv.indexOf(name);
  if (i >= 0) { const v = argv[i + 1]; argv.splice(i, 2); return v; }
  return undefined;
};

const dryRun = flag("--dry-run");
const prerelease = flag("--prerelease");
const notesFile = opt("--notes");
let version = argv[0];

const fail = (msg: string): never => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
const sh = (cmd: string): string =>
  execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const run = (cmd: string): void => {
  if (dryRun) { console.log(`  [dry-run] ${cmd}`); return; }
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

// ---- validate version ----
if (!version) fail("usage: release.ts <version> [--prerelease] [--notes <file>] [--dry-run]");
if (!version.startsWith("v")) version = `v${version}`;
if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) fail(`not a valid semver tag: ${version}`);

console.log(
  `Release ${version}  (from ${DST}${prerelease ? ", pre-release" : ""}${dryRun ? ", DRY RUN" : ""})\n`,
);

// ---- preconditions ----
try { sh("git rev-parse --git-dir"); } catch { fail("not a git repository"); }

try { console.log(`  gh active account: ${sh("gh api user --jq .login")}`); }
catch { fail("gh CLI not authenticated (run: gh auth status)"); }

const dirty = sh("git status --porcelain --untracked-files=no");
if (dirty) fail(`working tree has uncommitted changes — commit or stash first:\n${dirty}`);

const startBranch = sh("git rev-parse --abbrev-ref HEAD");
for (const b of [SRC, DST]) {
  try { sh(`git rev-parse --verify ${b}`); } catch { fail(`branch '${b}' not found`); }
}
try { sh(`git rev-parse --verify refs/tags/${version}`); fail(`tag ${version} already exists`); }
catch (e) { if (e instanceof Error && e.message.includes("already exists")) throw e; /* not found → ok */ }

run("git fetch origin --quiet");
if (!dryRun) {
  // main is advanced only through the develop → main PR (ADR-004) — reject local commits on it.
  if (sh(`git rev-list --count origin/${DST}..${DST}`) !== "0")
    fail(`${DST} has local commit(s) not on origin/${DST} — ${DST} is advanced only via PR; do not commit to ${DST} directly (ADR-004)`);
  // develop must be fully promoted into main: the develop → main PR must have merged.
  const unpromoted = sh(`git rev-list --count origin/${DST}..origin/${SRC}`);
  if (unpromoted !== "0")
    fail(`origin/${SRC} has ${unpromoted} commit(s) not on origin/${DST} — open/merge the ${SRC} → ${DST} PR before releasing (ADR-004)`);
}

// ---- the release (from the already-promoted main; tag + publish only, never a commit push) ----
run(`git checkout ${DST}`);
run(`git merge --ff-only origin/${DST}`); // sync local main to the promoted remote — no content push
run(`git tag -a ${version} -m "${version}"`);
run(`git push origin ${version}`);        // push the TAG only — never push commits to main

const notesArg = notesFile ? `--notes-file "${notesFile}"` : "--generate-notes";
const preArg = prerelease ? "--prerelease" : "";
run(`gh release create ${version} --target ${DST} ${preArg} --title "${version}" ${notesArg}`.replace(/\s+/g, " "));

run(`git checkout ${startBranch}`); // back to where you were

console.log(`\n${dryRun ? "✓ dry run complete — no changes made" : `✓ released ${version}`}`);
