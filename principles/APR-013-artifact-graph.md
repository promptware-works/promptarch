---
apr: 13
title: "An Artifact-Graph Principle for Promptware"
abstract: "A container's canonical state — a project at the root, optionally nested into a tree of sub-containers, each owning a subgraph — is one append-only graph of versioned artifact nodes across the lifecycle, joined by checkable typed edges. Traceability is a path through them, emitted as a side effect of production; other tools are projections, not parallel systems of record. This APR owns the graph's structure; the identity of containers and nodes is APR-019's."
status: Draft
class: architectural
version: 0.3.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic)"
created: 2026-06-20
last-updated: 2026-06-20
audience: Architects and framework authors of agentic AI platforms; teams running an AI-driven SDLC where AI produces most artifacts
supersedes: []
superseded-by: []
related:
  - APR-002
  - APR-004
  - APR-006
  - APR-008
  - APR-011
tags:
  - artifact-graph
  - single-source-of-truth
  - traceability
  - provenance
  - append-only
  - baselines
---

# APR-013 — An Artifact-Graph Principle for Promptware

> **A project's canonical state is a single, append-only graph of versioned artifact nodes spanning the whole lifecycle — nested into a tree of containers, each owning a subgraph, when the project is large enough to warrant it — joined by checkable typed edges; traceability is a path through those edges, emitted as a side effect of producing each artifact, and every other tool is a projection of the graph rather than a parallel system of record.**

*Injectable summary (for feeding to an LLM): [`digests/APR-013-artifact-graph.md`](digests/APR-013-artifact-graph.md). This full APR is canonical.*

## Motivation

When AI produces most of a project's artifacts, the rate of artifact creation outruns the human bookkeeping that traditionally connects them. Two gaps follow:

- **No canonical cross-artifact state.** [APR-002 OBSERVE](APR-002-observe.md) makes *content* canonical and enforces "no orphans" within the content set; [APR-008](APR-008-artifact-lifecycle.md) versions *each artifact* on its own timeline. But nothing in the corpus makes the **relationships between different artifact kinds** — intent → requirement → decision → design → code → test → deployment — first-class. Project knowledge fragments across ticketing, wikis, repos, design tools, and chat threads, each authoritative for a slice, none for the whole.
- **Traceability and rationale are maintained by hand, so they rot.** The link from an intent to the test that validates it, and the *why* behind a design choice, live in people's heads and stale documents. When AI generates faster than humans can read, hand-maintained trace links and decision records are the first casualties — exactly when they matter most for review and audit.

## The principle

> **Treat the project's canonical state as one append-only, typed graph of all lifecycle artifacts and the relationships between them. Produce the edges as a side effect of producing the nodes, and treat every tool as a projection of the graph rather than a second source of record.**

Two halves: a **structural** claim (the graph is the system of record — typed nodes and typed edges across the lifecycle, with traceability as a path) and a **disciplinary** claim (the graph is governed — integrity guarantees, reconciled projections, signed baselines).

## Scope and applicability

### When this applies

- Projects — especially AI-driven SDLCs — where artifacts across the *whole* lifecycle (intent, requirements, decision records, design, code/promptware, tests, deployment specs, run logs) must stay mutually traceable, and where AI produces enough of them that manual linkage is infeasible.

### When this does NOT apply

- The **runtime delegation graph** of a running multi-agent system — that is [APR-006](APR-006-composition-topology.md)'s graph (agents/skills as nodes, *delegations* as edges), a different graph entirely.
- **Runtime execution traceability** (tracing one request across the delegation graph) — that is [APR-011](APR-011-observability.md). This APR traces *authoring/derivation lineage* across SDLC artifacts, not a live execution.
- The **inner versioning/status/lineage of a single artifact** — that is [APR-008](APR-008-artifact-lifecycle.md); this APR places those versioned artifacts in a typed graph, it does not re-own their lifecycle.
- Small or short-lived efforts where one repository's directory layout and git history already make the relationships obvious. The graph is overkill when there is nothing to lose track of.

