# APR-021 — Evaluation — Digest

> **Generated digest of [APR-021 — An Evaluation and Regression-Gate Principle for Promptware](../APR-021-evaluation.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** No promptware or harness change ships without a regression signal from a versioned evaluation suite, and the suite is authored before the change it measures — because a system with no compiler has evaluation as its only objective feedback that a change fixed a failure rather than moving it.

**Principle.** Evaluation is a **design-time gate**, not a runtime check. A versioned eval suite (datasets + metrics) is a first-class artifact; no behavior-shaping change is accepted without a regression signal from it; and the suite is authored *before* the change, so it measures against a known baseline rather than against itself.

## Prescription

- **MUST** maintain a **versioned eval suite** (datasets + metrics) as a first-class artifact — a graph node (APR-013), versioned per APR-008.
- **No behavior-shaping change ships without a regression signal** (a gate in the APR-010 two-tier model).
- Eval cases **MUST** exist **before** the change (red before green); new behavior adds its case first.
- **Model migration MUST re-run** the suite (APR-008); a model swap is a change.
- Eval artifacts/results **SHOULD** be declared via metadata (`core.evaluation`, APR-014; `observe.evals`, APR-002).
- A regression is a **change-blocking finding**, not an overridable warning.

## Governance

Gate exists (pipeline runs evals, blocks on regression) · baseline precedes change (eval case in the diff) · migration re-eval (APR-008) · traceable results (graph nodes with verifies-edges, APR-013).

## Scope limits — do NOT misapply

Not runtime verification (APR-003 = live output at the seam; this = a change, offline) · not observability (APR-011 = production traces; this = design-time, authored before the change) · not the governance machinery (APR-010; this is the eval-specific gate it runs) · not a capability benchmark/leaderboard · not a metric mandate (requires a signal, not a method).

---
*Source: [APR-021 — An Evaluation and Regression-Gate Principle for Promptware](../APR-021-evaluation.md) v0.1.0 · regenerate this digest whenever the source changes.*
