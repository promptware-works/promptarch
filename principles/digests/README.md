# APR Digests

Token-efficient, AI-injectable summaries of the APRs. Each digest distills its source APR down to the **operative content** — the principle, the normative rules (MUST / SHOULD), the key structures, and the critical scope limits — for the case where an APR is fed to an LLM as context while developing promptware.

A full APR runs 3–7k tokens; a digest runs ~1k. Load the digest by default; open the full APR when you hit ambiguity.

## Rules of the road

- **The full APR is canonical.** A digest is a derived convenience, never authoritative. If a digest and its source APR disagree, the APR wins. Cite the APR, never the digest.
- **Do not hand-edit digests.** They are derived from the source APR (callout + abstract + normative bullets + key tables/examples + scope limits). A generator under [`tools/`](../../tools/) will rebuild them; until it exists, each digest is maintained to match its source and records the source version it was generated from.
- **Read the full APR for rationale.** Digests deliberately omit motivation, prior art, adoption notes, and most prose — what a human needs to *understand* the principle, but an implementer *applying* it does not. When in doubt, open the source.

## Naming

`principles/digests/APR-NNN-<slug>.md`, mirroring the source `principles/APR-NNN-<slug>.md`. The digest header records the source APR version it reflects.

## The layering model

Each APR is consumable at four levels of detail — pull only what you need:

| Level | Where | Size | Use |
|---|---|---|---|
| 1. `abstract` | source frontmatter | ~300 chars | routing — "is this APR relevant?" |
| 2. opening `>` callout | top of source | 1 line | the principle in a sentence |
| 3. **digest** | this directory | ~1k tokens | the operative rules — for injection |
| 4. full APR | `principles/` | 3–7k tokens | rationale, scope, edge-cases — on demand |

This is [APR-002 OBSERVE](../APR-002-observe.md)'s own consumption-mode distinction (reference vs injected content) applied to the APRs themselves.
