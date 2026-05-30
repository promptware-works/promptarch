# ADR-003 — Tooling stack: TypeScript / Node

- **Status**: Accepted
- **Date**: 2026-05-30
- **Decider**: D. Maxios

## Context

PROMPTARCH is currently a docs-only repository (Markdown, YAML). The first tooling is now being scoped — a digest generator (see [`tools/digests/digest-generator.scope.md`](../../tools/digests/digest-generator.scope.md)) — and the [`tools/`](../../tools/) README anticipates more: a frontmatter validator against [`schemas/apr-frontmatter.schema.yaml`](../../schemas/apr-frontmatter.schema.yaml) and an OBSERVE-manifest linter. A language for `tools/` should be chosen once, deliberately, rather than drifting per-script.

Two candidates were considered seriously (a third, shell, was rejected as not portable to Windows):

1. **TypeScript (Node).**
2. **Python.**

Cross-platform support was *not* a differentiator: both run on Windows, macOS, and Linux.

## Decision

All PROMPTARCH tooling under [`tools/`](../../tools/) is written in **TypeScript on Node**.

Conventional libraries: `unified` / `remark` (Markdown), `gray-matter` (frontmatter), `js-yaml` (YAML), `ajv` (JSON Schema validation), `@anthropic-ai/sdk` (optional LLM passes), and `promptfoo` (eval-gating where an LLM substrate is introduced).

## Consequences

**Positive**

- **One toolchain for the whole `tools/` vision.** The planned work is dominated by JSON-Schema validation and manifest linting, where `ajv` (the reference JSON Schema implementation) is first-class. The digest generator, the frontmatter validator, and the OBSERVE-manifest linter share one stack.
- **Zero-install distribution.** Tools run via `npx` without a global install.
- **Ecosystem alignment.** The host runtimes the APRs target (VS Code / Copilot, Claude Code, the Anthropic TypeScript SDK) are TypeScript-first; contributors are likely to have Node already.
- **Eval-gating stays in-stack.** `promptfoo` (JS) — already cited in the APRs — covers the eval-gating that OBSERVE requires for any LLM-assisted tool, so no second language is needed.

**Negative**

- **Node is required to run the tools.** Adopters who only want to *read* the APRs need nothing; only those running the tooling need Node.
- **Less direct access to the Python ML/eval ecosystem** (e.g., DeepEval, HELM tooling). Accepted: the eval needs here are covered by `promptfoo`, and the tooling is validation/linting, not model training.

**Neutral**

- The repository's [`.gitignore`](../../.gitignore) already covers Node artefacts (`node_modules/`). A `package.json` / `tsconfig.json` will appear when the first tool is built, not before.

## Revisiting

Revisit if the tooling roadmap shifts decisively toward work better served by the Python ecosystem (e.g., heavy offline model evaluation), or if a contributor maintaining the bulk of the tooling has a strong, reasoned preference and commits to the maintenance.
