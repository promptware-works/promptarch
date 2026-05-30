---
apr: 4
title: "A Canonical-Source and Materialization Principle for Runtime-Independent Promptware"
abstract: "Author promptware once in a runtime-neutral canonical location and materialize each AI environment's home (.claude/, .github/, .cursor/, …) from it — generated, never hand-edited — so promptware is portable across tools and outlives any single vendor's directory convention."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-30
last-updated: 2026-05-30
audience: Architects and framework authors of agentic AI platforms; teams using or migrating between more than one AI coding/agent tool
supersedes: []
superseded-by: []
related:
  - APR-000
  - APR-001
  - APR-002
tags:
  - portability
  - canonical-source
  - materialization
  - runtime-independence
  - repository-layout
---

# APR-004 — A Canonical-Source and Materialization Principle for Runtime-Independent Promptware

> **Promptware is authored once in a runtime-neutral canonical location in the repository; each AI environment's home (`.claude/`, `.github/`, `.cursor/`, …) is *materialized* from it by a build step and never hand-edited.**

*Injectable summary (for feeding to an LLM): [`digests/APR-004-canonical-source.md`](digests/APR-004-canonical-source.md). This full APR is canonical.*

## Motivation

AI coding and agent tools each define their own home and format — `.claude/` (skills, agents, `CLAUDE.md`), `.github/copilot-instructions.md`, `.cursor/rules/`, `.windsurf/`, `AGENTS.md`, with more arriving constantly. Authoring promptware *directly* into one of these couples the work to that vendor:

- **Lock-in.** Switching tools, or supporting a second one, means re-authoring or relocating everything.
- **N-way drift.** Keeping several tools in sync means hand-maintaining several divergent copies of the same skills and instructions — the exact silent-drift failure [APR-000](APR-000-promptware.md) and [APR-002 OBSERVE](APR-002-observe.md) exist to prevent, reintroduced at the repository-layout level.
- **No source of truth.** The "real" promptware is wherever the author happened to put it, in whatever vendor's format. There is nothing to cite, diff, or govern as canonical.

The discipline that fixes this is the one already applied to reference content (OBSERVE) and to APR digests (`tools/digests/`): **one canonical source; derived artifacts generated from it.** This APR applies it to the *runtime-binding* axis.

## The principle

> **Author once, in a runtime-neutral canonical location. Materialize the vendor homes from it. Never hand-edit what was materialized.**

Two halves, inseparable:

- **Canonical source** — a single, vendor-independent root holds the promptware (its skills, agents, and OBSERVE-organized reference content). This is the only place anyone authors.
- **Materialization** — a build step *projects* that root into each runtime's expected home and format. The vendor dirs are **build artifacts**, not sources.

## Scope and applicability

### When this applies

- Promptware must work across — or migrate between — more than one AI runtime.
- A team wants vendor-independence or longevity beyond a single tool's directory convention.
- The same skills/instructions are needed by several tools at once and must not drift.

### When this does NOT apply

- Single-tool throwaway or prototype work where lock-in is acceptable and a build step is overhead.
- It does **not** mandate a specific folder name or build tool — it mandates the *canonical-source + materialization discipline*, not an implementation.

## The canonical layout

The canonical root defaults to a **visible** folder — `promptware/` — because it is *source you author and review*, not hidden config. The name is configurable; the discipline matters more than the name.

```text
promptware/                      # canonical source of truth — author here, only here
├── agents/                      # ASPECT-A agent specs
├── skills/  ontology/  config/  policies/  contracts/  examples/  evals/   # OBSERVE layout
└── ...
        │
        │   materialize  (one-way build; transform, not copy)
        ▼
.claude/            .github/                      .cursor/
  skills/  agents/    copilot-instructions.md       rules/
  (generated — do not edit)   (generated)            (generated)
```

The canonical root **SHOULD** organize its contents per [APR-002 OBSERVE](APR-002-observe.md). This APR governs the root's *neutrality and projection*, not its inner structure — OBSERVE owns the inside; ASPECT owns each spec's body.

## Materialization

