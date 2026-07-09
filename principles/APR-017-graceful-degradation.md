---
apr: 17
title: "A Graceful-Degradation and Failure-Handling Principle for Promptware"
abstract: "When a tool errors, an injection is missing, a delegate times out, or the model is unavailable, handling is set by what the failure blocks: safety-critical paths fail closed, other paths degrade only via a declared bounded fallback, and no failure or degradation is ever silent."
status: Draft
class: architectural
version: 0.2.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-08
last-updated: 2026-07-09
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
  - APR-015
  - APR-016
tags:
  - failure-handling
  - graceful-degradation
  - fail-closed
  - resilience
  - fallback
---

# APR-017 — A Graceful-Degradation and Failure-Handling Principle for Promptware

> **A failure's handling is set at design time by what it blocks — its irreversibility, blast radius, and detectability — never by runtime model judgment. Irreversible/consequential (and unclassified) paths fail closed: the harness denies new consequential actions, rolls back or compensates in-flight ones, presumes ambiguous outcomes committed, and constrains the action space so the model cannot re-plan around the halt. Other paths degrade only via a declared fallback that is never less constrained than the path it replaces, within a sticky run-level degradation budget that may never reach the guardrail or classification machinery. Retries are a distinct mode, permitted only for idempotent operations under declared limits. No failure is silent — it is logged, disclosed, and marked at the artifact boundary so degraded output is never consumed as full-fidelity.**

## Motivation

Failure is the *normal case* in promptware: models rate-limit or go unavailable, tools flake or return malformed output, injected references 404, delegates hang or fail to terminate, LLM output fails its seam schema. The corpus already mandates a halt in at least six specific places — [OBSERVE](APR-002-observe.md) on a failed required injection, [APR-003](APR-003-code-prompt-boundary.md) on a failed seam ("halt, don't guess"), [APR-006](APR-006-composition-topology.md) on a tripped termination bound, [APR-011](APR-011-observability.md) on a hard cost cap, [APR-005](APR-005-trust-boundaries.md) on a consequential action resting on untrusted content, [APR-015](APR-015-context-assembly.md) on a reduction that would evict a non-evictable segment. But each rule is *local* to its own APR; there is no general principle saying *when* a failure should halt versus degrade, or *how* a degrade should be disciplined.

Without one, adopters improvise — and improvised failure handling collapses to the two worst behaviors:

- **Silent best-effort.** The system proceeds on a guess that hides the failure: a missing injection is silently backfilled by the model's prior knowledge; a failed access-check "fails open" because the error path was never considered; a degraded summary flows downstream as if authoritative. This is how failures become *safety* incidents.
- **Brittle total halt.** A flaky, low-stakes tool takes down a reversible, non-critical path that could have degraded cleanly — so operators disable the guardrails that were "too noisy," and the pendulum swings back to silent best-effort.

And there is a structural complication the other two failure-domains lack: **the model is inside the loop, reading the failure and re-planning around it.** A fail-closed decision delivered to the model as a tool-error *string* is not experienced as a halt — it is a signal to try a different tool (denied `transfer_funds` → reach for `execute_script`). That is a model-invented, undeclared fallback: exactly what this principle forbids, re-entering through the back door. So fail-closed must be enforced in code — terminating or constraining the loop — not returned as text the model is free to reinterpret.

The discipline that resolves this is the same one [APR-009](APR-009-human-in-the-loop.md) uses for oversight placement: **let a declared property of the action — not the model's in-the-moment judgment — select the behavior.**

## The principle

**On any failure, the handling mode is selected — at design time, from a declared property of the path the failure blocks — among three modes; any degrade's mechanics are declared in advance; and both the failure and the degrade are always recorded and disclosed.**

- **Fail closed** on irreversible, consequential, or unclassified paths: deny new consequential actions, roll back or compensate in-flight ones, and **constrain the action space** — never proceed on a guessed or degraded substitute, and never return a mere error string the model can route around.
- **Degrade** on reversible/low-blast paths, only through a **declared fallback that is never less constrained than the path it replaces** (reduce capability, never guarantees) — never an improvised or model-invented substitute.
- **Retry** — a distinct third mode (the most common real behavior), permitted only for **idempotent** operations under declared limits; an ambiguous outcome is **presumed committed**, never blind-retried.
- **Never silently.** Every failure and fallback is logged, disclosed to the right audience, and **marked at the artifact boundary** so degraded output is never consumed as full-fidelity.

## The placement rule

The selector is the path's **irreversibility** and **blast radius**, with **detectability** as tiebreaker (an irreversible failure you cannot detect afterward is more severe than one you can). It MUST come from declared metadata (`safety_critical`, reversibility, blast radius — [APR-009](APR-009-human-in-the-loop.md)), **not** the agent's judgment at failure time.

| Path the failure blocks | Handling |
|---|---|
| **Irreversible / consequential** (allow-deny, access control, secrets, audit, or any action gated per APR-003 / APR-005 / APR-009) | **Fail closed** — deny new actions, roll back/compensate in-flight, presume ambiguous outcomes committed, constrain the action space, escalate; never substitute a guess or degraded value. |
| **Reversible / low-blast / advisory** | **Degrade** — a *declared* fallback no less constrained than the primary (canonical default, cached value, reduced-capability mode), marked and logged. |
| **Idempotent, transient** | **Retry** — under declared count/budget/time limits; ambiguous outcome ⇒ presume committed, do not blind-retry; on exhaustion fall through to fail-closed or the declared fallback. |
| **Unclassified / unrecognized** | **Fail closed** — an unknown blast radius is treated as high; classification is a design-time property in code, never a runtime model judgment. |

