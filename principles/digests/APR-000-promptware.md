# APR-000 PROMPTWARE — Digest

> **Generated digest of [APR-000 PROMPTWARE](../APR-000-promptware.md) v0.1.3.** The full APR is authoritative — read it for motivation, prior art, and the full positioning. APR-000 is a *position statement*, not a rule set, so this digest is mostly definitional. Do not edit by hand.

**Abstract.** Defines promptware — software whose runtime behavior is shaped by content (prose, specs, ontology, policies) read by LLM agents at execution time — and argues it needs an architectural discipline distinct from code-centric software, published as the PROMPTARCH APR series.

**Position.** Software whose dominant runtime behaviour is shaped by content read at execution time by LLM agents requires architectural discipline distinct from that of code-centric software. PROMPTARCH publishes that discipline as Architectural Principle Records (APRs).

## What promptware IS

A system is promptware when it has all of:
- **Content as operative** — editing a Markdown/YAML file can materially change runtime behaviour, because that file is loaded into an agent's context at execution time.
- **LLM in the decision loop** — at least one consequential decision (routing, classification, tool selection, generation, evaluation) is made by an LLM reading that content, not by deterministic code.
- **Specification-as-execution** — the same file a human reads as a spec is what the LLM reads to act.

Threshold is **dominance, not exclusivity**: an LLM-reads-prose decisioning loop makes it promptware even with substantial deterministic code; a mostly-deterministic system with one edge LLM call is not.

## What promptware is NOT

Not "any software that uses an LLM" · not "AI" generally (excludes weight-defined behaviour with no content layer) · not "agentic" as a runtime label (the two overlap but name different things) · not low-code/no-code · not Software 2.0 (that = trained weights; promptware = prose read at runtime) · not "GenAI app" marketing.

## What PROMPTARCH addresses (and not)

**In scope:** how agents/skills are specified ([APR-001 ASPECT](../APR-001-aspect.md)); how non-behavioral content is organised ([APR-002 OBSERVE](../APR-002-observe.md)); the code/prompt boundary ([APR-003](../APR-003-code-prompt-boundary.md)); future autonomy, audit-binding, injection, routing.

**Out of scope:** how LLMs work · runtime architecture (schedulers, buses, RAG) · provider choice · regulatory compliance (supports ISO 42001 / EU AI Act audits, satisfies none) · security frameworks · eval tooling choice · code-centric concerns.

---
*Source: [APR-000 PROMPTWARE](../APR-000-promptware.md) v0.1.3 · regenerate this digest whenever the source changes.*
