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
| [APR-005](APR-005-trust-boundaries.md) | — | A Trust-Boundary and Untrusted-Input Principle for Promptware | Draft | 0.1.1 |
| [APR-006](APR-006-composition-topology.md) | — | A Composition and Delegation-Topology Principle for Multi-Agent Promptware | Draft | 0.1.1 |
| [APR-007](APR-007-pattern-mechanism.md) | — | A Pattern Principle for Reusable, Declaratively-Applied Promptware Behavior | Draft | 0.1.0 |
| [APR-008](APR-008-artifact-lifecycle.md) | — | An Artifact-Lifecycle and Model-Migration Principle for Promptware | Draft | 0.1.0 |

APR-000 is the project's foundational position — start there if you are new to PROMPTARCH or evaluating whether the APR series applies to your work. APR-001 onward are normal principle records.

Each APR also has a token-efficient **[digest](digests/)** — an injectable summary (~1k tokens vs 3–7k) for feeding to an LLM while building promptware. The full APR is always canonical; see [`digests/README.md`](digests/README.md).

## Conventions

- **Filename**: `APR-NNN-<short-slug>.md` (lowercase, kebab-case). The slug is the mnemonic where one exists (`aspect`, `observe`); a descriptive slug otherwise (`code-prompt-boundary`). A `—` in the **Name** column above means the APR has no mnemonic — see [`meta/apr-numbering.md`](../meta/apr-numbering.md#L73-L75).
- **Canonical ID**: `APR-NNN`, used in citations and cross-references.
- **Frontmatter**: every APR begins with YAML frontmatter conforming to [`schemas/apr-frontmatter.schema.yaml`](../schemas/apr-frontmatter.schema.yaml).

## Authoring a new APR

Copy [`_template/APR-NNN-template.md`](_template/APR-NNN-template.md) to a new file, replacing `NNN` with your assigned ID (see [`meta/apr-numbering.md`](../meta/apr-numbering.md)). Fill in the frontmatter, write the prose, open a PR. See [`meta/apr-process.md`](../meta/apr-process.md) for the full workflow.
