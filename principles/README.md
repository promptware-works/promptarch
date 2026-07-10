# Principles — APR Index

This directory contains the **Architectural Principle Records (APRs)** that are the core deliverable of PROMPTARCH.

For background on what an APR is, see the top-level [`README.md`](../README.md). For the proposal / review / acceptance workflow, see [`meta/apr-process.md`](../meta/apr-process.md). For the status state machine, see [`meta/apr-statuses.md`](../meta/apr-statuses.md). For the frontmatter schema, see [`schemas/apr-frontmatter.schema.yaml`](../schemas/apr-frontmatter.schema.yaml).

## Status legend

| Status | Citable? | Notes |
|---|---|---|
| `Draft` | No | Active authoring; content unstable. |
| `Proposed` | Cautiously | Author considers complete; under review. |
| `Accepted` | **Yes** | Reviewed, merged, frozen content; editorial fixes only. |
| `Deprecated` | No | No replacement; cite historically only. |
| `Superseded` | No | Cite the superseding APR instead. |
| `Withdrawn` | No | Terminal; kept for historical reference. |

## Index

| ID | Name | Title | Status | Version |
|---|---|---|---|---|
| [APR-000](APR-000-promptware.md) | **PROMPTWARE** | A Foundational Position for the PROMPTARCH APR Series | Draft | 0.1.3 |
| [APR-001](APR-001-aspect.md) | **ASPECT** | A Prompt Framework for Agent & Skill Specifications | Draft | 0.2.4 |
| [APR-002](APR-002-observe.md) | **OBSERVE** | A Content-Organization Principle for Agentic Platforms | Draft | 0.1.5 |
| [APR-003](APR-003-code-prompt-boundary.md) | — | A Code/Prompt Boundary Principle for Promptware | Draft | 0.1.3 |
| [APR-004](APR-004-canonical-source.md) | — | A Canonical-Source and Materialization Principle for Runtime-Independent Promptware | Draft | 0.1.1 |
| [APR-005](APR-005-trust-boundaries.md) | — | A Trust-Boundary and Untrusted-Input Principle for Promptware | Draft | 0.2.0 |
| [APR-006](APR-006-composition-topology.md) | — | A Composition and Delegation-Topology Principle for Multi-Agent Promptware | Draft | 0.1.1 |
| [APR-007](APR-007-pattern-mechanism.md) | — | A Pattern Principle for Reusable, Declaratively-Applied Promptware Behavior | Draft | 0.1.0 |
| [APR-008](APR-008-artifact-lifecycle.md) | — | An Artifact-Lifecycle and Model-Migration Principle for Promptware | Draft | 0.1.0 |
| [APR-009](APR-009-human-in-the-loop.md) | — | A Human-in-the-Loop Oversight-Placement Principle for Promptware | Draft | 0.1.0 |
| [APR-010](APR-010-governance.md) | — | A Governance Principle for Promptware Conformance | Draft | 0.1.0 |
| [APR-011](APR-011-observability.md) | — | An Observability and Cost-Governance Principle for Promptware | Draft | 0.1.0 |
| [APR-012](APR-012-federated-composition.md) | — | A Federated-Composition Principle for Promptware Across Trust Domains | Draft | 0.1.0 |
| [APR-013](APR-013-artifact-graph.md) | — | An Artifact-Graph Principle for Promptware | Draft | 0.3.0 |
| [APR-014](APR-014-declare.md) | **DECLARE** | A Declared-Classification Contract for Promptware Components | Draft | 0.1.0 |
| [APR-015](APR-015-context-assembly.md) | — | A Context-Assembly and Window-Discipline Principle for Promptware | Draft | 0.2.0 |
| [APR-016](APR-016-memory.md) | — | A Memory and State-Lifecycle Principle for Promptware | Draft | 0.2.1 |
| [APR-017](APR-017-graceful-degradation.md) | — | A Graceful-Degradation and Failure-Handling Principle for Promptware | Draft | 0.2.0 |
| [APR-018](APR-018-runtime-contract.md) | — | A Runtime-Conformance Profile for Promptware Harnesses | Draft | 0.3.0 |
| [APR-019](APR-019-identity.md) | — | A Project & Node Identity and Provenance Principle for Promptware | Draft | 0.3.0 |
| [APR-020](APR-020-execution-environment.md) | — | An Execution-Environment and Sandboxing Principle for Promptware | Draft | 0.1.0 |
| [APR-021](APR-021-evaluation.md) | — | An Evaluation and Regression-Gate Principle for Promptware | Draft | 0.1.0 |
| [APR-022](APR-022-tools.md) | — | A Tool-Contract and Least-Privilege Principle for Promptware | Draft | 0.1.0 |

APR-000 is the project's foundational position — start there if you are new to PROMPTARCH or evaluating whether the APR series applies to your work. APR-001 onward are normal principle records.

Each APR also has a token-efficient **[digest](digests/)** — an injectable summary (~1k tokens vs 3–7k) for feeding to an LLM while building promptware. The full APR is always canonical; see [`digests/README.md`](digests/README.md).

## Reading guides

Two orthogonal cuts over the index above — a conceptual tour (**by concern**) and a grain-of-system tour (**by operational scope**). Both are navigation aids; the numbered index above remains authoritative. Both are also independent of an APR's `class` (`architectural | implementation | process`): scope says *where* a principle applies, `class` says *what kind* of record it is. The numbers themselves are stable citation IDs assigned in drafting order (RFC-style) — **not** a ranking or reading sequence, so an APR may reference a higher-numbered one (see [`meta/apr-numbering.md`](../meta/apr-numbering.md)).

