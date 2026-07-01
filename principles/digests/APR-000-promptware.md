# APR-000 PROMPTWARE — Digest

> **Generated digest of [APR-000 PROMPTWARE](../APR-000-promptware.md) v0.2.0.** The full APR is authoritative — read it for motivation, prior art, and the full positioning. APR-000 is a *position statement*, not a rule set, so this digest is mostly definitional. Do not edit by hand.

**Abstract.** Establishes the foundational dyad: **software** = **promptware** + **codeware**. Promptware's dominant runtime behaviour is shaped by content (prose, specs, ontology, policies) interpreted at execution time by LLM agents; codeware's is governed by formal instructions run under fixed semantics by a compiler or interpreter. PROMPTARCH publishes the architectural discipline for the promptware class as the APR series.

**Position.** Software whose dominant runtime behaviour is shaped by content read at execution time by LLM agents — promptware — requires architectural discipline distinct from that of codeware. PROMPTARCH publishes that discipline as Architectural Principle Records (APRs).

## The dyad

Software is the umbrella for any artefact whose runtime behaviour is determined by authored *operative content*. It splits by **what interprets that content, and with what semantics**:

- **Codeware** — dominant operative content is a formal language, reduced to execution by a compiler/interpreter under **fixed, mechanical semantics**; behaviour is **bounded** by authored control flow.
- **Promptware** — dominant operative content is prose/specs/ontology/policies/examples, **interpreted at execution time by LLM agents** that assign meaning **probabilistically**; behaviour is **shaped, not bounded**.

The distinguishing invariant is the **interpreter's semantics** (formal-mechanical vs. model-probabilistic) — **not** code-vs-prose (a correlate; codeware has non-operative prose, promptware uses structured non-prose content) and **not** determinism (codeware is routinely non-deterministic; promptware's non-determinism is over *meaning itself*). Secondary asymmetry: promptware reads its operative content at *execution* time; codeware's is fixed in ahead of execution.

**Dominance, not exclusivity.** The minority substrate is the other's **serving layer** (codeware serving a promptware core, or vice versa). LLM-central-loop → promptware; deterministic-with-one-edge-LLM-call → codeware; neither dominant → **hybrid**, classified by region via the component-level `exec_form: code | prompt` axis ([APR-003](../APR-003-code-prompt-boundary.md), [APR-014](../APR-014-declare.md)). PROMPTARCH disciplines only promptware; codeware has established software engineering.

## What promptware IS

A system is promptware when it has all of:
- **Content as operative** — editing a Markdown/YAML file can materially change runtime behaviour, because that file is loaded into an agent's context at execution time.
- **LLM in the decision loop** — at least one consequential decision (routing, classification, tool selection, generation, evaluation) is made by an LLM reading that content, not by deterministic code.
- **Specification-as-execution** — the same file a human reads as a spec is what the LLM reads to act.

## What promptware is NOT

Not "any software that uses an LLM" (that's codeware with a promptware serving layer) · not "AI" generally (excludes weight-defined behaviour with no content layer) · not "agentic" as a runtime label (the two overlap but name different things) · not low-code/no-code · not Software 2.0 (that = trained weights; promptware = prose read at runtime, ≈ Karpathy's later "Software 3.0") · not "GenAI app" marketing. *Codeware* is a PROMPTARCH coinage (≈ Software 1.0), used only to locate the promptware boundary — not a claim on any commercial "Codeware" product.

## What PROMPTARCH addresses (and not)

**In scope:** how agents/skills are specified ([APR-001 ASPECT](../APR-001-aspect.md)); how non-behavioral content is organised ([APR-002 OBSERVE](../APR-002-observe.md)); the code/prompt boundary ([APR-003](../APR-003-code-prompt-boundary.md)); further autonomy, audit-binding, injection, routing.

**Out of scope:** how LLMs work · the engineering of codeware (type systems, build, deploy) · runtime architecture (schedulers, buses, RAG) · provider choice · regulatory compliance (supports ISO 42001 / EU AI Act audits, satisfies none) · security frameworks · eval tooling choice.

---
*Source: [APR-000 PROMPTWARE](../APR-000-promptware.md) v0.2.0 · regenerate this digest whenever the source changes.*
