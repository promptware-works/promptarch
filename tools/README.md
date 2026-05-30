# tools/

Optional tooling that helps maintain and validate the repo. TypeScript / Node per [ADR-003](../meta/decisions/ADR-003-tooling-stack.md). Node ≥ 23.6 runs the `.ts` files directly (native type stripping), so the current scripts need no build step and no install.

## Built

- [`digests/check-digests.ts`](digests/check-digests.ts) — verifies each [APR digest](../principles/digests/) states the same version as its source APR, and flags stale or orphan digests. Run from this directory (`tools/`):

  ```bash
  node digests/check-digests.ts      # or:  npm run check:digests
  ```

  Exits non-zero on drift, so it can gate CI.

## In scoping

- [`digests/digest-generator.scope.md`](digests/digest-generator.scope.md) — design for regenerating the digests from their source APRs. `check-digests.ts` is its first (deterministic) increment; the extractor (MVP) and the LLM condensation pass (full) follow.

Further tooling — an APR frontmatter validator against [`../schemas/apr-frontmatter.schema.yaml`](../schemas/apr-frontmatter.schema.yaml), an OBSERVE-manifest linter — will be added only when it has clear, demonstrable value. Open an issue first to discuss scope and fit.
