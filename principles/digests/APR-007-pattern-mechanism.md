# APR-007 — Pattern Mechanism — Digest

> **Generated digest of [APR-007 — A Pattern Principle for Reusable, Declaratively-Applied Promptware Behavior](../APR-007-pattern-mechanism.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** A reusable unit of agent/skill behavior — a pattern — is a first-class, named, versioned artifact applied declaratively (via `applies_patterns`): behavioral prose plus optional structural obligations, defined once in `patterns/`, composed orthogonally, and never copy-pasted into prose.

**Principle.** Reusable behavior lives in named pattern artifacts that components *apply* declaratively; the pattern is woven into the component from a single canonical source. A pattern is **applied, not invoked** — that line separates it from a skill (an invoked graph node, APR-006).

## What a pattern is

- **Applied, not invoked.** Woven into a component's spec; no independent I/O contract. Test: if you'd *call* it → skill; if you'd *attach* it → pattern.
- **Prose + structural obligations.** Reusable behavioral prose/guardrails, AND it MAY require host structure (e.g., "appliers of `evidence-grounding` MUST have an `evidence[]` field"). A *superset* of a Copilot instruction / Cursor rule (which can't require host structure).
- **Named, single-concern**, referenced in `applies_patterns`.

## Normative rules

- Reusable behavior MUST live in a named pattern in `patterns/`; components MUST apply it by declaration (`applies_patterns`) and MUST NOT inline its text.
- A pattern is applied, not invoked; a unit with its own I/O contract is a skill, not a pattern.
- A pattern MAY impose structural obligations on its host; those MUST be enforced by governance.
- Patterns SHOULD be orthogonal; stacked patterns apply in declared order; contradictory patterns are a governance error (flagged, never last-wins).
- Patterns MUST be versioned; changes follow OBSERVE's additive/evolutionary/breaking classification with impact analysis over all appliers; each application is audit-logged with the consumed version.
- Application resolves from the single canonical source — injected at load time (loader runtimes) or woven at materialization (static runtimes, APR-004); never copy-pasted.

## Where patterns live

`patterns/` under the canonical root (APR-004) — a **behavioral sibling of `skills/`**, NOT an OBSERVE category (OBSERVE is non-behavioral). Patterns are OBSERVE's behavioral complement, governed the same way.

## Governance checks

No inline duplication (reference, don't embed) · structural obligations met by every applier · stacked patterns don't contradict (conflicts flagged) · no orphan patterns · pattern changes run impact analysis over appliers (breaking → ADR + deprecation window) · each application audit-logs the consumed version.

## Scope limits — do NOT misapply

Not a catalogue (defines the mechanism; patterns are governed content) · not a skill mechanism (skills are invoked graph nodes) · not an OBSERVE category (behavioral, not non-behavioral) · not a vendor instruction format (a Copilot instruction / Cursor rule is one *materialization* of a pattern) · not inheritance (composition by declarative application + orthogonality).

---
*Source: [APR-007 — A Pattern Principle for Reusable, Declaratively-Applied Promptware Behavior](../APR-007-pattern-mechanism.md) v0.1.0 · regenerate this digest whenever the source changes.*
