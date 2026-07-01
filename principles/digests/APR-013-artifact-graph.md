# APR-013 — Artifact Graph — Digest

> **Generated digest of [APR-013 — An Artifact-Graph Principle for Promptware](../APR-013-artifact-graph.md) v0.2.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** A project's canonical state is one append-only graph of versioned artifact nodes across the lifecycle, joined by checkable typed edges. Traceability is a path through them, emitted as a side effect of production; other tools are projections, not parallel systems of record.

**Principle.** Treat the project's canonical state as one append-only, typed graph of all lifecycle artifacts and the relationships between them. Produce the edges as a side effect of producing the nodes, and treat every tool as a projection of the graph rather than a second source of record.

## Nodes and typed edges

- **Nodes** are versioned lifecycle artifacts: intent, requirements/use cases, decision records + the studies grounding them, design, code (in promptware: ASPECT components + OBSERVE content), tests, deployment specs, run logs. Each node's version/status/lineage is **APR-008's** job; this APR governs the edges between nodes.
- **Edges** are typed and directional: `derives-from`, `satisfies`, `verifies`, `justified-by`/`informed-by`, `supersedes` (the APR-008 lineage pointer as an edge), `depends-on`/`contradicts`. Adopters MAY extend the vocabulary but MUST declare it.

## Traceability by construction

- Traceability is **a path through the edges** (intent → requirement → design → code → test), not a separate document.
- The producing agent MUST **emit an artifact's edges in the same step that creates the node**, so traceability is a side effect of production, not a maintained artifact.

## Integrity guarantees (the slots OBSERVE leaves open)

1. **No orphan nodes** — a node MUST enter with ≥1 edge to an existing node.
2. **Edges are checkable, not decorative** — an edge MUST be substantiable (a `verifies` edge only if the test exercises its target); structural checkability is mandatory, semantic is adopter-pluggable.
3. **History is append-only** — nodes are superseded, never silently overwritten.

## Divergence and reconciliation

- A human edit to a projection MUST re-enter the graph as a new node; any edge it invalidates is marked **stale** and reconciled — automatically, or via an APR-009 HITL gate.
- Tools are projections connected by adapters; an unreconcilable projection is kept **read-only**. The graph is authoritative not because nothing else may write, but because every write is reconciled back into it.

## Baselines

- The append-only graph MAY be **baselined** at a gate: a signed, immutable checkpoint that later evolution `supersedes` without erasing — reconciling living artifacts with audit's need for a frozen reference.

## Governance checks

No orphans (every non-root node has an inbound edge) · edge legality + checkability (declared vocabulary, target exists, substantiable) · append-only (change is supersession, not overwrite) · reconciliation (projections write back; stale edges surfaced) · baseline integrity (immutable, signed, chain intact). Storage-agnostic: files-with-frontmatter or a graph DB.

## Scope limits — do NOT misapply

Not APR-006's runtime *delegation* graph · not APR-011's *runtime execution* traceability (this is authoring/derivation lineage) · not APR-008's per-artifact lifecycle (this is the edges between nodes) · not OBSERVE's content SoT (this is the cross-artifact layer above it) · not a mandate for RDF/triplestore/graph-DB · not a version-control system.

---
*Source: [APR-013 — An Artifact-Graph Principle for Promptware](../APR-013-artifact-graph.md) v0.2.0 · regenerate this digest whenever the source changes.*
