---
apr: 19
title: "A Project & Node Identity and Provenance Principle for Promptware"
abstract: "Every promptware artifact carries a stable, globally-resolvable identity — a local id canonicalised as project.id:node.id — and each project declares its identity and accountable owner once, in a root project.yaml. An artifact's provenance (owner, institution) is resolvable from its canonical id alone, without the surrounding graph; cross-project edges resolve through declared dependencies."
status: Draft
class: architectural
version: 0.2.0
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

> **Every promptware artifact carries a stable, globally-resolvable identity — a local `id`, canonicalised as `project.id : node.id` — and every project declares its identity and accountable owner once, in a root manifest. Provenance is then addressable from the id alone, without the surrounding graph.**

*Injectable summary (for feeding to an LLM): [`digests/APR-019-identity.md`](digests/APR-019-identity.md). This full APR is canonical.*

## Motivation

[APR-013](APR-013-artifact-graph.md) makes a project's state an append-only graph of typed nodes. But a node's `id` is only unique *within* one graph: `REQ-001` is meaningless out of context, and two projects' `REQ-001`s collide. Extract a node from its repo and you cannot tell which project it belongs to, who owns it, or where it came from — its **provenance is lost**. The same gap applies to a component ([APR-014](APR-014-declare.md)) shared across projects, and to an edge that reaches into a *foreign* project ([APR-012](APR-012-federated-composition.md)).

Two things are missing: a **globally-unique, resolvable identity** for each artifact, and a **single, authoritative record of project identity and accountability** that the id resolves to. Without them, traceability holds only inside one repo, federation has nothing to point at, and audit cannot answer "who is responsible for this artifact?"

## The principle

> **Every artifact has a local `id` and a canonical, project-qualified id `project.id : node.id`. Each project declares its identity — a globally-unique id, its owner, and its institution — once, in a root `project.yaml`. An artifact's provenance is resolvable from its canonical id alone: `project.id` names the manifest that carries the accountable owner.**

Three claims:

1. **Local vs. canonical.** `id` is project-unique and human-readable for internal use; `project.id : node.id` is globally unique for external / cross-project use. Both name the same node.
2. **Identity is declared once.** Project identity and attribution live in one manifest (a [canonical source](APR-004-canonical-source.md)); artifacts *reference* `project.id`, never copy the manifest's contents.
3. **Provenance follows the id.** From a bare canonical id you resolve the project, its owner, and its institution — no graph required.

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
  type: research                      # research | industrial | governmental | … (extensible)
  domain: [software-architecture, agentic-ai]
  version: 0.5.0                      # optional
  owner: "D. Maxios"                  # accountable owner; MAY be an ORCID
  institution: "promptware.works"     # organization; MAY be a ROR id
  license: "CC-BY-4.0 AND Apache-2.0"
  dependencies: [com.acme.identity]   # foreign project ids this may edge into (APR-012)
