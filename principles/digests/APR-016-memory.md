# APR-016 — Memory & State Lifecycle — Digest

> **Generated digest of [APR-016 — A Memory and State-Lifecycle Principle for Promptware](../APR-016-memory.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Agent memory is tiered, trust-labeled, and scope-bound: recall re-enters content at its origin trust and never elevates it, retention is bounded and forgettable, and memory that durably shapes behavior graduates into a governed, versioned artifact.

**Principle.** Treat memory as governed state with four declared properties — tier, trust, scope, lifecycle — plus a graduation rule: recall never elevates trust, scope is enforced, retention is bounded and forgettable, and any memory that durably shapes behavior becomes a governed artifact rather than ungoverned "memory."

## The three tiers

| Tier | Lifetime | Typical scope | Treatment |
|---|---|---|---|
| **Working** | one run / turn | the run | Ephemeral; part of the assembled window (APR-015); not persisted. |
| **Session** | across turns, one session | session / conversation | Bounded retention; selective, audit-logged recall; trust preserved. |
| **Long-term** | across sessions | user / agent / project / global (declared) | Persisted; forgettable; graduates to a governed artifact once behavior-shaping. |

Tiers distinguished by *lifetime* (as OBSERVE distinguishes content by change-lifecycle). Working memory is an APR-015 window segment; this principle governs session + long-term memory and the trust/scope discipline spanning all three.

## Normative rules

- Every memory item MUST carry a declared **tier** and **scope**; recall MUST be confined to that scope — cross-scope / cross-principal recall is a boundary violation (APR-005, APR-012).
- Memory MUST carry the **trust label of the lowest-trust content** that formed it (taint composition, APR-005); **recall MUST re-enter at that trust and MUST NOT elevate it** — recalled untrusted memory is delimited data, never instructions. (The memory-poisoning defense.)
- Writing **session/long-term memory from untrusted content** MUST NOT, on later recall, drive a consequential/safety-critical action alone; a deterministic check or authorized human MUST gate it (APR-005 + APR-009).
- Recall MUST be **selective and declared** (which memory, which scope) — never blanket re-injection — and each recall MUST be **audit-logged** (`{item/scope id, trust label, timestamp}`); recalled memory is an APR-015 window segment.
- Every persisted memory MUST have a **declared retention/expiry**; **indefinite retention MUST be explicit, not a default**. Memory MUST be **forgettable** — a delete/forget operation MUST remove it from all future recall (data-subject-erasure hook).
- Long-term memory that **durably shapes behavior** MUST **graduate to a governed artifact** — versioned + status-tracked + provenance (APR-008), organized per OBSERVE, edged into the artifact graph (APR-013); it MUST NOT persist as ungoverned memory.
- **Contradictory memories** MUST be reconciled by a **declared policy** (recency, provenance priority, or HITL — APR-009); silent last-write-wins is forbidden.
- A memory item's **schema is a contract** (OBSERVE `contracts/`) and is versioned (APR-008); a change is a migration, not a silent reshape.

## Metadata (deferred to review)

Enforcement of trust/scope/retention/forgettability is a **runtime/memory-subsystem obligation**, not a per-component field (consistent with APR-015). Persisted memory items are OBSERVE `contracts/`, versioned by APR-008; memory a component reads/produces uses OBSERVE `consumes`/`produces`. **Open question:** APR-014's "agency is declared" doctrine implies a component's **authority to write durable memory** should be a declared `core.composition` capability (e.g. `writes_memory` + scope, owned by APR-016) — deferred to review; if adopted, registered here + in the registry on acceptance, never by editing APR-014.

## Governance checks

Tier + scope declared, recall scope-confined · trust preserved across memory (label present, recall non-elevating; a memory-poisoning red-team eval gates merge) · writes from untrusted content gated · selective + audit-logged recall (no blanket re-injection) · retention declared + forget path exists (indefinite is explicit) · behavior-shaping long-term memory graduated to a governed artifact · contradiction-reconciliation policy declared.

## Scope limits — do NOT misapply

Not a memory store/database (governs discipline, not the engine) · not APR-015 (that orders/budgets recalled memory as a window segment; this governs tier/trust/scope/lifecycle before it becomes one) · not OBSERVE (that governs authored canonical content; memory is runtime-written, low-trust-by-origin, until graduation) · not APR-005 (composes it — memory is where a trust label gets a lifetime) · not the PII principle (memory is one place PII lands; forgettability is the shared hook) · not a guarantee of correct memory (governs trust/scope/lifecycle, not truth) · not conversation-history compaction (that's APR-015 reduction).

---
*Source: [APR-016 — A Memory and State-Lifecycle Principle for Promptware](../APR-016-memory.md) v0.1.0 · regenerate this digest whenever the source changes.*
