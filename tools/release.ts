#!/usr/bin/env node
/**
 * Release helper (TypeScript/Node per ADR-003).
 *
 * Implements the project's branching model: work happens on `develop`; a release
 * fast-forwards `develop` into `main`, tags `main`, and publishes a GitHub release
 * (mark it `--prerelease` while APRs are still `Draft`).
 *
 * Usage (from tools/):
 *   node release.ts <version> [--prerelease] [--notes <file>] [--dry-run]
 *   npm run release -- v0.2.0 --prerelease
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
  `Release ${version}  (${SRC} → ${DST}${prerelease ? ", pre-release" : ""}${dryRun ? ", DRY RUN" : ""})\n`,
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
  if (sh(`git rev-list --count ${SRC}..origin/${SRC}`) !== "0")
    fail(`${SRC} is behind origin/${SRC} — pull first`);
  const dstOnly = sh(`git rev-list --count ${SRC}..${DST}`);
  if (dstOnly !== "0")
    fail(`${DST} has ${dstOnly} commit(s) not on ${SRC}; reconcile first (the model is one-way ${SRC} → ${DST})`);
}

// ---- the release ----
run(`git checkout ${DST}`);
run(`git merge --ff-only ${SRC}`);
run(`git tag -a ${version} -m "${version}"`);
run(`git push origin ${DST}`);
run(`git push origin ${version}`);

const notesArg = notesFile ? `--notes-file "${notesFile}"` : "--generate-notes";
const preArg = prerelease ? "--prerelease" : "";
run(`gh release create ${version} --target ${DST} ${preArg} --title "${version}" ${notesArg}`.replace(/\s+/g, " "));

run(`git checkout ${startBranch}`); // back to where you were

console.log(`\n${dryRun ? "✓ dry run complete — no changes made" : `✓ released ${version}`}`);
