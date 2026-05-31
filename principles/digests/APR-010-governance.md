# APR-010 — Governance for Promptware Conformance — Digest

> **Generated digest of [APR-010 — A Governance Principle for Promptware Conformance](../APR-010-governance.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Promptware has no compiler, so conformance is reconstructed through a layered apparatus — schema validation, evals, review gates, audit-log binding — in two tiers: mechanics run as CI fitness functions, judgment goes to human review. The canonical governance model the domain APRs defer to.

**Principle.** Conformance is reconstructed, not assumed. Every self-imposed requirement is enforced by a check that is either an **automated fitness function** or a **human review gate** — decided by whether the check is mechanical or a judgment. Governance is the compensating control for the absence of compile-time guarantees.

## The two-tier model

- **Tier 1 — automatable → CI.** Closed-form checks (schema validity, reference integrity, required fields, staleness, no-inline-duplication). Deterministic → *code* → executable **fitness functions** that fail the build on violation. (`tools/digests/check-digests.ts` is a worked example.)
- **Tier 2 — judgment → human review.** Architectural/semantic calls (is this classification right? is this a breaking change? should this component exist?). MUST go to human review; MUST NOT be delegated to a probabilistic auto-approver (an APR-003 violation).

The dividing line is APR-003's code/prompt boundary, applied to the governance checks themselves.

## The apparatus (four layers)

Schema validation (type-system analogue) · evals (test-suite analogue, OBSERVE) · review gates (Tier-2 judgments) · **audit-log binding** at the moment of consumption (`{source, version/commit, timestamp}`) — universal across injection/delegation/application/approval, defined here.

## Normative rules

- Every conformance requirement MUST be enforced by a Tier-1 (automatable → CI fitness function) or Tier-2 (judgment → human review) check.
- Tier-2 judgments MUST NOT be delegated to a probabilistic auto-approver (APR-003).
- Tier-1 rules SHOULD be executable fitness functions that fail the build.
- Consequential consumption MUST be audit-log-bound at the moment of consumption.
- Consumer-affecting changes MUST be classified additive/evolutionary/breaking; breaking → ADR + impact analysis.
- Governance MUST NOT re-own RBAC (APR-005), artifact versioning (APR-008), or telemetry (observability) — it references them.

## What it owns vs delegates

**Owns:** two-tier model, gate composition, audit-binding, change-via-ADR + impact analysis, fitness-function framing. **Delegates:** RBAC → APR-005; artifact versioning/migration → APR-008; visibility → observability (proposed).

## Scope limits — do NOT misapply

Not a compliance certification (supports ISO 42001 / EU AI Act audits, satisfies none) · not a CI tool · not access control (RBAC is APR-005) · not the APRs' meta-process (`apr-process`) · not a guarantee of conformance (makes non-conformance visible and gated).

> **Source vs summary:** this APR is the *canonical source* the domain APRs defer to for the shared model — not a summary of their governance sections. Repointing those sections is a staged follow-up.

---
*Source: [APR-010 — A Governance Principle for Promptware Conformance](../APR-010-governance.md) v0.1.0 · regenerate this digest whenever the source changes.*
