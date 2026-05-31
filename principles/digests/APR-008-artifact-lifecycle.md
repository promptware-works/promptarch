# APR-008 — Artifact Lifecycle & Model Migration — Digest

> **Generated digest of [APR-008 — An Artifact-Lifecycle and Model-Migration Principle for Promptware](../APR-008-artifact-lifecycle.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Runtime artifacts carry an explicit lifecycle — versioned, status-tracked, deprecated with lineage, never silently changed — and declare the model they're validated against, so a model upgrade re-validates the prompt substrate via evals and blocks regression in safety-critical artifacts.

**Principle.** Treat every runtime artifact as a versioned, status-tracked dependency, and the model as a dependency of the artifacts' behavior. Change either only through re-validation, not in place.

## Artifact lifecycle

- Behavior- and contract-bearing artifacts (skills, agents, patterns, contracts, policies, ontology, eval sets) MUST carry **version + status + lineage**.
- Leaf content (a config scalar, a single example) is versioned by **git + its file's version** — no separate ceremony.
- A behavioral change to a depended-on artifact MUST be a **version bump**, not a silent in-place edit.

## Deprecation & supersession

Status is `Active` / `Deprecated` / `Superseded`. Deprecation carries a **window** + `superseded_by` lineage; **consumers are migrated before removal** (impact analysis flags them). Never silent deletion. (Mirrors `apr-statuses` for runtime artifacts.)

## The model is a dependency

- Declared via **platform baseline + per-artifact override**: a default validated model platform-wide; an artifact pins `validated_against:` only when model-sensitive or specifically validated.

## Model migration (on model change)

- **Only the probabilistic substrate is re-validated** (APR-003): prompt-driven behavior MUST be re-evaluated via evals against the new model; deterministic (code) behavior is **exempt**. This bounds the migration surface.
- **Tiered gate** on an eval regression: **blocks** the migration for safety-critical artifacts (`safety_critical: true`, or gating consequential actions — APR-005); for others, ships **only with an ADR** accepting it (OBSERVE's eval-regression rule).
- A migration is a disciplined, eval-gated, recorded event — never a silent swap.

## Governance checks

Lifecycle fields present on behavior/contract artifacts · no silent behavioral edits (change ⇒ version bump) · deprecation carries window + lineage, consumers flagged, nothing deleted with live consumers · model baseline exists, model-sensitive artifacts pin `validated_against` · migration gate runs prompt-substrate evals on the new model (block safety-critical regressions, ADR otherwise).

## Scope limits — do NOT misapply

Not the APRs' lifecycle (that's `apr-process`) · not an eval framework (uses OBSERVE evals) · not a version-control system (git remains the substrate) · not model benchmarking (validates artifacts against a model, not models against each other) · not a guarantee of zero regression (makes it visible and gated).

---
*Source: [APR-008 — An Artifact-Lifecycle and Model-Migration Principle for Promptware](../APR-008-artifact-lifecycle.md) v0.1.0 · regenerate this digest whenever the source changes.*
