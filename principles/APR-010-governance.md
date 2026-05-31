---
apr: 10
title: "A Governance Principle for Promptware Conformance"
abstract: "Promptware has no compiler, so conformance is reconstructed through a layered apparatus — schema validation, evals, review gates, audit-log binding — in two tiers: mechanics run as CI fitness functions, judgment goes to human review. The canonical governance model the domain APRs defer to."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-31
last-updated: 2026-05-31
audience: Architects and framework authors of agentic AI platforms; compliance and audit stakeholders; anyone implementing conformance checks for a promptware platform
supersedes: []
superseded-by: []
related:
  - APR-000
  - APR-002
  - APR-005
  - APR-008
tags:
  - governance
  - conformance
  - fitness-functions
  - audit
  - compliance
---

# APR-010 — A Governance Principle for Promptware Conformance

> **Promptware behavior is prose with no compile-time guarantees, so conformance is not given — it is *reconstructed*: a layered apparatus of schema validation, evals, review gates, and audit-log binding, organized by a two-tier model (automatable mechanics → CI; judgment → human review).**

*Injectable summary (for feeding to an LLM): [`digests/APR-010-governance.md`](digests/APR-010-governance.md). This full APR is canonical.*

## Motivation

[APR-000](APR-000-promptware.md) observes that promptware lacks the safety net of code — no compiler, no type system, no unit tests at the layer that matters — and that "equivalent mitigations have to be reinvented for content-centric artefacts." **Governance is that reinvention**, but the series has built it *incidentally*:

- 8 of 10 APRs carry a "Governance and validation" section.
- The **two-tier model** (automatable CI vs. human judgment) is defined *inside* [APR-002 OBSERVE](APR-002-observe.md) §9, framed for content, and cited ad hoc elsewhere (APR-003: "Two-tier enforcement, as in OBSERVE").
- **Audit-log binding** appears in six APRs; **change-via-ADR + impact analysis** in three.

The machinery has no canonical home, so it is **duplicated and at risk of drift**, there is **no front door** for an adopter or auditor asking "how is a promptware platform governed?", and the **foundational claim is unstated** — nothing names governance as the safety net APR-000 calls for, and structures it. This APR is that home: the **canonical governance model the domain APRs instantiate**.

## The principle

> **Conformance is reconstructed, not assumed. Every requirement a promptware platform places on itself is enforced by a check that is either an automated fitness function or a human review gate — and which it is, is decided by whether the check is mechanical or a judgment.**

Governance is the *compensating control* for the absence of compile-time guarantees: where code gets correctness from the compiler and the test suite, promptware must *build* the equivalent assurance, deliberately and continuously.

## Scope and applicability

### When this applies

- Any promptware platform that must enforce conformance to its own principles and contracts.

### What it owns vs. delegates

| Owns | Delegates to |
|---|---|
| The two-tier model; gate composition; **audit-log-binding-at-consumption**; change-via-ADR + impact analysis; the fitness-function framing | **Decision rights / RBAC** → [APR-005](APR-005-trust-boundaries.md); **artifact versioning & migration mechanics** → [APR-008](APR-008-artifact-lifecycle.md); **runtime visibility / telemetry** → observability (proposed) |

It is **not** the APRs' own meta-process (`apr-process` governs the principles documents), **not** a compliance certification, and **not** a specific CI tool.

## The two-tier model

Every conformance check is one of two tiers, decided by the check's nature — which is itself an [APR-003](APR-003-code-prompt-boundary.md) determination:

- **Tier 1 — automatable (→ CI).** Anything decidable by a closed-form check: schema validity, reference integrity, presence of required fields, link resolution, version/staleness, no-inline-duplication. These are **deterministic**, so they are *code* and run as CI fitness functions.
- **Tier 2 — human judgment (→ review).** Anything requiring an architectural or semantic decision: is this classification correct? is this a breaking change? should this new component exist? These are not closed-form, so they **MUST** go to human review — they **MUST NOT** be delegated to a probabilistic auto-approver (an APR-003 violation: a safety decision on a probabilistic substrate).

The dividing line is the same code/prompt boundary APR-003 draws — applied to the *governance checks themselves*.

## Governance checks are fitness functions

Tier-1 checks are **executable fitness functions** — small, deterministic programs that assert a conformance property and fail the build when it is violated. They run continuously (CI, pre-merge), not as periodic audits, so drift is caught at the moment it is introduced.

The repository's own [`tools/digests/check-digests.ts`](../tools/digests/check-digests.ts) is a worked example: it asserts that every digest is in sync with its source APR's version and exits non-zero on drift. Every Tier-1 governance rule SHOULD become such a check.

## The apparatus

The reconstructed safety net has four layers; a conformant platform uses all four:

- **Schema validation** — structure and references are machine-checked (the type-system analogue).
- **Evals** — behavioral quality is measured against golden sets with gating thresholds (the test-suite analogue); see [OBSERVE](APR-002-observe.md).
- **Review gates** — Tier-2 judgments are gated by human review.
- **Audit-log binding** — every consequential consumption records `{source, version/commit, timestamp}` *at the moment it happens*, so conformance is evidenced, not reconstructed retrospectively. This binding is **universal** across the series (injection, delegation, application, approval) and is defined here.

