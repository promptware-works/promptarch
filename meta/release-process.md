# Release Process

PROMPTARCH promotes changes to a release through a **pull request at every step**. Nothing is pushed directly to `main`; every promotion is reviewable. The decision and its rationale are recorded in [`meta/decisions/ADR-004-release-process.md`](decisions/ADR-004-release-process.md); this document is the operational how-to.

## The flow

```text
working branch ──PR──▶ develop ──PR──▶ main ──▶ tag + GitHub release
```

1. **Working branch → `develop`, via PR.** Feature and fix branches (`apr/*`, `fix/*`, …) target `develop`. This is where changes are reviewed and integrated.
2. **`develop` → `main`, via PR.** A stable `develop` is promoted to the release branch by a PR. `main` is advanced **only** this way.
3. **Release from a stable `main`.** After the `develop → main` PR merges, cut the tag and GitHub release from `main`.

## The branches

| Branch | Role |
|---|---|
| `apr/*`, `fix/*`, … | Working branches — where changes are authored; target `develop`. |
| `develop` | Integration branch — all PRs land here first. |
| `main` | Release branch — only ever advanced by a PR from `develop`; every commit on it is a released-or-releasable state. **No direct commits or pushes.** |

## Before releasing — refresh the docs

Before opening the `develop → main` PR, check the docs and READMEs for anything the release makes stale, and fold the updates into that PR (or an earlier one). At least:

- top-level [`README.md`](../README.md) — Status and repository-layout sections;
- the [principles index](../principles/README.md) — every new/changed APR row and version;
- [`tools/README.md`](../tools/README.md) — if tooling changed;
- [`GLOSSARY.md`](../GLOSSARY.md) — any new shared term an APR introduced;
- this file and [ADR-004](decisions/ADR-004-release-process.md) — if the process itself changed.

## Cutting the release

Once `main` holds the promoted `develop` (step 2 merged) and the docs are current, run — from `tools/`:

```bash
node release.ts <vX.Y.Z> [--prerelease] [--notes <file>]
# e.g. npm run release -- v0.6.0 --prerelease
```

The tool operates on the **already-promoted `main`**: it verifies `main` is in sync with its remote and that `develop` is fully merged into `main`, then **tags `main`, pushes the tag, and publishes the GitHub release**. It does **not** push commits to `main` — that promotion is the `develop → main` PR's job. If `develop` has commits not yet on `main`, the tool refuses and tells you to merge the promotion PR first.

Use `--prerelease` while APRs are still `Draft` (the corpus is pre-1.0).

## Versioning

- **Project release tags** (`vX.Y.Z`) are **separate** from per-APR `version:` fields. A release bundles whatever APR versions are current on `main`.
- Minor bump (`v0.X.0`) for new APRs or substantial new content; patch (`v0.X.Y`) for clarifications and editorial fixes.

## Why PR-based (and not a direct `develop → main` fast-forward)

Routing every promotion through a PR keeps `main` protected and every release reviewable, and it avoids relying on a branch-protection **bypass** to push `main` directly. (An earlier version of `release.ts` fast-forwarded `develop → main` and pushed `main` directly; that path is deprecated in favor of the PR-based flow above.)
