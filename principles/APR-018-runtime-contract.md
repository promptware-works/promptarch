---
apr: 18
title: "A Runtime-Conformance Profile for Promptware Harnesses"
abstract: "The runtime obligations scattered across the corpus — inject only what's declared, halt-and-audit, propagate trust, enforce the delegation envelope, govern memory and failure — collected by reference into one checkable conformance profile for harnesses, so no APR becomes a runtime specification."
status: Draft
class: architectural
version: 0.3.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-09
last-updated: 2026-07-09
audience: Architects and framework authors building agent/skill runtimes (loaders, orchestrators, harnesses); anyone certifying a platform as PROMPTARCH-conformant
supersedes: []
superseded-by: []
related:
  - APR-002
  - APR-005
  - APR-006
  - APR-009
  - APR-010
  - APR-011
  - APR-013
  - APR-014
  - APR-015
  - APR-016
  - APR-017
  - APR-019
  - APR-020
  - APR-022
tags:
  - runtime
  - harness
  - conformance
  - loader
  - applicability-statement
---

# APR-018 — A Runtime-Conformance Profile for Promptware Harnesses

> **The runtime obligations the corpus already imposes on a harness — inject only what is declared, halt-and-audit on failure, propagate trust, enforce the delegation envelope, govern memory and failure, emit lineage, read metadata from frontmatter — are collected here as one conformance profile, each obligation deferring to its owning principle, so a harness is checkable against a single contract without this APR (or any APR) becoming a runtime specification.**

## Motivation

