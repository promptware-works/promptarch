# APR Numbering

## ID format

```
APR-NNN
```

where `NNN` is a zero-padded three-digit integer assigned at the time the APR moves from issue to draft PR. IDs are monotonically increasing across the project and are **never reused**, even if an APR is withdrawn before acceptance.

The three-digit width is a soft convention chosen for legibility. The project will widen to four digits at `APR-999`; existing IDs will not be retroactively renumbered.

## Numbers are identifiers, not a ranking

PROMPTARCH numbers APRs the way the **RFC series** numbers documents: an ID is a stable handle assigned **in order of drafting** (first-PR-wins), nothing more. The number answers *"which document?"* — never *"how important is it,"* *"read this first,"* or *"what depends on what."*

Two consequences follow:

- **Conceptual importance is independent of the number.** A foundational principle can have a high number simply because it was written later. The only number that carries inherent meaning is the reserved `APR-000` (the project's position statement); `APR-001` onward are assignment-order identifiers.
- **Forward references are normal.** An APR may cite a higher-numbered one — `APR-000` already references `APR-001` and `APR-002`, and a domain APR may defer to a later cross-cutting one (e.g. `APR-002` → `APR-010`). This is expected, just as an older RFC is read in light of a newer RFC that updates it. Cross-references are by canonical ID (see *Cross-references between APRs*), so order of creation never breaks them.

Conceptual structure — which principles are foundational, which build on which — is conveyed by the grouped reading guide in [`principles/README.md`](../principles/README.md) and by each APR's `related:` field, **not** by the numbers. APRs are therefore **never renumbered** to reflect changing views of their importance; renumbering would break every existing citation and is forbidden by the never-reused rule above.

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
