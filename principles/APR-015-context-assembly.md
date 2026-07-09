---
apr: 15
title: "A Context-Assembly and Window-Discipline Principle for Promptware"
abstract: "The context window is assembled, not accreted: every run composes its window from trust-labeled, canonically-sourced segments under a declared precedence order and per-class token budget, and reduces it on overflow by a declared, audit-logged policy that never evicts safety-critical content."
status: Draft
version: 0.2.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-08
last-updated: 2026-07-09
audience: Architects and framework authors of agentic AI platforms; harness/runtime engineers who assemble the context window; anyone debugging non-reproducible runs or governing token spend
supersedes: []
superseded-by: []
related:
  - APR-002
  - APR-003
  - APR-005
  - APR-008
  - APR-009
  - APR-011
tags:
  - context-window
  - context-engineering
  - prompt-assembly
  - trust
  - cost
---

# APR-015 — A Context-Assembly and Window-Discipline Principle for Promptware

> **The context window is a composed artifact: every model call re-derives it from trust-labeled, canonically-sourced segments under a declared precedence order and per-class token budget. When inputs exceed budget, reduction follows a declared per-class order of sacrifice, recorded as a composition manifest. Guardrail/policy content is carried verbatim and never evicted or lossily transformed; task-critical grounding is present-or-fail-closed; if the protected tier alone cannot fit, the run fails closed.**

## Motivation

Every other principle in this corpus disciplines *a source* of content: [ASPECT](APR-001-aspect.md) the component body, [OBSERVE](APR-002-observe.md) the injected references, [APR-004](APR-004-canonical-source.md) the materialized files, [APR-007](APR-007-pattern-mechanism.md) the applied patterns, [APR-005](APR-005-trust-boundaries.md) the untrusted inputs. At execution time all of them — plus conversation history, tool and sub-agent output, and recalled memory — converge into **one finite context window**. That convergence is where promptware's behavior is actually determined, and it is the one place the corpus does not yet govern.

Left unmanaged, the window is where silent, un-auditable behavior change happens:

- **Silent truncation.** History or references are dropped by an opaque middleware default when the window fills. Behavior changes invisibly; a safety-critical instruction or guardrail can be the thing evicted, and nothing records that it was.
- **Precedence collisions.** Untrusted tool output lands adjacent to — or ahead of — operator instructions. This is the positional face of prompt injection: APR-005 labels the content untrusted, but *where it sits in the window and what it outranks* is an assembly decision APR-005 does not make.
- **Non-reproducibility.** Two runs with identical inputs produce different windows because assembly order and reduction are unspecified. A run that cannot be reconstructed cannot be audited (APR-010) or debugged (APR-011).
- **Cache thrash.** Volatile, per-request content is placed before stable, shared content, invalidating the model's prompt-cache prefix on every call and inflating cost (APR-011).
- **Buried instructions.** Critical content is placed where the model attends to it least ("lost in the middle") with no discipline governing placement.

These are not tuning bugs; they are the absence of a principle. The window needs to be *assembled by declared rule*, not accreted by whatever order the harness happened to append things.

## The principle

**Treat the context window as a composed artifact with three declared decisions — order, budget, and reduction — re-derived every model call from labeled inputs and logged so the window is reconstructable.**

1. **Order.** Segments are assembled in a **declared precedence**. Assembly is deterministic given its inputs: the same inputs under the same policy MUST produce the same window. Instruction-channel (trusted, operator-authored) content outranks data-channel (untrusted) content in both position and authority.
2. **Budget.** Each **segment class** has a declared token budget; their sum is bounded by the target model's window. The **protected tier** (below) holds **reserved** budget.
3. **Reduction.** When inputs exceed budget, a **declared overflow policy** decides what is summarized, truncated, or dropped, and in what order (the *order of sacrifice*) — never an opaque default, and never touching the protected tier in a way its rule forbids.

