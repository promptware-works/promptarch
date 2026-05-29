# ADR-002 — Project licence: CC BY 4.0 for prose, Apache 2.0 for code

- **Status**: Accepted
- **Date**: 2026-05-29
- **Decider**: D. Maxios
- **Supersedes**: [ADR-001](ADR-001-license.md)

## Context

[ADR-001](ADR-001-license.md) chose MIT for the entire repository, trading fit-for-purpose for single-licence simplicity. While preparing PROMPTARCH for public release, that trade was re-examined and reversed. Two facts drove the change:

1. **The dominant artifact is prose, not code.** PROMPTARCH is a citable principles corpus (the APRs and supporting docs). The `schemas/` and `tools/` directories hold code, but they are a minority of the repository and largely unwritten today. MIT is a software licence; applied to prose it raises avoidable interpretive questions ("what is *the Software*? what are *substantial portions* of a paragraph?").

2. **Attribution is central to the project's value.** A shared vocabulary accrues authority through provenance — being correctly and consistently attributed is how the series becomes citable. ADR-001 left attribution merely "welcomed." For a principles series that is a weaker posture than the project wants.

ADR-001 itself flagged both the prose-on-MIT awkwardness and the absence of a patent grant as reasons it might be revisited. This ADR acts on those flags before any external contributions or adoption make a relicence expensive.

## Decision

Dual-license the repository:

- **Prose and documentation** — the APRs under `principles/`, and all content under `docs/`, `meta/`, `examples/`, and the repository's Markdown files — under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**. Full text in [`LICENSE-docs`](../../LICENSE-docs).
- **Code** — the machine-readable schemas under `schemas/` and any tooling under `tools/` — under the **Apache License, Version 2.0**. Full text in [`LICENSE`](../../LICENSE).

A [`NOTICE`](../../NOTICE) file at the repository root records the copyright and restates the split. The README "Licensing" section is the human-facing summary.

### Why these two specifically

- **CC BY 4.0, not BY-ND or BY-SA.** No-Derivatives would block the paraphrasing and excerpting into other documents that PROMPTARCH explicitly wants to enable. Share-Alike would force downstream adopters to relicense their own documents — reintroducing the adoption friction the project is trying to avoid. Plain CC BY 4.0 = "reuse freely, credit required," which matches intent.
- **Apache 2.0, not MIT.** Apache 2.0 adds an explicit patent grant over MIT at no meaningful cost to enterprise adopters. ADR-001 noted that future tooling (e.g., a novel evaluation algorithm) could make a patent grant matter; choosing Apache now avoids a forced relicence later, which becomes hard once there are external code contributors.
- **No copyleft (GPL/AGPL).** Would defeat the goal of frictionless reuse of the principles as a shared vocabulary.

## Consequences

**Positive**

- Each kind of content carries the licence idiomatic for it; interpretive ambiguity on prose is removed.
- Attribution on reuse of the principles is now a licence requirement, aligning the legal posture with how the project wants to be cited.
- Code adopters get a patent grant; the project is insulated from a costly future relicence.

**Negative**

- Two licences instead of one: adopters must know which covers which directory. Mitigated by the README table, the `NOTICE` file, and the per-directory mapping above.
- GitHub's licence detector keys off the root `LICENSE` file and will report the repository as Apache-2.0, under-representing that most content is CC BY 4.0. Accepted as a cosmetic limitation; the README and `NOTICE` state the full picture.

**Neutral**

- Inbound-equals-outbound is retained: contributors offer prose under CC BY 4.0 and code under Apache 2.0 (see [`CONTRIBUTING.md`](../../CONTRIBUTING.md)). Contributors retain copyright in their contributions.

## Revisiting

This ADR should be revisited if a formal foundation or governance body is established and prefers a different model, or if downstream adopters report concrete friction with the prose/code split.
