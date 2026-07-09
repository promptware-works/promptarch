# APR-019 — Identity & Provenance — Digest

> **Generated digest of [APR-019 — A Project & Node Identity and Provenance Principle for Promptware](../APR-019-identity.md) v0.3.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Every promptware artifact carries a stable, globally-resolvable identity — a local `id` canonicalised as `container.id : node.id`, where a container is the graph-owning scope and a project is its root. Each container declares its identity and accountable owner once, in a manifest; containers nest (a sub-container is `part-of` its parent, its id extending the parent's), and provenance resolves from the canonical id alone by walking that chain — no graph needed. Containment stays in one trust domain; edges to a foreign project resolve through declared `dependencies`. This APR owns *identity*; the graph's *structure* is APR-013's.

**Principle.** An artifact has a local `id` and a canonical `container.id : node.id`. A *container* owns a graph and issues ids; a *project* is the root container, and containers nest. Each container declares its identity — id, owner, institution, `parent` — once, in a manifest; artifacts reference `container-id`, never copy it. Provenance follows the id, inheriting up the `parent` chain.

## Two levels of identity

Identity has a **container** granularity (who owns the graph) and an **artifact** granularity (which node). APR-013 gives both their *structure*; this APR gives both their *identity* — the container/artifact × structure/identity 2×2. A **project** is the root container; where there is no nesting, the container *is* the project and `container.id` = `project.id`.

## The container manifest

One manifest per container (single source of truth; nodes/tools read, never copy): `id` (reverse-DNS, required), `title` (required), `owner` (required unless inherited; MAY be ORCID), `parent` (absent = root project), plus `description`, `type` (research | industrial | …), `domain[]`, `version`, `institution` (MAY be ROR), `license`, `dependencies[]`.

**Project-metadata registry.** Manifest fields are declared in a **field registry** `registries/project-metadata.yaml` — the sibling of DECLARE's component registry (APR-014): each field a single-owner entry (`name`, `owner`, `required`, `type`, `values?`, `format?`). `type`/`domain` carry their open `values` vocabulary there; other APRs (federation tier, conformance profile) register project-level fields without editing APR-019. Registry shape fixed by `schemas/project-metadata.schema.yaml`; `tools/project/check-project.ts` validates the manifest against it (required present, no unregistered keys, values in vocabulary, reverse-dns where declared).

## Identity conventions

- `container.id` — globally unique, stable, **reverse-DNS** (like Maven/Android/Go); a sub-container's id extends its parent's. MAY also carry purl/DOI.
- `node.id` — container-unique, **immutable** (append-only, APR-013); readable typed slug.
- **canonical id = `container.id : node.id`** (innermost container; hierarchy encoded in the id) — derived, never stored concatenated.
- Each node carries `container-id` as a node-attribute (APR-013) — a stable **foreign key**, not a copy of container metadata; a single extracted artifact stays globally addressable. `title`/`owner`/`institution` resolve *from* `container.id`.

## Nesting: containment vs. dependency

- **Containment** (`parent` / `part-of`): a sub-container is *part of* its parent — **same** trust domain, **shared/extended** id namespace, provenance **inherited**. Declared by `parent` in the child.
- **Dependency** (`dependencies` / `depends-on`): a project references a **foreign** project — **crosses** trust domains (APR-012), foreign namespace, **no** inheritance. Declared by `dependencies`.
- An intra-project cross-container edge needs no dependency; only a foreign-project target does.

## Provenance & federation

- Provenance = walk the chain: `node → container.id → manifest → owner + institution`, inheriting any unset field from `parent` up to the root (ORCID/ROR-resolvable) — no graph needed. (The "agent" of W3C PROV; the supplier of an SBOM.)
- A cross-project edge target MAY be a foreign canonical id **only if** that project is in `dependencies`.

## Governance

Manifest valid (reverse-DNS id, title+owner) · sub-container id extends `parent` · every node declares `id` + `container-id` · cross-project edges name a declared dependency.

## Scope limits — do NOT misapply

Not the artifact graph (APR-013 = nodes/edges + containment *structure*); this APR = *identity* · not the component-metadata contract (APR-014 = component frontmatter; the project-metadata registry is a *sibling* of DECLARE's, not part of it) · not a package manager / registry service · not lifecycle (version/status/supersession = APR-008).

---
*Source: [APR-019 — A Project & Node Identity and Provenance Principle for Promptware](../APR-019-identity.md) v0.3.0 · regenerate this digest whenever the source changes.*
