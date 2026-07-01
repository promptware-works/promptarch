# APR-014 DECLARE — Digest

> **Generated digest of [APR-014 DECLARE — The Frontmatter Contract for Promptware Components](../APR-014-declare.md) v0.4.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Every packaged promptware component is a two-layer unit: a structured **frontmatter** block holding all machine-readable metadata in typed scope clusters, and a **body** restricted to functional prose only. Tooling, dispatch, governance, and audit read from the frontmatter; the body is the only layer injected into an LLM context. Classification, operability, provenance, evaluation, and composition each live in their owning cluster; format, name, or folder never implies any of them.

**Principle.** The frontmatter is the machine-readable contract — structured, orthogonal, authoritative, in typed clusters, never inferred from format or name. The body is functional prose only — the behavioral instructions injected into an LLM. **No metadata in the body; no behavior in the frontmatter.**

## The two layers

- **Frontmatter** — authoritative source for all component metadata: **structured** (named clusters), **orthogonal** (each independent attribute its own field; if two attributes can vary separately they MUST be separate fields), **authoritative** (folders/names/loaders/dispatch derive from it; on conflict the declaration wins and the divergence is a validation error), **not injected** (read at load/governance time, never sent to the model — per-invocation token cost = body size only).
- **Body** — the only layer injected into an LLM context; behavioral instructions only. No classification, operational, governance, composition, or evaluation metadata; no typed I/O schemas.

## Canonical scope clusters

Every field has a dotted `path` under `metadata`: **namespace** (L1) → **cluster** (L2) → **field** (L3). Each field defers to its **owning principle**.

- **`core`** (required namespace) — cross-cutting clusters:
  - `classification` — exec_form (APR-003) · skill_kind (APR-007) · trust_level (APR-005) · agency (APR-006) · max_autonomy_level / max_blast_radius (APR-009)
  - `composition` — applies_patterns (APR-007) · delegation_envelope (APR-006) · escalation_triggers / escalation_path (APR-009)
  - `provenance` — principals · status (APR-010) · version · supersedes (APR-008)
  - `evaluation` — model_pin (APR-008)
  - `operability` — trace_anchor (APR-011)
- **`observe`** (opt-in namespace, APR-002) — `consumes.*` · `produces.*` · `evals.*` (evaluated_by, min_eval_score) · loose `includes`, `safety_critical`.
- Non-owned custom keys are namespaced (`x-…`), never inside a canonical cluster.

## Normative rules

- Frontmatter is the **single authoritative source** for machine-readable metadata; MUST NOT be inferred from format, file name, or folder.
- Body is **functional prose only**; classification/operational/governance/composition/evaluation metadata MUST NOT appear in it.
- Each **independent** attribute is its **own** field; orthogonal attributes MUST NOT be fused into one overloaded label.
- The DECLARE layer lives under `metadata`, organized as **namespace → cluster → field** (`core` required, subsystems like `observe` opt-in); each owned field sits at its registered dotted `path`, non-owned custom fields are namespaced `x-` keys, never inside a canonical cluster.
- Canonical fields are recorded in a **registry** (`registries/component-metadata.yaml`), registered by each field's **owning APR** (via a *Metadata registrations* section) — never enumerated in DECLARE. The full `path`+`name` is unique; custom fields are namespaced, unregistered. (RFC-8126-style; closed-for-modification, open-for-extension.)
- Field values **defer to the owning principle**; DECLARE MUST NOT redefine them.
- A component that composes/governs others MUST declare its delegation in `composition`. **Agency is declared, never discovered at runtime.**
- Frontmatter MUST NOT be injected into an LLM; the body MUST NOT be parsed by governance to extract metadata.

## Governance checks

Body purity (no structured metadata in prose — deterministic, no LLM) · frontmatter completeness (required clusters per owning principle) · no conflation (one field ≠ two attributes) · cluster placement (fields in their canonical cluster) · declaration authoritative (folder/name reconciled against frontmatter; mismatch fails) · agency declared (coordinators declare their envelope) · tooling reads the field, not the path.

## Scope limits — do NOT misapply

Not a schema (no fixed field names/value sets/format) · not ASPECT (that governs body semantics; DECLARE governs the frontmatter sibling + body-restriction) · not APR-003/005/006/007 (it requires those axes be declared, doesn't define them) · not a taxonomy of component kinds · not a folder/naming convention (names/folders are derived shadows) · not OBSERVE · not a token-optimization technique (token reduction is a consequence).

---
*Source: [APR-014 DECLARE — The Frontmatter Contract for Promptware Components](../APR-014-declare.md) v0.4.0 · regenerate this digest whenever the source changes.*
