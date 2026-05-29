# APR Numbering

## ID format

```
APR-NNN
```

where `NNN` is a zero-padded three-digit integer assigned at the time the APR moves from issue to draft PR. IDs are monotonically increasing across the project and are **never reused**, even if an APR is withdrawn before acceptance.

The three-digit width is a soft convention chosen for legibility. The project will widen to four digits at `APR-999`; existing IDs will not be retroactively renumbered.

## APR-000 reservation

`APR-000` is reserved for the project's *foundational position* — the document that introduces and motivates the APR series itself. The convention is borrowed from numbering schemes (RFC, IETF drafts, some ADR collections) that reserve index zero for the meta-entry.

APR-000 is unique:

- There is exactly one APR-000. It is not a normal principle record; it is the project's position statement.
- Revising APR-000 in place uses standard version bumps, like any other APR.
- If a fundamentally different foundational position is adopted, the new draft is published *as* APR-000 with `supersedes: [APR-000]` (referencing the prior version) and the prior content is preserved in git history. APR-000's *slot* is durable; its *content* may evolve.

APR-001 onward are normal principle records and follow the rules below.

## Filename

```
APR-NNN-<short-slug>.md
```

The `<short-slug>` is the APR mnemonic in lowercase, kebab-cased — typically the memorable name (`aspect`, `observe`), not the long expansion. The slug exists for filesystem readability; the canonical identifier remains `APR-NNN`.

Examples:

```
principles/APR-001-aspect.md
principles/APR-002-observe.md
```

## Title

The title in the APR's frontmatter is the *full* form: mnemonic + dash + descriptive subtitle, exactly as it should appear in citations.

```yaml
title: "ASPECT — A Prompt Framework for Agent & Skill Specifications"
```

The mnemonic SHOULD be ALL-CAPS to visually separate it from prose. Subtitles SHOULD be short — ideally one line, never more than two.

## Assignment

ID assignment happens once an issue progresses to a draft PR. Until then the proposal is referenced by issue number (`#NN`), not an APR ID. This avoids ID inflation from proposals that never reach drafting.

If two drafts are in flight simultaneously, the first to open a PR gets the lower number. There is no reservation system — first-PR-wins.

## Cross-references between APRs

Within APR prose, reference another APR using its canonical ID and a Markdown link to the file:

```markdown
... see [APR-002 OBSERVE](APR-002-observe.md) for the content-organization principle ...
```

In frontmatter `related:`, `supersedes:`, and `superseded-by:` lists, use the canonical ID only:

```yaml
related:
  - APR-002
supersedes: []
superseded-by: []
```

## Names of APRs

Names SHOULD be memorable mnemonics + expansions (the ASPECT/OBSERVE pattern). This is not strictly required — a plain descriptive title is acceptable when no good mnemonic exists. Forced mnemonics are worse than honest descriptive ones; reviewers will push back on contortions.
