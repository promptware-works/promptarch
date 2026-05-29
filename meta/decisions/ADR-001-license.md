# ADR-001 — Project licence: MIT for everything

- **Status**: Accepted
- **Date**: 2026-05-28
- **Decider**: Robil Daher

## Context

PROMPTARCH is a hybrid repository: most content is prose (APRs, supporting docs) but the [`schemas/`](../../schemas/) and [`tools/`](../../tools/) directories will contain code (YAML schemas, validators, linters). Three licence shapes were considered for a project of this nature:

1. **Dual licence** — Creative Commons Attribution 4.0 (CC-BY 4.0) for prose, plus an OSI-approved software licence (MIT or Apache 2.0) for code.
2. **Apache 2.0** alone — for the explicit patent grant.
3. **MIT** alone — simplest, shortest, most permissive OSI-approved licence.

## Decision

Use **MIT** for the entire repository — prose and code alike. A single `LICENSE` file at the repository root applies to all content.

## Consequences

**Positive**

- One licence, one file, one set of obligations on adopters — the lowest possible friction for reuse, reference, paraphrase, and inclusion of PROMPTARCH content in other projects.
- MIT is universally recognised by enterprise legal teams; no due-diligence stalls.
- Citation is welcomed but not legally required — the project's reputation depends on quality, not on licence-enforced attribution.

**Negative**

- MIT was designed for software, not prose. Using it on documentation is legally fine but is culturally less idiomatic than CC-BY for documentation. We accept this trade in exchange for licence-shape simplicity.
- No explicit patent grant. If PROMPTARCH later publishes substantive tooling that could trip patent issues (e.g., a novel evaluation algorithm), the project may need to reconsider — likely via a per-directory licence under [`tools/`](../../tools/), or by re-licensing the whole repo to Apache 2.0.

**Neutral**

- Contributors retain copyright in their contributions but grant the project the right to redistribute under MIT (the standard inbound-equals-outbound convention).

## Revisiting

This ADR should be revisited if any of the following occur:

- A substantive contributor or downstream adopter raises a concern about the prose-on-MIT framing.
- Tooling under [`tools/`](../../tools/) grows to the point that a patent grant matters.
- A formal foundation or governance body is established and prefers a different licence model.
