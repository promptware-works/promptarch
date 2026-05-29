---
apr: NNN
title: "MNEMONIC — <Descriptive subtitle>"
status: Draft                  # Draft | Proposed | Accepted | Deprecated | Superseded | Withdrawn
version: 0.1.0
authors:
  - <Author Name>
co-authors:                    # OPTIONAL — list LLM drafting assistants here, in the
  - "<Model Name & Version (Provider)>"   # form 'Claude Opus 4.7 (Anthropic)'. Remove the
                                          # section entirely if no LLM materially contributed.
created: YYYY-MM-DD
last-updated: YYYY-MM-DD
audience: <one-line audience description>
supersedes: []                 # list of APR IDs, e.g. [APR-001]
superseded-by: []
related: []
tags: []
---

<!--
AUTHORING NOTE — DELETE THIS COMMENT BEFORE PUBLISHING.

The frontmatter shape above is PRESCRIBED and validated against
schemas/apr-frontmatter.schema.yaml. Do not deviate.

The body structure below is ADVISORY. APRs vary in shape — a framework spec
(APR-001 ASPECT) reads differently from a content-organisation principle
(APR-002 OBSERVE). The "right" section ordering is the one that best serves
the principle.

What every APR MUST cover, in some recognisable form:

  ☐ MOTIVATION             — what goes wrong without this principle?
  ☐ THE PRINCIPLE          — a clear, callout-worthy statement
  ☐ SCOPE                  — positive case (when this applies)
  ☐ NEGATIVE SCOPE         — explicit "what this is NOT" / when it doesn't apply
  ☐ PRESCRIPTION           — actionable content; tables/lists over prose
  ☐ PRIOR ART              — honest accounting of related established patterns
  ☐ CHANGE LOG             — version history at the bottom

What every APR SHOULD cover when applicable:

  ☐ GOVERNANCE             — what does a conformant adopter check / enforce?
  ☐ ADOPTION NOTES         — phased migration, pitfalls, measurement protocols
  ☐ WORKED VARIANTS        — if the principle has multiple variants, describe each

Pick headings that fit your principle. Reviewers verify that the required
concerns are addressed and findable, not that headings match this template
verbatim.

The skeleton below is one workable shape — reorder, rename, or merge sections
as the principle requires.
-->

# APR-NNN MNEMONIC — <Descriptive subtitle>

> **One-line statement of the principle.**

## Motivation

What is the problem in promptware systems that motivates this principle? Be concrete. Avoid generalities about "good engineering."

## The principle

State the principle clearly. Use a callout or bold line for the operative sentence. Subsequent text expands on it.

## Scope and applicability

### When this applies

- Bullet the conditions under which the principle is intended to be adopted.

### When this does NOT apply

- Bullet the conditions under which the principle is overkill or wrong.

Explicit limits are mandatory — principles without bounded scope tend to over-reach.

## Prescription

The actionable content. Tables, lists, declarative rules. Use RFC 2119 keywords (MUST, SHOULD, MAY) where you are stating a normative requirement.

## Worked variants (if applicable)

If the principle has multiple distinct variants, describe each in its own subsection. Avoid duplicating prose from *Prescription*.

## Governance and validation (if applicable)

What does a conformant adopter check / enforce? CI rules, review gates, manifest validation, audit log expectations.

## What this principle is NOT

A bulleted list explicitly excluding things readers commonly assume the principle covers. This section prevents over-application.

## Relationship to established patterns

Honest accounting of prior art, inside or outside agentic AI. A table is often clearest:

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| <pattern> | <shared trait> | <distinctive contribution> |

The goal is contribution, not novelty for novelty's sake. Adopters evaluating the APR deserve a clear picture of its position relative to what they already know.

## Adoption notes (if applicable)

Tips for adopters: phased migration patterns, common pitfalls, measurement protocols.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | YYYY-MM-DD | Draft | Initial draft. |