### By concern

For a conceptual tour, the principles group into four layers:

- **Foundations** — [APR-000](APR-000-promptware.md) (what promptware is) · [APR-010](APR-010-governance.md) (how conformance is governed) · [APR-018](APR-018-runtime-contract.md) (the runtime contract a harness must satisfy)
- **Specifying a component** — [APR-001](APR-001-aspect.md) ASPECT · [APR-014](APR-014-declare.md) DECLARE (frontmatter classification) · [APR-003](APR-003-code-prompt-boundary.md) code/prompt boundary · [APR-007](APR-007-pattern-mechanism.md) patterns · [APR-022](APR-022-tools.md) tool contracts
- **Organizing the platform** — [APR-002](APR-002-observe.md) OBSERVE · [APR-004](APR-004-canonical-source.md) canonical source · [APR-006](APR-006-composition-topology.md) composition · [APR-012](APR-012-federated-composition.md) federated composition · [APR-013](APR-013-artifact-graph.md) artifact graph · [APR-019](APR-019-identity.md) identity & provenance · [APR-015](APR-015-context-assembly.md) context assembly
- **Operating safely over time** — [APR-005](APR-005-trust-boundaries.md) trust boundaries · [APR-020](APR-020-execution-environment.md) execution environment · [APR-008](APR-008-artifact-lifecycle.md) lifecycle · [APR-009](APR-009-human-in-the-loop.md) human-in-the-loop · [APR-011](APR-011-observability.md) observability & cost · [APR-021](APR-021-evaluation.md) evaluation · [APR-016](APR-016-memory.md) memory & state · [APR-017](APR-017-graceful-degradation.md) graceful degradation

### By operational scope

The other cut: **which grain of an agentic system a principle governs.** The grain is set by the **trust domain** — a single component, one runtime (a structured agent and its subagents inside one trust domain), or several agents across trust domains. Most principles are cross-cutting; the ones that are grain-specific cluster cleanly.

- **Agent** — one component / agent / skill in isolation: [APR-001](APR-001-aspect.md) ASPECT · [APR-003](APR-003-code-prompt-boundary.md) code/prompt boundary · [APR-007](APR-007-pattern-mechanism.md) patterns · [APR-014](APR-014-declare.md) DECLARE.
- **Harness** — *one runtime / one trust domain*: a **structured agent and its subagents**, and the loader/orchestrator that runs them: [APR-002](APR-002-observe.md) OBSERVE (loader) · [APR-006](APR-006-composition-topology.md) delegation topology · [APR-015](APR-015-context-assembly.md) context assembly · [APR-016](APR-016-memory.md) memory · [APR-017](APR-017-graceful-degradation.md) graceful degradation · [APR-018](APR-018-runtime-contract.md) runtime profile · [APR-020](APR-020-execution-environment.md) execution environment · [APR-022](APR-022-tools.md) tool contracts.
- **Multi-agent** — *across trust domains* (federation; each participant runs its own harness): [APR-012](APR-012-federated-composition.md) federated composition.
- **Cross-cutting** — apply at every grain: [APR-000](APR-000-promptware.md) · [APR-004](APR-004-canonical-source.md) · [APR-005](APR-005-trust-boundaries.md) · [APR-008](APR-008-artifact-lifecycle.md) · [APR-009](APR-009-human-in-the-loop.md) · [APR-010](APR-010-governance.md) · [APR-011](APR-011-observability.md) · [APR-013](APR-013-artifact-graph.md) · [APR-019](APR-019-identity.md) · [APR-021](APR-021-evaluation.md) evaluation.

The **structured-agent (harness) → multi-agent (federation)** step is the same **trust-domain boundary** the corpus draws as *containment vs. dependency* ([APR-013](APR-013-artifact-graph.md)/[APR-019](APR-019-identity.md)): subagents are contained within one domain (intra-domain delegation, APR-006), while cross-domain agents federate (APR-012).

A few principles **span grains** and are listed under their home above with this note: [APR-005](APR-005-trust-boundaries.md) runs agent → multi-agent (trust propagates across every hop); [APR-006](APR-006-composition-topology.md) covers subagent delegation *and* intra-domain multi-agent topology; [APR-016](APR-016-memory.md) is harness memory but scopes cross-agent sharing; [APR-018](APR-018-runtime-contract.md) is a harness profile that **indexes obligations at every grain** (e.g. R13 federation, R14 identity). This is a reading aid, not a partition — an APR may belong to more than one grain.

## Conventions

- **Filename**: `APR-NNN-<short-slug>.md` (lowercase, kebab-case). The slug is the mnemonic where one exists (`aspect`, `observe`); a descriptive slug otherwise (`code-prompt-boundary`). A `—` in the **Name** column above means the APR has no mnemonic — see [`meta/apr-numbering.md`](../meta/apr-numbering.md#L73-L75).
- **Canonical ID**: `APR-NNN`, used in citations and cross-references.
- **Frontmatter**: every APR begins with YAML frontmatter conforming to [`schemas/apr-frontmatter.schema.yaml`](../schemas/apr-frontmatter.schema.yaml).

## Authoring a new APR

Copy [`_template/APR-NNN-template.md`](_template/APR-NNN-template.md) to a new file, replacing `NNN` with your assigned ID (see [`meta/apr-numbering.md`](../meta/apr-numbering.md)). Fill in the frontmatter, write the prose, open a PR. See [`meta/apr-process.md`](../meta/apr-process.md) for the full workflow.