## Nodes and typed edges

- **Nodes** are versioned, individually addressable lifecycle artifacts: *intent*, *requirements / use cases*, *decision records* and the *studies* that ground them, *design*, *code* (in promptware, the [APR-001 ASPECT](APR-001-aspect.md) components and [APR-002 OBSERVE](APR-002-observe.md) content), *tests* and results, *deployment specs*, and *run logs*. Each node's version, status, and lineage are governed by [APR-008](APR-008-artifact-lifecycle.md); this APR governs the edges *between* nodes.
- **Edges** are typed and directional. The baseline vocabulary: `derives-from`, `satisfies`, `verifies`, `justified-by` / `informed-by` (a node justified by a decision record, itself informed by studies and requirements), `supersedes` (the [APR-008](APR-008-artifact-lifecycle.md) lineage pointer, recorded as a graph edge), and `depends-on` / `contradicts` for impact analysis and conflict detection. Adopters MAY extend the vocabulary; they MUST declare it in the artifact-graph config (below).

## Containers and scope

A graph always belongs to a **container** — the unit that owns it. A **project** is the *root* container; larger efforts nest, so a container **MAY** be `part-of` a parent container, forming a **tree of containers** in which each owns a **subgraph**. A container's subgraph is exactly the set of nodes whose `container-id` names it (see below); a project's full state is the union of its own subgraph and its descendants'.

This is the **structure** half of a two-level model; the **identity** half is [APR-019](APR-019-identity.md):

| | **Structure — this APR** | **Identity — APR-019** |
|---|---|---|
| **Container / scope** | a container owns a (sub)graph; containers nest via `part-of` | the container's id (reverse-DNS), owner, institution, and its `parent` link |
| **Artifact / node** | the node and its typed edges — its place in the graph | the node's `id` and canonical `container-id : id` |

Concretely:

- **Membership by attribute, nesting by edge.** A node attaches to its **innermost** container through the top-level `container-id` attribute (a foreign key, not an edge — so membership does not inflate the edge set). The **containment tree** itself is expressed with `part-of` edges between *container* nodes: a container **MAY** be represented as a node of `type: container` whose payload is its manifest ([APR-019](APR-019-identity.md)), letting `part-of` connect a child container to its parent like any other typed edge.
- **The integrity guarantees are per-container.** `roots` (the no-orphan exemptions) and the no-orphan rule apply **within each subgraph**: every container has its own entry points. A node MUST have an inbound edge within its container's subgraph unless it is a declared root of that container.
- **Intra-tree edges stay in one trust domain; cross-tree edges are federation.** An edge between two containers of the **same root project** is an ordinary intra-project edge (same trust domain). An edge whose target lives under a **foreign** root container is a cross-project reference — permitted only through a declared dependency, and governed as [federated composition](APR-012-federated-composition.md); [APR-019](APR-019-identity.md) draws this **containment-vs-dependency** line and supplies the identity that makes each addressable.

Containment is thus a *structural* relation owned here; what a container **is** — its id, its `parent`, its owner — is declared once in its manifest and governed by [APR-019](APR-019-identity.md). A project with no sub-containers is simply the degenerate tree of one root container, and `container-id` equals its `project.id`.

## The artifact-graph config

The graph's **vocabulary and scan rules** are declared in a project-level config, [`registries/artifact-graph.yaml`](../registries/artifact-graph.yaml): the `node-types` (including the optional `container` type) and `edge-types` (including `part-of` for the containment tree) a project allows, the `node-attributes` every node declares (`id` + `container-id` + `type` + `title` are the mandatory identity — the globally-canonical id is `container-id:id`, governed by [APR-019](APR-019-identity.md) — plus optional `description` and its typed `edges`), the `roots` exempt from the no-orphan rule, and the `include` / `ignore` globs the kernel scans. It is the **artifact-side sibling** of the component-metadata registry ([APR-014](APR-014-declare.md)): that one governs a *component's* frontmatter fields; this one governs the *artifact graph* across all node types — most of which (requirements, tests, run logs) are not components. Adopters extend the vocabulary by editing this config, not this principle, and it is validated in CI (`tools/graph/check-graph.ts`).

