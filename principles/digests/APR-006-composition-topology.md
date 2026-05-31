# APR-006 — Composition & Delegation Topology — Digest

> **Generated digest of [APR-006 — A Composition and Delegation-Topology Principle for Multi-Agent Promptware](../APR-006-composition-topology.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Compose agents and skills into an explicit, bounded delegation graph: prefer skills, prefer a DAG, declare the allowed edges and traverse them dynamically, guarantee termination, and attenuate authority down every edge — so multi-agent control flow is legible, terminating, and auditable.

**Principle.** A multi-agent system is a delegation graph (nodes = agents/skills, edges = delegations). That graph MUST be explicit and bounded — in shape, depth, and authority. Each edge is an ASPECT delegation contract.

## The four axes

- **Granularity** — a unit SHOULD be a skill unless it needs identity, authority, or routing (then it's an agent, per ASPECT). Prefer the smallest graph; fight god-agents and skill sprawl.
- **Topology** — the graph SHOULD be a DAG (supervisor/worker). Cycles / peer-to-peer MUST be a declared exception with its own termination bound.
- **Legibility** — the *allowed* edges (who MAY call whom) MUST be declared (the envelope); the *actual* path MAY be dynamic within it; every actual delegation MUST be audit-logged.
- **Bounds** — termination + authority (below).

## Normative rules

- A unit of behavior SHOULD be a skill unless it needs identity/authority/routing; prefer the smallest graph.
- The graph SHOULD be a DAG; cycles/peer-to-peer MUST be declared exceptions with explicit termination bounds.
- The allowed delegation edges MUST be declared; runtime delegations MUST stay within the envelope; the actual path MAY be dynamic.
- Every actual delegation MUST be audit-logged (`caller`, `callee`, input reference, timestamp).
- Termination MUST be guaranteed by composing depth + cycle-detection + budget bounds; tripping any MUST halt with an audit-logged error (never silently truncate or spin).
- A delegate's authority/blast-radius MUST be bounded by its caller's (attenuation, never escalation); raising authority MUST be an explicit upward escalation; delegate output is untrusted input (APR-005).
- Routing/dispatch follows APR-003: deterministic where a closed-form choice exists, prompt-driven only for genuine judgment.

## Governance checks

Declared envelope present and reviewed · envelope acyclic except declared bounded cycles · termination bounds (depth/cycle/budget) configured · authority monotonic across edges (escalations explicit) · delegation audit log reconcilable against the envelope · new agents justified by an identity/authority/routing need.

## Scope limits — do NOT misapply

Not a runtime/scheduler/message bus · not a multi-agent framework (framework-agnostic) · not a replacement for ASPECT (ASPECT governs nodes/edges; this governs the graph) · not a guarantee of correct routing · not applicable to single-component systems (no graph).

---
*Source: [APR-006 — A Composition and Delegation-Topology Principle for Multi-Agent Promptware](../APR-006-composition-topology.md) v0.1.0 · regenerate this digest whenever the source changes.*
