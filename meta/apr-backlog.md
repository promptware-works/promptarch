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
| Artifact lifecycle & model migration | Runtime artifacts are versioned, status-tracked, and deprecated by discipline; they declare the model they're validated against, so upgrades trigger re-validation, not silent regression. | ✍️ Drafted | [APR-008](../principles/APR-008-artifact-lifecycle.md) · issue #6 |
| Human-in-the-loop oversight | Place human oversight by reversibility/blast-radius — plan-and-approve (gate before) for irreversible/high-blast actions, fire-and-judge (review after) for reversible/low-blast ones. | ✍️ Drafted | [APR-009](../principles/APR-009-human-in-the-loop.md) · issue #7 |
| Governance (conformance) | The reconstructed conformance safety net — two-tier model (CI fitness functions + human review), audit-binding, change-via-ADR — as the canonical source the domain APRs defer to. Repointing them is a staged follow-up. | ✍️ Drafted | [APR-010](../principles/APR-010-governance.md) · issue #8 |
| Observability & cost | End-to-end traces over the delegation graph linking behavior to artifact/model versions and injected content, with cost as a first-class attributed, budgeted dimension. | ✍️ Drafted | [APR-011](../principles/APR-011-observability.md) · issue #9 |
| Federated composition (cross-domain) | Composition *across* a trust/identity boundary (farms → federation): governed membership, authenticated participants, least-privilege non-ambient cross-domain trust. Forward-looking (emerging scale); L3-centered, L4 noted. | ✍️ Drafted | [APR-012](../principles/APR-012-federated-composition.md) · issue #10 |
| Artifact graph (single source of truth) | A project's canonical state is one append-only, typed artifact graph across the lifecycle; traceability is a path through edges emitted as a side effect of production; tools are projections, not parallel systems of record; baselines are signed checkpoints. | ✍️ Drafted | [APR-013](../principles/APR-013-artifact-graph.md) · draft (no issue yet) |
| Declared classification (DECLARE) | A packaged component declares its architectural classification as orthogonal machine-readable frontmatter; tooling/structure/dispatch derive from the declaration; format/name/location never imply role (the "costume" failure). The frontmatter sibling ASPECT defers. | ✍️ Drafted | [APR-014](../principles/APR-014-declare.md) · draft (no issue yet) |
| Context assembly & window discipline | The context window is a composed artifact: declared precedence order, per-class token budget, and a declared overflow-reduction policy with a non-evictable safety floor; assembly is deterministic, provenance-carrying, and audit-logged. Surfaced by the harness-coverage study. | ✍️ Drafted | [APR-015](../principles/APR-015-context-assembly.md) · issue #11 |
| Memory & session state | Agent memory is tiered (working/session/long-term), trust-labeled, and scope-bound: recall never elevates trust (memory-poisoning defense), retention is bounded and forgettable, and behavior-shaping memory graduates into a governed artifact. Surfaced by the harness-coverage study. | ✍️ Drafted | [APR-016](../principles/APR-016-memory.md) · issue #12 |
| Graceful degradation & failure handling | Failure handling selected by declared safety-criticality: fail closed for safety-critical/consequential/irreversible paths, declared bounded fallback elsewhere, never silent. Unifies the six local halt rules (APR-002/003/005/006/011/015) as one principle. Surfaced by the harness-coverage study. | ✍️ Drafted | [APR-017](../principles/APR-017-graceful-degradation.md) · issue #13 |

## Idea backlog (not yet proposed)

Ranked by current priority. Each is a candidate, not a commitment. All three
promptware-architectural gaps surfaced by the [harness-coverage study](../docs/studies/harness-coverage.md)
— context assembly, memory & session state, and graceful degradation — are now drafted as
[APR-015](../principles/APR-015-context-assembly.md), [APR-016](../principles/APR-016-memory.md),
and [APR-017](../principles/APR-017-graceful-degradation.md) respectively (see *In flight* above).

### 1. Eval-driven development — 💡 Idea (low / hold)

- **One-liner:** Golden sets + graders + CI regression gates as a development *discipline* for promptware.
- **Gap:** OBSERVE says *where* eval sets live and what governance applies; it does not prescribe the *methodology*.
- **Hold:** Wait until APR-002 OBSERVE is `Accepted`, to avoid two `Draft` APRs contesting the eval territory.

### 2. PII & sensitive data in promptware artifacts — 💡 Idea (low / maybe)

- **One-liner:** PII, credentials, and secrets that land in prompts, examples, eval cases, logs, and traces are classified, redacted, and access-controlled — content-centric data privacy.
- **Gap:** OBSERVE §10 flags sensitive data in `examples/` as out of scope; nobody owns content privacy. The one genuinely promptware-specific slice of security not in APR-005.
- **Relationship:** Complements APR-005 (trust) and ties to observability (PII in traces).

### 3. Coordination mechanisms (beyond delegation) — 💡 Idea (low / maybe)

- **One-liner:** How agents coordinate *without* a delegation edge — shared state (blackboard), broadcast/pub-sub, negotiation/market — under discipline.
- **Gap:** APR-006 governs the delegation call-graph; coordination that isn't call→return is untouched.
- **Caveat:** May not be a principle — much of it reduces to "shared state is an OBSERVE-governed artifact." Park and revisit.

## Considered, not pursued as standalone

- **Prompt-caching discipline** — too tactical and provider-coupled to be a durable APR. Its durable kernel — *order injected context by volatility (stable/shared first, volatile/per-request last) for cache-stability* — is now absorbed as a subordinate `SHOULD` in [APR-015](../principles/APR-015-context-assembly.md) (context assembly), not a standalone APR.
- **General security** — covered. The promptware-specific security concern (trust boundaries, untrusted input, prompt injection, RBAC on content, provenance) is [APR-005](../principles/APR-005-trust-boundaries.md); the rest (secrets, transport, sandboxing, authn/authz) is generic platform security the corpus deliberately delegates (APR-000 scope, APR-005 §What-this-is-NOT, OBSERVE §10). A general security APR would be generic advice, not a promptware principle.
- **General orchestration / hub-spoke models** — covered by [APR-006](../principles/APR-006-composition-topology.md). Hub-spoke is its DAG-default supervisor/worker topology; specific orchestration patterns are *instances* (content), not principles — cataloguing them would repeat the mechanism-vs-catalogue trap.

## How to use this file

- **New idea** → add a section under *Idea backlog* (one-liner, gap, relationship).
- **Idea → issue** → open a 5-point proposal, move the item to *In flight* as 📋 Proposed, link the issue.
- **Issue → draft** → mark ✍️ Drafted, link the APR file.
- **Accepted** → remove the row from here; the [index](../principles/README.md) is now its home.
