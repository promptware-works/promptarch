# APR-015 — Context Assembly & Window Discipline — Digest

> **Generated digest of [APR-015 — A Context-Assembly and Window-Discipline Principle for Promptware](../APR-015-context-assembly.md) v0.2.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** The context window is assembled, not accreted: every model call re-derives it from trust-labeled, canonically-sourced segments under a declared precedence order and per-class token budget, and reduces it on overflow by a declared per-class order of sacrifice — recorded as a composition manifest, and never at the cost of the protected tier, which fails closed instead.

**Principle.** The context window is a composed artifact: every model call re-derives it from trust-labeled, canonically-sourced segments under a declared precedence order and per-class token budget. On overflow, reduction follows a declared per-class order of sacrifice, logged as a manifest; guardrail/policy content is verbatim and never evicted or lossily transformed, task-critical grounding is present-or-fail-closed, and if the protected tier alone cannot fit the run fails closed.

## The three declared decisions

- **Order** — declared precedence; assembly deterministic given inputs; instruction-channel (trusted operator) content outranks data-channel (untrusted) content in position and authority.
- **Budget** — each segment class has a declared token budget; sum bounded by the target model's window; the protected tier holds reserved budget.
- **Reduction** — on overflow, a declared policy sets the *order of sacrifice*; never an opaque default; never violates a protected-tier rule.

**Unit = the model call, not the user turn.** The window MUST be re-derived and its budget + protected-tier invariants re-validated **every model call** (overflow and trust drift accumulate per iteration).

A *segment* is a contiguous, single-provenance region: system/instruction, one OBSERVE reference, applied-patterns, a delimited untrusted-input block, a history turn (or summary), a tool-result block, a recalled-memory block, or a **self-authored block** (the model's own prior output re-entering). Trust label (APR-005) + source/version (APR-002/APR-008) travel with it; self-authored segments carry the **trust floor of their inputs** (APR-005), never operator trust.

## The protected tier — two classes, two rules

- **Tier-0 — guardrails/policy/consequential-gating** — reserved and **carried verbatim**; never evicted, truncated, or lossily summarized. If Tier-0 alone can't fit → **fail closed**.
- **Tier-1 — task-critical grounding facts** — **present-or-fail-closed** for the task; MAY be re-fetched/re-ranked, but a needed fact that can't be present fails the task closed (the confabulation failure — APR-017), never proceeds over the gap.

## Normative rules

- Assembly MUST be **deterministic given its inputs**; nondeterminism comes only from inputs, never the assembler.
- The window MUST be **re-derived every model call**; budget + protected-tier invariants re-validated each call.
- Every segment MUST carry its **trust label** (APR-005) and **canonical source + version** (APR-002/APR-008); assembly MUST NOT strip provenance. **Self-authored** segments MUST carry their inputs' trust floor.
- Segments MUST be assembled in a **declared precedence order**; instruction-channel content MUST outrank data-channel content in position and authority; untrusted content MUST occupy a **delimited data region**, not the instruction channel. The boundary MUST be **unforgeable from within content** (structural/sentinel, not fixed in-band markers — APR-005).
- Declared precedence governs **conflict resolution**; it MUST be reinforced by **placement and explicit authority signaling**, not ordering alone (the model has its own positional/recency bias).
- Each class MUST have a **declared token budget**; total ≤ the **pinned model's** window (APR-008 `validated_against`).
- The **protected tier** MUST hold reserved budget: **Tier-0 verbatim** (never evicted/summarized), **Tier-1 present-or-fail-closed**. No budget-pressure lever crosses either rule.
- On overflow, reduction MUST follow a **declared policy** with an order of sacrifice (not a middleware default); a protected-tier violation — or protected-tier-alone-overflow — MUST **fail closed with an audit-logged error** (APR-003 halt-don't-guess, APR-017).
- **Summarization/compaction is a probabilistic transform** (APR-003) → MUST be eval-gated; over trust-mixed content its output MUST inherit the **lowest trust + highest sensitivity** of its inputs (APR-005). Closed-rule truncation is code, unit-tested.
- The **realized composition** MUST be logged as a **full manifest** — ordered segment IDs with class, trust label, source/version, token count, and which reduction fired — sufficient to reconstruct the window (a bare `reduced: true` does NOT satisfy this).
- Ordering SHOULD place **stable/shared before volatile/per-request** for cache reuse — subordinate to the precedence and protected-tier MUSTs.
- The **assembly policy is a versioned artifact** (APR-008); a change to precedence/budgets/reduction is a behavioral change requiring a version bump + re-validation.

## Metadata (no new DECLARE field)

Novel obligations fall on the **assembler** (a harness obligation, like OBSERVE's loader). Assembly policy is a **platform baseline artifact** (OBSERVE `policies/`-class, APR-008), not a per-component field; per-class **budgets MUST NOT be a component field** (model-dependent, volatile). The protected tier reuses `observe.safety_critical` + `core.classification.trust_level`. A per-component `context_assembly_policy` override under `core.operability` is **reserved, not shipped**.

## Governance checks

Deterministic per-call assembly (golden test; re-derived each call) · provenance intact (label + source/version; self-authored at input floor) · precedence enforced + unforgeable boundary (delimiter-forgery in red-team evals) · budgets bound the window · protected tier (no rule evicts Tier-0 or drops a needed Tier-1 fact; violation/overflow fails closed) · reduction declared with order of sacrifice + summarization eval-gated + taint composed · window logged as a full manifest (not a bare flag) · cache ordering present where cost matters (SHOULD).

## Scope limits — do NOT misapply

Not a runtime / context-management library (states the discipline, not the implementation) · not OBSERVE (that governs *which sources*; this governs the *whole window* and its order/budget/reduction) · not APR-005 (composes it by making position/precedence first-class) · not APR-011 (cache ordering is one SHOULD; the manifest rides APR-011's substrate) · not a memory principle (recalled memory is one segment class — APR-016) · not a prompt-engineering guide (mandates *declared* order/budget/reduction, not an optimal ordering) · not a guarantee against context degradation.

---
*Source: [APR-015 — A Context-Assembly and Window-Discipline Principle for Promptware](../APR-015-context-assembly.md) v0.2.0 · regenerate this digest whenever the source changes.*
