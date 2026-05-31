# APR Backlog

A forward-looking tracker of *candidate* APRs — ideas under consideration, proposals in flight, and drafts not yet accepted. It complements, and never duplicates, the authoritative list of **existing** APRs in [`principles/README.md`](../principles/README.md).

This is a **living document**: add ideas freely, move them along the stages, prune what's withdrawn. It is not part of the formal record — an idea becomes binding only when it reaches a `Draft` APR and, ultimately, `Accepted` status (see [`apr-process.md`](apr-process.md)).

## Stages

| Stage | Meaning |
|---|---|
| 💡 Idea | Noted here; no issue yet. |
| 📋 Proposed | Issue-stage proposal open (the 5-point format from [`apr-process.md`](apr-process.md) §2). |
| ✍️ Drafted | A `Draft` APR file exists; in the finalizing pipeline (→ `Proposed` → `Accepted`). |

These are *backlog* stages — distinct from an APR's lifecycle `status` (see [`apr-statuses.md`](apr-statuses.md)). An item leaves this file once its APR is `Accepted`; from then on the index is its home.

## In flight (proposed or drafted, not yet Accepted)

| Candidate | One-line principle | Stage | Tracking |
|---|---|---|---|
| Code/prompt boundary | Deterministic/verifiable/safety-critical behavior in code; open-ended judgment in prompts; the seam explicit, typed, testable. | ✍️ Drafted | [APR-003](../principles/APR-003-code-prompt-boundary.md) · issue #1 |
| Canonical source + materialization | Author promptware once in a runtime-neutral canonical root; materialize each vendor home from it; never hand-edit the generated copies. | ✍️ Drafted | [APR-004](../principles/APR-004-canonical-source.md) · issue #2 |
| Trust boundaries & untrusted input | Classify content by trust; untrusted is data, never instructions; category/author boundaries explicit and enforced, with provenance. | ✍️ Drafted | [APR-005](../principles/APR-005-trust-boundaries.md) · issue #3 |
| Composition & delegation topology | Compose agents/skills into an explicit, bounded delegation graph — structured topology, depth/cycle/termination limits, composed blast radius. | ✍️ Drafted | [APR-006](../principles/APR-006-composition-topology.md) · issue #4 |
| Pattern mechanism | A reusable unit of behavior ("pattern") is a first-class, named, versioned artifact applied declaratively — defined once, never copy-pasted. | ✍️ Drafted | [APR-007](../principles/APR-007-pattern-mechanism.md) · issue #5 |
| Artifact lifecycle & model migration | Runtime artifacts are versioned, status-tracked, and deprecated by discipline; they declare the model they're validated against, so upgrades trigger re-validation, not silent regression. | 📋 Proposed | issue #6 |

## Idea backlog (not yet proposed)

Ranked by current priority. Each is a candidate, not a commitment.

### 1. Eval-driven development — 💡 Idea (low / hold)

- **One-liner:** Golden sets + graders + CI regression gates as a development *discipline* for promptware.
- **Gap:** OBSERVE says *where* eval sets live and what governance applies; it does not prescribe the *methodology*.
- **Hold:** Wait until APR-002 OBSERVE is `Accepted`, to avoid two `Draft` APRs contesting the eval territory.

## How to use this file

- **New idea** → add a section under *Idea backlog* (one-liner, gap, relationship).
- **Idea → issue** → open a 5-point proposal, move the item to *In flight* as 📋 Proposed, link the issue.
- **Issue → draft** → mark ✍️ Drafted, link the APR file.
- **Accepted** → remove the row from here; the [index](../principles/README.md) is now its home.
