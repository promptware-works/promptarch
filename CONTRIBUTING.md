# Contributing to PROMPTARCH

Thank you for considering a contribution. PROMPTARCH is a small, curated collection of architectural principles — the bar for accepting a new APR is intentionally high, but the bar for editorial corrections, clarifications, and discussion is low.

## Types of contribution

| Type | Process |
|---|---|
| Typo / grammar / link fix | Open a PR directly. |
| Clarification of existing prose (no semantic change) | Open a PR directly; tag the affected APR ID in the title. |
| New example, FAQ entry, or supporting doc | Open an issue first to confirm fit; then PR. |
| Substantive change to an existing APR | Open an issue. May result in a new version of the APR or a superseding APR — see [`meta/apr-process.md`](meta/apr-process.md). |
| **Proposal of a new APR** | Open an issue using the *APR proposal* template (when available) or following the structure in [`meta/apr-process.md`](meta/apr-process.md). Substantial review happens at issue stage *before* a draft is written. |

## Authoring an APR

If your proposal advances to a draft, follow the template at [`principles/_template/APR-NNN-template.md`](principles/_template/APR-NNN-template.md). The numbering rules are in [`meta/apr-numbering.md`](meta/apr-numbering.md); the status state machine is in [`meta/apr-statuses.md`](meta/apr-statuses.md).

A passing APR draft typically includes:

- A motivating problem that is broad (i.e., not specific to one product).
- A clearly-named principle, ideally a memorable mnemonic + expansion (the ASPECT/OBSERVE style).
- Explicit scope of applicability — *and* explicit limits / "what this is not."
- At least one section relating the principle to established patterns or prior art, written honestly.
- Versioned frontmatter conforming to [`schemas/apr-frontmatter.schema.yaml`](schemas/apr-frontmatter.schema.yaml).

## Attributing LLM co-authorship

If an LLM materially helped draft your APR, record it in the optional `co-authors:` frontmatter field. This is distinct from `authors:` so the human / non-human distinction stays grep-able and auditable.

```yaml
authors:
  - Your Name
co-authors:
  - "Claude Opus 4.7 (Anthropic)"
```

Use one entry per model that contributed substantively. Trivial assistance (typo fixes, formatting suggestions) does not need to be recorded; substantive drafting, restructuring, or section authorship does. The full field convention is in [`schemas/apr-frontmatter.schema.yaml`](schemas/apr-frontmatter.schema.yaml).

## Tone

PROMPTARCH prose is matter-of-fact, declarative, and audit-friendly. We avoid:

- Marketing language ("revolutionary", "game-changing").
- Vague hedges ("might", "could" — prefer "MAY"/"SHOULD"/"MUST" per RFC 2119 when stating a normative rule).
- Tables-for-decoration. If a list is not actually tabular, use a list.

## Code of conduct

See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Licence

By contributing you agree your contribution is offered under the project's licences on an inbound-equals-outbound basis: prose and documentation under **CC BY 4.0** (see [`LICENSE-docs`](LICENSE-docs)) and code under **Apache 2.0** (see [`LICENSE`](LICENSE)). The split is recorded in [`meta/decisions/ADR-002-license.md`](meta/decisions/ADR-002-license.md).