- Materialization is **one-way**: canonical → runtime. Editing a vendor dir is not a supported authoring path.
- It is a **transformation, not a copy.** Each runtime has its own format and frontmatter schema; the build maps the canonical spec onto each. [APR-001 ASPECT](APR-001-aspect.md)'s split — host-neutral **body**, host-specific **frontmatter** — is what makes this tractable: the body carries across, the frontmatter is generated per host.
- **Lossy by necessity.** When a target cannot express some canonical content (e.g., a runtime with no autonomy-level concept), materialization emits what the target supports and **reports** what it dropped. It never silently discards canonical content.
- **Derived-but-committed.** Many runtimes only work if their files are present in the repo. Materialized output therefore MAY be committed — but it remains generated: each artifact carries a "generated — do not edit" marker, and a staleness check fails the build when the canonical source changed but the artifact did not. (This is the same guardrail the digest layer uses.)

## Prescription

- Promptware **MUST** have exactly one runtime-neutral canonical root (default `promptware/`; name configurable). All authoring happens there.
- Vendor/runtime homes **MUST** be materialized from the canonical root and **MUST NOT** be authored directly.
- Materialization **MUST** be one-way; reverse edits **MUST NOT** be a supported workflow.
- Materialized artifacts **MUST NOT** be hand-edited. If committed, each **MUST** carry a "generated — do not edit" marker and **MUST** be covered by a staleness check that fails when canonical source changed without regeneration.
- Materialization **MUST** transform to each target's schema, not copy verbatim, and **SHOULD** use the ASPECT body/frontmatter split.
- When a target cannot express canonical content, materialization **MUST** emit what is supported and **MUST** report what was dropped; it **MUST NOT** silently discard it.
- The canonical root **SHOULD** organize content per OBSERVE.

## Governance and validation

A conformant repository checks, in review or CI:

- **Single source.** Vendor dirs contain *only* generated files; no hand-authored promptware lives under `.claude/`, `.github/`, etc.
- **Generated markers.** Every committed materialized artifact carries its "generated — do not edit" marker.
- **Staleness.** Materialized output is in sync with the canonical source (same mechanism as the digest staleness check).
- **Drop report.** The most recent materialization's list of dropped/unsupported content is surfaced for review, not silently swallowed.

## What this principle is NOT

- **Not a runtime or execution model.** It governs where source lives and that targets are generated, not how tools execute.
- **Not a folder-name or build-tool mandate.** `promptware/` is a default; the discipline is the point.
- **Not a vendor format spec.** It *maps onto* each tool's format; it does not define any tool's format.
- **Not two-way sync.** Generation is one-way; a vendor dir is never a place to author.
- **Not a replacement for OBSERVE or ASPECT.** It is the outer portability layer; they operate inside the canonical root.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **`AGENTS.md`** (cross-tool agent-instructions convention, ~2025) | A tool-neutral source many agents read | Generalizes from one file to a canonical *tree* + materialization into per-tool homes and formats |
| **Build-once / deploy-many; transpilation** (e.g., Babel) | One source compiled to multiple targets | Targets are AI-runtime layouts; the transform reports lossy drops and preserves a single source of truth |
| **Infrastructure-as-code** (e.g., Terraform) | Declarative source materialized per environment | The "environments" are AI tools; materialized output is derived-but-committed and staleness-checked |
| **Dotfile templating** (e.g., chezmoi) | Render machine-specific config from one source | Renders vendor-specific promptware homes from one canonical promptware root |

The novel contribution is a **promptware-specific portability principle**: a runtime-neutral canonical source, one-way materialization into vendor homes as derived-but-committed artifacts with staleness checking, and explicit lossy-capability reporting — composing with ASPECT (per-host frontmatter) and OBSERVE (canonical content organization).

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. AGENTS.md. *AGENTS.md — an open format for guiding coding agents*. <https://agents.md/>
2. chezmoi. *chezmoi — manage your dotfiles across multiple machines, securely*. <https://www.chezmoi.io/>
3. HashiCorp. *Terraform Documentation*. <https://developer.hashicorp.com/terraform>
4. Babel. *Babel — the compiler for next generation JavaScript*. <https://babeljs.io/>

## Adoption notes

- **Pick the canonical root and consolidate into it first** — moving existing vendor-dir content into `promptware/` surfaces the drift between your tools' copies, which is itself valuable.
- **Materialize your primary tool first** — generate its home, commit the output with the generated-marker, and wire the staleness check before adding a second target.
- **Add targets incrementally** — accept lossy degradation and read the drop report; don't block portability on full feature parity across tools.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-30 | Draft | Initial draft published as APR-004. |