```

`id`, `title`, and `owner` are mandatory (identity + accountability); the rest are optional payload.

### The project-metadata registry

The manifest's fields are not fixed in prose or a bespoke schema — they are declared in a **field registry**, [`registries/project-metadata.yaml`](../registries/project-metadata.yaml), the deliberate sibling of the component-metadata registry ([APR-014](APR-014-declare.md)): that one lists a *component's* frontmatter fields, this one lists a *project's* manifest fields. Each field is one entry — `name`, owning `owner` APR, `required`, `type`, an optional `values` vocabulary, an optional `format` (e.g. `reverse-dns`) — so:

- **the open vocabularies live with their field.** `type` (`research | industrial | governmental | educational | personal`) and `domain` (`software-architecture`, `agentic-ai`, …) are `values` lists, extended in the registry — never by editing this APR.
- **other principles MAY register project-level fields.** A federation tier ([APR-012](APR-012-federated-composition.md)) or a conformance profile ([APR-010](APR-010-governance.md)) is added by its owning APR as a new registry entry, without touching APR-019 — the same open, single-owner extension model DECLARE uses for components.

Its shape is fixed by [`schemas/project-metadata.schema.yaml`](../schemas/project-metadata.schema.yaml); [`tools/project/check-project.ts`](../tools/project/check-project.ts) validates both the registry and each `project.yaml` against it (required fields present, no unregistered keys, values in vocabulary, `reverse-dns` where declared).

## Identity conventions

- **`project.id`** MUST be **globally unique and stable**, using **reverse-DNS** (`works.promptware.promptarch`) — the same coordinate scheme as Java packages, Android application ids, and Go modules. Adopters MAY additionally carry a purl or DOI for external interop.
- **`node.id`** MUST be **project-unique and immutable** — append-only history ([APR-013](APR-013-artifact-graph.md)) forbids reuse or rename. A readable typed slug is preferred (`REQ-001`, `design/checkout-flow`).
- **Canonical id** = **`project.id : node.id`** (e.g. `works.promptware.promptarch:APR-014`). It is *derived*, never stored concatenated.
- Each node **carries its `project-id`** as a node-attribute ([APR-013](APR-013-artifact-graph.md), `node-attributes.project-id`) — a stable **foreign key**, not a copy of project metadata — so a single extracted artifact is globally addressable on its own. The manifest's `title` / `owner` / `institution` resolve *from* `project.id`; they are never duplicated onto nodes.

## Provenance resolution

The provenance of any artifact is a two-hop resolution from its canonical id: **`node → project.id → project.yaml → owner + institution`**. `owner` MAY be an **ORCID** and `institution` a **ROR** id, making the responsible party a globally-resolvable identifier — citable, auditable, and independent of the artifact graph. This is the "agent" in [W3C PROV](https://www.w3.org/TR/prov-overview/) terms and the supplier field of an SBOM.

## Cross-project / federation

`project.dependencies` lists the foreign project ids a project may reference. An edge target ([APR-013](APR-013-artifact-graph.md)) MAY be a foreign canonical id (`com.acme.identity:REQ-9`) **only if** that project is declared in `dependencies` — the identity handle that makes [federated composition](APR-012-federated-composition.md) across trust domains addressable and bounded.

## Prescription

- Every project MUST have exactly one root **`project.yaml`** with a globally-unique reverse-DNS `id`, a `title`, and an accountable `owner`.
- Every node MUST carry a project-unique, immutable `id` and its `project-id`; its canonical id is `project.id : node.id`.
- Project identity MUST NOT be duplicated onto artifacts; artifacts reference `project.id` and resolve the rest from the manifest ([APR-004](APR-004-canonical-source.md)).
- A cross-project edge target MUST name a `project.id` declared in `dependencies`.
- `node.id` MUST NOT be reused or renamed (append-only, [APR-013](APR-013-artifact-graph.md)); supersession is an edge, not a rename.

## Governance and validation

A conformant platform checks, in review or CI:

- **Manifest validity** — `project.yaml` carries every `required` field and no unregistered key, each value satisfies its registered `type` / `values` / `format`; `id` is reverse-DNS; `title` / `owner` present ([`check-project.ts`](../tools/project/check-project.ts) against [`project-metadata.yaml`](../registries/project-metadata.yaml)).
- **Node identity** — every node declares `id` + `project-id` (the artifact-graph checker enforces the mandatory node-attributes).
- **No foreign dangling** — a cross-project edge names a `project.id` declared in `dependencies`.

## What this principle is NOT

- **Not the artifact graph.** [APR-013](APR-013-artifact-graph.md) defines nodes and edges; this APR defines their *identity and provenance*.
- **Not the component-metadata contract.** [APR-014](APR-014-declare.md) governs a component's frontmatter (`metadata.core.*` / `observe.*`); node identity is a top-level attribute on *every* artifact and project identity is one manifest — neither is duplicated into the component registry. The project-metadata registry defined here is a *sibling* of DECLARE's, not a part of it: same shape, different subject (project vs component).
- **Not a package manager or registry service.** It fixes the *id scheme* and the *manifest*, not a distribution / resolution service.
- **Not lifecycle.** Version, status, and supersession are [APR-008](APR-008-artifact-lifecycle.md); this APR provides the stable identity they attach to.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Package coordinates** (Maven `groupId:artifactId`, npm `@scope/name`, Go modules) | reverse-DNS namespace + local name = global coordinate; metadata resolved from a manifest | applied to *promptware artifacts* (graph nodes, components), with provenance resolution to owner / institution |
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
| 0.2.0 | 2026-07-09 | Draft | Manifest fields moved into a **project-metadata field registry** (`registries/project-metadata.yaml`), the sibling of DECLARE's component registry: each field is a single-owner entry, `type` / `domain` carry their open `values` vocabulary, and other APRs MAY register project-level fields without editing APR-019. Retires the bespoke `project.schema.yaml`; adds `project-metadata.schema.yaml`. `check-project.ts` now validates the manifest against the registry. |
| 0.1.0 | 2026-07-09 | Draft | Initial draft: project manifest (`project.yaml`), reverse-DNS project ids, `project.id : node.id` canonical ids with `project-id` carried on every node (foreign key), provenance resolution to owner / institution (ORCID/ROR-friendly), and `dependencies`-gated cross-project edges. |
