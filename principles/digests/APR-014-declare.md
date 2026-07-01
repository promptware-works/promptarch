# APR-014 DECLARE — Digest

> **Generated digest of [APR-014 DECLARE — The Frontmatter Contract for Promptware Components](../APR-014-declare.md) v0.2.1.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Every packaged promptware component is a two-layer unit: a structured **frontmatter** block holding all machine-readable metadata in typed scope clusters, and a **body** restricted to functional prose only. Tooling, dispatch, governance, and audit read from the frontmatter; the body is the only layer injected into an LLM context. Classification, operability, provenance, evaluation, and composition each live in their owning cluster; format, name, or folder never implies any of them.

**Principle.** The frontmatter is the machine-readable contract — structured, orthogonal, authoritative, in typed clusters, never inferred from format or name. The body is functional prose only — the behavioral instructions injected into an LLM. **No metadata in the body; no behavior in the frontmatter.**

## The two layers

- **Frontmatter** — authoritative source for all component metadata: **structured** (named clusters), **orthogonal** (each independent attribute its own field; if two attributes can vary separately they MUST be separate fields), **authoritative** (folders/names/loaders/dispatch derive from it; on conflict the declaration wins and the divergence is a validation error), **not injected** (read at load/governance time, never sent to the model — per-invocation token cost = body size only).
- **Body** — the only layer injected into an LLM context; behavioral instructions only. No classification, operational, governance, composition, or evaluation metadata; no typed I/O schemas.

## Canonical scope clusters

Each field defers to its **owning principle**; DECLARE defines only the structural home, not the values.

- **`classification`** — `exec_form: code | prompt` (APR-003) · `skill_kind: capability | pattern` (APR-007) · `trust_level` (APR-005) · `agency: leaf | coordinator` (APR-006).
- **`operability`** — version, ticket, resolution, trace_anchor, direction (APR-008, APR-011).
- **`provenance`** — principals, created, last-updated, status (APR-010).
- **`evaluation`** — evaluated_by, min_eval_score, model_pin (APR-002, APR-008).
- **`composition`** — applies_patterns, delegation_envelope (APR-006, APR-007).

## Normative rules

- Frontmatter is the **single authoritative source** for machine-readable metadata; MUST NOT be inferred from format, file name, or folder.
- Body is **functional prose only**; classification/operational/governance/composition/evaluation metadata MUST NOT appear in it.
- Each **independent** attribute is its **own** field; orthogonal attributes MUST NOT be fused into one overloaded label.
- Fields live in canonical clusters; platform-specific clusters MAY be added but MUST NOT reuse a canonical name for a different scope.
- Field values **defer to the owning principle**; DECLARE MUST NOT redefine them.
- A component that composes/governs others MUST declare its delegation in `composition`. **Agency is declared, never discovered at runtime.**
- Frontmatter MUST NOT be injected into an LLM; the body MUST NOT be parsed by governance to extract metadata.

## Governance checks

Body purity (no structured metadata in prose — deterministic, no LLM) · frontmatter completeness (required clusters per owning principle) · no conflation (one field ≠ two attributes) · cluster placement (fields in their canonical cluster) · declaration authoritative (folder/name reconciled against frontmatter; mismatch fails) · agency declared (coordinators declare their envelope) · tooling reads the field, not the path.

## Scope limits — do NOT misapply

Not a schema (no fixed field names/value sets/format) · not ASPECT (that governs body semantics; DECLARE governs the frontmatter sibling + body-restriction) · not APR-003/005/006/007 (it requires those axes be declared, doesn't define them) · not a taxonomy of component kinds · not a folder/naming convention (names/folders are derived shadows) · not OBSERVE · not a token-optimization technique (token reduction is a consequence).

---
*Source: [APR-014 DECLARE — The Frontmatter Contract for Promptware Components](../APR-014-declare.md) v0.2.1 · regenerate this digest whenever the source changes.*
