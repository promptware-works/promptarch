# tools/

Optional tooling that helps maintain and validate the repo. TypeScript / Node per [ADR-003](../meta/decisions/ADR-003-tooling-stack.md). Node ≥ 23.6 runs the `.ts` files directly (native type stripping), so the current scripts need no build step and no install.

## Built

- [`digests/check-digests.ts`](digests/check-digests.ts) — verifies each [APR digest](../principles/digests/) states the same version as its source APR, and flags stale or orphan digests. Run from this directory (`tools/`):

  ```bash
  node digests/check-digests.ts      # or:  npm run check:digests
  ```

  Exits non-zero on drift, so it gates CI — [`.github/workflows/check-digests.yml`](../.github/workflows/check-digests.yml) runs it on pushes and PRs to `main` and `develop`.

- [`registry/check-registry.ts`](registry/check-registry.ts) — validates the [component-metadata registry](../registries/component-metadata.yaml) against [`../schemas/component-metadata.schema.yaml`](../schemas/component-metadata.schema.yaml): unique field names (the APR-014 collision policy), declared clusters, APR-id owners, and valid types/statuses. Run from this directory (`tools/`):

  ```bash
  node registry/check-registry.ts    # or:  npm run check:registry
  ```

  Exits non-zero on any violation, so it gates CI — [`.github/workflows/check-registry.yml`](../.github/workflows/check-registry.yml) runs it on pushes and PRs to `main` and `develop`.

- [`graph/check-graph.ts`](graph/check-graph.ts) — validates the [artifact-graph config](../registries/artifact-graph.yaml) against [`../schemas/artifact-graph.schema.yaml`](../schemas/artifact-graph.schema.yaml): non-empty node/edge types (valid slugs), `roots` that reference declared node-types, non-empty `include` globs. Governed by [APR-013](../principles/APR-013-artifact-graph.md). Run from this directory (`tools/`):

  ```bash
  node graph/check-graph.ts          # or:  npm run check:graph
  ```

  Exits non-zero on any violation, so it gates CI — [`.github/workflows/check-graph.yml`](../.github/workflows/check-graph.yml) runs it on pushes and PRs to `main` and `develop`.

- [`project/check-project.ts`](project/check-project.ts) — validates the [project manifest](../project.yaml) against the [project-metadata registry](../registries/project-metadata.yaml) (its shape fixed by [`../schemas/project-metadata.schema.yaml`](../schemas/project-metadata.schema.yaml)): the registry is well-formed (unique fields, APR owners, valid types), and the manifest carries every `required` field, no unregistered keys, values in vocabulary (`type` / `domain`), and reverse-DNS where declared (`id`, `dependencies`). Governed by [APR-019](../principles/APR-019-identity.md). Run from this directory (`tools/`):

  ```bash
  node project/check-project.ts      # or:  npm run check:project
  ```

  Exits non-zero on any violation, so it gates CI — [`.github/workflows/check-project.yml`](../.github/workflows/check-project.yml) runs it on pushes and PRs to `main` and `develop`.

- [`release.ts`](release.ts) — cuts a release from an already-promoted `main`, per the PR-based flow ([ADR-004](../meta/decisions/ADR-004-release-process.md); how-to in [`meta/release-process.md`](../meta/release-process.md)). Promotion is by PR (working → `develop` → `main`); this tool only verifies, tags, and publishes — it does **not** push commits to `main`. Run from this directory (`tools/`):

  ```bash
  node release.ts v0.6.0 --prerelease        # or:  npm run release -- v0.6.0 --prerelease
  node release.ts v0.6.0 --dry-run           # preview the steps, change nothing
  ```

  Use `--prerelease` while APRs are still `Draft`; drop it once they reach `Accepted`. `--notes <file>` supplies release notes (otherwise GitHub auto-generates them). It refuses to run on a dirty tree, if `main` has local commits not on its remote, or if `develop` is not yet fully merged into `main` (merge the `develop → main` PR first). (It prints the active `gh` account first — check it's the right one, since the publish uses it.)

## In scoping

- [`digests/digest-generator.scope.md`](digests/digest-generator.scope.md) — design for regenerating the digests from their source APRs. `check-digests.ts` is its first (deterministic) increment; the extractor (MVP) and the LLM condensation pass (full) follow.

Further tooling — an APR frontmatter validator against [`../schemas/apr-frontmatter.schema.yaml`](../schemas/apr-frontmatter.schema.yaml), an OBSERVE-manifest linter — will be added only when it has clear, demonstrable value. Open an issue first to discuss scope and fit.
