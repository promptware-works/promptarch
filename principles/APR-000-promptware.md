---
apr: 0
title: "PROMPTWARE — A Foundational Position for the PROMPTARCH APR Series"
abstract: "Establishes the foundational dyad for PROMPTARCH: software divides into promptware — whose dominant runtime behaviour is shaped by content interpreted at execution time by LLM agents — and codeware — whose dominant behaviour is governed by formal instructions run under fixed semantics by a compiler or interpreter. The two are distinguished by the interpreter's semantics, not by prose-vs-code or determinism; each can serve as the other's minority serving layer, with hybrids classified by region. PROMPTARCH publishes the architectural discipline for the promptware class as the APR series."
status: Draft
class: architectural
version: 0.2.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.7 (Anthropic; 1M context)"
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2025-11-03
last-updated: 2026-07-01
audience: Readers approaching PROMPTARCH for the first time; architects evaluating whether the APR series applies to their systems
supersedes: []
superseded-by: []
related:
  - APR-001
  - APR-002
  - APR-003
  - APR-014
tags:
  - foundational
  - terminology
  - position
  - promptware
  - codeware
---

# APR-000 PROMPTWARE — A Foundational Position for the PROMPTARCH APR Series

> **Software** divides into two classes by what governs its dominant runtime behaviour. **Codeware**'s behaviour is governed by instructions in a formal language, reduced to execution by a compiler or interpreter under fixed, mechanical semantics. **Promptware**'s behaviour is shaped by content interpreted at execution time by LLM agents, which assign meaning probabilistically. Promptware requires architectural discipline distinct from codeware's — PROMPTARCH publishes that discipline as a series of Architectural Principle Records (APRs).

*Injectable summary (for feeding to an LLM): [`digests/APR-000-promptware.md`](digests/APR-000-promptware.md). This full APR is canonical.*

This APR is the foundational position the rest of the series builds on. It is not a dictionary entry for the term "promptware"; it is a normative claim about *why* promptware deserves its own discipline and *what* PROMPTARCH does about it. The dyad it draws — promptware and codeware under a broadened *software* — exists to name that discipline's boundary precisely.

---

## Motivation

The names already in circulation for LLM-driven systems do not cut the right joints for architectural reasoning.

- **"AI software"** is too broad. A system that calls an LLM once at the edge but is otherwise deterministic is mostly codeware. Calling it "AI software" obscures that its engineering discipline is mostly the established discipline of codeware.

- **"Agentic AI / agentic software"** names a runtime pattern (autonomous decision-making, multi-turn, tool use). It is orthogonal to *what the operative content is*. A multi-agent system whose decisions are entirely defined by Python code is not what PROMPTARCH addresses; a single-turn classifier whose behaviour is shaped by injected ontology, policies, and examples is.

- **"LLM application"** is an implementation flavour, not an architectural category. Two LLM applications can have radically different engineering profiles depending on whether prose drives behaviour or merely decorates it.

- **"Prompt engineering"** is a craft — the writing of individual prompts. It does not name the engineering of *systems* of prompts, content, and orchestration that share state and discipline across many components.

Without a name for the class of software where prose-and-config drive runtime decisions — and a matching name for the class it is *not* — architectural discussions slip into talking past each other. The author asks "how do you organise your skill library?" and the reader replies in terms of API call patterns; the author asks "how do you handle ontology drift?" and the reader replies in terms of model versioning. The lack of a shared term keeps the architectural concerns invisible.

---

## The dyad: promptware and codeware

PROMPTARCH treats **software** as the umbrella term for any artefact engineered so that its runtime behaviour is determined by authored *operative content* — the material a human writes to specify what the system does. Software divides into two classes by **what interprets that operative content, and with what semantics**:

- **Codeware** — software whose dominant operative content is expressed in a *formal language* and reduced to execution by a compiler or interpreter under *fixed, mechanical semantics*. The same source yields the same interpretation every run; behaviour is **bounded** by the authored control flow.

- **Promptware** — software whose dominant operative content is prose, specifications, ontology, policies, and examples, *interpreted at execution time by LLM agents* that assign meaning *probabilistically*. Behaviour is **shaped, not bounded**, by the authored content; the same content can be read differently across inputs and across model versions.

The distinguishing invariant is the **interpreter and its semantics** — formal-mechanical versus model-probabilistic — **not** the surface medium and **not** determinism:

