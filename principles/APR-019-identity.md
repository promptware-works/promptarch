---
apr: 19
title: "A Project & Node Identity and Provenance Principle for Promptware"
abstract: "Every promptware artifact carries a stable, globally-resolvable identity — a local id canonicalised as container.id:node.id, where a container is the graph-owning scope and a project is its root. Each container declares its identity and accountable owner once, in a manifest; containers nest (a sub-container is part-of its parent, its id extending the parent's), and provenance is resolvable from the canonical id alone by walking that chain, without the surrounding graph. Containment stays in one trust domain; edges to a foreign project resolve through declared dependencies. This APR owns identity; the graph's structure is APR-013's."
status: Draft
class: architectural
version: 0.3.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-09
last-updated: 2026-07-09
audience: Architects and platform authors organising promptware artifacts across projects; anyone needing citable, provenance-bearing identity for agents, skills, and lifecycle artifacts
supersedes: []
superseded-by: []
related:
  - APR-008
  - APR-010
  - APR-012
  - APR-013
  - APR-014
tags:
  - identity
  - provenance
  - project-manifest
  - canonical-id
  - federation
---

# APR-019 — A Project & Node Identity and Provenance Principle for Promptware

> **Every promptware artifact carries a stable, globally-resolvable identity — a local `id`, canonicalised as `container.id : node.id`, where a container is the graph-owning scope and a project is its root. Every container declares its identity and accountable owner once, in a manifest, and containers nest. Provenance is then addressable from the id alone, without the surrounding graph.**

*Injectable summary (for feeding to an LLM): [`digests/APR-019-identity.md`](digests/APR-019-identity.md). This full APR is canonical.*

## Motivation

[APR-013](APR-013-artifact-graph.md) makes a project's state an append-only graph of typed nodes. But a node's `id` is only unique *within* one graph: `REQ-001` is meaningless out of context, and two projects' `REQ-001`s collide. Extract a node from its repo and you cannot tell which project it belongs to, who owns it, or where it came from — its **provenance is lost**. The same gap applies to a component ([APR-014](APR-014-declare.md)) shared across projects, and to an edge that reaches into a *foreign* project ([APR-012](APR-012-federated-composition.md)).

Two things are missing: a **globally-unique, resolvable identity** for each artifact, and a **single, authoritative record of identity and accountability** that the id resolves to. Without them, traceability holds only inside one repo, federation has nothing to point at, and audit cannot answer "who is responsible for this artifact?"

Identity therefore has **two levels of granularity**: the **container** — the base unit that owns the graph (a project, a sub-project, or any nested scope) — and the **artifact** — each individual node within it. [APR-013](APR-013-artifact-graph.md) gives these their *structure* (a container owns a subgraph; nodes and edges shape it); this APR gives them their *identity* (what each is called, and whose it is).

## The principle

> **Every artifact has a local `id` and a canonical, container-qualified id `container.id : node.id`. A *container* is the unit that owns a graph and issues ids; a *project* is the root container, and containers nest. Each container declares its identity — a globally-unique id, its owner, its institution, and its `parent` — once, in a manifest. An artifact's provenance is resolvable from its canonical id alone: `container.id` names the manifest that carries (or inherits) the accountable owner.**

This is the **identity** half of a two-level model whose **structure** half is [APR-013](APR-013-artifact-graph.md): identity has a *container* granularity (who owns the graph) and an *artifact* granularity (which node), and this APR names both while APR-013 shapes both. Four claims:

1. **Container vs. project.** A container is any graph-owning scope; a project is the root container. Everything here applies to containers — where a project has no sub-containers, its one container *is* the project, and `container.id` = `project.id`.
2. **Local vs. canonical.** `id` is container-unique and human-readable for internal use; `container.id : node.id` is globally unique for external / cross-container use. Both name the same node.
3. **Identity is declared once.** Container identity and attribution live in one manifest (a [canonical source](APR-004-canonical-source.md)); artifacts *reference* `container.id`, never copy the manifest's contents.
4. **Provenance follows the id.** From a bare canonical id you resolve the container, then its owner and institution — walking `parent` for anything a sub-container inherits — no graph required.

## Scope and applicability

### When this applies

