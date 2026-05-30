# APR-001 ASPECT — Digest

> **Generated digest of [APR-001 ASPECT](../APR-001-aspect.md) v0.2.4.** The full APR is authoritative — read it for rationale, per-section purpose, skeletons, and prior art. Do not edit by hand.

**Abstract.** A body-level prompt framework for specifying LLM agents and skills as two variants (ASPECT-A, ASPECT-S), with type-driven mandatory sections, negative scoping required for agents, and a stricter mode for security-sensitive components — making agent and skill spec corpora auditable.

**Principle.** Specify every LLM agent and skill in a prescribed Markdown body — ASPECT-A for agents, ASPECT-S for skills — with type-driven mandatory sections and active-voice headings, so the spec corpus stays consistent, auditable, and resistant to drift.

ASPECT governs the **Markdown body** only. The frontmatter (tool grants, schema refs, policies, eval pins) is a *sibling* layer the host runtime defines — never duplicate frontmatter fields in body prose; reference them.

## ASPECT-A — agents (required sections)

`Role & Access Level` · `Session Bootstrap` (hubs always; specialists if they have agent-level pre-reads) · `Invocation Contract` · `Scope` (**both** `When to Use` **and** `When NOT to Use`) · `Tools & Capabilities` · `Routing & Method` · `Handoff Contract` (`Artifacts Produced` + `Handoff Report Format`) · `Autonomy Profile` (required for security-sensitive / consequential agents) · `Guardrails` · `Version & Lineage`.

## ASPECT-S — skills (required sections)

`Purpose` + `Consumed by` + `Produces` · `Pre-Invocation Checklist` (HALT-on-failure) · `Inputs (schema)` · `Procedure` / `Algorithm` (numbered steps) · `Output Contract` · `Quality Gates` + `Shared Rules` · `Dependencies` (only if it calls other skills or applies patterns) · `Version & Lineage`.

## Normative rules

- Frontmatter = machine contract; body = human/LLM spec. Never duplicate; reference.
- Agent body ≠ skill body — use the matching variant; don't force one template on both.
- Positive **and** negative scoping is MANDATORY for agents (`When NOT to Use` prevents misrouting). Skills omit it (the input schema enforces the negative case) — except *pattern* skills, which SHOULD include `When NOT to Apply`.
- Every claim MUST be anchorable to a named schema, policy, or artifact — not free prose.
- Active-voice headings (`Guardrails`, `Procedure`, `Scope`), not noun labels.
- Declarative governance (Autonomy Profile, Quality Gates, Inputs, Routing) as **tables**, not paragraphs.

## Security-sensitive components → stricter mode

A component is security-sensitive if its output influences a security decision, it processes untrusted input, it touches access control/secrets/audit, or it participates in security review. Then three slots tighten: **Autonomy Profile** becomes required (full table); **Pre-Invocation Checklist** must enumerate every policy/pattern with HALT-and-report; **Guardrails** must cover untrusted-input handling, evidence-grounding, and no-exploit-code. Security-sensitivity is a property of the *component*, not the host system.

## Scope limits — do NOT misapply

ASPECT is **not** a runtime, a frontmatter schema, a prompt-template library, a behaviour framework, an inter-agent message protocol, a tool-grant policy, a regulatory-compliance package, or a substitute for review. It specifies the *shape* of agent/skill prose, not what an agent should do for any domain.

## Choosing the variant

Stateful actor with identity/authority/routing → **ASPECT-A**. Stateless typed transform → **ASPECT-S**. Both → ASPECT-A with the transform under `Routing & Method`. Neither (pure prompt template, no I/O contract) → plain Markdown, ASPECT is overkill.

---
*Source: [APR-001 ASPECT](../APR-001-aspect.md) v0.2.4 · regenerate this digest whenever the source changes.*
