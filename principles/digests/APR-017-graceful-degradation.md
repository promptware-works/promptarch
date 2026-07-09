# APR-017 — Graceful Degradation & Failure Handling — Digest

> **Generated digest of [APR-017 — A Graceful-Degradation and Failure-Handling Principle for Promptware](../APR-017-graceful-degradation.md) v0.2.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** A failure's handling is set at design time by what it blocks — irreversibility, blast radius, detectability — never by runtime model judgment: irreversible/consequential/unclassified paths fail closed (deny, roll back, presume ambiguous outcomes committed, and constrain the action space so the model can't re-plan around the halt); other paths degrade only via a declared fallback no weaker than the primary, within a sticky run-level budget that never reaches the guardrail machinery; retries are idempotency-gated; and no failure is silent — logged, disclosed, and marked at the artifact boundary.

**Principle.** Handling is selected at design time from a declared property of the path — among three modes (fail closed / degrade / retry) — any degrade's mechanics are declared in advance, and both the failure and the degrade are recorded and disclosed.

## The placement rule

Selector = **irreversibility + blast radius**, **detectability** as tiebreaker; from declared metadata (`safety_critical`, reversibility, blast radius — APR-009), never failure-time judgment.

| Path the failure blocks | Handling |
|---|---|
| **Irreversible / consequential** | **Fail closed** — deny new actions, roll back/compensate in-flight, presume ambiguous outcomes committed, constrain the action space, escalate. |
| **Reversible / low-blast / advisory** | **Degrade** — a declared fallback **no weaker than the primary**, marked and logged. |
| **Idempotent, transient** | **Retry** — declared limits; ambiguous outcome ⇒ presume committed; exhaustion falls through. |
| **Unclassified / unrecognized** | **Fail closed** — unknown blast radius treated as high. |

## Normative rules

- Irreversible/consequential/**unclassified** paths MUST **fail closed**; MUST NOT proceed on a guess, degraded substitute, or skipped check.
- Fail-closed MUST be **enforced in code and constrain the action space** — not a routable error string the model can re-plan around (denied `transfer_funds` → `execute_script`). Returning fail-closed as free text is non-conformant.
- The **mode MUST be selected by declared metadata** (irreversibility/blast radius/detectability), never agent self-assessment. **Unclassified fails closed.**
- A reversible path MAY **degrade**, but only via a **declared fallback no less constrained than the path it replaces** — reduce **capability, never guarantees**; a fallback that would weaken a safety property fails closed instead. Never model-improvised; never a probabilistic value silently replacing a failed deterministic one (APR-003).
- **Retry is a distinct mode**, only for **idempotent** operations under a declared count/budget/time bound; non-idempotent MUST NOT be blind-retried; **ambiguous outcome ⇒ presume committed**; exhaustion falls through to fail-closed/fallback (APR-006, APR-011).
- **Degradation is bounded per run, not only per failure**: a **run-level budget**, **sticky/monotone** state, a declared **recovery gate**, and a **floor** — degradation MUST NOT reach the classification/guardrail machinery.
- **No degradation is silent — three audiences**: logged (operator), disclosed (user), **marked at the artifact boundary** (downstream/next agent). The archetypal silent failure is **confabulation** (fluent prose over an empty retrieval / errored tool) — boundary-marking is mandatory. What's disclosed *to the model* is a manipulation surface, kept thin. Degraded results carry degraded-status taint (APR-005; parallels APR-016).
- A failure interrupting a **multi-step irreversible action** MUST NOT leave a silent partial effect: complete, roll back/compensate, or halt-and-escalate with partial state recorded (APR-009).
- **Escalation is not terminal** — every escalation carries a **declared timeout** whose **expiry fails closed** (else "escalate" becomes "wait, then proceed").
- On **model unavailability**, fall back to another model **only if within its validated set** (APR-008); safety-critical artifacts fail closed rather than run unvalidated.

## Metadata (no new DECLARE field)

The mode is **derived** from existing metadata — `observe.safety_critical`, reversibility/blast-radius (`core.classification.max_blast_radius`, APR-009), `trust_level` (APR-005). Declared **fallbacks** are policy content (OBSERVE `policies/`/`config/`), versioned by APR-008. *Deferred (as with APR-015/016): a `degradation_policy` reference under `core.operability`; if adopted, registered by APR-017 on acceptance, never by editing APR-014.*

## Governance checks

Fail-closed enforced in code (constrains action space, not a routable string) · unclassified fails closed · fallbacks no weaker than primary · retry gated to idempotent + ambiguous-presumed-committed · run-level sticky degradation budget + recovery gate + floor (never reaches guardrail machinery) · no silent degradation across three audiences (confabulation-over-empty-retrieval eval) · escalation timeout expires fail-closed · model-fallback within the validated set.

## Scope limits — do NOT misapply

Not an infrastructure resilience framework (governs the behavioral fail-closed-vs-degrade-vs-retry decision, not transports/supervisors/circuit-breaker libs) · not APR-009 (that places oversight on *successful* actions by reversibility; this handles *failed* dependencies — they compose) · not a replacement for the local halt rules (the general principle they instantiate; unifies, doesn't remove) · not a guarantee of availability or correctness · not chaos-testing methodology.

---
*Source: [APR-017 — A Graceful-Degradation and Failure-Handling Principle for Promptware](../APR-017-graceful-degradation.md) v0.2.0 · regenerate this digest whenever the source changes.*
