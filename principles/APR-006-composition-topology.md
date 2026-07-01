---
apr: 6
title: "A Composition and Delegation-Topology Principle for Multi-Agent Promptware"
abstract: "Compose agents and skills into a bounded delegation graph: prefer skills, keep delegation acyclic with bounded feedback loops, declare the edges and traverse them dynamically, guarantee termination, and narrow authority along each edge — so control flow stays legible, terminating, and auditable."
status: Draft
version: 0.1.1
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-31
last-updated: 2026-05-31
audience: Architects of multi-agent systems; framework authors building orchestrators and routers; teams whose promptware has several agents delegating to one another
supersedes: []
superseded-by: []
related:
  - APR-001
  - APR-003
  - APR-005
tags:
  - composition
  - delegation
  - multi-agent
  - topology
  - orchestration
---

# APR-006 — A Composition and Delegation-Topology Principle for Multi-Agent Promptware

> **Compose agents and skills into an explicit, bounded delegation graph — structured topology, declared edges, depth/cycle/termination limits, and authority that only narrows down each edge — so multi-agent control flow is legible, terminating, and auditable.**

*Injectable summary (for feeding to an LLM): [`digests/APR-006-composition-topology.md`](digests/APR-006-composition-topology.md). This full APR is canonical.*

## Motivation

[APR-001 ASPECT](APR-001-aspect.md) specifies *one* component — its role, scope, invocation and handoff contracts. But real promptware is *many* agents and skills delegating to one another, and nothing governs the **graph** they form. Five failure modes follow:

- **Runaway delegation.** Agents calling agents with no depth limit or cycle detection → infinite loops, cost blow-ups, context explosion.
- **Misrouting at scale.** Without topology discipline, any agent may call any other; responsibility diffuses and "which agent owns this?" becomes unanswerable.
- **Granularity drift.** No rule for *when to add a skill vs. spawn an agent* → either god-agents or skill sprawl.
- **Blast-radius compounding.** A delegate that exceeds its caller's authority → privilege confusion.
- **Illegible control flow.** The real call graph is emergent and undocumented; it cannot be audited or reasoned about.

## The principle

> **A multi-agent system is a delegation graph: nodes are agents and skills, edges are delegations. That graph MUST be explicit and bounded — in shape, in depth, and in authority.**

Each edge is an ASPECT delegation contract; the graph is the structure over those edges. The principle constrains the graph along four axes — *granularity* (what is a node), *topology* (what shape), *legibility* (which edges, declared how), and *bounds* (termination and authority).

## Scope and applicability

### When this applies

- Multi-agent / multi-skill systems where components delegate to one another.

### When this does NOT apply

