---
apr: 17
title: "A Graceful-Degradation and Failure-Handling Principle for Promptware"
abstract: "When a tool errors, an injection is missing, a delegate times out, or the model is unavailable, handling is set by what the failure blocks: safety-critical paths fail closed, other paths degrade only via a declared bounded fallback, and no failure or degradation is ever silent."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-08
last-updated: 2026-07-08
audience: Architects and framework authors of agentic AI platforms; harness/runtime and SRE engineers handling tool, delegate, injection, and model failures; anyone hardening promptware for production
supersedes: []
superseded-by: []
related:
  - APR-002
  - APR-003
  - APR-005
  - APR-006
  - APR-008
  - APR-009
  - APR-011
tags:
  - failure-handling
  - graceful-degradation
  - fail-closed
  - resilience
  - fallback
---

# APR-017 — A Graceful-Degradation and Failure-Handling Principle for Promptware

> **A failure's handling is set by what it blocks: safety-critical or consequential paths fail closed (halt, deny, escalate), other paths may degrade only via a declared, bounded fallback, and no failure or degradation is ever silent.**

## Motivation

Failure is the *normal case* in promptware: models rate-limit or go unavailable, tools flake or return malformed output, injected references 404, delegates hang or fail to terminate, LLM output fails its seam schema. The corpus already mandates a halt in at least six specific places — [OBSERVE](APR-002-observe.md) on a failed required injection, [APR-003](APR-003-code-prompt-boundary.md) on a failed seam ("halt, don't guess"), [APR-006](APR-006-composition-topology.md) on a tripped termination bound, [APR-011](APR-011-observability.md) on a hard cost cap, [APR-005](APR-005-trust-boundaries.md) on a consequential action resting on untrusted content, [APR-015](APR-015-context-assembly.md) on a reduction that would evict a non-evictable segment. But each rule is *local* to its own APR; there is no general principle saying *when* a failure should halt versus degrade, or *how* a degrade should be disciplined.

Without one, adopters improvise — and improvised failure handling collapses to the two worst behaviors:

- **Silent best-effort.** The system proceeds on a guess that hides the failure: a missing injection is silently backfilled by the model's prior knowledge; a failed access-check "fails open" because the error path was never considered; a degraded summary flows downstream as if authoritative. This is how failures become *safety* incidents.
- **Brittle total halt.** A flaky, low-stakes tool takes down a reversible, non-critical path that could have degraded cleanly — so operators disable the guardrails that were "too noisy," and the pendulum swings back to silent best-effort.

The discipline that resolves this is the same one [APR-009](APR-009-human-in-the-loop.md) uses for oversight placement: **let a declared property of the action — not the model's in-the-moment judgment — select the behavior.**

## The principle

**On any failure, the handling mode is selected by the safety-criticality of the path the failure blocks; the mechanics of any degrade are declared in advance; and both the failure and the degrade are always recorded.**

- **Fail closed** on safety-critical, consequential, or irreversible paths: halt, deny, or escalate — never proceed on a guessed or degraded substitute.
- **Degrade** on other paths, but only through a **declared, bounded fallback** — never an improvised or model-invented substitute.
- **Never silently.** Every failure and every fallback activation is audit-logged and marked, so a degraded result is always distinguishable from a normal one.

## The placement rule

| Path the failure blocks | Handling |
|---|---|
| **Safety-critical / consequential / irreversible** (allow-deny, access control, secrets, audit, or any action gated per APR-003 / APR-005 / APR-009) | **Fail closed** — halt or deny and escalate; record the partial state; never substitute a guess or a degraded value. |
| **Reversible / low-blast / advisory** | **Degrade** — activate a *declared* bounded fallback (canonical default, cached value, reduced-capability mode, bounded retry), mark the result degraded, log it. |

Safety-criticality selects the column; blast radius tunes the rigor of the fallback (how many retries, how loud the alert). The selection MUST come from declared metadata (`safety_critical`, reversibility, blast radius — [APR-009](APR-009-human-in-the-loop.md)), **not** from the agent's judgment at failure time.

## Prescription

