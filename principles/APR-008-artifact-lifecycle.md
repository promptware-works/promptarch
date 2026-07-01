---
apr: 8
title: "An Artifact-Lifecycle and Model-Migration Principle for Promptware"
abstract: "Runtime artifacts carry an explicit lifecycle — versioned, status-tracked, deprecated with lineage, never silently changed — and declare the model they're validated against, so a model upgrade re-validates the prompt substrate via evals and blocks regression in safety-critical artifacts."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-31
last-updated: 2026-05-31
audience: Architects and framework authors of agentic AI platforms; teams operating promptware across model upgrades or multiple models
supersedes: []
superseded-by: []
related:
  - APR-001
  - APR-002
  - APR-003
  - APR-005
tags:
  - lifecycle
  - versioning
  - model-migration
  - deprecation
  - evals
---

# APR-008 — An Artifact-Lifecycle and Model-Migration Principle for Promptware

> **Runtime promptware artifacts have an explicit lifecycle — versioned, status-tracked, deprecated and superseded by discipline, never silently changed — and they declare the model they are validated against, so a model change triggers re-validation and migration, not silent regression.**

*Injectable summary (for feeding to an LLM): [`digests/APR-008-artifact-lifecycle.md`](digests/APR-008-artifact-lifecycle.md). This full APR is canonical.*

## Motivation

Two intertwined gaps:

- **Artifact lifecycle.** Skills, agents, patterns, and OBSERVE content all change over time. [APR-001 ASPECT](APR-001-aspect.md) has a per-component `Version & Lineage` section, [APR-002 OBSERVE](APR-002-observe.md) has schema-evolution + eval-staleness discipline, [APR-007](APR-007-pattern-mechanism.md) versions patterns — but *piecemeal*. With no unifying principle, runtime artifacts get edited in place, deprecated by deletion, and superseded without lineage, leaving consumers broken and history lost.
- **Model migration — the urgent one.** Promptware behavior is **model-dependent**: a skill's prose is tuned against a particular model. When the model upgrades (e.g. 4.7 → 4.8) or is swapped, behavior can **regress silently** — the same prompt under-performs or shifts its output distribution. [APR-000](APR-000-promptware.md) calls model versioning "orthogonal," but the *interaction* — promptware validated against a model — is real and unaddressed. Without discipline, a model upgrade is a silent, untested, platform-wide behavior change.

## The principle

> **Treat every runtime artifact as a versioned, status-tracked dependency, and treat the model as a dependency of the artifacts' behavior. Change either only through re-validation, not in place.**

Two halves: a **lifecycle discipline** for artifacts, and **the model as a declared, eval-validated dependency** of promptware behavior.

## Scope and applicability

### When this applies

- The lifecycle of runtime promptware artifacts (skills, agents, patterns, OBSERVE content, materialized outputs), and model changes affecting them.

### When this does NOT apply

- The APRs' own meta-lifecycle — that is [`apr-process`](../meta/apr-process.md); this governs *runtime* artifacts, not the principles documents.
- It is **not** a model-evaluation methodology or a version-control system. It prescribes the lifecycle discipline, leveraging OBSERVE's evals and ordinary VCS, not replacing them.

## Artifact lifecycle

- **Behavior- and contract-bearing artifacts** — skills, agents, patterns, contracts, policies, ontology, eval sets — **MUST** carry a **version**, a **status**, and **lineage**. These are where change-impact is real.
- **Leaf content** — an individual config scalar, a single example case — is versioned by **git history and its containing file's version**, not its own ceremony. (This avoids bureaucracy and matches OBSERVE, which schema-governs contracts/ontology/policies but treats config values as fluid.)
- An artifact **MUST NOT** be changed silently in place when consumers depend on its behavior: a behavioral change is a version bump, not an untracked edit.

## Deprecation and supersession

Mirroring the APR lifecycle ([`apr-statuses`](../meta/apr-statuses.md)) for runtime artifacts:

- An artifact's **status** is `Active`, `Deprecated`, or `Superseded`.
- **Deprecation** carries a **window** and, when replaced, a `superseded_by` **lineage** pointer; the superseding artifact points back via `supersedes`.
- **Consumers are migrated before removal** — impact analysis (OBSERVE) flags every consumer at deprecation. Deprecation is **never silent deletion**.

## The model is a dependency

- Promptware behavior depends on the model, so the model is a **declared dependency** of behavior-bearing artifacts.
- Declaration uses a **platform baseline + per-artifact override**: the platform declares a default validated model; most artifacts inherit it, and an artifact pins `validated_against:` only when it is model-sensitive or has been specifically validated against particular model(s).
- A model whose behavior an artifact depends on is part of its lineage — recorded, not assumed.

## Model migration

When the model changes (upgrade or swap):

