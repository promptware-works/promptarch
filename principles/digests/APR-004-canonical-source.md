# APR-004 — Canonical Source & Materialization — Digest

> **Generated digest of [APR-004 — A Canonical-Source and Materialization Principle for Runtime-Independent Promptware](../APR-004-canonical-source.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Author promptware once in a runtime-neutral canonical location and materialize each AI environment's home (.claude/, .github/, .cursor/, …) from it — generated, never hand-edited — so promptware is portable across tools and outlives any single vendor's directory convention.

**Principle.** Promptware is authored once in a runtime-neutral canonical location; each AI environment's home (`.claude/`, `.github/`, `.cursor/`, …) is materialized from it by a build step and never hand-edited.

## The shape

```text
promptware/                 # canonical source — author here, only here
├── agents/                 # ASPECT-A specs
└── skills/ ontology/ config/ policies/ contracts/ examples/ evals/   # OBSERVE
        │  materialize (one-way; transform, not copy)
        ▼
.claude/   .github/copilot-instructions.md   .cursor/rules/   …   (generated — do not edit)
```

The canonical root SHOULD organize its content per OBSERVE; this principle governs the root's neutrality and projection, not the inner layout.

## Normative rules

- Promptware MUST have exactly one runtime-neutral canonical root (default `promptware/`; name configurable). All authoring happens there.
- Vendor/runtime homes MUST be materialized from the canonical root and MUST NOT be authored directly.
- Materialization MUST be one-way (canonical → runtime); reverse edits MUST NOT be a supported workflow.
- Materialized artifacts MUST NOT be hand-edited. If committed, each MUST carry a "generated — do not edit" marker and MUST be covered by a staleness check that fails when the source changed without regeneration.
- Materialization MUST transform to each target's schema (not copy verbatim) and SHOULD use the ASPECT body/frontmatter split (portable body, host-specific frontmatter).
- When a target cannot express canonical content, materialization MUST emit what is supported and MUST report what it dropped; it MUST NOT silently discard it.
- The canonical root SHOULD organize content per OBSERVE.

## Governance checks

Vendor dirs contain only generated files (no hand-authored promptware under `.claude/`, `.github/`, …) · every committed materialized artifact carries its generated marker · materialized output is in sync with source (staleness check) · the latest drop report is surfaced for review.

## Scope limits — do NOT misapply

Not a runtime or execution model · not a folder-name or build-tool mandate (`promptware/` is a default; the discipline is the point) · not a vendor format spec (it maps onto tools' formats, doesn't define them) · not two-way sync (one-way generation; a vendor dir is never an authoring place) · not a replacement for OBSERVE/ASPECT (it is the outer portability layer; they operate inside the canonical root).

---
*Source: [APR-004 — A Canonical-Source and Materialization Principle for Runtime-Independent Promptware](../APR-004-canonical-source.md) v0.1.0 · regenerate this digest whenever the source changes.*
