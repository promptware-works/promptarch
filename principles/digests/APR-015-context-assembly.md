# APR-015 — Context Assembly & Window Discipline — Digest

> **Generated digest of [APR-015 — A Context-Assembly and Window-Discipline Principle for Promptware](../APR-015-context-assembly.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** The context window is assembled, not accreted: every run composes its window from trust-labeled, canonically-sourced segments under a declared precedence order and per-class token budget, and reduces it on overflow by a declared, audit-logged policy that never evicts safety-critical content.

**Principle.** The context window is a composed artifact: every run assembles it from trust-labeled, canonically-sourced segments under a declared precedence order and per-class token budget, and — when inputs exceed budget — reduces it by a declared, audit-logged policy that never silently evicts safety-critical content.

## The three declared decisions

- **Order** — segments assembled in a declared precedence; assembly deterministic given inputs; instruction-channel (trusted operator) content outranks data-channel (untrusted) content in position and authority.
- **Budget** — each segment class has a declared token budget; the sum is bounded by the target model's window; safety-critical segments hold reserved, non-evictable budget.
- **Reduction** — on overflow, a declared policy decides what is summarized/truncated/dropped and in what order; never an opaque default; never touches a non-evictable segment.

A *segment* is a contiguous, single-provenance region: system/instruction block, one OBSERVE reference, the applied-patterns block, a delimited untrusted-input block, a history turn (or summary), a tool-result block, a recalled-memory block. Trust label (APR-005) + source/version (APR-002/APR-008) travel with it.

## Normative rules

- Window assembly MUST be **deterministic given its inputs** (same inputs + same policy ⇒ same window); nondeterminism comes only from the inputs, never the assembler.
- Every segment MUST carry its **trust label** (APR-005) and **canonical source + version** (APR-002/APR-008) into the window; assembly MUST NOT strip provenance.
- Segments MUST be assembled in a **declared precedence order**; instruction-channel content MUST outrank data-channel content in position and authority; untrusted content MUST occupy a **delimited data region** and MUST NOT be interleaved into the instruction channel.
- Each segment class MUST have a **declared token budget**; the total MUST be bounded by the **target model's** window (pin via APR-008 `validated_against`).
- **Safety-critical segments** (guardrails, safety-critical instructions, active policy, segments gating consequential actions) MUST hold reserved budget and MUST NOT be evicted, truncated, or summarized away by any reduction policy — the hard floor (mirrors APR-009's no-fatigue-lever and APR-011's audit floor).
- On overflow, reduction MUST follow a **declared policy** (not a middleware default); if it would evict a non-evictable segment, the run MUST **halt with an audit-logged error** (APR-003 halt-don't-guess).
- **Summarization/compaction is a probabilistic transform** (APR-003) → MUST be eval-gated; over trust-mixed content its output MUST inherit the **lowest trust + highest sensitivity** of its inputs (taint composition, APR-005). Truncation by a closed rule is code, unit-tested.
- The **realized window's composition** MUST be audit-logged at assembly (ordered segments + source/version + per-segment token counts + reduction actions) — sufficient to reconstruct the window (APR-010/APR-011 substrate).
- Ordering SHOULD place **stable/shared segments before volatile/per-request** ones for cache-prefix reuse — a cost SHOULD, subordinate to the precedence and safety MUSTs.
- The **assembly policy is a versioned artifact** (APR-008); a change to precedence/budgets/reduction is a behavioral change requiring a version bump and re-validation.

## Metadata (no new DECLARE field in v0.1.0)

Novel obligations fall on the **assembler** (a harness obligation, like OBSERVE's loader), not the component. Assembly policy is a **platform baseline artifact** (OBSERVE `policies/`-class, APR-008 lifecycle), not a per-component field. Per-class **budgets MUST NOT be a component field** (model-dependent, volatile → platform policy). The **safety floor reuses** `observe.safety_critical` + `core.classification.trust_level`. A per-component `context_assembly_policy` override under `core.operability` is **reserved, not shipped**. Test: declare in frontmatter only if it (a) belongs to the component, (b) varies independently per component, (c) the runtime dispatches on it.

## Governance checks

Deterministic assembly (golden test: inputs+policy ⇒ identical window) · provenance intact (label + resolvable source/version per segment) · precedence enforced (no untrusted segment in/above the instruction channel) · budgets bound the window (total ≤ pinned model limit) · safety floor (no reduction path evicts a reserved segment; attempt halts-and-logs) · reduction declared + summarization eval-gated + taint composed · window reconstructable from the assembly log · cache ordering present where cost matters (SHOULD).

## Scope limits — do NOT misapply

Not a runtime / context-management library (states the discipline the assembler MUST satisfy, not the implementation) · not OBSERVE (that governs *which sources*; this governs the *whole window* — history, tool output, untrusted input, memory — and its order/budget/reduction) · not APR-005 (composes it by making position/precedence first-class) · not APR-011 (cache ordering is one SHOULD; the log rides APR-011's substrate) · not a memory principle (recalled memory is one segment class) · not a prompt-engineering guide (mandates *declared* order/budget/reduction, not an optimal ordering) · not a guarantee against context degradation (makes assembly explicit, bounded, reproducible, auditable).

---
*Source: [APR-015 — A Context-Assembly and Window-Discipline Principle for Promptware](../APR-015-context-assembly.md) v0.1.0 · regenerate this digest whenever the source changes.*