- Single-agent or single-skill setups (there is no graph).
- It is a *composition/topology* principle, **not** a runtime scheduler or message-bus specification. It says what the graph must satisfy, not how the orchestrator executes it (the host's concern, per APR-000 and ASPECT).

## Granularity: agents vs skills

Reuse ASPECT's distinction — an **agent** is a stateful actor with identity, authority, and routing logic; a **skill** is a stateless transform with typed I/O — with a **default-to-skill bias**:

- A unit of behavior **SHOULD** be a skill *unless* it genuinely needs identity, authority, or routing among multiple skills — in which case it is an agent.
- Spawning an agent adds a node with its own authority and blast radius; skills are leaves. **Prefer the smallest graph** that does the work; this fights both god-agents and skill sprawl.

## Topology: acyclic delegation with bounded feedback

Two kinds of edge, governed differently:

- **Forward delegation** (a coordinator calling a specialist) **SHOULD** form a **directed acyclic graph**, flowing down from coordinators to leaves. Forward delegation does not loop.
- **Feedback loops** — iterative-refinement patterns where output cycles back for another pass (generator–critic / reflexion, plan–act–observe / ReAct, evaluator–optimizer, debate) — are **first-class, not exceptions**. Each feedback loop **MUST** be *explicitly declared* and carry a **termination condition** (max iterations, a convergence test, or a budget; see § *Termination*).

The line is **bounded loop vs. uncontrolled cycle**: a declared, bounded feedback loop is supported; an unbounded cycle — a back-edge with no termination condition — is forbidden. Feedback is welcome; unbounded recursion is not. Because every loop is declared in the envelope (§ *The delegation graph*), the graph stays legible and terminates by construction.

## The delegation graph: declared envelope, dynamic path

Auditability and flexibility are reconciled by separating *what is allowed* from *what happens*:

- The set of **allowed edges** — which agent/skill **MAY** delegate to which — **MUST** be declared (the *envelope* / capability graph). Runtime delegations **MUST** stay within it.
- The **actual path** through that envelope **MAY** be chosen dynamically at runtime (an agent picking the right specialist for the input).
- Every **actual delegation MUST be audit-logged** — `{caller, callee, input reference, timestamp}` — so any run is reconstructable and the realized graph is reviewable against the declared envelope.

You can therefore audit the *envelope* statically and reconstruct the *path* after the fact, without forcing static routing.

## Termination

Every delegation graph **MUST** guarantee termination *by construction*, via composing bounds:

- a maximum delegation **depth**;
- **cycle detection** — a node **MUST NOT** recur on a delegation path unless it is a declared, bounded loop;
- a resource/iteration **budget** (calls/tokens) as a backstop.

Tripping any bound **MUST** halt that path with an audit-logged error — it **MUST NOT** silently truncate or spin. The specific limits are platform-configurable; *having* a guarantee is not optional.

## Authority composition

- A delegate's authority and blast radius **MUST** be bounded by its caller's — delegation only *narrows* authority, never *escalates* it (capability attenuation; a child cannot do what its parent could not). This composes ASPECT Autonomy Profiles down the graph.
- Raising authority **MUST** be an explicit **escalation up** — to a human or a higher-authority supervisor — and audit-logged; it is never a delegate quietly exceeding its caller.
- A delegate's returned output is **untrusted input** to the caller ([APR-005](APR-005-trust-boundaries.md)); a parent acting on it **MUST NOT** thereby launder privilege or skip its own trust checks.

## Prescription

- A unit of behavior **SHOULD** be a skill unless it needs identity, authority, or routing; prefer the smallest graph.
- Forward delegation **SHOULD** form a DAG; feedback loops are first-class but **MUST** be explicitly declared and carry a termination condition; unbounded cycles are forbidden.
- The allowed delegation edges **MUST** be declared; runtime delegations **MUST** stay within the declared envelope; the actual path **MAY** be dynamic.
- Every actual delegation **MUST** be audit-logged (`caller`, `callee`, input reference, timestamp).
- Termination **MUST** be guaranteed by composing depth, cycle-detection, and budget bounds; tripping any **MUST** halt with an audit-logged error.
- A delegate's authority/blast-radius **MUST** be bounded by its caller's; escalation **MUST** be explicit and upward; delegate output is untrusted (APR-005).
- Routing/dispatch decisions follow [APR-003](APR-003-code-prompt-boundary.md): deterministic where a closed-form choice exists, prompt-driven only for genuine judgment.

## Governance and validation

The shared governance model — two-tier enforcement, audit-log binding, and change-via-ADR — is defined in [APR-010](APR-010-governance.md); the checks below are this APR's domain-specific additions.

A conformant platform checks, in review or CI:

- **Declared envelope present** — the allowed-edge set exists and is reviewed; no agent may delegate outside it.
- **Acyclicity** — forward delegation is acyclic; every feedback loop in the envelope is explicitly declared with a termination condition; no unbounded cycles.
- **Termination bounds configured** — depth, cycle-detection, and budget are set and enforced.
- **Authority monotonicity** — no declared edge grants a delegate more authority than its caller; escalations are explicit.
- **Delegation audit log** — actual delegations are logged and reconcilable against the envelope.
- **Granularity review** — new agents (vs. skills) are justified by an identity/authority/routing need.

## What this principle is NOT

- **Not a runtime, scheduler, or message bus.** It constrains the graph's shape and bounds, not the execution mechanism.
- **Not a multi-agent framework.** It is framework-agnostic; LangGraph, AutoGen, CrewAI, a bespoke orchestrator, etc. can all satisfy it.
- **Not a replacement for ASPECT.** ASPECT governs each node and edge contract; this governs the graph over them.
- **Not a guarantee of correct routing.** Bounded, legible, terminating composition does not make a wrong delegation right — that is a spec/review concern.
- **Not applicable to single-component systems.** With no delegation there is no graph to govern.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Supervisor/worker orchestration** (LangGraph, AutoGen, CrewAI, OpenAI Swarm) | Structured multi-agent delegation | A *principle* (granularity, DAG-default, declared envelope, termination, authority attenuation) rather than a framework |
| **Actor model & supervision trees** (Erlang/OTP, Akka) | Hierarchical message-passing with bounded supervision | Applied to LLM-agent delegation, where edges are ASPECT contracts and delegate output is untrusted (APR-005) |
| **Service-mesh / call-graph governance** (e.g. Istio) | Declared allowed callers, depth limits, circuit breakers, audited calls | Envelope-vs-path split and authority attenuation for prose-driven agents, not network services |
| **Control-flow / call-graph analysis** | Cycle detection and termination reasoning | Termination guaranteed by construction for a graph whose nodes are LLM agents |
| **Organizational span-of-control / delegation theory** | Bounded delegation and authority | Capability attenuation down delegation edges, with explicit upward escalation |

The novel contribution is a **promptware-specific composition principle**: agent-vs-skill granularity, a DAG-default bounded topology, a declared-envelope/dynamic-path graph, termination by construction, and authority that only narrows down each edge — composing with ASPECT (per-edge contracts), APR-003 (router determinism), and APR-005 (delegate output as untrusted input).

## Metadata registrations

Component-metadata fields this APR owns, registered per [APR-014 §The metadata registry](APR-014-declare.md) in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml):