- A failure on a **safety-critical, consequential, or irreversible** path MUST **fail closed** — halt or deny and escalate — and MUST NOT proceed on a guessed value, a degraded substitute, or a silently-skipped check. (Generalizes APR-003 "halt, don't guess," OBSERVE strict-mode halt, APR-015 non-evictable halt.)
- A failure on a **non-safety-critical** path MAY **degrade**, but only via a **declared fallback** — a default from canonical source ([OBSERVE](APR-002-observe.md) `config/`), a cached prior result, a reduced-capability mode, or a bounded retry. The fallback MUST NOT be improvised by the model, and MUST NOT silently substitute a probabilistic value where a deterministic one failed (composes APR-003).
- **No degradation is silent.** Every failure and every fallback activation MUST be **audit-logged** and **marked** in the output/trace (an explicit degraded marker, e.g. OBSERVE's `[INJECTION_FALLBACK]`); a degraded result MUST be distinguishable from a normal one downstream.
- The **failure-handling mode MUST be selected by declared metadata** (safety-criticality, reversibility, blast radius), never by the agent's in-the-moment self-assessment (composes APR-003, APR-009).
- **Recovery MUST be bounded.** Retries, re-delegation, and re-prompting MUST have a declared bound (count / budget / time); exhausting the bound MUST fall through to fail-closed or the declared fallback — never spin or retry unboundedly (composes APR-006 termination, APR-011 budget).
- A **degraded or partial result** propagated downstream MUST carry its degraded status (taint-style), so a consumer does not treat a fallback value as authoritative (composes APR-005; parallels APR-016 recall-trust).
- When a failure interrupts a **multi-step irreversible action**, the system MUST NOT leave a partial irreversible effect silently: it MUST complete, roll back, or halt-and-escalate with the partial state recorded (composes APR-009's rollback plan).
- On **model unavailability**, an artifact MAY fall back to another model **only if that model is within the artifact's validated set** ([APR-008](APR-008-artifact-lifecycle.md)); a safety-critical artifact MUST NOT silently run on an unvalidated model — it fails closed instead.

## Scope and applicability

### When this applies

- Any promptware path that can fail at runtime — a tool call, an injection, a delegation, a seam validation, a model call — which is essentially all agentic promptware in production.
- Any system that mixes safety-critical and non-critical paths (the mix is exactly what makes a single blanket policy — always-halt or always-continue — wrong).

### When this does NOT apply

- A **purely advisory, read-only** component with no consequential path and no downstream consumer of its output — a failure just returns nothing.
- The **infrastructure-level** resilience of the substrate (process supervision, network retries, load balancing) — that is generic platform/SRE engineering, out of scope per [APR-000](APR-000-promptware.md). This governs *behavioral* failure handling — what the agent does when a promptware dependency fails — not the transport.
- Choosing the **oversight mode** for a *successful* action — that is [APR-009](APR-009-human-in-the-loop.md); this governs the *failure* path.

## Governance and validation

*(Shared conformance model — two-tier CI/human, audit-binding, change-via-ADR — per [APR-010](APR-010-governance.md).)*

- **Fail-closed on safety-critical** — an error-injection test shows every safety-critical/consequential path halts-or-denies on dependency failure and never proceeds on a substitute (Tier 1 test harness; Tier 2 to confirm the safety-critical set is complete).
- **Declared fallbacks** — every degrade path names a fallback from a canonical source; no model-improvised substitution (Tier 1 presence; Tier 2 judgment).
- **No silent degradation** — failures + fallback activations are audit-logged and output-marked; degraded results are flagged downstream (Tier 1).
- **Mode from metadata** — handling mode derives from declared safety-criticality/reversibility, not agent self-assessment (Tier 2).
- **Bounded recovery** — retries/re-delegation carry a declared bound; exhaustion falls through, never spins (Tier 1 config; parallels APR-006).
- **Degraded taint propagated** — a fallback value carries degraded status to consumers (Tier 1/2).
- **Model-fallback validated** — a fallback model is within the artifact's validated set; safety-critical artifacts fail closed rather than run unvalidated (Tier 1 against APR-008 pins).

## What this principle is NOT

- **Not an infrastructure resilience framework.** It does not specify retry transports, supervisors, circuit-breaker libraries, or load balancing — it governs the *behavioral* decision (fail closed vs declared degrade), not the plumbing.
- **Not [APR-009](APR-009-human-in-the-loop.md).** APR-009 places oversight on *successful* actions by reversibility; this places handling on *failed* dependencies by safety-criticality. They share the "declared property selects behavior" shape and compose (a failure on an irreversible path escalates to APR-009's plan-and-approve).
- **Not a replacement for the local halt rules.** It is the *general principle* those six specific halts (APR-002/003/005/006/011/015) are instances of; it unifies and defaults them, it does not remove them.
- **Not a guarantee of availability or correctness.** It makes failure handling explicit, safe-by-default, and non-silent — it does not prevent the failure or guarantee a good degraded result.
- **Not fault injection / chaos testing methodology.** It says paths MUST be tested for correct failure handling, not which tool or test harness to use.

## Relationship to established patterns

| Pattern | What it shares | What this APR adds |
|---|---|---|
| Fail-safe vs fail-secure (safety engineering) | The fail-closed/fail-open distinction | Selection by *declared* safety-criticality, and the promptware-specific "proceed on a model guess" failure mode |
| Circuit breaker / bulkhead (Nygard, *Release It!*) | Bounded failure isolation, degraded modes | Content-trust awareness; degraded output is *marked and taint-carrying*, not just returned |
| Erlang/OTP supervision — "let it crash" | Bounded restart under a supervisor | Fail-*closed* for safety (not just restart); the fallback is declared, not merely "try again" |
| Graceful degradation / progressive enhancement (web, SRE) | Reduced capability keeps serving | A safety floor that forbids degrading a safety-critical path, and a no-silent-degrade rule |
| Typed error handling / `Result` types | Errors are explicit values, not hidden control flow | Degraded status propagates as trust taint to downstream consumers |

## Adoption notes

Safety-floor first:

1. **Enumerate the safety-critical paths** and prove each fails closed under dependency failure — this is the incident-preventing step and mirrors the existing local halts.
2. **Declare fallbacks for the degrade-able paths** from canonical sources; delete any model-improvised substitution.
3. **Mark and log every degrade** — make a degraded result visibly different from a normal one, in output and trace.
4. **Bound recovery** — put counts/budgets on retries and re-delegation; wire exhaustion to fail-closed-or-fallback.

Pitfalls: the classic "fails open" — an unconsidered error path that skips a check and proceeds; treating a bounded-retry as unbounded under load; letting a degraded value lose its marker one hop downstream and become authoritative; falling back to an unvalidated model on a safety-critical artifact. Measures: fail-closed coverage on safety-critical paths (target 100%, error-injection tested); silent-degradation count (target zero); unbounded-recovery incidents (target zero).

## Metadata registrations

This APR introduces **no new component-metadata field**, consistent with APR-015/APR-016: the failure-handling *mode* is **derived** from metadata that already exists — `observe.safety_critical`, and the reversibility / blast-radius / autonomy fields owned by [APR-009](APR-009-human-in-the-loop.md) (`core.classification.max_blast_radius`) and [APR-005](APR-005-trust-boundaries.md) (`trust_level`). Declared **fallbacks** are policy content ([OBSERVE](APR-002-observe.md) `policies/` / `config/`), versioned per [APR-008](APR-008-artifact-lifecycle.md) and referenced — not a DECLARE classification axis.

*(Open design question, deferred to review — matching APR-015/APR-016: whether a `degradation_policy` reference belongs under `core.operability`, or remains a referenced policy artifact. If ever adopted, APR-017 registers it here + in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml) on acceptance, never by editing [APR-014 DECLARE](APR-014-declare.md).)*

## References

1. Nygard, M. T. *Release It! Design and Deploy Production-Ready Software* (circuit breaker, bulkhead). Pragmatic Bookshelf, 2nd ed., 2018.
2. Armstrong, J. *Making Reliable Distributed Systems in the Presence of Software Errors* (Erlang/OTP supervision, "let it crash"). PhD thesis, KTH, 2003. <https://erlang.org/download/armstrong_thesis_2003.pdf>
3. Beyer, B., et al. *Site Reliability Engineering* — graceful degradation, handling overload. Google / O'Reilly, 2016. <https://sre.google/sre-book/handling-overload/>
4. Avizienis, A., Laprie, J.-C., Randell, B., Landwehr, C. *Basic Concepts and Taxonomy of Dependable and Secure Computing* (fail-safe/fail-secure taxonomy). IEEE TDSC, 2004. <https://ieeexplore.ieee.org/document/1335465>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-08 | Draft | Initial draft. Failure handling selected by declared safety-criticality: fail closed for safety-critical/consequential/irreversible paths, declared bounded fallback elsewhere, never silent. Unifies the six local halt rules (APR-002/003/005/006/011/015) as instances of one principle. |
