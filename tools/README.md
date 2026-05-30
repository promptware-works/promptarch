# tools/

Reserved for optional tooling that helps adopters validate conformance to PROMPTARCH APRs — for example, validators that check APR frontmatter against [`../schemas/apr-frontmatter.schema.yaml`](../schemas/apr-frontmatter.schema.yaml), or linters that check OBSERVE-style manifests for orphan declarations.

**Status**: no tooling built yet. Tooling will be added only when it has clear, demonstrable value — not on speculation. If you have a tool that you'd like to contribute, open an issue first to discuss scope and fit.

**In scoping:**

- [`digest-generator.scope.md`](digest-generator.scope.md) — design for regenerating the [APR digests](../principles/digests/) from their source APRs. Recommended first increment is a deterministic *staleness check* (digest version vs source version).