- **Only the probabilistic substrate is re-validated.** Per [APR-003](APR-003-code-prompt-boundary.md), prompt-driven behavior is model-dependent and **MUST** be re-evaluated against the new model via its evals; deterministic (code) behavior is model-independent and **exempt** (its unit tests already cover it). This **bounds the migration surface** to the prompt parts.
- **The gate is tiered.** A regression below an artifact's `min_eval_score` on the new model:
  - **blocks the migration** for safety-critical artifacts (those declaring `safety_critical: true`, or gating consequential actions — see [APR-005](APR-005-trust-boundaries.md));
  - for all others, the migration ships **only with an ADR explicitly accepting** the regression (mirroring OBSERVE's eval-regression rule).
- A model migration is therefore a **disciplined, eval-gated event with a recorded outcome** — never a silent, untested swap.

## Prescription

- Behavior- and contract-bearing artifacts **MUST** carry version, status, and lineage; leaf content is versioned via git + its file's version.
- A behavioral change to a depended-on artifact **MUST** be a version bump, not a silent in-place edit.
- Artifacts **MUST** declare model validation via a platform baseline, overriding with `validated_against:` where model-sensitive; deprecation **MUST** carry a window and `superseded_by` lineage, and **MUST** migrate consumers before removal.
- On a model change, the prompt substrate **MUST** be re-validated via evals; the deterministic substrate is exempt (APR-003).
- An eval regression on the new model **MUST** block the migration for safety-critical artifacts and **MUST** require an ADR to proceed for others.

## Governance and validation

The shared governance model — two-tier enforcement, audit-log binding, and change-via-ADR — is defined in [APR-010](APR-010-governance.md); the checks below are this APR's domain-specific additions.

A conformant platform checks, in review or CI:

- **Lifecycle fields present** — behavior/contract-bearing artifacts have version, status, lineage.
- **No silent behavioral edits** — a behavioral change without a version bump is flagged.
- **Deprecation discipline** — deprecated artifacts carry a window + lineage; consumers are flagged for migration; nothing is deleted with live consumers.
- **Model validation recorded** — the platform baseline exists; model-sensitive artifacts pin `validated_against`.
- **Migration gate** — on a model change, prompt-substrate evals run against the new model; regressions block safety-critical artifacts and require an ADR otherwise.

## What this principle is NOT

- **Not the APRs' lifecycle.** That is `apr-process`; this governs runtime artifacts.
- **Not an eval framework.** It *uses* OBSERVE evals as the migration gate; it does not define eval tooling.
- **Not a version-control system.** Git remains the substrate; this adds the discipline on top.
- **Not model evaluation/benchmarking.** It validates *artifacts against a model*, not models against each other.
- **Not a guarantee of zero regression.** It makes regression *visible and gated*, not impossible.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Semantic Versioning** | Versions that communicate change impact | Applied to prose/behavioral artifacts, with status + lineage, not just code releases |
| **Deprecation / sunset policies** (RFC 8594) | Disciplined retirement with a window | Lineage + consumer-migration-before-removal for promptware artifacts |
| **Database / schema migrations** (Flyway) | Versioned, ordered change of stateful artifacts | The "schema" is behavioral content; migration is triggered by *model* change too |
| **Model registries & model cards** (MLflow; Mitchell et al.) | Tracking model versions and their validated use | The *artifact* declares the model it is validated against; the model is the dependency, not the product |
| **Dependency pinning / lockfiles** | Pin to validated versions; upgrade deliberately | The model is pinned as a behavioral dependency; upgrading it re-validates only the prompt substrate |

The novel contribution is a **promptware-specific lifecycle principle** that unifies versioning/deprecation/supersession across all runtime artifacts **and** treats the model as a pinned, eval-validated dependency — so model upgrades are disciplined, tiered-gated migrations rather than silent regressions, with the migration surface bounded to the prompt substrate by APR-003.

## Metadata registrations

Component-metadata fields this APR owns, registered per [APR-014 §The metadata registry](APR-014-declare.md) in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml):

| Field | Cluster | Type | Values | Status |
|---|---|---|---|---|
| `version` | provenance | string | — | active |
| `supersedes` | provenance | string | — | active |
| `model_pin` | evaluation | string | — | active |

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. Preston-Werner, T. *Semantic Versioning 2.0.0*. <https://semver.org/>
2. Wilde, E. *RFC 8594 — The Sunset HTTP Header Field*. IETF, 2019. <https://www.rfc-editor.org/rfc/rfc8594>
3. Flyway. *Flyway — version control for your database*. <https://flywaydb.org/>
4. MLflow. *MLflow — model registry and lifecycle management*. <https://mlflow.org/>
5. Mitchell, M. et al. *Model Cards for Model Reporting*. arXiv:1810.03993, 2019. <https://arxiv.org/abs/1810.03993>

## Adoption notes

- **Stamp lifecycle fields on behavior/contract artifacts first** (skills, agents, patterns, contracts, policies); leaf content rides git.
- **Set the platform model baseline explicitly**, and pin `validated_against` only on the artifacts you know are model-sensitive — don't pin everything.
- **Wire the migration gate into your eval CI**: on a model bump, re-run prompt-substrate evals against the new model before promoting it; block safety-critical regressions.
- **Treat a model upgrade like a dependency upgrade** — a deliberate, tested, recorded event, not an ambient change.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-31 | Draft | Initial draft published as APR-008. |