- **Not "code vs. prose."** Prose is the *typical* medium of promptware and formal syntax the typical medium of codeware, but they are correlates, not the definition. Codeware carries prose (comments, docstrings, a README) that shapes *human* behaviour but not runtime behaviour; promptware is often driven by *structured, non-prose* content (ontology YAML, policy tables, example sets). What matters is which content the *runtime interpreter* acts on.

- **Not "deterministic vs. non-deterministic."** Determinism is a frequent *consequence* of formal semantics, not the boundary. Codeware is routinely non-deterministic — concurrency, wall-clock, RNG, network, served model weights — yet remains codeware because its behaviour is still governed by mechanically-interpreted instructions. Promptware's non-determinism is of a different kind: *meaning itself* is assigned probabilistically.

A second asymmetry follows from the first: promptware *reads its operative content at execution time*, so editing a markdown or YAML file can change behaviour with no build step; codeware's operative content is typically *fixed into the executable ahead of execution* by compilation or interpretation. This is a large part of *why* the two classes drift, are audited, and must be governed differently.

### Dominance, serving layers, and hybrids

The classes are defined by **dominance, not exclusivity**. Real systems mix both substrates: an agent that reads prose to *decide* and runs code to *compute*; a deterministic pipeline with one LLM enrichment step. When one mode is present only as the minority, it is the other's **serving layer** — codeware serving a promptware core (tool implementations, validators, routers, the runtime itself), or promptware serving a codeware core (an LLM feature bolted onto a deterministic product).

- A system whose **central decisioning loop** is an LLM reading operative content is **promptware**, even with substantial deterministic code beneath it.
- A system that is deterministic end-to-end with a **single LLM call at the edge** is **codeware** with a promptware serving layer.
- Where neither mode dominates, the system is **hybrid**; the honest classification names its promptware and codeware *regions* separately — see [APR-003](APR-003-code-prompt-boundary.md) for the component-level `exec_form: code | prompt` axis and [APR-014 DECLARE](APR-014-declare.md) for how a component declares it — rather than forcing a single whole-system label.

PROMPTARCH publishes the discipline for the **promptware** class. Codeware already has a mature engineering discipline — type systems, compilers, build pipelines, unit tests — that PROMPTARCH does not duplicate. Naming codeware explicitly is what lets the principles speak precisely about the *seam* between the two ([APR-003](APR-003-code-prompt-boundary.md)) and about the codeware that *serves* promptware, instead of gesturing at an unnamed "everything else."

---

## The position

> **Software whose dominant runtime behaviour is shaped by content read at execution time by LLM agents — promptware — requires architectural discipline distinct from that of codeware.**

This is normative. It claims three things:

1. There is a meaningful category of systems for which prose, specifications, ontology, policies, examples, and evals are the *operative content* — not decoration.
2. The discipline appropriate to that category is materially different from the discipline appropriate to codeware, in ways that matter at scale.
3. That discipline can and should be specified in a way that is teachable, citable, and machine-verifiable — not implicit in expert practice.

PROMPTARCH names that category **promptware** and publishes the discipline as APRs.

---

## What promptware is

A promptware system has at least the following observable properties:

- **Content as operative.** Editing a markdown or YAML file in the repository can materially change runtime behaviour, because that file is loaded into an LLM agent's context at execution time. The "code" of the behaviour is, in part, prose.

- **LLM in the decision loop.** At least one consequential decision — routing, classification, tool selection, content generation, evaluation — is made by an LLM reading the operative content, rather than by a deterministic algorithm.

- **Specification-as-execution.** Agent and skill specifications are not just documentation; they are inputs to the runtime. The same file a human reads as a spec is also what the LLM reads to know what to do.

The minimum threshold is a matter of *dominance*, not exclusivity. A system whose central decisioning loop is an LLM reading prose is promptware even if it also contains substantial deterministic code; a system that is mostly deterministic with a single LLM call at the edge is not.

---

## What codeware is

Codeware is named in this series only as the symmetric counterpart that lets PROMPTARCH speak precisely; the series does not attempt to discipline it. A codeware system's operative content is formal source; its behaviour is honoured by a compiler or interpreter under fixed semantics, verified by type checks and unit/property tests, and bounded by authored control flow. Its failure modes — type errors, race conditions, dependency breakage — and their mitigations are the domain of established software engineering.

