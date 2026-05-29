# Why "Promptware"?

The term **promptware** is used throughout PROMPTARCH to name a class of software whose dominant behavior is shaped by prompts and natural-language specifications consumed by LLM agents, rather than by deterministic code paths.

## The distinction

Consider two systems that "do the same thing" — say, both classify a piece of text as `low | medium | high | critical`.

- **Code-centric.** A function with explicit `if`/`else` branches over regex matches, keyword counts, and numeric thresholds. The behavior is entirely defined by the code; the inputs to debugging are the code itself plus example traces.
- **Promptware.** A skill spec whose prose says "classify the input according to the rubric below" plus an injected ontology that defines what each label means, an injected policy that defines the decision rules, and a few-shot example block. The behavior is shaped by an LLM reading prose; the inputs to debugging include all of the injected content, the prompt template, the model version, and the temperature.

These two systems have **profoundly different engineering disciplines** even when they produce the same outputs. In particular:

- Drift in promptware is silent because the "code" is prose, and prose has no compiler.
- Audit in promptware depends on capturing *what content was injected at the moment of decision*, not just what the latest version of the repo says.
- Change impact in promptware is hard to see — editing a single ontology file can change the behavior of every skill that injects it.

## Why not just call it "AI software"?

"AI software" is too broad. A system that calls an LLM once at the edge but otherwise behaves deterministically (e.g., a deterministic pipeline with an LLM-powered enrichment step) is mostly code-centric, with a small AI component bolted on. The architectural discipline for that system is *mostly* traditional software engineering.

A system whose central decision-making loop is an agent reading prose, choosing what to do, calling other agents, and producing consequential actions is qualitatively different. Calling both "AI software" obscures the architectural challenge that PROMPTARCH addresses.

## Why not "agentic software"?

"Agentic" describes a runtime pattern (autonomous decision-making, multi-turn, tool use). Promptware describes a *content profile* (prose as operative content). The two overlap heavily in practice but are not identical.

- A heavily-promptware system that has no agentic loop (e.g., a one-shot text classifier with rich injected ontology and policies) still benefits from PROMPTARCH's principles.
- An agentic system whose behavior is entirely defined by code (e.g., a state-machine bot with no LLM in the loop) is not promptware.

Most modern agentic AI systems are also promptware systems; PROMPTARCH uses both terms.

## Is "promptware" original to PROMPTARCH?

The term has appeared informally in industry usage. PROMPTARCH does not claim invention of the term — only its specific use as the named subject domain of these APRs. Where the term is used in other ways in the literature, this project's usage is the one defined here.