**The unit of composition is the model call, not the user turn.** Overflow and trust drift accumulate iteration by iteration in an agent loop, so the window MUST be re-derived — and its budget and invariants re-validated — on **every model call**, not once per turn.

A *segment* is a contiguous, single-provenance region of the window: a system/instruction block, one injected OBSERVE reference, the applied-patterns block, a delimited untrusted-input block, a history turn (or a summary of turns), a tool-result block, a recalled-memory block, or a **self-authored block** (the model's own prior plans/scratchpad re-entering context). Trust label (APR-005) and canonical source + version (OBSERVE / APR-008) travel *with* the segment into the window. Self-authored segments are **not trusted by origin**: per [APR-005](APR-005-trust-boundaries.md) they carry the trust floor of their inputs, so a plan that summarized a tool result is untrusted.

## The protected tier — two classes, two rules

Collapsing everything a run must not lose into one "safety-critical" class is where the protected tier leaks. There are two classes, with different eviction rules:

- **Tier-0 — guardrails & policy instructions** (behavioral constraints; active policy; any segment gating a consequential action per APR-005). Few, stable, small. MUST be **reserved and carried verbatim** — never evicted, truncated, **or lossily summarized** by any reduction policy. If Tier-0 alone cannot fit, the run **fails closed** (it does not evict to make room).
- **Tier-1 — task-critical grounding facts** (the specific data the task depends on: an account number, a retrieved clause, the user's stated constraint). Many, volatile, task-specific. MUST be **present-or-fail-closed for the task**: they need not all be held verbatim (they MAY be re-fetched or re-ranked), but if a needed grounding fact cannot be present, the task **fails closed** rather than proceeding over the hole (the confabulation failure — see [APR-017](APR-017-graceful-degradation.md)).

## Scope and applicability

### When this applies

- Any promptware run whose window is assembled from **more than one source** — i.e., essentially all agentic promptware (instructions + injected content + history + tool output).
- Any system where the window can **overflow** the model's limit and something must be dropped or compacted.
- Any system that must **reproduce, audit, or debug** a run from its record (composes with APR-010 / APR-011).

### When this does NOT apply

- A **single-shot, single-source** prompt that always fits the window with no injection, no history, no tool output — there is nothing to order, budget, or reduce.
- Choosing *which references a component declares* — that is [OBSERVE](APR-002-observe.md). This principle governs the window those declarations (and everything else) land in.
- The **retrieval mechanism** (RAG index, vector store) — out of scope per [APR-000](APR-000-promptware.md); this governs how *already-selected* content is labeled, ordered, budgeted, and reduced, not how it is fetched.

## Prescription

- Window assembly MUST be **deterministic given its inputs**: identical inputs under an identical assembly policy MUST yield an identical window. Any nondeterminism MUST come from the inputs, never from the assembler.
- The window MUST be **re-derived on every model call**, not once per user turn; budget and the protected-tier invariants MUST be **re-validated each call** (overflow and trust drift accumulate per iteration in an agent loop).
- Every segment MUST carry its **trust label** ([APR-005](APR-005-trust-boundaries.md)) and its **canonical source + version** ([APR-002](APR-002-observe.md) / [APR-008](APR-008-artifact-lifecycle.md)) into the window; assembly MUST NOT strip provenance. A **self-authored segment** (the model's own prior output re-entering context) MUST carry the trust floor of its inputs per APR-005 — never operator trust by virtue of being model-produced.
- Segments MUST be assembled in a **declared precedence order**. Instruction-channel (trusted operator) content MUST outrank data-channel (untrusted) content in both position and authority; untrusted content MUST occupy a **delimited data region** and MUST NOT be interleaved into the instruction channel (composes with APR-005's "untrusted is data, never instructions"). The delimiting/labeling boundary MUST be **unforgeable from within segment content** per [APR-005](APR-005-trust-boundaries.md) — structural (message-role) separation or per-run sentinels, not fixed in-band string markers a segment could reproduce.
- Declared precedence governs **conflict resolution**; it is not the only force on the model, whose attention has its own positional/recency bias. Precedence therefore MUST be reinforced by **placement and explicit in-band authority signaling**, not by ordering alone.
- Each segment class MUST have a **declared token budget**; the total budgeted size MUST be bounded by the **target model's** context window (a model-dependent value — pin the model per [APR-008](APR-008-artifact-lifecycle.md) `validated_against`).
- The **protected tier** MUST hold **reserved budget** and MUST be handled per its two classes: **Tier-0** (guardrails/policy/consequential-gating) MUST be carried **verbatim** — never evicted, truncated, or lossily summarized; **Tier-1** (task-critical grounding) MUST be **present-or-fail-closed** for the task (it MAY be re-fetched/re-ranked, but a needed grounding fact that cannot be present MUST fail the task closed, not proceed over the gap). No budget-pressure lever may cross either rule (mirrors [APR-009](APR-009-human-in-the-loop.md)'s "no fatigue lever skips a safety gate").
- On overflow, reduction MUST follow a **declared policy** stating which classes are summarized, truncated, or dropped and in what order (the *order of sacrifice*); it MUST NOT be an opaque middleware default. If reduction would violate a protected-tier rule — evict/summarize Tier-0, or drop a needed Tier-1 fact — the run/task MUST **fail closed with an audit-logged error** (composes with APR-003's "halt, don't guess" and [APR-017](APR-017-graceful-degradation.md)). When the protected tier *alone* exceeds the window, assembly MUST fail closed rather than evict to fit.
- **Summarization / compaction of window content is a probabilistic transform** ([APR-003](APR-003-code-prompt-boundary.md)) → it MUST be eval-gated (`evaluated_by` + `min_eval_score`). Because it operates over **trust-mixed** content, its output MUST inherit the **lowest trust** and **highest sensitivity** of its inputs (taint composition, APR-005) — a summary of untrusted content is untrusted. Truncation or windowing by a closed rule (keep last N turns, drop oldest) is deterministic → code, unit-tested.
- The **realized window's composition** MUST be audit-logged at the moment of assembly as a **full composition manifest** — the ordered list of segment IDs with each segment's class, trust label, source + version, and token count, plus which reduction fired on each class — sufficient to **reconstruct the window** from the record. A bare `reduced: true` flag does NOT satisfy this; the manifest is what makes a run reconstructable after an incident. This is one more consumption event on the shared audit/observability substrate ([APR-010](APR-010-governance.md) / [APR-011](APR-011-observability.md)).
- Ordering SHOULD place **stable/shared segments before volatile/per-request segments** to preserve the model's prompt-cache prefix (this absorbs the previously-parked prompt-caching kernel). This is a cost SHOULD, **subordinate** to the precedence and safety MUSTs above — cache stability never reorders instruction-above-data or evicts a reserved segment.
- The **assembly policy itself is a versioned artifact** ([APR-008](APR-008-artifact-lifecycle.md)): a change to precedence, budgets, or reduction is a behavioral change requiring a version bump and re-validation, not a silent config edit.

## Governance and validation

*(Shared conformance model — two-tier CI/human, audit-binding, change-via-ADR — per [APR-010](APR-010-governance.md).)*

- **Deterministic, per-call assembly** — a golden test asserts identical inputs + policy ⇒ byte-identical window; the window is re-derived and invariants re-validated each model call, not once per turn (Tier 1).
- **Provenance intact** — every segment in the manifest carries a trust label and a resolvable source + version; self-authored segments are labeled at their input floor (Tier 1).
- **Precedence enforced + unforgeable** — the declared order exists; no untrusted segment sits in or above the instruction channel; the boundary is structural/sentinel, and a delimiter-forgery attempt is in the red-team evals (Tier 1 structural; Tier 2 judges the order is *sensible*).
- **Budgets bound the window** — per-class budgets declared; total ≤ the pinned model's limit (Tier 1).
- **Protected tier** — no reduction path can evict/summarize a Tier-0 segment or drop a needed Tier-1 fact; a violation, or protected-tier-alone-overflow, fails closed and logs (Tier 1: assert no rule targets Tier-0; Tier 2: confirm the Tier-0/Tier-1 sets are complete).
- **Reduction declared, summarization eval-gated** — an overflow policy exists (not a default) with a declared order of sacrifice; every summarization step has `evaluated_by` + `min_eval_score` and composes taint (Tier 1 presence; Tier 2 policy judgment).
- **Window reconstructable** — assembly is logged as a full composition manifest, not a bare `reduced` flag (Tier 1).
- **Cache ordering** — where cost matters, stable-before-volatile ordering is present (Tier 2 / SHOULD).

## What this principle is NOT

- **Not a runtime or a context-management library.** It states the discipline the assembler MUST satisfy, not how to implement paging, a token counter, or a summarizer.
- **Not [OBSERVE](APR-002-observe.md).** OBSERVE governs *which sources exist* and the selective injection of *declared references*. This governs the *whole window* — including history, tool output, untrusted input, and memory, which OBSERVE does not touch — and its order, budget, and reduction.
- **Not [APR-005](APR-005-trust-boundaries.md).** APR-005 owns trust *labeling and enforcement*; this composes it by making segment *position and precedence* a first-class assembly decision. Labeling without ordering leaves injection's positional face open.
- **Not [APR-011](APR-011-observability.md).** APR-011 owns cost measurement and budgets; here cache-stable ordering is one SHOULD. The window-composition log is emitted on APR-011's substrate but is an assembly concern.
- **Not a memory principle.** Recalled memory is one segment class this orders and budgets; *how memory is structured, scoped, trusted, and persisted* is [APR-016](APR-016-memory.md).
- **Not a prompt-engineering guide.** It mandates *declared* order + budget + reduction, not a specific optimal ordering; "put the important thing where the model attends" is adopter tuning, not a normative rule here.
- **Not a guarantee against context degradation.** It makes assembly explicit, bounded, reproducible, and auditable — not optimal.

## Relationship to established patterns

| Pattern | What it shares | What this APR adds |
|---|---|---|
| OS virtual memory / working set (Denning) | Eviction under a bounded resource by a declared policy | Trust- and safety-aware segments; reserved, non-evictable regions; provenance carried with each "page" |
| Compiler register allocation / spilling | Allocating a scarce resource under a priority order with a spill policy | Priorities are *content-semantic* (safety-critical, trust) and the "spill" (summarization) is itself a governed, eval-gated transform |
| HTTP / gRPC framing; header vs body | Separating a control channel from a data channel | A probabilistic interpreter that *cannot reliably* keep them separate → position/precedence made normative, taint composed on merge |
| Prompt / prefix caching (Anthropic, OpenAI) | Order stable content first for cache reuse | Demotes it to a SHOULD subordinate to precedence and the safety floor |
| Context engineering; "Lost in the Middle" (Liu et al.) | Placement and window budget affect behavior | Turns empirical tactics into declared, audit-bound, reproducible discipline |
| Dual-LLM / CaMeL, quarantine (APR-005 kin) | Isolating untrusted content | Makes the isolation a *positional/budgeted* property of the assembled window, not only a labeling one |

## Adoption notes

A phased path, observability-first:

1. **Log what you already assemble.** Emit the window-composition record (ordered segments, sources, token counts) before changing behavior. This alone makes runs reconstructable and surfaces silent truncation.
2. **Declare order and budgets.** Write down the precedence and per-class token budgets you are *implicitly* using; assert the total against the pinned model's limit.
3. **Reserve the safety floor.** Mark safety-critical segment classes non-evictable; add the CI check that no reduction rule can target them.
4. **Formalize reduction.** Replace the middleware default with a declared overflow policy; eval-gate any summarization step and compose taint on its output.

Common pitfalls: treating summarization as free and trusted (it is a probabilistic, taint-carrying transform); letting cache-ordering silently reorder instruction-above-data; counting tokens against the wrong model after a migration (APR-008). Suggested measures: window-reconstruction rate from logs (target 100%), prompt-cache hit rate, and reserved-segment eviction count (target zero).

## Metadata registrations

This APR introduces **no new component-metadata field** in v0.1.0. The novel obligations fall on the **assembler** (a harness/runtime obligation, like OBSERVE's loader), not on the component. The decision, and the reasoning that fixes it, follow the "baseline + sparse override" model [APR-008](APR-008-artifact-lifecycle.md) already established for the model dependency:

- **The assembly policy is a platform baseline artifact, not a per-component field.** One versioned policy (an OBSERVE `policies/`-class artifact under APR-008 lifecycle) governs the harness by default; a component declares nothing. This covers essentially all cases, because a harness normally assembles windows one way.
- **Per-segment-class *token budgets* MUST NOT be a component field.** Budgets are model-dependent and volatile — they change on every model migration and every body edit. Declaring them per component would fuse volatile platform tuning into the durable component contract (the conflation DECLARE's orthogonality rule and OBSERVE's change-lifecycle homing both forbid). Budgets live in the platform policy artifact, tuned centrally and re-validated on migration ([APR-008](APR-008-artifact-lifecycle.md)). A component never needs to know the window's absolute size.
- **The non-evictable safety floor needs no new axis.** "Which of my segments are non-evictable" is already fully expressed by `observe.safety_critical` and `core.classification.trust_level` ([APR-005](APR-005-trust-boundaries.md)); this principle *reads* them, it does not add a classification.
- **A per-component policy override is reserved, not shipped.** Only where a component genuinely needs a *different* assembly policy would a single optional reference field — `context_assembly_policy` under `core.operability` — be justified, exactly as an artifact pins `validated_against` only when model-sensitive. It is deliberately **not** registered in v0.1.0; if a real multi-policy deployment demands it, this APR registers it (a row here + an entry in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml)), never by editing [APR-014 DECLARE](APR-014-declare.md).

The test that fixes all four: declare a property in frontmatter **only if** it (a) belongs to the component, (b) varies independently per component, and (c) the runtime must dispatch on it. The budget hint fails (a) and (b); the policy reference passes only in a multi-policy platform — hence reserved.

## References

1. Anthropic. *Effective context engineering for AI agents*. 2025. <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
2. Liu, N. F., Lin, K., Hewitt, J., et al. *Lost in the Middle: How Language Models Use Long Contexts*. TACL, 2024. <https://arxiv.org/abs/2307.03172>
3. Anthropic. *Prompt caching*. API documentation. <https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching>
4. OWASP. *Top 10 for LLM Applications — LLM01: Prompt Injection*. 2025. <https://owasp.org/www-project-top-10-for-large-language-model-applications/>
5. Denning, P. J. *The Working Set Model for Program Behavior*. CACM, 1968. <https://dl.acm.org/doi/10.1145/363095.363141>
6. Debenedetti, E., et al. *Defeating Prompt Injections by Design (CaMeL)*. 2025. <https://arxiv.org/abs/2503.18813>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-08 | Draft | Initial draft. Context window as a composed artifact: declared order, per-class budget, declared reduction with a non-evictable safety floor; deterministic, provenance-carrying, audit-logged assembly. Absorbs the parked prompt-caching kernel as a subordinate SHOULD. |
| 0.2.0 | 2026-07-09 | Draft | Review-driven (feedback on the principle). Unit of composition fixed to the **model call** (re-derive + re-validate each call). Protected tier split into **Tier-0** (guardrails — verbatim, never evicted *or lossily summarized*) and **Tier-1** (task-critical grounding — present-or-fail-closed); protected-tier-alone-overflow fails closed. Named the **self-authored segment** class (trust floor per APR-005). Labels MUST be **unforgeable** and precedence reinforced by placement, not ordering alone (compose APR-005 v0.2.0). Audit log tightened to a **full composition manifest**. |
