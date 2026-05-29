# Why "Promptware"?

This is a short introduction to the term. **For the full, citable position** — what promptware is, what it is NOT, why it requires its own architectural discipline, and how it relates to neighbouring terms (prompt engineering, AI engineering, agentic AI, Software 2.0, low-code, policy-as-code) — see [APR-000 PROMPTWARE](../principles/APR-000-promptware.md).

## The one-paragraph version

**Promptware** is software whose dominant runtime behaviour is shaped by content read at execution time by LLM agents, rather than by deterministic code paths. Editing a markdown or YAML file in a promptware system can materially change runtime behaviour, because that file is loaded into an agent's context at execution time. The term distinguishes *content-centric* software (where the operative content is prose) from *code-centric*, deterministic software — and that distinction matters because the two classes have qualitatively different engineering disciplines: drift is silent in promptware, audit becomes interpretation, change impact is invisible without governance. PROMPTARCH is the principles layer that addresses those shifts.

## Why a new term at all?

The names already in circulation — "AI software," "agentic AI," "LLM application," "prompt engineering" — each cut a different joint:

- **"AI software"** is too broad. A deterministic pipeline with one LLM call at the edge is mostly code-centric; calling it "AI software" obscures the engineering reality.
- **"Agentic"** names a runtime pattern, not a content profile. Some agentic systems are promptware; some promptware systems are not agentic.
- **"LLM application"** is an implementation flavour, not an architectural category.
- **"Prompt engineering"** is a craft — the writing of *individual* prompts. It does not name the engineering of *systems* of prompts, content, and orchestration.

Without a name for the class of software where prose-and-config drive runtime decisions, architectural conversations slip into talking past each other. The full motivation, including how promptware sits relative to each of these neighbouring terms, is in [APR-000](../principles/APR-000-promptware.md).

## Is "promptware" original to PROMPTARCH?

No. The term has appeared informally in industry usage. PROMPTARCH does not claim invention — only a specific, bounded, technical use of the term, with the architectural discipline that follows.
