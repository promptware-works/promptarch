# APR-002 OBSERVE — Digest

> **Generated digest of [APR-002 OBSERVE](../APR-002-observe.md) v0.1.5.** The full APR is authoritative — read it for motivation, rationale, scope, and limits. This is the token-efficient injectable for AI-assisted development. Do not edit by hand.

**Abstract.** Organizes an agentic platform's non-behavioral content — ontology, values, rules, shapes, examples, evals — as seven first-class artifact types, each with a single canonical source, a declarative manifest, selective runtime injection, and audit-logged provenance.

**Principle.** A platform's non-behavioral content — ontology, values, rules, shapes, examples, evals — belongs in separate, first-class, canonically-sourced artifacts, declaratively referenced by skills rather than embedded in their prose. No overlap.

## The seven categories → directories

| Category | Directory | Holds |
|---|---|---|
| Behavior | `skills/` | skills, prompts, agent definitions (prose) |
| Ontology | `ontology/` | domain concepts, definitions, relationships |
| Values | `config/` | enums, thresholds, paths, toggles |
| Rules | `policies/` | declarative decision matrices |
| Shapes | `contracts/` | typed data schemas |
| Examples | `examples/` | concrete I/O pairs, counter-examples |
| Evals | `evals/` | golden sets, rubrics, thresholds |

Categories are mutually exclusive by *dominant change lifecycle*; file an artifact by its primary home, not ontological purity. One canonical source per artifact. (Ontology = what terms *mean*; Values = which options *exist* — the most common conflation.)

## Normative rules

- Skills MUST declare consumed/produced references under `metadata.observe` frontmatter; the loader injects ONLY what is declared.
- Selective injection is MANDATORY — blanket-loading all refs is an architectural violation.
- Skills MUST NOT carry inline concept definitions, value lists, rule restatements, schema fragments, or few-shot examples — not even as fallback hints. Exactly one canonical source per artifact.
- If a required runtime injection fails, the delegation MUST halt with an audit-logged error (strict mode = CI/staging/prod). Permissive mode (local dev only) MAY log-and-continue with an `[INJECTION_FALLBACK]` marker.
- Every skill MUST declare `evaluated_by` + `min_eval_score`; a skill lacking them is blocked from merge.
- `safety_critical` skills MUST have ≥1 human-authored eval case; synthetic-only cases MUST NOT be the sole grading basis.
- Every runtime injection MUST record `{file_path, commit_sha, fragment, timestamp}`; every eval run MUST record `{eval_file_path, commit_sha, score, threshold, pass/fail}`. Binding happens *at consumption*, not retrospectively — cached reads still emit an audit entry.
- Cross-references between reference files are resolved transitively by the loader and audit-logged at each hop; keep chains shallow.

## Governance checks (CI + human review)

YAML schema validity · reference integrity (`#fragment`s resolve) · no orphans · ontology consistency (rename ⇒ ADR) · no inline duplication · impact analysis on change · audit-log binding · quality-gate enforcement · example/eval coherence (tag `training|test|both|counter-example`) · eval staleness (`last_reviewed`) · content provenance (`human|synthetic|hybrid`) · schema-evolution discipline (additive / evolutionary / breaking).

## Scope limits — do NOT misapply

OBSERVE is **not** a runtime, a behavior framework, an eval framework, a knowledge graph/triplestore, or a security framework. It gives forensic traceability and structural integrity — **not** access control, signing, audit-log integrity, or prompt-injection defense. A **loader** (a resolution step between "decide to delegate" and "send prompt to LLM") is a hard prerequisite. Partial/hybrid adoption within a scope surrenders the guarantees — adopt wholesale or not at all.

## Manifest shape

```yaml
metadata:
  observe:
    consumes_ontology: [ontology/concepts.yaml#severity]
    consumes_config:   [config/enums.yaml#severity]
    consumes_policies: [policies/severity-criteria.yaml]
    consumes_contracts: [contracts/Evidence.schema.yaml]
    produces_contracts: [contracts/Finding.schema.yaml]
    consumes_examples: [examples/severity-classification.yaml]
    evaluated_by:      [evals/severity-classification.yaml]
    min_eval_score: 0.85
    safety_critical: false
```

---
*Source: [APR-002 OBSERVE](../APR-002-observe.md) v0.1.5 · regenerate this digest whenever the source changes.*