- Any project whose artifacts are addressed, cited, or shared beyond a single repo.
- Any [artifact graph](APR-013-artifact-graph.md) whose nodes must be globally unique or that edges across projects ([APR-012](APR-012-federated-composition.md)).

### When this does NOT apply

- A throwaway or single-file experiment with no external references and no graph.
- This APR governs *identity and provenance* — not the graph's structure ([APR-013](APR-013-artifact-graph.md)), the component frontmatter contract ([APR-014](APR-014-declare.md)), or lifecycle/versioning ([APR-008](APR-008-artifact-lifecycle.md)).

## The project manifest

Project identity lives in a single root **`project.yaml`** — the single source of truth, *read* (never copied) by nodes and tooling:

```yaml
project:
  id: works.promptware.promptarch     # canonical, globally-unique (reverse-DNS)
  title: PROMPTARCH
  description: "…"
  # parent: works.promptware          # omit for a root project; a sub-container's id MUST extend its parent's
  type: research                      # research | industrial | governmental | … (extensible)
  domain: [software-architecture, agentic-ai]
  version: 0.5.0                      # optional
  owner: "D. Maxios"                  # accountable owner; MAY be an ORCID
  institution: "promptware.works"     # organization; MAY be a ROR id
  license: "CC-BY-4.0 AND Apache-2.0"
  dependencies: [com.acme.identity]   # foreign project ids this may edge into (APR-012)
```

`id`, `title`, and `owner` are mandatory (identity + accountability); the rest are optional payload. The top-level key is `project` for a root container; a nested container declares a `parent` (its manifest lives at its subtree root). The manifest is a **container** manifest — *project* is the root case.

### The project-metadata registry

The manifest's fields are not fixed in prose or a bespoke schema — they are declared in a **field registry**, [`registries/project-metadata.yaml`](../registries/project-metadata.yaml), the deliberate sibling of the component-metadata registry ([APR-014](APR-014-declare.md)): that one lists a *component's* frontmatter fields, this one lists a *project's* manifest fields. Each field is one entry — `name`, owning `owner` APR, `required`, `type`, an optional `values` vocabulary, an optional `format` (e.g. `reverse-dns`) — so:

- **the open vocabularies live with their field.** `type` (`research | industrial | governmental | educational | personal`) and `domain` (`software-architecture`, `agentic-ai`, …) are `values` lists, extended in the registry — never by editing this APR.
- **other principles MAY register project-level fields.** A federation tier ([APR-012](APR-012-federated-composition.md)) or a conformance profile ([APR-010](APR-010-governance.md)) is added by its owning APR as a new registry entry, without touching APR-019 — the same open, single-owner extension model DECLARE uses for components.

Its shape is fixed by [`schemas/project-metadata.schema.yaml`](../schemas/project-metadata.schema.yaml); [`tools/project/check-project.ts`](../tools/project/check-project.ts) validates both the registry and each `project.yaml` against it (required fields present, no unregistered keys, values in vocabulary, `reverse-dns` where declared).

## Containers, nesting, and containment vs. dependency

A **container** is the unit that owns a graph and issues node ids; a **project** is the root container. Containers **nest**, and the identity model makes that first-class:

- **Nesting is by `parent`, and the id extends the parent's.** A sub-container declares `parent: <parent-id>` and its own `id` **MUST** be the parent's id extended by one reverse-DNS segment (`works.promptware.promptarch` → `works.promptware.promptarch.tooling`). Containment is therefore visible in the id itself, and the root of any container is reachable by walking `parent`. The structural side of this relation — the `part-of` edge and the subgraph it bounds — is [APR-013](APR-013-artifact-graph.md)'s; this APR supplies the *identity* and the *trust/inheritance* semantics.
- **Provenance inherits up the chain.** A sub-container **MAY** override `owner` / `institution`; any field it leaves unset is inherited from its `parent`, up to the root. So `owner` need be stated once at the root and still resolves for every nested node.
- **Containment ≠ dependency.** These are the two ways one container reaches another, and they are deliberately different:

