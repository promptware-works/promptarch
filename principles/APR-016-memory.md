---
apr: 16
title: "A Memory and State-Lifecycle Principle for Promptware"
abstract: "Agent memory is tiered, trust-labeled, and scope-bound: recall re-enters content at its origin trust and never elevates it, retention is bounded and forgettable, and memory that durably shapes behavior graduates into a governed, versioned artifact."
status: Draft
version: 0.2.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-08
last-updated: 2026-07-09
audience: Architects and framework authors of agentic AI platforms; harness/runtime engineers implementing agent memory and session state; anyone reasoning about memory poisoning, data retention, or cross-session behavior drift
supersedes: []
superseded-by: []
related:
  - APR-002
  - APR-003
  - APR-005
  - APR-008
  - APR-009
  - APR-013
  - APR-015
tags:
  - memory
  - session-state
  - trust
  - retention
  - lifecycle
---

# APR-016 — A Memory and State-Lifecycle Principle for Promptware

> **Agent memory is tiered, trust-labeled, and scope-bound state. Admission is governed: memory is stamped at write time with the trust floor of its inputs, by a least-privilege write path, and derived memory inherits its least-trusted ancestor's label. Recall re-enters content at its stored origin trust and never elevates it automatically. Scope is enforced default-deny at the query boundary in code. Retention is bounded and forgettable via cascading, tombstoned erasure. Trust elevation occurs only through graduation: the single audited, reviewed channel by which memory earns behavior-shaping status.**

## Motivation

An agent is, by definition, a *stateful* actor — it carries context across turns and, increasingly, across sessions. That state is **memory**: the scratchpad within a run, the accumulating facts of a session, the durable preferences and learned rules that persist between sessions. The corpus names the agent stateful but governs none of that state, and the gaps are consequential:

- **Memory poisoning (persistent injection).** Untrusted content — a user message, a scraped document, a tool result — is written to memory in one session and *recalled as if it were trusted operator content* in a later one. [APR-005](APR-005-trust-boundaries.md) labels the content untrusted at ingress, but nothing carries that label into and out of memory, so recall silently launders untrusted data into the instruction channel. This is prompt injection with a persistence layer.
- **Scope bleed.** Memory written under one principal, user, or task is recalled into another's context because scope was never declared or enforced.
- **Unbounded, unforgettable retention.** Memory accretes with no expiry and no delete path — a compliance and privacy liability (a data-subject erasure request has nowhere to land) and a slow behavior-drift source.
- **The governance escape hatch.** Durable, behavior-shaping content lives indefinitely as "memory" and thereby escapes the versioning, review, and provenance every other behavior-shaping artifact is subject to ([APR-002](APR-002-observe.md), [APR-008](APR-008-artifact-lifecycle.md)) — simply because it was written at runtime rather than authored.
- **Silent contradiction.** A newer memory contradicts an older one; last-write-wins changes behavior invisibly, with no reconciliation and no record.

These are not storage-engine problems; they are the absence of a *discipline* over what memory is, how far it reaches, how long it lives, and what trust it carries.

## The principle

**Treat memory as governed state with four declared properties — tier, trust, scope, and lifecycle — and a graduation rule that stops durable memory from escaping artifact governance.**

