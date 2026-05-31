# APR Process

This document describes how an Architectural Principle Record progresses from idea to accepted principle in PROMPTARCH.

## 1. Stages

```text
   Idea
    │
    ▼
[Issue: Proposal]      ← discussion, scoping, sanity check
    │
    ▼
[PR: Draft APR]        ← first full draft, status: Draft
    │
    ▼
[Review]               ← editorial + architectural review, status: Proposed
    │
    ▼
[Accepted]             ← merged, frozen content, status: Accepted
    │
    ├─ amended → version bump (still status: Accepted)
    │
    └─ obsolete → status: Deprecated  or  Superseded by APR-XXX
```

## 2. Proposing an APR

Rough ideas not yet ready for an issue can be parked in the [APR backlog](apr-backlog.md) — a living list of candidate APRs and their stage.

Before writing prose, open an issue using the *APR proposal* template (when available) or a free-form issue covering:

1. **One-line statement of the principle.** If you can't write it in one line, the principle is probably two principles.
2. **Motivating problem.** What goes wrong in promptware systems that lack this principle?
3. **Audience.** Who would adopt this — agentic-platform architects, framework authors, both?
4. **Scope.** Where does it apply? Where does it *not* apply?
5. **Prior art.** What existing patterns (inside or outside agentic AI) does this relate to? An honest accounting protects the project's credibility — the goal is contribution, not novelty for novelty's sake.

A proposal SHOULD attract at least one supportive maintainer review before progressing to a draft PR. Proposals can be declined at this stage with a written rationale.

## 3. Drafting

A draft APR is a PR against the `main` branch (or its successor) adding a new file under [`principles/`](../principles/), following the template at [`principles/_template/APR-NNN-template.md`](../principles/_template/APR-NNN-template.md).

The APR file is created with `status: Draft`. Numbering follows [`apr-numbering.md`](apr-numbering.md). Frontmatter MUST conform to [`schemas/apr-frontmatter.schema.yaml`](../schemas/apr-frontmatter.schema.yaml).

## 4. Review

When the author considers the draft complete, they update `status` to `Proposed` and request review. Reviewers check:

- **Scope discipline.** Is this one principle, or several?
- **Self-containment.** Does it stand alone, or does it presume undocumented context?
- **Limits.** Is there an explicit "what this is not" section? Principles without bounded scope tend to over-reach.
- **Prior-art honesty.** Are relationships to established patterns named openly *and backed by a References section with resolvable links*? Standards and tools are cited, not merely named; ideas with no canonical source are flagged as such rather than given an invented citation.
- **Wording.** Active voice; RFC 2119 keywords where normative; no marketing language; tables for declarative governance.
- **Cross-references.** Internal links resolve; APR references use canonical IDs.
- **Standard opening.** Frontmatter carries the (schema-required) `abstract`; the body opens with a one-line `>` principle callout immediately after the H1, per the template skeleton.

A Proposed APR sits open for at least 7 days before merge, to give the community a chance to weigh in. Substantive review comments may move the APR back to `Draft`.

## 5. Acceptance

When reviewers and maintainers reach consensus, `status` is set to `Accepted` and the PR is merged. The content is then considered *frozen* in the sense that editorial fixes are allowed but semantic changes require a version bump (and may require a new APR if the change is large).

## 6. Versioning, deprecation, supersession

- **Editorial fix**: typo / link / clarification with no semantic change — same version.
- **Minor version (`0.1.x`)**: tightening or extending without breaking existing references.
- **Major version (`x.0.0`)**: semantic change that consumers of the APR need to react to.
- **Deprecated**: the APR is no longer recommended but has no replacement. Status is updated; the document remains.
- **Superseded**: a newer APR replaces this one. The deprecated APR's frontmatter MUST set `superseded-by` and the new APR's frontmatter MUST set `supersedes`. Cross-links MUST be added in prose so a reader landing on either record finds the other.

See [`apr-statuses.md`](apr-statuses.md) for the full status state machine.

## 7. Project-level decisions vs APRs

Decisions about *the project itself* (e.g., licence choice, numbering scheme, tooling) are recorded as ADRs in [`meta/decisions/`](decisions/), not as APRs. APRs are reserved for principles about agentic-AI promptware architecture — i.e., content that downstream adopters might cite.
