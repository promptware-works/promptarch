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

## The APRs

The canonical, always-current list of APRs — with status and version for each — lives in **[`principles/README.md`](principles/README.md)**. This top-level README does not repeat it, so the index has a single source of truth.

Start with **[APR-000 PROMPTWARE](principles/APR-000-promptware.md)** if you are new to PROMPTARCH or evaluating whether the series applies to your work — it is the project's foundational position. APR-001 onward are normal principle records.

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

## Licensing

PROMPTARCH is **dual-licensed**, matching the two kinds of content it contains:

| Content | License | File |
|---|---|---|
| **Prose & docs** — the APRs (`principles/`), plus `docs/`, `meta/`, `examples/`, and Markdown | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [`LICENSE-docs`](LICENSE-docs) |
| **Code** — schemas (`schemas/`) and tooling (`tools/`) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | [`LICENSE`](LICENSE) |

CC BY 4.0 fits a citable principles corpus and **requires attribution** when you reuse or adapt the prose — which is exactly how we want the series cited (see *Citing PROMPTARCH* below). Apache 2.0 gives code adopters an explicit patent grant. See [`NOTICE`](NOTICE) for the short version and [`meta/decisions/ADR-002-license.md`](meta/decisions/ADR-002-license.md) for the full rationale (it supersedes the original MIT decision in [ADR-001](meta/decisions/ADR-001-license.md)).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). The short version: open an issue first to propose a new APR or a substantive change to an existing one; small editorial fixes can come as a PR directly.

## Citing PROMPTARCH

If you build on an APR in published work, please cite the APR by its full ID, title, and version, e.g.:

> APR-001 ASPECT — A Prompt Framework for Agent & Skill Specifications, v0.1.0. PROMPTARCH, 2026. https://github.com/dmaxios/promptarch/blob/main/principles/APR-001-aspect.md
