---
apr: 21
title: "An Evaluation and Regression-Gate Principle for Promptware"
abstract: "No promptware or harness change ships without a regression signal from a versioned evaluation suite, and the suite is authored before the change it measures — because a promptware system with no compiler has evaluation as its only objective feedback that a change fixed a failure rather than moving it."
status: Draft
class: architectural
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-10
last-updated: 2026-07-10
audience: Architects and teams changing promptware or harness behavior under review; anyone building an eval suite as the regression gate for prompt-defined software
supersedes: []
superseded-by: []
related:
  - APR-002
  - APR-008
  - APR-010
  - APR-013
  - APR-014
tags:
  - evaluation
  - regression-gate
  - design-time
  - quality
  - model-migration
---

# APR-021 — An Evaluation and Regression-Gate Principle for Promptware

> **Every behavior-shaping change — to promptware or to the harness — MUST be gated by a regression signal from a versioned evaluation suite, and the suite MUST be authored before the change it measures.**

*Injectable summary (for feeding to an LLM): [`digests/APR-021-evaluation.md`](digests/APR-021-evaluation.md). This full APR is canonical.*

## Motivation

Promptware has **no compiler and no type checker** ([APR-000](APR-000-promptware.md)): a change to a prompt or a policy produces no build error, and its effect on behavior is probabilistic. The only objective feedback that a change *fixed* a failure rather than *moved* it is an evaluation. Without one, two failure modes are routine:

- **Edited in production without an eval run.** A prompt is tweaked to fix a reported failure; nobody can say whether the fix worked, regressed three other cases, or merely relocated the symptom. Change becomes superstition.
- **Evals built after the refactor.** A suite written *after* the system it measures can only compare the new system against itself — it has no record of the behavior it was supposed to preserve, so it certifies whatever shipped. The regression signal must predate the change or it is not a regression signal.

[APR-008](APR-008-artifact-lifecycle.md) already says a model migration must be re-validated; this APR states the general rule that migration is one instance of: **a model swap, a prompt edit, a harness change, and a tool change are all behavior-shaping changes, and each owes a regression signal.**

## The principle

> **Evaluation is a design-time gate, not a runtime check.** A versioned eval suite — datasets plus metrics — is a first-class project artifact; no promptware or harness change is accepted without a regression signal from it; and the suite is authored *before* the change, so it measures the change against a known baseline rather than against itself.

Evaluation is the promptware analogue of the regression test suite: the objective feedback loop that makes change *measurable* in a system whose behavior cannot be read off the source.

## Scope and applicability

### When this applies

- Any promptware under **change management** — a corpus of skills/agents/prompts, or a harness, that will be edited more than once and whose behavior matters.
- Every **behavior-shaping change**: prompt/policy edits, harness logic, tool contracts, and **model migrations** ([APR-008](APR-008-artifact-lifecycle.md)).

### When this does NOT apply

- A **throwaway or one-shot** prompt with no change history and no consumers — there is nothing to regress against.
- **Runtime output validation** ([APR-003](APR-003-code-prompt-boundary.md)) — that gates a live response against a schema; this gates a *change* against a baseline, offline.
- **Runtime observability** ([APR-011](APR-011-observability.md)) — production traces are a signal, but evaluation is the design-time measurement authored before the change.

## Prescription

- A project **MUST** maintain a **versioned evaluation suite** — datasets and metrics — as a first-class artifact (a node in the [APR-013](APR-013-artifact-graph.md) graph, versioned per [APR-008](APR-008-artifact-lifecycle.md)), not an ad-hoc script.
- **No behavior-shaping change ships without a regression signal** from that suite (a gate in the two-tier conformance model, [APR-010](APR-010-governance.md)).
- The relevant eval cases **MUST** exist **before** the change; a change that needs new coverage **MUST** add the case first (red before green), so the suite never measures the new system against itself.
- A **model migration MUST re-run** the suite ([APR-008](APR-008-artifact-lifecycle.md)); a model swap is a behavior-shaping change.
- Eval artifacts and results **SHOULD** be **declared** through component metadata ([APR-014](APR-014-declare.md) `core.evaluation`; [APR-002](APR-002-observe.md) `observe.evals` for OBSERVE consumers), so what a component is evaluated against is discoverable, not folklore.
- A regression **MUST** be surfaced as a change-blocking finding, not a warning silently overridden.