| | **Containment** (`parent` / `part-of`) | **Dependency** (`dependencies` / `depends-on`) |
|---|---|---|
| Relationship | a sub-container is *part of* its parent | a project *references* a foreign project |
| Trust domain | **same** (one root project) | **crosses** domains ([APR-012](APR-012-federated-composition.md)) |
| Id namespace | **shared / extended** (id prefix) | **foreign** (unrelated reverse-DNS root) |
| Provenance | **inherited** from parent | **not** inherited; each project owns its own |
| Declared by | `parent` in the child manifest | `dependencies` in the referencing manifest |

## Identity conventions

- **`container.id`** MUST be **globally unique and stable**, using **reverse-DNS** (`works.promptware.promptarch`) — the same coordinate scheme as Java packages, Android application ids, and Go modules. A sub-container's id extends its parent's; adopters MAY additionally carry a purl or DOI for external interop.
- **`node.id`** MUST be **container-unique and immutable** — append-only history ([APR-013](APR-013-artifact-graph.md)) forbids reuse or rename. A readable typed slug is preferred (`REQ-001`, `design/checkout-flow`).
- **Canonical id** = **`container.id : node.id`** (e.g. `works.promptware.promptarch:APR-014`), where `container.id` is the node's **innermost** container; because container ids are hierarchical, the full containment path is encoded in it. It is *derived*, never stored concatenated.
- Each node **carries its `container-id`** as a node-attribute ([APR-013](APR-013-artifact-graph.md), `node-attributes.container-id`) — a stable **foreign key**, not a copy of container metadata — so a single extracted artifact is globally addressable on its own. The manifest's `title` / `owner` / `institution` resolve *from* `container.id`; they are never duplicated onto nodes.

## Provenance resolution