**Node attributes are top-level on every artifact.** A node declares its `id`, `container-id`, `type`, `title`, and `edges` at the **top level** of its own frontmatter — uniformly, whether or not it is a promptware component. `container-id` is the foreign key to its innermost container ([APR-019](APR-019-identity.md)), and its globally-canonical id is `container-id:id`. A component is *both* a node and a component: its node attributes sit top-level (governed here), **beside — not inside** — its component `metadata` block (governed by [APR-014](APR-014-declare.md)). The graph kernel therefore reads `id` / `container-id` / `type` / `edges` identically from every scanned file (a bare `requirement.md` has no `metadata` block at all), and neither the edge vocabulary nor the identity scheme is duplicated into the component-metadata registry.

`supersedes` appears in the edge-type vocabulary but is **not** redefined here: it is `core.provenance.supersedes` (owned by [APR-008](APR-008-artifact-lifecycle.md)), recorded as a graph edge — the graph *derives* the edge from the provenance field rather than owning a second copy.

## Traceability by construction

- Traceability is **a path through the edges**, not a separate document. The chain *intent → requirement → design → code → test* is a graph traversal.
- The producing agent **MUST emit an artifact's edges in the same step that creates the node** — when it writes code to satisfy a requirement, it records the `satisfies` edge as part of that action, not as a later documentation task. Traceability is then a side effect of production, not a maintained artifact.

## Integrity guarantees

The graph is only trustworthy if three properties hold — and they are exactly the properties [APR-002 OBSERVE](APR-002-observe.md) leaves open (OBSERVE has a no-orphans rule for content but explicitly disclaims being a knowledge graph and being append-only):

1. **No orphan nodes.** A node MUST enter the graph with at least one edge to an existing node. A node with no inbound `derives-from` is a defect, surfaced like an undeclared variable.
2. **Edges are checkable, not decorative.** An edge MUST be substantiable: a `verifies` edge is valid only if the test actually exercises its target; a `satisfies` edge is subject to review at a gate. Unsubstantiated edges are flagged, not trusted. (Structural checkability — target exists, edge type legal — is mandatory; semantic checkability is adopter-pluggable.)
3. **History is append-only.** Nodes are superseded, never silently overwritten, so every path remains reconstructable for audit.

## Divergence and reconciliation

