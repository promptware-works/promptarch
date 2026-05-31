---
apr: 7
title: "A Pattern Principle for Reusable, Declaratively-Applied Promptware Behavior"
abstract: "A reusable unit of agent/skill behavior — a pattern — is a first-class, named, versioned artifact applied declaratively (via applies_patterns): behavioral prose plus optional structural obligations, defined once in patterns/, composed orthogonally, and never copy-pasted into prose."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-31
last-updated: 2026-05-31
audience: Architects and framework authors of agentic AI platforms; anyone maintaining several skills/agents that share behavioral conventions
supersedes: []
superseded-by: []
related:
  - APR-001
  - APR-002
  - APR-004
  - APR-005
tags:
  - patterns
  - reuse
  - behavior
  - aspect-oriented
  - composition
---

# APR-007 — A Pattern Principle for Reusable, Declaratively-Applied Promptware Behavior

> **A reusable unit of agent/skill behavior — a *pattern* — is a first-class, named, versioned artifact that components apply declaratively: defined once, referenced everywhere, woven in — never invoked, never copy-pasted.**

*Injectable summary (for feeding to an LLM): [`digests/APR-007-pattern-mechanism.md`](digests/APR-007-pattern-mechanism.md). This full APR is canonical.*

## Motivation

Across a platform the same behavioral fragments recur — "tag untrusted input before reasoning," "HALT and report on missing pre-reads," "emit evidence for every claim," "escalate to a human on low confidence." Today they are either:

- **copy-pasted** into every skill/agent's prose → the silent-drift failure of [APR-000](APR-000-promptware.md) / [APR-002 OBSERVE](APR-002-observe.md), reintroduced for *behavioral* content; or
- referenced informally — [APR-001 ASPECT](APR-001-aspect.md) has an `applies_patterns` field and mentions "applied shared patterns," and OBSERVE mentions "shared patterns" — but **neither defines what a pattern is**, how it is applied, versioned, or governed.

So "pattern" is a dangling concept two APRs lean on. The fix is the discipline OBSERVE already established for *non-behavioral* content — single canonical source, declarative application, no inline duplication, audit-logged — applied to reusable *behavior*. **A pattern is the behavioral analogue of an OBSERVE artifact.**

## The principle

> **Reusable behavior lives in named pattern artifacts that components *apply* declaratively; the pattern is woven into the component at load or materialization time from a single canonical source.**

A pattern is **applied**, not **invoked** — that is the line that separates it from a skill (which is invoked and is a node in the delegation graph, [APR-006](APR-006-composition-topology.md)).

## Scope and applicability

### When this applies

- Behavioral fragments recur across multiple components and must stay consistent.

### When this does NOT apply

- One-off behavior unique to a single component (no reuse → no pattern).
- This APR defines the **mechanism** — what a pattern is, how it is applied and governed — **not a catalogue.** The specific patterns are governed *content* (a library), like examples, not part of this principle.

## What a pattern is

- **Applied, not invoked.** A pattern is woven into a component's specification; a skill is invoked and is a graph node. The test: if you would *call* it → skill; if you would *attach* it to shape behavior → pattern. A pattern has no independent I/O contract; it augments its host's.
- **Prose plus structural obligations.** A pattern carries reusable behavioral prose/guardrails, **and MAY impose structural requirements on its host** — e.g., "any component applying `evidence-grounding` MUST have an `evidence[]` output field," or "MUST include a `When NOT to Apply` section." Those obligations are enforced by governance. (This makes a pattern a *superset* of a vendor instruction file like a Copilot instruction or Cursor rule, which carries prose but cannot require host structure.)
- **Named and single-concern.** Each pattern addresses one concern and has a stable name used in `applies_patterns`.

## Applying a pattern

- A component declares the patterns it applies in frontmatter: `applies_patterns: [evidence-grounding, untrusted-input-tagging]`. It **MUST NOT** inline a pattern's text.
- The reference resolves from the **single canonical source** in `patterns/`; *how* it resolves follows the runtime:
  - **Loader-equipped (OBSERVE) runtimes** → the loader **injects** the pattern into the delegation prompt at load time, with the same audit-log binding OBSERVE uses.
  - **Static runtimes** → the pattern is **woven at materialization** ([APR-004](APR-004-canonical-source.md)) into the generated output — a materialized pattern may *become* a `.github/instructions/…` file, a Cursor rule, or an injected Claude skill block.
- Either way the author never copy-pastes; the canonical pattern is the one source, and each application is audited.

## Composition

- Patterns **SHOULD** be **orthogonal by design** — each addresses a distinct concern, so stacking them is safe (aspect-oriented composition).
- When multiple patterns apply to one component, they apply in **declared order**; ordering is explicit and deterministic ([APR-003](APR-003-code-prompt-boundary.md) — the weaving step is deterministic).
- **Conflicts are surfaced, not silently resolved.** Two patterns whose prose or structural obligations contradict are a **governance error** flagged at validation — never quietly overridden last-wins.

## Versioning and propagation

