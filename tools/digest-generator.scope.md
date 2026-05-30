# Scope: APR Digest Generator

**Status:** Scoping (not built). Tracking the design before committing code, per [`tools/README.md`](README.md).

## Goal

Regenerate the files in [`principles/digests/`](../principles/digests/) from their source APRs in [`principles/`](../principles/), so digests are *derived artifacts* with one source of truth — never hand-maintained copies that drift.

- **Input:** one `principles/APR-NNN-<slug>.md`
- **Output:** one `principles/digests/APR-NNN-<slug>.md`
- **Invariant:** the digest reflects exactly the source's current version; if the source changes, the digest is stale until regenerated.

## The core design tension (this is an APR-003 problem)

Generating a digest is itself a code/prompt boundary question — so [APR-003](../principles/APR-003-code-prompt-boundary.md) decides the architecture:

| Part of the digest | Assurance mode | Substrate |
|---|---|---|
| Header, source link, version, "do not edit" banner | Deterministic | **code** (template) |
| Abstract, opening callout | Deterministic | **code** (copy verbatim from frontmatter / first `>` block) |
| Normative rules (lines containing MUST/SHOULD/MAY/MUST NOT) | Deterministic *extraction*, but *condensation* is judgment | **seam** — code extracts candidates; condensing to one line each is probabilistic |
| Key tables / manifest / skeletons | Deterministic | **code** (copy tables under known headings) |
| Scope limits ("What X is NOT") | Deterministic *extraction*, probabilistic *compression* | **seam** |
| One-line section summaries | Probabilistic | **prompt** (LLM condensation) |

So the generator is a **seam**: a deterministic core (extract verbatim the callout, abstract, rule sentences, tables, and the "is NOT" section) plus an optional probabilistic pass (LLM condensation of extracted prose into tight lines). The deterministic core alone yields a correct-but-rough digest; the LLM pass makes it tight.

## Two build levels

### MVP — deterministic only (no LLM, fully reproducible)
1. Parse frontmatter → emit header (id, version, source link, banner) + `abstract`.
2. Emit the first `>` callout verbatim as **Principle**.
3. Extract every line/bullet containing an RFC-2119 keyword → **Normative rules** (verbatim, deduped).
4. Copy tables under a configurable allowlist of headings (e.g. category tables, manifest blocks, skeletons).
5. Copy the "What X is NOT" / scope-limits section, flattened.
6. Emit footer with source + version.

Reproducible, no API key, no eval needed. Output is faithful but verbose (no condensation). Good enough to keep digests *in sync*; rougher than the hand-written exemplars.

### Full — hybrid (MVP + LLM condensation pass)
Add a prompt step that condenses the extracted prose lines into the tight one-liners the current hand-written digests use. Because this introduces a probabilistic substrate, **APR-002 OBSERVE applies**: the condensation prompt must be eval-gated (golden digests as the eval set; `min_eval_score`), and the seam (extracted bullets → condensed bullets) must be typed and validated.

## Verification (deterministic guardrails, regardless of level)

These are cheap, high-value, and worth building *before* the generator itself:

- **Completeness check** — every RFC-2119 rule in the source appears (in some form) in the digest. A digest that drops a MUST fails CI.
- **Staleness check** — the version string in the digest header equals the source's `version`. If an APR is bumped without regenerating its digest, CI fails. *(This one is worth shipping immediately — it protects the hand-written digests we have today.)*
- **No-contradiction check (full level only)** — sample-check that condensed lines don't invert a source rule (LLM-graded; advisory).

## Open questions

1. **Governance section in or out?** Currently in (analysis showed ~7/12 OBSERVE governance items are authoring requirements). Make it a `--governance` flag so it's a one-switch decision, not a rewrite.
2. **Per-APR-type templates?** Position statements (APR-000), frameworks (APR-001), and rule-sets (002/003) digest differently. Either one template with conditional sections, or a small template per type.
3. **Language/tooling — TypeScript (Node).** Chosen over Python:
   - The broader `tools/` vision is JSON-Schema validation and manifest linting, where TypeScript + [`ajv`](https://ajv.js.org/) (the reference JSON Schema implementation) is first-class — one toolchain serves both the digest generator and the planned frontmatter validator.
   - Runs cross-platform via `npx` with no global install.
   - Aligns with the host runtimes the APRs target (VS Code/Copilot, Claude Code, the Anthropic TypeScript SDK).
   - Libraries: `unified`/`remark` (Markdown) + `gray-matter` (frontmatter) + `js-yaml`; optional condensation pass via `@anthropic-ai/sdk`; eval-gating via `promptfoo` (JS — already cited in the APRs), keeping a single toolchain.

   *Note: "cross-platform" is not the deciding factor — Python is cross-platform too. The deciding factors are JSON-Schema tooling fit and ecosystem alignment.*
4. **Where do golden digests live?** The four current hand-written digests become the eval set for the condensation prompt — they are the target the generator should approximate.

## Recommended first step

Ship the **staleness check** (a ~20-line script: compare each digest's header version to its source `version:`) and wire it into review. It immediately protects the four hand-written digests from silently drifting, and is pure deterministic code — no LLM, no eval, no risk. The extractor (MVP) and the condensation pass (full) follow as separate increments.
