# APR-001 ASPECT — Digest

> **Generated digest of [APR-001 ASPECT](../APR-001-aspect.md) v0.3.1.** The full APR is authoritative — read it for rationale, per-section purpose, skeletons, and prior art. Do not edit by hand.

**Abstract.** A body-level prompt framework for specifying LLM agents and skills as two variants (ASPECT-A, ASPECT-S), with type-driven mandatory sections, negative scoping required for agents, and a stricter mode for security-sensitive components — making agent and skill spec corpora auditable.

**Principle.** Specify every LLM agent and skill in a prescribed Markdown body — ASPECT-A for agents, ASPECT-S for skills — with type-driven mandatory sections and active-voice headings, so the spec corpus stays consistent, auditable, and resistant to drift.

ASPECT governs the **Markdown body** only. The sibling frontmatter is the metadata contract defined by [APR-014 DECLARE](../APR-014-declare.md) — classification (agency, trust, `skill_kind`), autonomy/blast-radius, applied patterns & called skills (`composition`), eval pins, tool grants, schema refs, and version/lineage are **declared** there, never narrated in the body.

## ASPECT-A — agents (required sections)

`Role & Access Level` · `Session Bootstrap` (hubs always; specialists if they have agent-level pre-reads) · `Invocation Contract` · `Scope` (**both** `When to Use` **and** `When NOT to Use`) · `Tools & Capabilities` · `Routing & Method` · `Handoff Contract` (`Artifacts Produced` + `Handoff Report Format`) · `Guardrails`. (Agency/autonomy, trust, applied patterns, and version/lineage are **declared in frontmatter** per DECLARE, not body sections.)

## ASPECT-S — skills (required sections)

`Purpose` + `Consumed by` + `Produces` · `Pre-Invocation Checklist` (HALT-on-failure) · `Inputs (schema)` · `Procedure` / `Algorithm` (numbered steps) · `Output Contract` · `Quality Gates` + `Shared Rules`. (Classification/`skill_kind`, dependencies (`composition`), eval pins, and version/lineage are **declared in frontmatter** per DECLARE.)

## Normative rules

- Frontmatter = machine-readable metadata contract (APR-014 DECLARE); body = functional prose only. Metadata (classification, autonomy, composition, provenance) is declared, never narrated; reference frontmatter, don't duplicate it.
- Agent body ≠ skill body — use the matching variant; don't force one template on both.
- Positive **and** negative scoping is MANDATORY for agents (`When NOT to Use` prevents misrouting). Skills omit it (the input schema enforces the negative case) — except *pattern* skills, which SHOULD include `When NOT to Apply`.
- Every claim MUST be anchorable to a named schema, policy, or artifact — not free prose.
- Active-voice headings (`Guardrails`, `Procedure`, `Scope`), not noun labels.
- Declarative body slots (Quality Gates, Inputs, Routing) as **tables**, not paragraphs; declared metadata (autonomy, classification, composition) lives in the frontmatter per DECLARE.

## Security-sensitive components → stricter mode

A component is security-sensitive if its output influences a security decision, it processes untrusted input, it touches access control/secrets/audit, or it participates in security review. Then three slots tighten: the **autonomy declaration** (frontmatter) must be fully populated; **Pre-Invocation Checklist** must enumerate every policy/pattern with HALT-and-report; **Guardrails** must cover untrusted-input handling, evidence-grounding, and no-exploit-code. Security-sensitivity is a property of the *component*, not the host system.

## Scope limits — do NOT misapply

ASPECT is **not** a runtime, a frontmatter schema, a prompt-template library, a behaviour framework, an inter-agent message protocol, a tool-grant policy, a regulatory-compliance package, or a substitute for review. It specifies the *shape* of agent/skill prose, not what an agent should do for any domain.

## Choosing the variant

Stateful actor with identity/authority/routing → **ASPECT-A**. Stateless typed transform → **ASPECT-S**. Both → ASPECT-A with the transform under `Routing & Method`. Neither (pure prompt template, no I/O contract) → plain Markdown, ASPECT is overkill.

---
*Source: [APR-001 ASPECT](../APR-001-aspect.md) v0.3.1 · regenerate this digest whenever the source changes.*
