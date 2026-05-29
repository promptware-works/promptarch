# PROMPTARCH

**Architectural Principles for Agentic AI Promptware.**

PROMPTARCH is an open collection of *Architectural Principle Records* (APRs) for **promptware** — software whose dominant behavior is shaped by prompts and natural-language specifications consumed by LLM agents, rather than by deterministic code paths.

The project answers a simple need: as more systems are built around LLM agents, the discipline of *agentic architecture* — how agents are specified, how their content is organized, how they are governed and evaluated — has no shared, durable, citable reference. APRs are intended to fill that gap.

## What is an APR?

An **Architectural Principle Record (APR)** is a durable, numbered description of one architectural principle for promptware systems. It is:

- **Durable.** Once accepted, an APR is not retroactively edited; it is superseded by a newer APR.
- **Numbered and citable.** `APR-001`, `APR-002`, … — stable identifiers other projects can cite.
- **Self-contained.** One principle per record, with motivation, prescription, scope of applicability, and limits.
- **Status-tracked.** `Draft` → `Proposed` → `Accepted` → optionally `Deprecated` / `Superseded`.

APRs differ from ADRs (*Architectural Decision Records*): an ADR captures a point-in-time decision for one project. An APR captures a principle intended to hold across projects.

## What is "promptware"?

We use **promptware** to distinguish *content-centric* software — where the operative content is prose, prompts, specifications, ontology, examples, evals — from *code-centric*, deterministic software.

A promptware system is one where editing a Markdown file or a YAML file can materially change runtime behavior, because that file is loaded into an agent's context at execution time. This shifts the engineering discipline: drift is silent, audit becomes interpretation, change impact is invisible without governance. PROMPTARCH is the principles layer that addresses those shifts.

## Initial APRs

| ID | Name | Title | Status |
|---|---|---|---|
| [APR-001](principles/APR-001-aspect.md) | **ASPECT** | A Prompt Framework for Agent & Skill Specifications | Draft |
| [APR-002](principles/APR-002-observe.md) | **OBSERVE** | A Content-Organization Principle for Agentic Platforms | Draft |

See [`principles/README.md`](principles/README.md) for the full index and status legend.

## Repository layout

```text
promptarch/
├── principles/        # The APRs — the heart of the project
├── meta/              # How the project itself works (process, statuses, numbering, project ADRs)
├── docs/              # Supporting prose: why-promptware, audience, FAQ
├── schemas/           # Machine-readable companions (APR frontmatter schema, etc.)
├── tools/             # Linters and validators (deferred)
└── examples/          # Concrete applications of APRs (deferred)
```

## Audience

PROMPTARCH is written for:

- **Architects** designing agentic platforms or multi-agent systems.
- **Framework authors** building skill / agent runtimes.
- **Engineering leads** who need a citable reference when standardising agent specs or content organisation across teams.
- **Researchers and educators** working in the agentic-AI / LLM-application space.

It is *not* a tutorial on building your first agent — it assumes you've felt the maintenance pain that motivates principles in the first place.

## Status

**Pre-release.** APR-001 and APR-002 are at Draft status. The APR process itself (see [`meta/apr-process.md`](meta/apr-process.md)) is also in early iteration; expect refinement as the first few APRs land.

## License

MIT — see [`LICENSE`](LICENSE).

The choice of MIT (rather than CC-BY for prose) is recorded in [`meta/decisions/ADR-001-license.md`](meta/decisions/ADR-001-license.md). In short: simplicity, one license everywhere, maximum permissive reuse. Citation is welcomed but not required by the licence.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). The short version: open an issue first to propose a new APR or a substantive change to an existing one; small editorial fixes can come as a PR directly.

## Citing PROMPTARCH

If you build on an APR in published work, please cite the APR by its full ID, title, and version, e.g.:

> APR-001 ASPECT — A Prompt Framework for Agent & Skill Specifications, v0.1.0. PROMPTARCH, 2026. https://github.com/<org>/promptarch/blob/main/principles/APR-001-aspect.md