## Prescription

- A failure on an **irreversible, consequential, or unclassified** path MUST **fail closed** and MUST NOT proceed on a guessed value, a degraded substitute, or a silently-skipped check. (Generalizes APR-003 "halt, don't guess," OBSERVE strict-mode halt, APR-015 protected-tier halt.)
- Fail-closed MUST be **enforced in code**: the harness MUST **constrain the action space** (not merely refuse one call and return an error string), so the model cannot invent an undeclared fallback by reaching for a different tool. Returning a fail-closed decision as free text the model may reinterpret is non-conformant.
- The **handling mode MUST be selected by declared metadata** — irreversibility, blast radius, detectability (`safety_critical`, reversibility, blast radius — APR-009) — never by the agent's in-the-moment self-assessment (composes APR-003, APR-009). **Unclassified failures MUST fail closed** (unknown blast radius is treated as high).
- A failure on a **reversible** path MAY **degrade**, but only via a **declared fallback** that is **never less constrained than the path it replaces** — degradation reduces **capability, never guarantees**. A fallback that would weaken a safety property (e.g. the same operation minus its validator/policy-check) is a privilege escalation dressed as resilience; if the only available fallback would weaken a guarantee, the path **fails closed**. The fallback MUST NOT be model-improvised, and MUST NOT silently substitute a probabilistic value where a deterministic one failed (composes APR-003).
- **Retry is a distinct governed mode**, permitted only for **idempotent** operations under a declared count/budget/time bound; a non-idempotent operation MUST NOT be blind-retried, and an **ambiguous outcome** (e.g. a write that timed out with unknown commit state) MUST be **presumed committed** for safety. Exhausting the bound MUST fall through to fail-closed or the declared fallback — never spin (composes APR-006 termination, APR-011 budget).
- **Degradation is bounded per run, not only per failure.** Individually-bounded degradations compose into an out-of-spec aggregate; the platform MUST enforce a **run-level degradation budget**, and degradation state MUST be **sticky and monotone** across the run (it does not silently reset to full-fidelity on the next call). A run MUST define how it **recovers** from degraded state (a declared recovery gate), so a long-lived agent neither ratchets monotonically into uselessness nor quietly resumes nominal mode. Degradation MUST NOT reach the **failure-classification or guardrail machinery** itself (the floor).
- **No degradation is silent — and "not silent" has three audiences.** Every failure and fallback MUST be **audit-logged for the operator**, **disclosed to the user** where it affects the result, and **marked at the artifact boundary** so a downstream consumer (including the next agent) does not treat degraded output as full-fidelity. The archetypal silent failure is **confabulation** — retrieval returns nothing, the tool errors, and the model emits fluent, success-shaped prose over the hole: the failure was logged but the *output* was silent, so boundary-marking is mandatory. What is disclosed *to the model* is a separate manipulation surface and SHOULD be kept thin. A degraded/partial result propagated downstream MUST carry its degraded status taint-style (composes APR-005; parallels APR-016 recall-trust).
- When a failure interrupts a **multi-step irreversible action**, the system MUST NOT leave a partial irreversible effect silently: it MUST complete, roll back/compensate, or halt-and-escalate with the partial state recorded (composes APR-009's rollback plan).
- **Escalation is not a terminal state.** It is a blocking wait on a channel that can itself fail or go unanswered; every escalation MUST carry a **declared timeout**, and the timeout's **expiry MUST fail closed** — otherwise "escalate" quietly becomes "wait, then proceed."
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

- **Fail-closed enforced in code** — an error-injection test shows every irreversible/consequential path denies-and-constrains on dependency failure, never proceeds on a substitute, and does not merely return a routable error string (Tier 1 test harness; Tier 2 confirms the set is complete).
- **Unclassified fails closed** — a path with no declared classification fails closed, not degrades (Tier 1).
- **Fallbacks no weaker than primary** — every degrade path names a fallback from a canonical source that preserves the primary's safety properties; a would-be-weaker fallback fails closed instead (Tier 1 presence; Tier 2 judgment).
- **Retry gated** — retries apply only to idempotent operations under a declared bound; ambiguous outcomes are presumed committed, not blind-retried (Tier 1 config; Tier 2 idempotency judgment).
- **Run-level degradation budget** — degradation is sticky/monotone with a run budget and a declared recovery gate; degradation cannot reach the classification/guardrail machinery (Tier 1 budget; Tier 2 floor).
- **No silent degradation (three audiences)** — failures + fallbacks are logged (operator), disclosed (user), and marked at the artifact boundary (downstream); a confabulation-over-empty-retrieval case is in the evals (Tier 1 marking; Tier 2 disclosure).
- **Escalation bounded** — every escalation carries a timeout whose expiry fails closed (Tier 1).
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
| 0.2.0 | 2026-07-09 | Draft | Review-driven (feedback on the principle). Addressed the **model-in-the-loop**: fail-closed MUST be **enforced in code** and **constrain the action space**, not return a routable error string. Selector sharpened to **irreversibility + blast radius + detectability**; **unclassified fails closed** (fixed the residual-class inversion). Added **retry** as a distinct **idempotency-gated** mode, with **ambiguous-outcome ⇒ presume-committed**. Degradation made **run-level, sticky/monotone** with a declared **recovery gate** and a **floor** (never reach classification/guardrail machinery). Fallbacks MUST be **no weaker than the primary** (reduce capability, not guarantees). "Never silent" decomposed into **three audiences** + **confabulation** boundary-marking. **Escalation** given a timeout that **expires fail-closed**. Added `related:` APR-015/016. |