The provenance of any artifact resolves from its canonical id by naming its container and then walking the containment chain: **`node → container.id → manifest → owner + institution`** (inheriting any unset field from `parent`, up to the root). `owner` MAY be an **ORCID** and `institution` a **ROR** id, making the responsible party a globally-resolvable identifier — citable, auditable, and independent of the artifact graph. This is the "agent" in [W3C PROV](https://www.w3.org/TR/prov-overview/) terms and the supplier field of an SBOM.

## Cross-project / federation

`dependencies` lists the foreign project ids a container may reference. An edge target ([APR-013](APR-013-artifact-graph.md)) MAY be a foreign canonical id (`com.acme.identity:REQ-9`) **only if** that project is declared in `dependencies` — the identity handle that makes [federated composition](APR-012-federated-composition.md) across trust domains addressable and bounded. An edge to another container of the **same** root project is *not* a dependency — it is intra-project (containment shares the trust domain), and needs no `dependencies` entry.

## Prescription

- Every container MUST have exactly one manifest with a globally-unique reverse-DNS `id`, a `title`, and an accountable `owner` (owner MAY be inherited from a `parent`). A project is the root container; there is exactly one root per project.
- A nested container MUST declare its `parent`, and its `id` MUST extend the parent's id by a reverse-DNS segment.
- Every node MUST carry a container-unique, immutable `id` and its `container-id`; its canonical id is `container.id : node.id`.
- Container identity MUST NOT be duplicated onto artifacts; artifacts reference `container-id` and resolve the rest from the manifest, inheriting up the `parent` chain ([APR-004](APR-004-canonical-source.md)).
- A cross-**project** edge target MUST name a foreign `id` declared in `dependencies`; a cross-**container** edge within the same root project needs no dependency.
- `node.id` MUST NOT be reused or renamed (append-only, [APR-013](APR-013-artifact-graph.md)); supersession is an edge, not a rename.

## Governance and validation

A conformant platform checks, in review or CI:

- **Manifest validity** — `project.yaml` carries every `required` field and no unregistered key, each value satisfies its registered `type` / `values` / `format`; `id` is reverse-DNS; `title` / `owner` present ([`check-project.ts`](../tools/project/check-project.ts) against [`project-metadata.yaml`](../registries/project-metadata.yaml)).
- **Node identity** — every node declares `id` + `container-id` (the artifact-graph checker enforces the mandatory node-attributes).
- **Container nesting** — a nested container's `id` extends its `parent`'s id; provenance resolves by walking the chain to a stated `owner`.
- **No foreign dangling** — a cross-project edge names a foreign `id` declared in `dependencies`.

## What this principle is NOT

- **Not the artifact graph.** [APR-013](APR-013-artifact-graph.md) defines nodes, edges, and the *structure* of container nesting (`part-of`, subgraphs); this APR defines their *identity and provenance* (ids, `parent`, owner, inheritance). Structure and identity are the two halves of one model.
- **Not the component-metadata contract.** [APR-014](APR-014-declare.md) governs a component's frontmatter (`metadata.core.*` / `observe.*`); node identity is a top-level attribute on *every* artifact and project identity is one manifest — neither is duplicated into the component registry. The project-metadata registry defined here is a *sibling* of DECLARE's, not a part of it: same shape, different subject (project vs component).
- **Not a package manager or registry service.** It fixes the *id scheme* and the *manifest*, not a distribution / resolution service.
- **Not lifecycle.** Version, status, and supersession are [APR-008](APR-008-artifact-lifecycle.md); this APR provides the stable identity they attach to.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Package coordinates** (Maven `groupId:artifactId`, npm `@scope/name`, Go modules) | reverse-DNS namespace + local name = global coordinate; metadata resolved from a manifest | applied to *promptware artifacts* (graph nodes, components), with provenance resolution to owner / institution |
| **Nested modules / workspaces** (Maven multi-module, npm/Cargo workspaces, Go submodules) | a root that nests sub-units sharing a root coordinate and inherited settings | containers nest via `parent` with id-prefix extension and provenance inheritance; containment (same trust domain) is distinguished from dependency (foreign) |
| **URN / purl / DOI** | persistent, resolvable identifiers independent of location | a lightweight, in-repo manifest rather than a central registrar |
| **W3C PROV / SPDX-SBOM** | entity → responsible agent / supplier | the responsible party is the project `owner` / `institution`, resolvable from any artifact's canonical id |
| **ORCID / ROR** | globally-resolvable person / organization ids | optional standard resolvers for `owner` / `institution` |

The contribution is a **single, minimal manifest plus a project-qualified canonical id** that makes every promptware artifact self-identifying and provenance-resolvable *without* the surrounding graph — the identity layer the artifact graph, component metadata, and federation all reference.

## References

1. Mockapetris, P. *Domain Names — Concepts and Facilities (RFC 1034)* — reverse-DNS naming. IETF, 1987. <https://datatracker.ietf.org/doc/html/rfc1034>
2. package-url. *purl specification*. <https://github.com/package-url/purl-spec>
3. W3C. *PROV-Overview: An Overview of the PROV Family of Documents*. 2013. <https://www.w3.org/TR/prov-overview/>
4. ORCID. *Connecting research and researchers*. <https://orcid.org/>
5. Research Organization Registry (ROR). <https://ror.org/>
6. Bradner, S. *Key words for use in RFCs to Indicate Requirement Levels (RFC 2119 / BCP 14)*. IETF, 1997. <https://datatracker.ietf.org/doc/html/rfc2119>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-09 | Draft | Initial draft: project manifest (`project.yaml`), reverse-DNS project ids, `project.id : node.id` canonical ids with `project-id` carried on every node (foreign key), provenance resolution to owner / institution (ORCID/ROR-friendly), and `dependencies`-gated cross-project edges. |
| 0.2.0 | 2026-07-09 | Draft | Manifest fields moved into a **project-metadata field registry** (`registries/project-metadata.yaml`), the sibling of DECLARE's component registry: each field is a single-owner entry, `type` / `domain` carry their open `values` vocabulary, and other APRs MAY register project-level fields without editing APR-019. Retires the bespoke `project.schema.yaml`; adds `project-metadata.schema.yaml`. `check-project.ts` now validates the manifest against the registry. |
| 0.3.0 | 2026-07-09 | Draft | Generalized identity to **two levels of granularity**: the **container** (graph-owning scope; a project is the root container) and the **artifact** (node). Containers **nest** via a new `parent` field (id extends the parent's), with provenance **inheritance** up the chain; added the explicit **containment (`part-of`) vs. dependency** distinction (same vs. crossing trust domains). Generalized the node FK `project-id` → **`container-id`** and the canonical id to `container.id : node.id`. Paired with [APR-013](APR-013-artifact-graph.md) 0.3.0 (the structure half). |