Codeware matters to PROMPTARCH in exactly two ways:

- It is the **serving layer** beneath most promptware — the tools, validators, routers, and runtime that a promptware core calls into.
- The **code/prompt seam** where codeware meets promptware is itself an architectural concern, because a value crossing it moves between fixed and probabilistic semantics. That seam is governed by [APR-003](APR-003-code-prompt-boundary.md), and the per-component substrate is declared as `exec_form: code | prompt` per [APR-014 DECLARE](APR-014-declare.md).

---

## What promptware is NOT

The term is bounded:

- **Not "any software that uses an LLM."** A deterministic pipeline with an LLM-powered enrichment step is not promptware; the LLM is a component, not the architecture — it is codeware with a promptware serving layer.
- **Not "AI" as a general category.** Promptware excludes systems whose behaviour is shaped by trained model weights without prose specifications driving runtime context (classical ML, fine-tuned-and-served models without a content layer).
- **Not "agentic" as a runtime label.** Some agentic systems are promptware; some promptware systems are not agentic (e.g., a single-call classifier with rich injected ontology and policies). The two terms overlap heavily but name different things.
- **Not "low-code / no-code."** Those terms describe development surfaces (visual builders, configuration UIs). Promptware describes operative content profile.
- **Not "Software 2.0" in Karpathy's sense.** "Software 2.0" referred to behaviour defined by trained weights. Promptware refers to behaviour defined by prose read at runtime — a different mode of programmability (see *Relationship to established terms*).
- **Not a synonym for "GenAI app."** Marketing terms drift; "promptware" is intended as a technical category.

The term is also **not original to PROMPTARCH**. It has appeared informally in industry usage. PROMPTARCH does not claim invention; it claims a specific, bounded, technical use of the term, and publishes the architectural discipline that follows.

---

## Why promptware needs its own architectural discipline

Promptware systems exhibit a set of failure modes that codeware's architectural discipline is not equipped to address:

- **Silent drift.** The same enum, definition, or threshold appears in multiple prose specs; one edit and the others fall out of sync. There is no compiler to flag the divergence.
- **Audit-by-interpretation.** Policy values and concept definitions live in markdown readable only by humans. Compliance evidence depends on prose reading, not on machine-verifiable structure.
- **Invisible change impact.** Adding a severity level, renaming a domain concept, or extending a contract field requires editing N skills; nothing tells the author N or which skills.
- **Asserted quality.** Without canonical homes for examples and evaluation sets, prompt changes ship on intuition. Regressions are invisible until production.
- **Compounding token cost.** Every skill carries its own copy of shared concepts. Per-delegation context inflates with every duplicated paragraph.
- **Misrouting.** In multi-agent systems, "Use this agent when X" is necessary but insufficient — without explicit negative scoping, agents are invoked outside their competence.
- **Undeclared autonomy.** Agents that write to shared state, call external systems, or apply code changes have blast radius beyond their immediate prompt. Without declarative autonomy profiles, the blast radius is implicit.

Each failure mode has a codeware analogue (typo, audit log, refactor scope, test coverage, code duplication, API misuse, privilege escalation), but the *mitigations* are different because the artefact being engineered is prose, not code. Type systems, compilers, dependency graphs, and unit tests do not apply directly — equivalent mitigations have to be reinvented for content-centric artefacts.

PROMPTARCH publishes those equivalents as APRs. The discipline that *enforces* them — the reconstructed conformance safety net — is itself a principle: see [APR-010 Governance](APR-010-governance.md).

---

## Scope of the PROMPTARCH APR series

### What PROMPTARCH addresses

PROMPTARCH publishes principles for the architectural concerns of promptware:

- **How agents and skills are specified.** Body structure, frontmatter contracts, governance slots. See [APR-001 ASPECT](APR-001-aspect.md).
- **How non-behavioural content is organised.** Ontology, values, rules, shapes, examples, evals as first-class artefacts with declarative manifests. See [APR-002 OBSERVE](APR-002-observe.md).
- **Where the code/prompt boundary sits.** How to place each behaviour in the substrate whose guarantees match it, and how to type the seam between codeware and promptware. See [APR-003](APR-003-code-prompt-boundary.md).
- *(Further)* Autonomy and blast-radius declaration, audit-log binding, selective context injection, multi-agent routing discipline — each addressed as the principle stabilises.