Patterns reuse OBSERVE's discipline wholesale:

- A pattern is a **versioned artifact**; a change propagates to every applier from the single source.
- Changes are classified **additive / evolutionary / breaking**; breaking changes require an ADR and a deprecation window, and **impact analysis flags every applying component**.
- The audit log records **which pattern version** each component consumed at each application.

## Where patterns live

- Patterns are a governed **library** in a `patterns/` directory under the canonical root ([APR-004](APR-004-canonical-source.md)).
- Because patterns are **behavioral**, `patterns/` sits beside `skills/` (also behavioral) and is **not** an OBSERVE category — OBSERVE governs *non-behavioral* content. Patterns are OBSERVE's behavioral complement, governed *like* OBSERVE artifacts but living on the behavioral side of the line.

## Prescription

- Reusable behavior **MUST** live in a named pattern in `patterns/`; components **MUST** apply it by declaration (`applies_patterns`) and **MUST NOT** inline its text.
- A pattern is **applied, not invoked**; if a unit is invoked with its own I/O contract, it is a skill, not a pattern.
- A pattern **MAY** impose structural obligations on its host; those obligations **MUST** be enforced by governance.
- Patterns **SHOULD** be orthogonal; stacked patterns apply in **declared order**; contradictory patterns are a governance error.
- Patterns **MUST** be versioned; changes follow OBSERVE's additive/evolutionary/breaking classification with impact analysis over all appliers; each application is audit-logged with the consumed version.
- Application resolves from the single canonical source — injected at load time (loader runtimes) or woven at materialization (static runtimes); never copy-pasted.

## Governance and validation

A conformant platform checks, in review or CI:

- **No inline duplication** — components reference patterns, never embed their text.
- **Structural obligations met** — every applier satisfies the structural requirements its patterns impose.
- **Orthogonality / conflict** — stacked patterns do not contradict; conflicts are flagged.
- **No orphans** — every pattern is applied by at least one component.
- **Versioned propagation** — pattern changes run impact analysis over appliers; breaking changes carry an ADR + deprecation window.
- **Audit binding** — each application records the consumed pattern version.

## What this principle is NOT

- **Not a catalogue.** It defines the mechanism; the patterns themselves are governed content.
- **Not a skill mechanism.** Skills are invoked graph nodes (APR-006); patterns are applied augmentations. A unit with its own I/O contract is a skill.
- **Not an OBSERVE category.** OBSERVE is non-behavioral; patterns are behavioral. Same discipline, opposite side of the line.
- **Not a vendor instruction format.** A Copilot instruction or Cursor rule is one *materialization* of a pattern, not the pattern itself.
- **Not inheritance.** Patterns compose by declarative application and orthogonality, not by class hierarchy.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Aspect-oriented programming** (AspectJ) | Cross-cutting concerns applied declaratively, not scattered | The "advice" is reusable *behavioral prose* woven into LLM-agent specs; governed, versioned, conflict-checked |
| **Design patterns** (GoF) | Named, reusable solutions to recurring problems | Patterns are *applied artifacts*, not documentation — referenced and woven in, not re-implemented |
| **Policy-as-code admission control** (OPA Gatekeeper) | Declarative constraints applied to many resources | Constraints are behavioral + structural obligations on promptware components |
| **Vendor instruction conventions** (GitHub Copilot custom instructions, Cursor rules) | Reusable behavioral guidance applied (not invoked) | The canonical, vendor-neutral, named, versioned source that *materializes into* those vendor formats (APR-004); adds structural obligations and governance |

The novel contribution is a **promptware-specific pattern mechanism**: reusable behavior as a first-class, named, versioned, declaratively-applied artifact — prose plus structural obligations, composed orthogonally, audited — the behavioral complement to OBSERVE and the definition behind ASPECT's `applies_patterns`.

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. Eclipse Foundation. *AspectJ — aspect-oriented extension to Java*. <https://eclipse.dev/aspectj/>
2. Gamma, E., Helm, R., Johnson, R., Vlissides, J. *Design Patterns* (overview). <https://refactoring.guru/design-patterns>
3. Open Policy Agent. *Gatekeeper — policy controller for Kubernetes*. <https://open-policy-agent.github.io/gatekeeper/website/docs/>
4. GitHub. *Adding repository custom instructions for GitHub Copilot*. <https://docs.github.com/en/copilot/how-tos/custom-instructions/add-repository-instructions>
5. Cursor. *Rules*. <https://docs.cursor.com/context/rules>

## Adoption notes

- **Extract by repetition.** When the same guardrail or convention appears in a second component, lift it into a `patterns/` artifact and have both apply it — that is the moment a pattern is born.
- **Keep patterns single-concern and orthogonal**, so stacking is safe; resist grab-bag "misc rules" patterns.
- **Wire structural-obligation checks** alongside the no-inline-duplication check, so a pattern's requirements on its host are actually enforced.
- **Start with security patterns** (APR-005 guardrails) — they are the highest-value, most-reused, and most dangerous to let drift.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-31 | Draft | Initial draft published as APR-007. |