- Because humans still edit projections directly (a developer patches code, a stakeholder rewrites a requirement), the graph and reality can drift. Divergence is a **first-class event**, not an error to suppress.
- A human edit to a projection **MUST re-enter the graph** as a new node with its own edges; any edge it invalidates (a `satisfies` whose code no longer matches) is marked **stale** and raised for reconciliation — automatically where possible, through a [APR-009](APR-009-human-in-the-loop.md) HITL gate where not.
- The graph is therefore authoritative **not because nothing else may write, but because every write is reconciled back into it.** Tools are projections connected by adapters; a projection that cannot be reconciled is kept read-only rather than allowed to become a second source of record. (This is the same move as [APR-004](APR-004-canonical-source.md)'s "vendor homes are build artifacts, not sources," generalized from runtime materialization to the whole artifact graph.)

## Baselines

- Because history is append-only, the graph MAY be **baselined** at any gate: a signed, immutable checkpoint — "this is what we agreed to build, and verified, at time *T*" — that later evolution `supersedes` without erasing.
- Baselining reconciles **living artifacts with audit**: requirements keep evolving while each baseline gives an auditor a frozen reference, and the path between two baselines is itself the record of what changed and why.

## Prescription

- A project adopting this APR **MUST** designate one artifact graph as the canonical state and treat all other tools as projections of it.
- Producing agents **MUST** emit typed edges as a side effect of creating nodes; edges **MUST** use a declared vocabulary.
- The graph **MUST** satisfy the three integrity guarantees (no orphans; structurally checkable edges; append-only history). Semantic edge-checking **SHOULD** be applied where the domain admits it.
- Divergence between a projection and the graph **MUST** be reconciled back into the graph; an unreconcilable projection **MUST** be read-only.
- Baselines, where used, **MUST** be immutable and signed, and **MUST NOT** erase the history they checkpoint.
- The graph **MAY** be stored as files with typed-edge frontmatter, or exported to a graph database; this APR mandates the *properties*, not the *storage*.

## Governance and validation

The shared governance model — two-tier enforcement, audit-log binding, and change-via-ADR — is defined in [APR-010](APR-010-governance.md); the checks below are this APR's domain-specific additions.

A conformant platform checks, in review or CI:

- **No orphans** — every node (except declared roots) has at least one inbound edge.
- **Edge legality and checkability** — every edge uses the declared vocabulary, names an existing target, and is structurally substantiable; `verifies`/`satisfies` edges that cannot be substantiated are flagged.
- **Append-only** — no node is mutated in place when consumers depend on it; change is supersession, not overwrite.
- **Reconciliation** — projections write back into the graph; stale edges are surfaced, not silently dropped.
- **Baseline integrity** — baselines are immutable and signed; the chain between baselines is intact.

## What this principle is NOT

- **Not APR-006's delegation graph.** That graph's nodes are runtime agents/skills and its edges are delegations; this graph's nodes are SDLC artifacts and its edges are derivation relationships.
- **Not APR-011's runtime traceability.** That traces a live execution; this traces authoring lineage across artifacts.
- **Not APR-008's per-artifact lifecycle.** APR-008 versions each node; this connects the versioned nodes with typed edges.
- **Not OBSERVE's content source of truth.** APR-002 makes *content* canonical and walks it for injection; this is the cross-artifact graph layer above it, and it claims the append-only/knowledge-graph slots OBSERVE deliberately left open.
- **Not a mandate for RDF, a triplestore, or a graph database.** The graph is a set of properties; files with typed-edge frontmatter satisfy it.
- **Not a version-control system.** Git remains the substrate; this is the discipline on top.
- **Not a runtime container.** A "container" here is an authoring-time ownership scope for a subgraph — *not* an OCI/Docker sandbox an agent executes in (that is runtime isolation, [APR-018](APR-018-runtime-contract.md)). And a container's *identity* — its id, `parent`, owner — is [APR-019](APR-019-identity.md)'s; this APR owns only its structural role.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Requirements Traceability Matrix** (Gotel & Finkelstein) | Linking requirements forward to design/code/tests | Generated as a side effect of AI production; a typed *graph* across the whole lifecycle, not a hand-kept matrix |
| **Knowledge graphs / RDF** (W3C) | Typed nodes and typed relations as data | A bounded, project-scoped artifact vocabulary with integrity guarantees; storage-agnostic, no RDF/SPARQL mandate |
| **Provenance** (W3C PROV) | Recording what derived from what | Forward *and* backward traceability with checkable, reconciled edges and signed baselines, scoped to SDLC artifacts |
| **Event sourcing** (Fowler) | Append-only history, state as a fold over events | Applied to a heterogeneous artifact graph, with baselines as signed checkpoints |
| **Build dependency graphs** (Bazel) | A typed DAG of artifacts driving derivation | Spans non-code artifacts (intent, decisions, requirements) and is authored by AI, not just compiled |
| **Architecture Decision Records** (Nygard) | Durable, citable rationale | ADRs become first-class nodes with `informed-by` edges to the studies that ground them |
| **Monorepo workspaces / nested modules** (Bazel packages, npm/Cargo workspaces, Maven multi-module) | A root that nests sub-units, each with its own scope and a shared root identity | Containers nest the *artifact graph* (not just code): each owns a subgraph with its own roots, joined by `part-of`, with identity governed by [APR-019](APR-019-identity.md) |

The novel contribution is a **promptware-specific source-of-truth principle**: the canonical project state is one append-only, typed artifact graph spanning the lifecycle, whose edges are emitted by AI as a side effect of production and kept honest by no-orphan / checkable-edge / append-only guarantees — the cross-artifact layer that APR-002, APR-006, APR-008, and APR-011 each deliberately leave to a neighbor.

## Adoption notes

- **Start with the edges you already imply.** Most teams already produce requirements, code, and tests; begin by emitting `derives-from`/`satisfies`/`verifies` between them before adding decision and study nodes.
- **Files-with-frontmatter first.** Typed-edge YAML frontmatter over a git repo satisfies the principle with no new infrastructure; reach for a graph database only when traversal scale demands it.
- **Make checkability structural before semantic.** Validate that targets exist and edge types are legal in CI on day one; add semantic checks (does this test exercise its target?) per-domain later.
- **Treat baselines as gate outputs.** Cut a signed baseline at each human approval gate; the path between baselines is your audit trail for free.

## References

External sources cited in this APR; see *Relationship to established patterns* for how each relates.

1. Gotel, O. & Finkelstein, A. *An Analysis of the Requirements Traceability Problem*. Proc. ICRE, 1994. <https://doi.org/10.1109/ICRE.1994.292398>
2. W3C. *PROV-O: The PROV Ontology*. W3C Recommendation, 2013. <https://www.w3.org/TR/prov-o/>
3. W3C. *RDF 1.1 Concepts and Abstract Syntax*. W3C Recommendation, 2014. <https://www.w3.org/TR/rdf11-concepts/>
4. Fowler, M. *Event Sourcing*. 2005. <https://martinfowler.com/eaaDev/EventSourcing.html>
5. Bazel. *Build and test software of any size, quickly and reliably*. <https://bazel.build/>
6. Nygard, M. *Documenting Architecture Decisions*. 2011. <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions>
7. Pan, Y. et al. *Prometheus: Towards Long-Horizon Codebase Navigation for Repository-Level Problem Solving*. arXiv:2507.19942, 2025. <https://arxiv.org/abs/2507.19942>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-06-20 | Draft | Initial draft published as APR-013. |
| 0.2.0 | 2026-07-01 | Draft | Added §The artifact-graph config: the graph's vocabulary and node model live in a project-level config ([`registries/artifact-graph.yaml`](../registries/artifact-graph.yaml)) — `node-types`, `edge-types`, `node-attributes` (`id`/`type`/`title`/`description`/`edges`), `roots`, `include`/`ignore` — the artifact-side sibling of the component-metadata registry (APR-014), with its own schema + CI checker (`tools/graph/check-graph.ts`). Noted `supersedes` derives from `core.provenance` (APR-008), not redefined. |
| 0.2.1 | 2026-07-01 | Draft | Clarified that node attributes (`id` / `type` / `title` / `edges`) are declared **top-level** on every artifact — uniform across all node types; for a component they sit beside, not inside, its `metadata` block, so the edge vocabulary is never duplicated into the component-metadata registry. |
| 0.2.2 | 2026-07-09 | Draft | Added `project-id` to the mandatory node identity and the canonical-id rule `project-id:id`, governed by the new [APR-019](APR-019-identity.md) (Identity & Provenance); cross-referenced it from the config section and the top-level-attributes note. |
| 0.3.0 | 2026-07-09 | Draft | Introduced **containers** as the graph-owning scope (a project is the root container; containers nest via `part-of`, each owning a subgraph, with per-container roots and the intra-tree vs cross-tree/federation distinction). Added §Containers and scope with the structure-vs-identity (container/artifact) 2×2. Generalized the node identity FK `project-id` → **`container-id`** (canonical id `container-id:id`); added the optional `container` node-type and `part-of` edge-type. Container *identity* (id, `parent`, owner) is [APR-019](APR-019-identity.md)'s; disambiguated from OCI/runtime containers. |