### What PROMPTARCH does NOT address

- **How LLMs work.** The principles apply across model families; nothing here depends on a specific model's internals.
- **The engineering of codeware.** Type systems, build systems, deployment pipelines, and the rest of established software engineering govern the codeware class; PROMPTARCH does not duplicate them.
- **Runtime architecture.** Schedulers, message buses, persistence layers, RAG infrastructure — out of scope.
- **Provider choice.** Anthropic, OpenAI, open-weight models — the principles are vendor-neutral.
- **Regulatory compliance frameworks.** PROMPTARCH produces audit-friendly structure that *supports* ISO 42001 / EU AI Act / similar audits, but does not by itself satisfy any regulatory obligation.
- **Security frameworks.** Trust boundaries and prompt-injection defence are in scope (see [APR-005](APR-005-trust-boundaries.md)); forensic traceability is in scope (see [APR-002](APR-002-observe.md) §10). Generic platform security — access-control infrastructure, secrets management, cryptographic signing, transport security, sandboxing — is layered on top, not reinvented here.
- **Evaluation tooling.** Where to put eval sets and what governance applies to them is in scope; the choice of eval framework (Braintrust, Promptfoo, custom) is platform-specific.

---

## Relationship to established terms and patterns

PROMPTARCH does not invent the term "promptware" and does not claim the observation that prose can drive behaviour is novel. Honest positioning relative to neighbouring terms and discourses:

| Term / discourse | Overlaps with promptware in… | Distinct in… |
|---|---|---|
| **Prompt engineering** (~2022–) | Treating prose as operative content; emphasis on prompt structure | A craft of *individual prompts*, not a discipline of *systems of prompts*; no governance / drift / audit concerns |
| **AI engineering** (Chip Huyen et al., ~2023–) | Concern with LLM-driven systems at scale; lifecycle / evals / observability | Broader: covers training, data pipelines, deployment, monitoring. Promptware is the *content-side* subset where prose drives runtime |
| **Agentic AI / agent engineering** | LLM agents as first-class actors; multi-agent coordination | Names a *runtime pattern* (autonomy, tool use, multi-turn). Promptware names a *content profile*. The two overlap heavily but are orthogonal |
| **LLM application development** | Practical implementation of LLM-driven products | An implementation flavour, not an architectural category. A given LLM application may or may not be promptware |
| **Software 2.0** (Karpathy, ~2017) | Behaviour defined by something other than handwritten imperative code | "Software 2.0" = behaviour defined by *trained weights*. Promptware = behaviour defined by *prose read at runtime*. Different mode of programmability |
| **Low-code / no-code** (~2010s) | Software defined by something other than text source code | Defined by *configuration / visual builders*, executed by deterministic engines. Promptware is defined by *prose read by an LLM at runtime* |
| **Configuration-as-code** | Operative content held in declarative artefacts | Configuration drives deterministic engines (Kubernetes, Terraform). Promptware drives non-deterministic LLM agents — different governance needs |
| **Policy-as-code** (OPA / Rego, ~2016) | Rules separated from runtime, declaratively defined | Rules consumed by a *policy engine*, not by an LLM agent. Promptware can apply policy-as-code patterns to LLM-consumed rules (see APR-002) |

The novel contribution of PROMPTARCH is **the publication of architectural principles for the named category of promptware** — not the term, not the observation that prose can drive behaviour, but the specific discipline encoded as a citable APR series.

### On the term *codeware*

This revision introduces **codeware** as the symmetric counterpart to promptware and broadens *software* to be the umbrella over both. Unlike "promptware" — which PROMPTARCH adopts from pre-existing informal usage — "codeware" is a **coinage** for the purpose of this framing, and it is positioned with the same honesty:

- It is used in exactly one sense here: software whose dominant operative content is interpreted under fixed, formal semantics. It is **not** a claim on any prior or commercial use of the word "Codeware" — notably **Codeware Inc.**, a pressure-vessel design-software vendor since 1983 (see References) — which is unrelated.
- Relative to Karpathy's numbering, codeware corresponds to hand-authored "**Software 1.0**"; promptware is closest to his later "**Software 3.0**" framing (systems "programmed" in natural language), while remaining distinct from "**Software 2.0**" (behaviour defined by *trained weights*) — a promptware system's behaviour is defined by *content read at runtime*, not by the weights of the model reading it.
- Codeware is named to be *bounded*, not disciplined: PROMPTARCH says only enough about it to locate the promptware boundary and the code/prompt seam. Its own architectural discipline is the mature, existing field of software engineering.