## Governance and validation

The shared conformance model is [APR-010](APR-010-governance.md); the checks below are this APR's additions.

- **Gate exists** — the change pipeline runs the eval suite and blocks on a regression (Tier 1 that it runs; Tier 2 that its coverage is adequate for the change).
- **Baseline precedes change** — new behavior is accompanied by an eval case added in or before the same change, reviewable in the diff.
- **Migration re-eval** — a model or harness swap carries an eval run against the prior baseline ([APR-008](APR-008-artifact-lifecycle.md)).
- **Traceable results** — eval artifacts and outcomes are graph nodes ([APR-013](APR-013-artifact-graph.md)) with `verifies`-style edges to what they cover, not detached spreadsheets.

## What this principle is NOT

- **Not runtime verification.** [APR-003](APR-003-code-prompt-boundary.md) validates a live model output at the seam; evaluation measures a *change* offline against a baseline.
- **Not observability.** [APR-011](APR-011-observability.md) traces production; this is design-time measurement authored before the change (production signal *feeds* the suite, it is not the suite).
- **Not the governance machinery.** [APR-010](APR-010-governance.md) is the two-tier enforcement/audit model; this is the eval-specific gate that machinery runs.
- **Not a benchmark or a leaderboard.** The suite measures *this project's* regressions against *its* baseline, not general model capability.
- **Not a metric mandate.** It requires a regression signal, not a particular scoring method — exact-match, rubric-graded, LLM-as-judge, or human review, per what the behavior admits.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Regression testing / CI gates** (software) | No change ships without a green signal against a known baseline | Applied to *prompt-defined* behavior with no compiler; the baseline is an eval set, the signal probabilistic |
| **Test-Driven Development** (Beck) | The test precedes the change (red before green) | The "test" is an eval case; the mandate is *author-the-eval-before-the-edit* to avoid self-measurement |
| **ML model evaluation / golden datasets** | Versioned datasets + metrics measuring behavior | Positioned as a *change gate* for a whole promptware corpus, tied to lifecycle (APR-008) and the artifact graph (APR-013) |
| **LLM-as-judge / rubric grading** | A way to score open-ended output | Named as one admissible metric, not the mandate; the principle requires a *signal*, not a method |

The contribution is a **promptware regression-gate principle**: in a system with no compiler, evaluation is the objective feedback loop, and it must be a versioned artifact that gates every behavior-shaping change and is authored before the change — the design-time counterpart to the corpus's runtime safety principles.

## Adoption notes

- **Author the eval with the bug report, not the fix.** Turn each reported failure into an eval case *first*; the fix is then measured against it. This is the single habit that makes the gate real.
- **Small and versioned beats large and detached.** A handful of curated cases in the repo, versioned with the promptware, outperforms a big spreadsheet nobody re-runs.
- **Wire results into the graph.** Emit `verifies` edges ([APR-013](APR-013-artifact-graph.md)) from eval results to the requirements/components they cover, so coverage gaps are visible, not assumed.

## References

1. Beck, K. *Test-Driven Development: By Example*. Addison-Wesley, 2002. <https://www.oreilly.com/library/view/test-driven-development/0321146530/>
2. Fowler, M. *Continuous Integration*. 2006. <https://martinfowler.com/articles/continuousIntegration.html>
3. Liang, P. et al. *Holistic Evaluation of Language Models (HELM)*. 2022. <https://arxiv.org/abs/2211.09110>
4. Zheng, L. et al. *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*. NeurIPS, 2023. <https://arxiv.org/abs/2306.05685>
5. Bradner, S. *Key words for use in RFCs to Indicate Requirement Levels (RFC 2119 / BCP 14)*. IETF, 1997. <https://datatracker.ietf.org/doc/html/rfc2119>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-10 | Draft | Initial draft. Evaluation as a design-time regression gate: a versioned eval suite is a first-class artifact, every behavior-shaping change (including model migration, APR-008) owes a regression signal, and the suite is authored before the change. Fills the "Evaluation" harness primitive the corpus previously left to metadata alone. |