## Change is governed

- A change that consumers depend on **MUST** be classified **additive / evolutionary / breaking**; breaking changes **MUST** carry an **ADR** and run **impact analysis** flagging every consumer.
- This is the universal change-control rule; the *artifact-specific* versioning and migration mechanics are [APR-008](APR-008-artifact-lifecycle.md)'s.

## Prescription

- Every self-imposed conformance requirement **MUST** be enforced by a check classified Tier-1 (automatable → CI fitness function) or Tier-2 (judgment → human review).
- Tier-2 judgments **MUST NOT** be delegated to a probabilistic auto-approver (APR-003).
- Tier-1 rules **SHOULD** be implemented as executable fitness functions that fail the build on violation.
- Consequential consumption **MUST** be audit-log-bound at the moment of consumption.
- Consumer-affecting changes **MUST** be classified additive/evolutionary/breaking; breaking changes **MUST** carry an ADR + impact analysis.
- Governance **MUST NOT** re-own RBAC (APR-005), artifact versioning (APR-008), or telemetry (observability); it references them.

## How the domain APRs instantiate this

This APR is the **source**; each domain APR's "Governance and validation" section **defers to it** for the shared model and keeps only its domain-specific checks:

- **OBSERVE** — the two-tier model (currently defined in its §9) is generalized here; OBSERVE keeps its content-category checks (orphans, ontology consistency, …).
- **APR-003–009** — each cites this APR for the two-tier model, audit-binding, and change-via-ADR, and lists only its domain checks.

*(Rollout note: this draft establishes the canonical source. Repointing OBSERVE §9 and the eight existing governance sections to defer here — and adding the framing line to APR-000 — is the staged follow-up; see design tension #1 in the proposal.)*

## What this principle is NOT

- **Not a compliance certification.** It produces audit-friendly structure that *supports* ISO/IEC 42001 / EU AI Act audits; it satisfies no regulatory obligation by itself.
- **Not a CI tool.** It defines what must be checked and how it is tiered, not which runner executes it.
- **Not access control.** Who *may* approve or edit is RBAC (APR-005); this governs *what is checked and how*.
- **Not the APRs' meta-process.** `apr-process` governs the principles documents; this governs promptware platforms.
- **Not a guarantee of conformance.** It makes non-conformance *visible and gated*, not impossible.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Architecture fitness functions** (evolutionary architecture) | Automated, continuous checks that a system still conforms to its principles | Applied to *prose-driven* artifacts; paired with a human-judgment tier and audit-binding |
| **Policy-as-code / compliance-as-code** (OPA) | Conformance encoded as executable, gating rules | The "policy" governs promptware artifacts (content + behavior), tiered by decidability |
| **CI/CD required checks & quality gates** | Mechanical enforcement at merge | Generalized to schema/eval/audit layers, with judgment routed to review |
| **Four-eyes / change-approval** | Human gate for consequential change | The Tier-2 half of a two-tier model, bounded by the APR-003 decidability line |
| **AI governance frameworks** (ISO/IEC 42001, NIST AI RMF) | Required, structured governance of AI | A concrete, executable conformance apparatus that *implements* such governance |

The novel contribution is a **promptware-specific governance principle**: the reconstructed conformance safety net, defined as a two-tier apparatus (automatable fitness functions + human review) with universal audit-binding and change-control — the canonical model every domain APR instantiates, with RBAC, versioning, and telemetry explicitly delegated.

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. Ford, N., Parsons, R., Kua, P. *Building Evolutionary Architectures — fitness-function-driven development*. Thoughtworks. <https://www.thoughtworks.com/insights/articles/fitness-function-driven-development>
2. Open Policy Agent (CNCF). *Open Policy Agent — policy as code*. <https://www.openpolicyagent.org/>
3. ISO/IEC. *ISO/IEC 42001:2023 — Artificial intelligence — Management system*. 2023. <https://www.iso.org/standard/42001>
4. NIST. *AI Risk Management Framework (AI RMF 1.0)*. <https://www.nist.gov/itl/ai-risk-management-framework>
5. European Parliament and Council. *Regulation (EU) 2024/1689 (Artificial Intelligence Act)*. 2024. <https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng>

## Adoption notes

- **Make every Tier-1 rule an executable check.** A governance rule that lives only in prose is a rule that drifts; turn it into a fitness function that fails the build.
- **Route judgment to humans, never to an auto-approver.** "Let the model decide if this is a breaking change" is an APR-003 violation.
- **Bind the audit log at consumption**, not after the fact — retrospective reconstruction is not evidence.
- **Stage the consolidation.** Stand up this source first; repoint the domain governance sections to defer here incrementally, so each change stays reviewable.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-31 | Draft | Initial draft published as APR-010, the canonical governance model. Domain-section repointing is a staged follow-up. |
