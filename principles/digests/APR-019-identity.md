# APR-019 — Identity & Provenance — Digest

> **Generated digest of [APR-019 — A Project & Node Identity and Provenance Principle for Promptware](../APR-019-identity.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Every promptware artifact carries a stable, globally-resolvable identity — a local `id` canonicalised as `project.id : node.id` — and each project declares its identity and accountable owner once, in a root `project.yaml`. Provenance (owner, institution) is resolvable from an artifact's canonical id alone, without the surrounding graph; cross-project edges resolve through declared `dependencies`.

**Principle.** An artifact has a local `id` and a canonical `project.id : node.id`. Project identity — globally-unique id, owner, institution — is declared once in `project.yaml`; artifacts reference `project.id`, never copy the manifest. Provenance follows the id: `project.id` names the manifest carrying the accountable owner.

## The project manifest

Single root **`project.yaml`** (single source of truth; nodes/tools read, never copy): `id` (reverse-DNS, required), `title` (required), `owner` (required; MAY be ORCID), plus `description`, `type` (research | industrial | governmental | …), `domain[]`, `version`, `institution` (MAY be ROR), `license`, `dependencies[]`. Shape fixed by `schemas/project.schema.yaml`; validated by `tools/project/check-project.ts`.

## Identity conventions

- `project.id` — globally unique, stable, **reverse-DNS** (like Maven/Android/Go). MAY also carry purl/DOI.
- `node.id` — project-unique, **immutable** (append-only, APR-013); readable typed slug.
- **canonical id = `project.id : node.id`** — derived, never stored concatenated.
- Each node carries `project-id` as a node-attribute (APR-013) — a stable **foreign key**, not a copy of project metadata; a single extracted artifact stays globally addressable. `title`/`owner`/`institution` resolve *from* `project.id`.

## Provenance & federation

- Provenance = two hops: `node → project.id → project.yaml → owner + institution` (ORCID/ROR-resolvable) — no graph needed. (The "agent" of W3C PROV; the supplier of an SBOM.)
- A cross-project edge target MAY be a foreign canonical id **only if** that project is in `dependencies` — the handle that makes APR-012 federation addressable and bounded.

## Governance

Manifest valid (reverse-DNS id, title+owner) · every node declares `id` + `project-id` · cross-project edges name a declared dependency.

## Scope limits — do NOT misapply

Not the artifact graph (APR-013 = nodes/edges) · not the component-metadata contract (APR-014 = component frontmatter; node identity is top-level on every artifact) · not a package manager / registry service · not lifecycle (version/status/supersession = APR-008).

---
*Source: [APR-019 — A Project & Node Identity and Provenance Principle for Promptware](../APR-019-identity.md) v0.1.0 · regenerate this digest whenever the source changes.*