- **Tier** — every memory item belongs to a declared tier (working / session / long-term), which fixes its lifetime and default treatment.
- **Trust** — the vulnerability is the *write* path, not the read. Memory is **stamped at write time** with the trust floor of its inputs, by a **least-privilege write path** (not something any tool result performs freely); **derived or merged** memory inherits its **least-trusted ancestor's** label (monotone min — [APR-005](APR-005-trust-boundaries.md) v0.2.0). Recall then re-enters at that stored trust and **never elevates it automatically**. Self-authored memory (the model writing "the user prefers X" from observation) sits at the floor of its inputs, never at system trust.
- **Scope** — every item has a declared scope along named axes — **tenant/user, session/task, agent-or-tool identity, time** — enforced **default-deny at the store/query boundary in code** (not by asking the model to be careful). The catastrophic failure is **cross-tenant recall** (user A's memory surfacing for user B); a query that does not declare its scope gets **nothing**, not everything.
- **Lifecycle** — write, selective recall, bounded retention (TTL/decay), and **cascading, tombstoned** erasure; contradictions reconciled by declared policy, not silence.
- **Graduation** — trust never elevates automatically, and graduation is the **only** elevation path: a governed, reviewed promotion that is the single audited doorway through which memory earns behavior-shaping status. This resolves the apparent tension with "never elevates" — automatic elevation is forbidden; graduation is the sanctioned, human-gated exception.

## The three tiers

| Tier | Lifetime | Typical scope | Treatment |
|---|---|---|---|
| **Working** | one run / turn | the run | Ephemeral; part of the assembled window ([APR-015](APR-015-context-assembly.md)); not persisted; dies with the run. |
| **Session** | across turns, one session | session / conversation | Bounded retention; recall is selective and audit-logged; trust label preserved. |
| **Long-term** | across sessions | user / agent / project / global (declared) | Persisted; forgettable; **graduates to a governed artifact** once it durably shapes behavior. |

Tiers are distinguished by *lifetime*, the same way [OBSERVE](APR-002-observe.md) distinguishes content categories by change-lifecycle. Working memory is governed by APR-015 as a window segment; this principle governs session and long-term memory and the trust/scope discipline that spans all three.

## Storage model — append-only where integrity is load-bearing

Whether the store is append-only is not a free "security vs performance" choice; forcing it into one silently reinstates the silent-mutation laundering path (rewrite content, keep the trusted stamp). The store MUST be **append-only wherever a memory's integrity is load-bearing** — any session/long-term memory that is untrusted-origin, behavior-shaping, or erasure-subject — because that is where laundering, provenance, and cascading erasure live. A **mutable/fast** store is permitted only for state where integrity is not load-bearing: **ephemeral working memory** (dies with the run), or a **reconstructible projection** of an append-only source (a cache/index that can be rebuilt — the [APR-013](APR-013-artifact-graph.md) "tools are projections, reconciled back" pattern). The selector is the declared **tier + trust**, decided in code at design time — never a per-team performance preference. Append-only's costs (write amplification, read-resolution) are mitigated by a current-head index and retention-bounded compaction; it is the same append-only discipline APR-013 already commits the corpus to.

## Prescription

- **Admission is governed.** Memory MUST be **stamped at write time** with the trust floor of its inputs; the write path itself MUST be **least-privilege** (an explicit, authorized operation, not something any tool result performs freely). Stamping by *where content landed* rather than *where it came from* is forbidden — that launders trust before recall ever runs.
- **Derivation is monotone.** Memory derived, summarized, merged, or reflected from multiple sources MUST inherit its **least-trusted ancestor's** label (min, never max — composes [APR-005](APR-005-trust-boundaries.md) v0.2.0). **Self-authored** memory carries the floor of its inputs, never system trust — otherwise the reflection loop is a free elevation channel bypassing graduation.
- **Recall MUST re-enter content at its stored trust and MUST NOT elevate it automatically**: recalled untrusted memory is delimited **data**, never instructions. This is the hard defense against memory poisoning.
- Writing **session/long-term memory from untrusted content** MUST NOT, on later recall, drive a consequential or safety-critical action on its own; a deterministic check or an authorized human MUST gate it (composes with [APR-005](APR-005-trust-boundaries.md) and [APR-009](APR-009-human-in-the-loop.md)).
- Every memory item MUST carry a declared **scope** along its axes (tenant/user, session/task, agent-or-tool identity, time), enforced **default-deny at the store/query boundary in code** ([APR-003](APR-003-code-prompt-boundary.md) — not by asking the model). A query that does not declare its scope MUST return **nothing**; cross-scope or **cross-tenant** recall is a boundary violation (composes with [APR-005](APR-005-trust-boundaries.md), [APR-012](APR-012-federated-composition.md)).
- Recall MUST be **selective and declared** (which memory, which scope) — never blanket re-injection of everything remembered — and every recall MUST be **audit-logged** (`{item/scope id, trust label, timestamp}`). Recalled memory is a segment assembled under [APR-015](APR-015-context-assembly.md) and budgeted there.
- Session/long-term memory whose integrity is load-bearing (untrusted-origin, behavior-shaping, or erasure-subject) MUST be stored **append-only**; only ephemeral or reconstructible-projection state MAY be mutable (see *Storage model*). In-place edit of an integrity-bearing memory is forbidden — it is a silent-mutation laundering path.
- Every persisted memory MUST have a **declared retention/expiry** policy; **indefinite retention MUST be an explicit, justified choice, not a default**. Memory MUST be **forgettable**, and forgetting MUST **cascade**: erasing a memory MUST invalidate everything derived from it (deleting the origin but leaving its influence is cosmetic). Erasure MUST reconcile with audit via **tombstones** — remove the content, retain the *fact of* the memory for forensics (the architectural hook for data-subject erasure; ties to the proposed PII principle).
- Long-term memory that **durably shapes behavior across sessions** MUST **graduate to a governed artifact** — versioned + status-tracked + provenance-recorded ([APR-008](APR-008-artifact-lifecycle.md)), organized per [OBSERVE](APR-002-observe.md), edged into the artifact graph ([APR-013](APR-013-artifact-graph.md)). Graduation is the **only** trust-elevation path (reviewed, audited); it MUST be triggered before untrusted content recalled often enough becomes de facto policy (**laundering by repetition**), not left to accrue indefinitely as ungoverned memory.
- **Contradictory memories** MUST be reconciled by a **declared policy** (recency, provenance priority, or a HITL gate — [APR-009](APR-009-human-in-the-loop.md)); silent last-write-wins that changes behavior is forbidden (mirrors APR-013 reconciliation, APR-008 supersession).
- A **memory item's schema** is a contract ([OBSERVE](APR-002-observe.md) `contracts/`) and is versioned ([APR-008](APR-008-artifact-lifecycle.md)); a change to it is a migration, not a silent reshape.

## Scope and applicability

### When this applies

- Any agent that carries state **across turns** (session memory) or **across sessions** (long-term memory).
- Any system that **persists** anything later recalled into an agent's context — including summaries, learned facts, and preferences.

### When this does NOT apply

- **Stateless skills** ([ASPECT-S](APR-001-aspect.md)) — a schema-bound transform has no memory; its input schema *is* its whole state.
- A **single-turn** interaction that persists nothing.
- The **storage engine** (vector store, KV store, database) — infrastructure, out of scope per [APR-000](APR-000-promptware.md). This governs the discipline over what is stored, recalled, trusted, and expired, not the store.

## Governance and validation

*(Shared conformance model — two-tier CI/human, audit-binding, change-via-ADR — per [APR-010](APR-010-governance.md).)*

- **Governed admission** — memory is stamped at write time with its inputs' trust floor; the write path is least-privilege (Tier 1 stamp check; Tier 2 that the write path is authorized).
- **Monotone derivation** — derived/merged/self-authored memory carries the min ancestor label; a red-team "reflect untrusted → recall as trusted" case in `evals/` gates merge (Tier 1 label check; Tier 2 + eval).
- **Trust preserved on recall** — recall does not elevate automatically; the memory-poisoning eval (write untrusted → recall → attempt instruction) gates merge (Tier 1; Tier 2 + eval).
- **Scope default-deny in code** — scope declared along its axes; enforcement is at the store/query boundary in code; an undeclared-scope query returns nothing; a cross-tenant recall case is tested (Tier 1 structural; Tier 2 boundaries).
- **Gated writes** — a write from untrusted content cannot alone drive a consequential action on recall (Tier 2; deterministic gate present).
- **Append-only where load-bearing** — integrity-bearing memory is append-only; mutable stores are ephemeral or reconciled projections (Tier 1 config; Tier 2 the tier/trust selector is right).
- **Retention + cascading forget** — every persisted store declares retention; indefinite is explicit; forget cascades to derived memories and uses tombstones that keep the audit fact (Tier 1 presence; Tier 2 justification + cascade coverage).
- **Graduation enforced** — behavior-shaping long-term memory is a governed artifact, not raw memory; laundering-by-repetition is caught before it becomes de facto policy (Tier 2 judgment — the key review call).
- **Reconciliation declared** — contradiction policy exists; no silent last-write-wins (Tier 1 presence; Tier 2 policy).

## What this principle is NOT

- **Not a memory store or database.** It governs the discipline over memory, not the engine, index, or eviction mechanism.
- **Not [APR-015](APR-015-context-assembly.md).** APR-015 orders and budgets recalled memory as one *window segment*; this governs memory's tier, trust, scope, and lifecycle *before* it becomes a segment.
- **Not [OBSERVE](APR-002-observe.md).** OBSERVE governs authored, canonical, human-curated content; memory is runtime-written, per-session, and low-trust by origin — until it *graduates*, at which point it becomes OBSERVE/APR-008/APR-013-governed. This principle owns memory's life up to that graduation.
- **Not [APR-005](APR-005-trust-boundaries.md).** It composes it: memory is the persistence vector for taint, and this is where a trust label gets a *lifetime* and a recall rule.
- **Not the PII principle** (proposed, backlog): memory is one place PII lands, and forgettability is the shared hook, but this is not content-privacy in general.
- **Not a guarantee of correct memory.** It governs trust, scope, and lifecycle — not whether a remembered fact is true (a hallucinated memory is still governed; its truth is an eval concern).
- **Not conversation-history compaction** — that is APR-015's reduction policy.

## Relationship to established patterns

| Pattern | What it shares | What this APR adds |
|---|---|---|
| Cognitive architectures — working vs long-term memory (Atkinson–Shiffrin; SOAR, ACT-R) | The tiered model of memory | Trust labeling, scope enforcement, and governance — memory as an *audited* substrate, not just a cognitive one |
| MemGPT; generative agents (Park et al. 2023) — memory stream + reflection → long-term | Tiered agent memory; reflection promoting to durable store | The promotion is a *governed graduation* (versioned artifact); recall is trust-preserving and scope-bound |
| OS address-space scoping / capability confinement | Scope-enforced access to state | Probabilistic-content trust and taint-carrying recall |
| Taint tracking / information-flow control | Labels carried with data | Persisted taint with a *recall-never-elevates* rule and a forget path |
| RAG / vector memory | Selective recall of stored content | It is *not* the store; recall is audited, trust-labeled, and scope-bound |
| GDPR erasure / data-retention law | Bounded retention; right to be forgotten | Makes forgettability and bounded retention *architectural properties of memory*, not just policy |

## Adoption notes

Phased, defense-first:

1. **Label memory with trust at write time** and make recall preserve it — this closes the memory-poisoning vector before anything else.
2. **Declare tier + scope** on every store; enforce scope on recall.
3. **Add retention + a forget path**; make indefinite retention an explicit, reviewed choice.
4. **Draw the graduation line** — identify long-term memory that steers decisions and move it into OBSERVE/APR-008 governance; keep the rest as bounded, forgettable memory.

Pitfalls: re-injecting recalled memory as trusted (the default in most harnesses); treating a summary of a session as trusted (it inherits the session's lowest trust); letting "the agent learns" become a governance bypass. Measures: memory-poisoning eval pass rate; count of long-term stores past retention with no policy (target zero); erasure-request fulfillment latency.

## Metadata registrations

Consistent with [APR-015](APR-015-context-assembly.md)'s "obligations on the runtime, baseline over per-component field" stance, the enforcement of trust preservation, scope, retention, and forgettability is a **harness/memory-subsystem obligation**, not a per-component declaration. Persisted memory items are **contracts** ([OBSERVE](APR-002-observe.md) `contracts/`) and are versioned by [APR-008](APR-008-artifact-lifecycle.md); memory that a skill/agent reads or produces is declared through the existing OBSERVE `consumes.*` / `produces.*` model.

One case, however, is stronger here than in APR-015 and is flagged for review: **[APR-014 DECLARE](APR-014-declare.md)'s "agency is declared, never discovered" doctrine** implies that a component's **authority to write durable (long-term) memory** should be a *declared capability* — so governance and audit can see which components can mutate behavior-shaping state. The candidate is a `core.composition` field (e.g. `writes_memory` with a scope, orthogonal to `delegation_envelope`), owned by APR-016.

*(Open design question, deliberately deferred to review — matching how APR-015 handled `context_assembly_policy`: whether durable-memory-write authority is a registered `core.composition` field or is subsumed by OBSERVE `produces` on a memory contract. If adopted, APR-016 registers it here + in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml) on acceptance, never by editing APR-014.)*

## References

1. Atkinson, R. C., Shiffrin, R. M. *Human Memory: A Proposed System and its Control Processes*. 1968. (The working/long-term tiering.)
2. Packer, C., et al. *MemGPT: Towards LLMs as Operating Systems*. 2023. <https://arxiv.org/abs/2310.08560>
3. Park, J. S., et al. *Generative Agents: Interactive Simulacra of Human Behavior*. 2023. <https://arxiv.org/abs/2304.03442>
4. OWASP. *Top 10 for LLM Applications — LLM01: Prompt Injection* (memory/persistence as an injection vector). 2025. <https://owasp.org/www-project-top-10-for-large-language-model-applications/>
5. Denning, D. E. *A Lattice Model of Secure Information Flow*. CACM, 1976. <https://dl.acm.org/doi/10.1145/360051.360056>
6. European Parliament. *GDPR Art. 17 — Right to erasure ("right to be forgotten")*. 2016. <https://gdpr-info.eu/art-17-gdpr/>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-08 | Draft | Initial draft. Memory as tiered (working/session/long-term), trust-labeled, scope-bound, lifecycle-governed state; recall never elevates trust; bounded retention + forget path; graduation of behavior-shaping memory into a governed artifact. |
| 0.2.0 | 2026-07-09 | Draft | Review-driven (feedback on the principle). Moved the emphasis to the **write path**: governed least-privilege admission, write-time stamping, and **monotone (min) derivation** including **self-authored** memory (compose APR-005 v0.2.0). **Scope** sharpened — named axes, **cross-tenant** called out, **default-deny enforced in code** (APR-003). Forgetting made **cascading + tombstoned**. **Graduation** reframed as the *single* sanctioned elevation channel (resolving the "never elevates" tension) and triggered against **laundering by repetition**. Added a **Storage model** section: append-only where integrity is load-bearing, mutable only for ephemeral / reconstructible-projection state (APR-013 pattern). Added `related:` APR-003. `writes_memory` field still deferred to review. |
