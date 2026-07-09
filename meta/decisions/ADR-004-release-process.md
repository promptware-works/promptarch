# ADR-004 — Release promotion is PR-based (working → develop → main → release)

- **Status**: Accepted
- **Date**: 2026-07-09
- **Decider**: D. Maxios

## Context

PROMPTARCH ships as GitHub pre-releases. The release helper introduced under [ADR-003](ADR-003-tooling-stack.md) ([`tools/release.ts`](../../tools/release.ts)) implemented the branching model as: work on `develop`; a release **fast-forwards `develop` into `main`**, tags `main`, pushes `main` and the tag, and publishes the release.

`main` is branch-protected ("changes must be made through a pull request"). In practice, cutting v0.5.0 (2026-07-09) that way only succeeded because the release ran under an account with a **branch-protection bypass** — the push logged `Bypassed rule violations for refs/heads/main`. Relying on a bypass means the protection is nominal, the `develop → main` promotion is never reviewed, and the flow silently depends on one account's elevated permission.

## Decision

The promotion path to a release is **fully PR-based**, with a pull request at every step:

1. **working branch → `develop`**, via PR.
2. **`develop` → `main`**, via PR.
3. **Release from a stable `main`** — tag `main` and publish the GitHub release.

`main` is advanced **only** by the `develop → main` PR; nothing is pushed to it directly. [`tools/release.ts`](../../tools/release.ts) is narrowed accordingly: it runs on the **already-promoted `main`**, verifies `main` is in sync with its remote and that `develop` is fully merged into `main`, then **tags, pushes the tag, and publishes** — it no longer merges `develop` into `main` or pushes commits to `main`. The operational how-to is [`meta/release-process.md`](../release-process.md).

## Consequences

**Positive**

- **Every promotion is reviewable.** Both `develop` and `main` are advanced through PRs, so a release is the tip of a reviewed chain — consistent with the audit-friendly posture the APRs advocate.
- **`main` protection is real, not bypassed.** No release step depends on a branch-protection bypass; a maintainer without bypass can still release.
- **The release step is low-risk.** It only tags an already-promoted commit and publishes — no merge or commit-push to `main` happens inside the tool.

**Negative**

- **More ceremony.** A `develop → main` PR must be opened and merged before releasing, versus the previous one-command fast-forward.

**Neutral**

- [`tools/release.ts`](../../tools/release.ts) remains the release entry point, narrowed to verify + tag + publish.
- Project release tags (`vX.Y.Z`) remain separate from per-APR `version:` fields.
- This refines the release *behavior* that ADR-003 established as tooling; ADR-003's tooling-stack decision (TypeScript/Node) is unaffected.

## Revisiting

Revisit if `main` branch protection is removed, or if the maintainer set and cadence change enough that a lighter, single-maintainer flow is warranted again.
