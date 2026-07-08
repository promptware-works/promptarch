---
apr: 16
title: "A Memory and State-Lifecycle Principle for Promptware"
abstract: "Agent memory is tiered, trust-labeled, and scope-bound: recall re-enters content at its origin trust and never elevates it, retention is bounded and forgettable, and memory that durably shapes behavior graduates into a governed, versioned artifact."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-08
last-updated: 2026-07-08
audience: Architects and framework authors of agentic AI platforms; harness/runtime engineers implementing agent memory and session state; anyone reasoning about memory poisoning, data retention, or cross-session behavior drift
supersedes: []
superseded-by: []
related:
  - APR-002
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

> **Agent memory is tiered, trust-labeled, and scope-bound state: recall re-enters content at its origin trust and never elevates it, scope is enforced, retention is bounded and forgettable, and any memory that durably shapes behavior graduates into a governed artifact.**

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
- **Trust** — memory carries the trust label of the *lowest-trust* content that formed it; recall re-enters at that trust and never elevates it ([APR-005](APR-005-trust-boundaries.md) taint, given a lifetime).
- **Scope** — every item has a declared scope (run / session / user / agent / project / global) and is recallable only within it.
- **Lifecycle** — write, selective recall, bounded retention, and an explicit forget path; contradictions reconciled by declared policy, not silence.
- **Graduation** — memory that durably shapes behavior across sessions MUST become a governed artifact, not remain ungoverned "memory."

## The three tiers

| Tier | Lifetime | Typical scope | Treatment |
|---|---|---|---|
| **Working** | one run / turn | the run | Ephemeral; part of the assembled window ([APR-015](APR-015-context-assembly.md)); not persisted; dies with the run. |
| **Session** | across turns, one session | session / conversation | Bounded retention; recall is selective and audit-logged; trust label preserved. |
| **Long-term** | across sessions | user / agent / project / global (declared) | Persisted; forgettable; **graduates to a governed artifact** once it durably shapes behavior. |

Tiers are distinguished by *lifetime*, the same way [OBSERVE](APR-002-observe.md) distinguishes content categories by change-lifecycle. Working memory is governed by APR-015 as a window segment; this principle governs session and long-term memory and the trust/scope discipline that spans all three.

## Prescription

- Every memory item MUST carry a declared **tier** and **scope**; recall MUST be confined to that scope — cross-scope or cross-principal recall is a boundary violation (composes with [APR-005](APR-005-trust-boundaries.md) author/category boundaries, [APR-012](APR-012-federated-composition.md) across domains).
- Memory MUST carry the **trust label of the lowest-trust content** that produced it (taint composition, APR-005). **Recall MUST re-enter content at that trust level and MUST NOT elevate it**: recalled untrusted memory is delimited **data**, never instructions. This is the hard defense against memory poisoning.
- Writing **session/long-term memory from untrusted content** MUST NOT, on later recall, drive a consequential or safety-critical action on its own; a deterministic check or an authorized human MUST gate it (composes with [APR-005](APR-005-trust-boundaries.md) and [APR-009](APR-009-human-in-the-loop.md)).
- Recall MUST be **selective and declared** (which memory, which scope) — never blanket re-injection of everything remembered — and every recall MUST be **audit-logged** (`{item/scope id, trust label, timestamp}`). Recalled memory is a segment assembled under [APR-015](APR-015-context-assembly.md) and budgeted there.
- Every persisted memory MUST have a **declared retention/expiry** policy; **indefinite retention MUST be an explicit, justified choice, not a default**. Memory MUST be **forgettable**: a delete/forget operation MUST remove it from all future recall (the architectural hook for data-subject erasure; ties to the proposed PII principle).
- Long-term memory that **durably shapes behavior across sessions** (learned rules, curated fact bases, standing preferences that steer decisions) MUST **graduate to a governed artifact** — versioned + status-tracked + provenance-recorded ([APR-008](APR-008-artifact-lifecycle.md)), organized per [OBSERVE](APR-002-observe.md), and entered into the artifact graph with edges ([APR-013](APR-013-artifact-graph.md)). It MUST NOT persist indefinitely as ungoverned memory.
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

- **Tier + scope declared** on every memory item; recall confined to scope (Tier 1 structural; Tier 2 to judge scope boundaries are right).
- **Trust preserved across memory** — items carry a trust label; recall does not elevate it; a red-team memory-poisoning case in `evals/` (write untrusted → recall → attempt instruction) gates merge (Tier 1 label check; Tier 2 + eval for the attack).
- **Gated writes** — a write from untrusted content cannot alone drive a consequential action on recall (Tier 2 review; deterministic gate present).
- **Selective, logged recall** — no blanket re-injection; each recall audit-logged (Tier 1).
- **Retention + forget** — every persisted store declares retention; indefinite is explicit; a forget operation exists and removes from recall (Tier 1 presence; Tier 2 justification of indefinite).
- **Graduation enforced** — behavior-shaping long-term memory is a governed artifact, not raw memory (Tier 2 judgment — the key review call).
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
