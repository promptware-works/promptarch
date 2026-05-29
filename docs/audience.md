# Audience

PROMPTARCH is written for technical readers with first-hand experience building or operating LLM-driven systems. Specifically:

## Primary audience

- **Architects of agentic platforms.** People designing multi-agent systems, agent runtimes, or skill frameworks who need a stable, citable reference for organisational principles.
- **Framework authors.** People building reusable agent / skill infrastructure (loaders, orchestrators, manifest validators) who want a shared vocabulary with their adopters.
- **Engineering leads adopting agentic AI at scale.** People who have hit the maintenance pain that motivates the principles — drift, audit-by-interpretation, untracked change impact — and are looking for a discipline rather than a tutorial.

## Secondary audience

- **Researchers and educators.** Academics and instructors teaching agentic-AI architecture, who can use APRs as named, durable units of reference in papers and curricula.
- **Compliance and audit functions.** People in regulated industries who need to map LLM-system behaviour to ISO 42001 / EU AI Act controls, and who benefit from APR-level governance language being externalised from internal documents.

## Not the audience

- **First-time AI/LLM users.** PROMPTARCH assumes you've built and operated at least one non-trivial LLM application. It does not explain what an embedding is or how prompts work at the API level.
- **Single-shot LLM API users.** A system that calls `Anthropic.messages.create` once and returns the result rarely benefits from APR-002 OBSERVE's content-organisation discipline — it has too little content to organise.
- **Marketers and product managers without engineering context.** APRs are dense, prescriptive, and intentionally devoid of vendor framing. They are unlikely to be useful as marketing input.

## Expected background

A reader who gets full value from PROMPTARCH typically has:

- Hands-on experience with at least one LLM provider's API (Anthropic, OpenAI, etc.).
- Familiarity with markdown frontmatter, YAML, and JSON Schema.
- Exposure to or experience with multi-agent / orchestrator-style systems.
- Some prior exposure to architecture decision records (ADRs) or similar lightweight architecture documentation.

Readers without that background can still benefit, but may find some APRs assume more than they spell out. Where this is true, the APR's "Audience" frontmatter and §1 motivation are the right places to start — if the motivation doesn't resonate, the rest of the APR likely won't either.