Promptware has no compiler and no reference runtime; the **harness** — the loader/orchestrator between "decide to act" and "send a prompt to the model" — *is* the runtime. Almost every APR quietly depends on that harness doing certain things: [OBSERVE](APR-002-observe.md) assumes a loader that injects only declared references and halts on a missing one; [APR-005](APR-005-trust-boundaries.md) assumes trust labels propagate through every hop; [APR-006](APR-006-composition-topology.md) assumes delegation stays inside the declared envelope; [APR-010](APR-010-governance.md)/[APR-011](APR-011-observability.md) assume audit-binding at the moment of consumption. Each APR states only *its own* slice, and the [Glossary's "Loader / Orchestrator"](../GLOSSARY.md) entry notes the dependency exists — but **the obligations are never gathered in one place**.

Two costs follow:

- **You cannot certify a harness without reading the whole corpus.** A framework author asking the single most practical question — *"is my runtime PROMPTARCH-conformant?"* — must read all ~18 APRs, extract the runtime bits from each, and hope none was missed. There is no checklist.
- **An obligation no APR clearly owns is invisible.** Scatter hides gaps; you only see them when you try to enumerate the whole contract.

The problem has grown. The recent revisions added a class of **"enforce-in-code"** runtime obligations — re-derive the window every model call and log a composition manifest ([APR-015](APR-015-context-assembly.md)); enforce memory scope default-deny in code and store integrity-bearing memory append-only ([APR-016](APR-016-memory.md)); make fail-closed *constrain the action space* rather than return a routable string ([APR-017](APR-017-graceful-degradation.md)). The harness surface is larger and more scattered than before.

## The principle

**A conforming promptware harness satisfies a single collected contract — the union of the runtime obligations the corpus imposes — assembled here by reference, never redefined.**

This APR is a **profile**, not a new rulebook. It introduces no runtime obligation of its own: every entry is *owned by another principle*, and on any conflict the **owning APR wins** and this profile is corrected. Its contribution is the collection and the checkable index — the same move [APR-010](APR-010-governance.md) makes for the governance model and [APR-014](APR-014-declare.md) makes for component metadata.

Because it defines the **interface a runtime must satisfy, not the mechanism**, it honors every "not a runtime" scope limit in the corpus. It says *what* a conforming harness guarantees, never *how* to build the scheduler, bus, or store that guarantees it.

## The contract — collected runtime obligations

Each row is an obligation on the harness, owned by the cited principle. Verification is **not** re-invented here: each obligation maps to a governance check already defined in its owner (this APR indexes those checks, it does not add new ones).

| # | The harness MUST… | Owner |
|---|---|---|
| R1 | Resolve declared references and inject **only** what is declared; resolve cross-references transitively; audit-log each injection hop. | [APR-002](APR-002-observe.md) |
| R2 | Assemble the context window per declared precedence and per-class budget; **re-derive it every model call**; carry the protected tier verbatim (Tier-0) or present-or-fail-closed (Tier-1); log a full **composition manifest**. | [APR-015](APR-015-context-assembly.md) |
| R3 | Classify inputs/references at ingress and **propagate trust taint** through every hop; keep it **monotone** on derivation; keep labels **unforgeable** from within content; deliver untrusted content as data, never instructions. | [APR-005](APR-005-trust-boundaries.md) |
| R4 | Enforce the code/prompt **seam** — validate LLM output against its declared schema before acting; **halt, don't guess** on a failed crossing. | [APR-003](APR-003-code-prompt-boundary.md) |
| R5 | Keep runtime delegation **inside the declared envelope**, attenuate authority along each edge, guarantee **termination** (depth/cycle/budget → halt), and audit-log every delegation. | [APR-006](APR-006-composition-topology.md) |
| R6 | Weave applied **patterns** from their single canonical source at load/materialization; never inline; audit-log the consumed version. | [APR-007](APR-007-pattern-mechanism.md) |
| R7 | Govern **memory**: stamp trust at write time by a least-privilege path, enforce scope **default-deny in code**, never elevate on recall, store integrity-bearing memory **append-only**, and cascade tombstoned erasure. | [APR-016](APR-016-memory.md) |
| R8 | Place **human oversight** by declared reversibility/blast-radius; show the concrete diff and record the approver before an irreversible action; let no fatigue lever skip a safety gate. | [APR-009](APR-009-human-in-the-loop.md) |
| R9 | Handle **failure** by declared property: fail-closed **enforced in code** (constrain the action space), retry only idempotent, keep a run-level degradation budget, mark degraded output at the boundary, expire escalations fail-closed. | [APR-017](APR-017-graceful-degradation.md) |
| R10 | **Audit-log at the moment of consumption** — injection, delegation, application, approval — with `{source, version, timestamp}`, on one shared instrumentation substrate whose audit floor is immutable; attribute and budget cost (hard cap → halt). | [APR-010](APR-010-governance.md), [APR-011](APR-011-observability.md) |
| R11 | **Emit derivation edges** as a side effect of producing each artifact node, so traceability is a byproduct of production. | [APR-013](APR-013-artifact-graph.md) |
| R12 | Read machine-readable metadata **from frontmatter only**; never parse the injected body for metadata; never inject frontmatter into the model. | [APR-014](APR-014-declare.md) |
| R13 | Across a federation boundary, **authenticate** participants and grant only least-privilege, **non-transitive** cross-domain trust. | [APR-012](APR-012-federated-composition.md) |
| R14 | Reference every artifact by its **canonical `container-id:id`** in emitted lineage and audit records (so each is globally provenance-resolvable), and resolve a **cross-project** reference only when the target's project is a declared `dependency`. | [APR-019](APR-019-identity.md) |
| R15 | Execute any model-invoked tool/code in an **isolated, resource-bounded environment with no ambient credentials** and **default-deny egress**; scope capability per action at least privilege; fail closed on a bound breach. | [APR-020](APR-020-execution-environment.md) |
| R16 | Expose tools as **schema-validated contracts** — validate tool **input and output**, tier each by effect (`read`/`write`/`destructive`) at least privilege, gate `destructive` behind oversight, and return machine-actionable errors. | [APR-022](APR-022-tools.md) |

A harness declares which obligations it meets; **partial conformance is per-obligation and testable**, but a scope that adopts an owner APR inherits that APR's own "partial adoption surrenders the guarantee" rule (e.g. OBSERVE). Conformance of the whole = passing the union of the owners' runtime-facing governance checks.

## Extension — closed for modification, open by owner-registration

New runtime obligations MUST enter the contract the way new metadata fields enter the DECLARE registry: **registered by their owning APR**, not by editing this profile. An APR that imposes a new harness obligation adds a short *Runtime obligations* note declaring it; this profile indexes it. This APR is **closed for modification** (the god-object failure the [metadata-extensibility study](../docs/studies/metadata-extensibility.md) warns against); a machine-readable runtime-obligations registry + checker is the natural evolution if the list proliferates, deferred until it does.

## Scope and applicability

### When this applies

- Any **runtime/harness** that executes promptware written to this corpus — a platform with a loader/orchestrator (the OBSERVE prerequisite).
- Any effort to **certify or audit** a platform as PROMPTARCH-conformant.

### When this does NOT apply

- **Build-time tooling.** Materialization ([APR-004](APR-004-canonical-source.md)) is a build step, not a runtime obligation; it is out of this profile.
- A **single prompt with no loader** — there is no harness to conform.
- The **mechanism.** This is not a runtime spec, reference implementation, or scheduler/bus/store design — it is the interface those must satisfy.

## Governance and validation

*(Shared conformance model — two-tier CI/human, audit-binding, change-via-ADR — per [APR-010](APR-010-governance.md).)*

- **Profile completeness** — every obligation cites a live owner; no entry redefines its owner's rule (Tier 2 review against the owners).
- **Conformance report** — a conformant harness produces a report listing each obligation (R1–R16), its owning-APR governance check, and pass/fail; the report is the artifact a certifier reads (Tier 1 that the report exists and covers the contract; Tier 2 judges completeness of the harness's declared set).
- **No new checks** — this APR MUST NOT introduce a verification not already owned elsewhere; it indexes existing governance sections (Tier 2).
- **Owner-registered extensions** — a new obligation is registered by its owning APR, not added here (Tier 2 at owner-APR review).

## What this principle is NOT

- **Not a runtime, reference implementation, or execution model.** It states the interface a harness satisfies, never the scheduler/bus/store that satisfies it — the corpus-wide "not a runtime" limit, made explicit as a *contract*.
- **Not a new set of requirements.** It defines nothing; every obligation is owned by another APR and the owner wins on conflict.
- **Not [APR-010](APR-010-governance.md).** APR-010 is the conformance *machinery* (two-tier checks, audit-binding); this is the *index of runtime obligations* that machinery verifies. They compose.
- **Not a certification or compliance program.** It gives a checkable profile; it does not issue a certificate or satisfy ISO 42001 / EU AI Act.
- **Not a god-object.** It is closed for modification; obligations are registered by their owners.

## Relationship to established patterns

| Pattern | What it shares | What this APR adds |
|---|---|---|
| IETF **applicability statement** (BCP) — how base protocols must be used together | Collecting cross-cutting "how to use the base specs" into one document | A promptware harness profile: collects by reference, owner-registered, no redefinition |
| Conformance **profiles** (WS-I Basic Profile, PDF/A, USB device classes, OpenGL profiles) | A checkable subset/collection of a larger spec as a conformance target | Obligations owned by separate principles; verification delegated to each owner's checks |
| POSIX / language **conformance suites** | "Does this runtime satisfy the contract?" as a first-class question | The contract is assembled from independent principles, not a monolithic base spec |
| **APR-010** (governance), **APR-014** (metadata registry) — internal precedents | Collect-by-reference; closed-for-modification, open-by-registration | Applies the same consolidation move to the *runtime interface* |

## Adoption notes

- **Start with a conformance report skeleton** — list R1–R16, link each to its owner's governance section, mark current pass/fail. The gaps in that first report *are* your harness backlog.
- **Prioritize the enforce-in-code obligations** (R2 per-call re-derivation, R3 taint, R7 memory scope, R9 fail-closed-in-code) — these are the ones a harness most often only *approximates*, and where the safety consequences of approximation are highest.
- **Treat a missing owner as a finding.** If you can articulate a runtime obligation your harness needs that no APR owns, that is a gap to raise against the corpus, not a row to invent here.

## References

1. Bradner, S. *The Internet Standards Process — Revision 3 (BCP 9 / RFC 2026)* — applicability statements and the standards-track profile mechanism. IETF, 1996. <https://datatracker.ietf.org/doc/html/rfc2026>
2. WS-I. *Basic Profile* — a conformance profile collecting how base web-service specs must be used. <https://www.ws-i.org/>
3. ISO. *ISO 19005 (PDF/A)* — an archival conformance profile of a larger base specification. <https://www.iso.org/standard/38920.html>
4. IEEE/The Open Group. *POSIX (IEEE Std 1003.1)* — runtime conformance to a collected interface contract. <https://pubs.opengroup.org/onlinepubs/9699919799/>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-09 | Draft | Initial draft. Collects the corpus's runtime obligations (R1–R13) into one conformance profile for harnesses, each deferring to its owning APR; verification delegated to owners' existing governance checks; closed-for-modification, extended by owner-registration. Surfaced by the harness-coverage study. |
| 0.2.0 | 2026-07-09 | Draft | Registered **R14** (owner [APR-019](APR-019-identity.md)): the harness references artifacts by canonical `container-id:id` in emitted lineage/audit records and resolves cross-project references only through a declared `dependency` — the first owner-registered extension, exercising the extension model. Added APR-019 to `related`. |
| 0.3.0 | 2026-07-10 | Draft | Registered **R15** (owner [APR-020](APR-020-execution-environment.md)): execute model-invoked tools/code in an isolated, resource-bounded environment with no ambient credentials and default-deny egress. Registered **R16** (owner [APR-022](APR-022-tools.md)): expose tools as schema-validated (input *and* output), effect-tiered, least-privilege contracts with machine-actionable errors. Added APR-020/APR-022 to `related`; R1–R14 → R1–R16. |