| Field | Path | Type | Values | Status |
|---|---|---|---|---|
| `agency` | core.classification | enum | `leaf, coordinator` | active |
| `delegation_envelope` | core.composition | object | `{ max_depth, allowed_skills }` | active |

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. LangChain. *LangGraph — low-level orchestration for stateful agents*. <https://langchain-ai.github.io/langgraph/>
2. Microsoft. *AutoGen — a framework for multi-agent AI applications*. <https://microsoft.github.io/autogen/>
3. CrewAI. *CrewAI — framework for orchestrating role-playing autonomous agents*. <https://www.crewai.com/>
4. OpenAI. *Swarm — educational framework for ergonomic, lightweight multi-agent orchestration*. <https://github.com/openai/swarm>
5. Lightbend. *Akka — actor-based concurrent and distributed systems*. <https://akka.io/>
6. Ericsson / Erlang. *OTP Design Principles — Supervisor Behaviour*. <https://www.erlang.org/doc/design_principles/sup_princ.html>
7. Istio. *Istio service mesh*. <https://istio.io/>

## Adoption notes

- **Draw the envelope first.** Enumerate the allowed delegation edges before wiring routing — you cannot audit or bound a graph you haven't declared.
- **Default to skills; justify every agent.** Each new agent should earn its node with an identity/authority/routing need; otherwise it's a skill.
- **Set termination bounds at the start**, not after the first runaway loop in production. Wire the delegation audit log alongside them.
- **Keep cycles rare and declared.** Reach for a DAG first; introduce a bounded loop only for genuine iterative-refinement patterns.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-31 | Draft | Initial draft published as APR-006. |
| 0.1.1 | 2026-05-31 | Draft | Topology reframed: feedback loops are first-class (acyclic forward delegation + bounded feedback loops), not "cycles by exception"; the line is bounded loop vs. unbounded cycle (the latter forbidden). |
