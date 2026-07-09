# APR-016 — Memory & State Lifecycle — Digest

> **Generated digest of [APR-016 — A Memory and State-Lifecycle Principle for Promptware](../APR-016-memory.md) v0.2.1.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Agent memory is tiered, trust-labeled, and scope-bound: admission is governed (stamped at write time with its inputs' trust floor, by a least-privilege path; derived memory inherits its least-trusted ancestor), recall never elevates trust automatically, scope is enforced default-deny in code, retention is bounded and forgettable via cascading tombstones, and graduation is the single audited channel by which memory earns behavior-shaping trust.

**Principle.** Memory is governed state with four declared properties — tier, trust, scope, lifecycle — plus graduation. Admission is governed and trust is stamped at write time at the floor of inputs; derivation is monotone (min); recall re-enters at stored trust and never elevates automatically; scope is default-deny in code; retention is bounded and forgettable by cascading tombstones; trust elevation happens only through reviewed graduation.

## The three tiers

| Tier | Lifetime | Typical scope | Treatment |
|---|---|---|---|
| **Working** | one run / turn | the run | Ephemeral; part of the assembled window (APR-015); not persisted; MAY be mutable/fast. |
| **Session** | across turns, one session | session / conversation | Bounded retention; selective, audit-logged recall; trust preserved; append-only if integrity-bearing. |
| **Long-term** | across sessions | user / agent / project / global (declared) | Persisted append-only; forgettable; graduates to a governed artifact once behavior-shaping. |

Tiers distinguished by *lifetime*. Working memory is an APR-015 window segment; this principle governs session + long-term memory and the trust/scope discipline spanning all three.

## Storage model

Append-only **wherever integrity is load-bearing** (untrusted-origin, behavior-shaping, or erasure-subject session/long-term memory) — in-place edit there is a silent-mutation laundering path. Mutable/fast permitted only for **ephemeral working memory** or a **reconstructible projection** of an append-only source (APR-013 "tools are projections, reconciled back"). Selector = declared tier + trust, decided in code — never a performance preference.

## Normative rules

- **Admission is governed**: memory MUST be stamped at write time with its inputs' **trust floor**, by a **least-privilege write path**; stamping by where content landed (not where it came from) is forbidden.
- **Derivation is monotone**: derived/summarized/merged/reflected memory MUST inherit its **least-trusted ancestor's** label (min — APR-005 v0.2.0); **self-authored** memory carries its inputs' floor, never system trust.
- **Recall MUST re-enter at stored trust and MUST NOT elevate automatically**: recalled untrusted memory is delimited data, never instructions. (The memory-poisoning defense.)
- Writing session/long-term memory from untrusted content MUST NOT, on recall, drive a consequential/safety-critical action alone; a deterministic check or authorized human MUST gate it (APR-005 + APR-009).
- **Scope** MUST be declared along its axes (tenant/user, session/task, agent-or-tool identity, time) and enforced **default-deny at the store/query boundary in code** (APR-003); an undeclared-scope query returns **nothing**; cross-scope / **cross-tenant** recall is a boundary violation.
- Recall MUST be **selective + declared** and **audit-logged** (`{item/scope id, trust label, timestamp}`); recalled memory is an APR-015 window segment.
- Integrity-bearing session/long-term memory MUST be **append-only**; only ephemeral / reconstructible-projection state MAY be mutable.
- Every persisted memory MUST have a **declared retention/expiry** (indefinite is explicit, not default). Forgetting MUST be **cascading** (erasing M invalidates everything derived from M) and reconciled with audit via **tombstones** (drop content, keep the fact).
- Behavior-shaping long-term memory MUST **graduate to a governed artifact** (APR-008 versioning, OBSERVE organization, APR-013 edges). Graduation is the **only** trust-elevation path; trigger it before laundering-by-repetition makes untrusted content de facto policy.
- **Contradictory memories** MUST be reconciled by a declared policy (recency / provenance / HITL — APR-009); silent last-write-wins is forbidden.
- A memory item's **schema is a contract** (OBSERVE `contracts/`), versioned (APR-008); a change is a migration.

## Metadata (deferred to review)

Enforcement is a **runtime/memory-subsystem obligation**, not a per-component field. Persisted memory items are OBSERVE `contracts/`; reads/writes use OBSERVE `consumes`/`produces`. **Open question:** APR-014's "agency is declared" doctrine implies a component's **authority to write durable memory** should be a declared `core.composition` capability (`writes_memory` + scope, owned by APR-016) — deferred; if adopted, registered here + in the registry on acceptance, never by editing APR-014.

## Governance checks

Governed admission (write-time floor stamp, least-privilege path) · monotone derivation (min ancestor label; reflect-untrusted red-team eval) · trust preserved on recall (memory-poisoning eval gates merge) · scope default-deny in code (undeclared → nothing; cross-tenant tested) · writes from untrusted content gated · append-only where load-bearing · retention + cascading tombstoned forget · graduation enforced (laundering-by-repetition caught) · contradiction-reconciliation policy declared.

## Scope limits — do NOT misapply

Not a memory store/database (governs discipline, not the engine) · not APR-015 (that orders/budgets recalled memory as a window segment; this governs tier/trust/scope/lifecycle before it becomes one) · not OBSERVE (authored canonical content; memory is runtime-written, low-trust-by-origin, until graduation) · not APR-005 (composes it — memory is where a trust label gets a lifetime) · not the PII principle (memory is one place PII lands; forgettability is the shared hook) · not a guarantee of correct memory (governs trust/scope/lifecycle, not truth) · not conversation-history compaction (APR-015 reduction) · not a solver of downstream influence (cascading erasure reaches derived memories + graduated artifacts, but not a fine-tune the memory shaped — training-data lineage is a PII-principle hook).

---
*Source: [APR-016 — A Memory and State-Lifecycle Principle for Promptware](../APR-016-memory.md) v0.2.1 · regenerate this digest whenever the source changes.*
