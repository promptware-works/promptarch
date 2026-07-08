# APR-017 — Graceful Degradation & Failure Handling — Digest

> **Generated digest of [APR-017 — A Graceful-Degradation and Failure-Handling Principle for Promptware](../APR-017-graceful-degradation.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** When a tool errors, an injection is missing, a delegate times out, or the model is unavailable, handling is set by what the failure blocks: safety-critical paths fail closed, other paths degrade only via a declared bounded fallback, and no failure or degradation is ever silent.

**Principle.** A failure's handling is set by what it blocks: safety-critical or consequential paths fail closed (halt, deny, escalate); other paths may degrade only via a declared, bounded fallback; and no failure or degradation is ever silent.

## The placement rule

| Path the failure blocks | Handling |
|---|---|
| **Safety-critical / consequential / irreversible** (allow-deny, access, secrets, audit, or gated per APR-003/005/009) | **Fail closed** — halt/deny + escalate; record partial state; never substitute a guess or degraded value. |
| **Reversible / low-blast / advisory** | **Degrade** — activate a *declared* bounded fallback (canonical default, cache, reduced mode, bounded retry), mark the result degraded, log it. |

Safety-criticality selects the column; blast radius tunes fallback rigor. Selection MUST come from declared metadata (`safety_critical`, reversibility, blast radius — APR-009), never the agent's failure-time judgment.

## Normative rules

- A failure on a **safety-critical / consequential / irreversible** path MUST **fail closed** (halt/deny + escalate); MUST NOT proceed on a guess, a degraded substitute, or a silently-skipped check. (Generalizes APR-003 halt-don't-guess, OBSERVE strict-mode halt, APR-015 non-evictable halt.)
- A **non-safety-critical** path MAY **degrade**, but only via a **declared fallback** (canonical default, cached result, reduced-capability mode, bounded retry) — never model-improvised, never a probabilistic value silently replacing a failed deterministic one (APR-003).
- **No degradation is silent** — every failure and fallback activation MUST be **audit-logged and marked** (e.g. OBSERVE `[INJECTION_FALLBACK]`); a degraded result MUST be distinguishable downstream.
- The **handling mode MUST be selected by declared metadata** (safety-criticality/reversibility/blast radius), never by agent self-assessment (APR-003, APR-009).
- **Recovery MUST be bounded** — retries/re-delegation/re-prompting have a declared count/budget/time bound; exhaustion MUST fall through to fail-closed or the declared fallback, never spin (APR-006, APR-011).
- A **degraded/partial result** propagated downstream MUST carry its degraded status (taint-style), so consumers don't treat a fallback as authoritative (APR-005; parallels APR-016 recall-trust).
- A failure interrupting a **multi-step irreversible action** MUST NOT leave a silent partial effect: complete, roll back, or halt-and-escalate with partial state recorded (APR-009 rollback).
- On **model unavailability**, an artifact MAY fall back to another model **only if within its validated set** (APR-008); a safety-critical artifact MUST NOT silently run on an unvalidated model — it fails closed.

## Metadata (no new DECLARE field in v0.1.0)

The handling *mode* is **derived** from existing metadata — `observe.safety_critical`, plus reversibility/blast-radius (`core.classification.max_blast_radius`, APR-009) and `trust_level` (APR-005). Declared **fallbacks** are policy content (OBSERVE `policies/`/`config/`), versioned by APR-008, referenced. *Open (deferred, as with APR-015/016): whether a `degradation_policy` reference belongs under `core.operability`; if adopted, registered by APR-017 on acceptance, never by editing APR-014.*

## Governance checks

Fail-closed on safety-critical (error-injection tested; no substitute-on-failure) · declared fallbacks (no model-improvised substitution) · no silent degradation (failures + fallbacks logged and output-marked) · mode from metadata, not self-assessment · bounded recovery (exhaustion falls through, never spins) · degraded taint propagated to consumers · model-fallback within the validated set (safety-critical fails closed rather than run unvalidated).

## Scope limits — do NOT misapply

Not an infrastructure resilience framework (governs the behavioral fail-closed-vs-degrade decision, not transports/supervisors/circuit-breaker libs) · not APR-009 (that places oversight on *successful* actions by reversibility; this handles *failed* dependencies by safety-criticality — they compose) · not a replacement for the local halt rules (it is the general principle they instantiate; unifies, doesn't remove) · not a guarantee of availability or correctness · not chaos-testing methodology.

---
*Source: [APR-017 — A Graceful-Degradation and Failure-Handling Principle for Promptware](../APR-017-graceful-degradation.md) v0.1.0 · regenerate this digest whenever the source changes.*