---

## How to read the APR series

- **Each APR is durable and citable.** Cite by full ID, title, and version (e.g., *APR-001 ASPECT v0.2.0*).
- **APRs are normative.** They use RFC 2119 keywords (MUST / SHOULD / MAY) where they state requirements. Read them as professional discipline, not as suggestions.
- **APRs are bounded.** Every APR includes an explicit "what this is NOT" section. Adopters in regulated or specialised contexts layer their own controls on top.
- **The series evolves through new APRs, not silent rewrites.** Accepted APRs are frozen in content; supersession is explicit (see [`meta/apr-statuses.md`](../meta/apr-statuses.md)).

For the index and reading order, start at [`principles/README.md`](README.md). APR-000 is a position statement, not a prerequisite — readers comfortable with the framing can skip directly to the principle that addresses their concern.

---

## A note on numbering

APR-000 is reserved as the project's *foundational position*. The convention is borrowed from numbering schemes (RFC, IETF drafts, some ADR collections) that reserve index zero for the document that introduces and motivates the series itself.

APR-000 is unique:

- There is exactly one APR-000. It cannot be superseded by another APR-000 — only revised in place (with version bumps) or supplanted by a new foundational position that itself takes APR-000's place via the standard `supersedes` mechanism.
- APR-001 onward are normal principle records and follow the rules in [`meta/apr-numbering.md`](../meta/apr-numbering.md).

If the foundational position changes substantively, a new draft of APR-000 is published with a major version bump (e.g., 1.0.0 → 2.0.0). The change is then visible in the APR's change log and propagates through the citation history.

---

## References

External sources referenced in this APR. PROMPTARCH claims no novelty over these; see *Relationship to established terms and patterns* above.

1. Karpathy, A. *Software 2.0*. 2017. <https://karpathy.medium.com/software-2-0-a64152b37c35>
2. Karpathy, A. *Software Is Changing (Again)* — "Software 3.0," programming LLMs in natural language. Talk, Y Combinator AI Startup School, 17 June 2025. <https://www.latent.space/p/s3>
3. Huyen, C. *AI Engineering: Building Applications with Foundation Models*. O'Reilly, 2025. <https://huyenchip.com/>
4. Open Policy Agent (CNCF). *Rego Policy Language*. <https://www.openpolicyagent.org/docs/policy-language>
5. Bradner, S. *Key words for use in RFCs to Indicate Requirement Levels (RFC 2119 / BCP 14)*. IETF, 1997. <https://datatracker.ietf.org/doc/html/rfc2119>
6. ISO/IEC. *ISO/IEC 42001:2023 — Information technology — Artificial intelligence — Management system*. 2023. <https://www.iso.org/standard/42001>
7. European Parliament and Council. *Regulation (EU) 2024/1689 (Artificial Intelligence Act)*. Official Journal of the EU, 2024. <https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng>
8. Codeware Inc. *Codeware — pressure-vessel design software* (an unrelated prior commercial use of the name "Codeware," in business since 1983). <https://www.codeware.com/>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-28 | Draft | Initial draft published as APR-000, the foundational position for the PROMPTARCH APR series. |
| 0.1.1 | 2026-05-30 | Draft | Added References section. No semantic change. |
| 0.1.2 | 2026-05-30 | Draft | Added `abstract` frontmatter field. No semantic change. |
| 0.1.3 | 2026-05-30 | Draft | Renamed `authors`→`principals` and `co-authors`→`generative-contributors`. No semantic change. |
| 0.2.0 | 2026-07-01 | Draft | Semantic revision. Introduced the **software = promptware + codeware** dyad: named *codeware* as the symmetric counterpart to promptware and broadened *software* as the umbrella over both. Redefined both classes on the **interpreter's semantics** (formal-mechanical vs. model-probabilistic) rather than on prose-vs-code or determinism. Added serving-layer / hybrid framing, a *What codeware is* section, and an *On the term codeware* prior-art note (coinage honesty; Software 1.0/3.0 relationship). Replaced the unnamed "code-centric software" foil with *codeware* throughout. Harmonized with the component-level `exec_form: code \| prompt` axis (APR-003 / APR-014). |
