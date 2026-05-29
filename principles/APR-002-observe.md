---
apr: 002
title: "OBSERVE — A Content-Organization Principle for Agentic Platforms"
status: Draft
version: 0.1.0
authors:
  - Robil Daher
created: 2026-05-28
last-updated: 2026-05-28
audience: Architects and framework authors of agentic AI platforms
supersedes: []
superseded-by: []
related:
  - APR-001
tags:
  - content-organization
  - ontology
  - context-engineering
  - evals
  - governance
---

# APR-002 OBSERVE — A Content-Organization Principle for Agentic Platforms

**Origin**: Developed November 2025 for an agentic platform; extended May 2026 to cover examples, evals, and ontology.
**Scope**: A principle applicable to any agentic platform; validated in internal platform pilots; promotion to additional deployments is voluntary.
**Note on location**: This is the canonical principle reference. Platform-specific adoption documents build on this baseline.

---

## 1. What OBSERVE Is

OBSERVE is an architecture concept for organizing the **non-behavioral content** of an agentic platform — the concept definitions, values, decision rules, data shapes, demonstrations, and quality gates that agents reference, consume, produce, or are measured against — as distinct, first-class artifacts, separate from the behavioral content (skills, prompts, agent definitions).

OBSERVE is a **prompt-engineering, context-engineering, and quality-engineering principle**. Its central claim is that a maintainable, auditable agentic platform requires seven content categories to live in separate places:

| Category | What it contains | What it answers |
|---|---|---|
| **Behavior** | Skills, prompts, agent definitions — written prose | *What should the agent do, and how?* |
| **Ontology** | Domain concepts, definitions, relationships, controlled vocabulary | *What do the terms in this domain mean?* |
| **Values** | Enum members, scalars, thresholds, paths, integration toggles | *What concrete options exist?* |
| **Rules** | Declarative decision matrices (if X and Y → Z) | *Given these inputs, what is the correct outcome?* |
| **Shapes** | Typed data structures flowing between agents | *What does the input/output look like?* |
| **Examples** | Concrete input/output pairs — positive demonstrations and counter-examples | *What does a good (or bad) execution look like in practice?* |
| **Evals** | Golden test sets, grading rubrics, quality thresholds | *Is the output good enough to ship?* |

The seven categories are **mutually exclusive in dominant lifecycle** and **collectively exhaustive in coverage**. When an artifact spans two categories (e.g., a threshold scalar that also drives a decision rule, or an enum whose members carry conceptual definitions), file it under the category whose change lifecycle dominates: the scalar lives in `config/`, the rule consuming it lives in `policies/`, and the *meaning* of the enum members lives in `ontology/`. The split is by *primary home*, not by ontological purity — the goal is one canonical source per artifact, not metaphysical disjointness.

**Ontology vs. Values — the most common conflation.** Values store *which options exist* (`severity: [critical, high, medium, low]`); Ontology stores *what each option means and how concepts relate* (`severity` = "Worst-case business impact if exploited", with prose definitions per level and links to related concepts). Different change lifecycles: Values shift when policy adjusts (frequent); Ontology shifts when domain understanding shifts (rare and high-impact). Without Ontology, skills reason on labels they don't understand.

**Three consumption modes.** The seven categories divide naturally by when and how they are consumed:

- **Runtime base**: `behavior` is the skill's prose — the loader uses it as the *base* of the delegation prompt. The other runtime categories are composed *into* this prose, not alongside it.
- **Runtime-injected**: `ontology`, `config`, `policies`, `contracts`, and `examples`-as-few-shot are read by the loader at delegation time and injected as labeled blocks into the skill's prompt.
- **Validation-time**: `evals` (and `examples`-as-test-cases) are read by CI and offline grading, not by skill prompts. They govern *whether* the output is acceptable, not *what* the agent does.

All three modes share the same OBSERVE contract: single canonical source, declarative manifest, no inline duplication, audit-logged provenance.

---

## 2. Why It Matters

When non-behavioral content is embedded inside behavioral prose:

- **Drift is silent.** The same enum, definition, or threshold appears in multiple skills; one edit and others fall out of sync.
- **Audit becomes interpretation.** Policy values and concept definitions readable only by humans; ISO 42001 / EU AI Act evidence depends on prose interpretation.
- **Change impact is invisible.** Adding a new severity level, renaming a domain concept, or extending a contract field requires editing N files, with no compile-time check.
- **Token cost compounds.** Every skill prompt carries its own copies of shared concepts and values, inflating per-delegation context.
- **Quality is asserted, not measured.** Without a canonical home for examples and evals, prompt changes ship on intuition rather than evidence; regressions are invisible until production.

OBSERVE addresses all five problems by giving each content category a single canonical home and a single canonical source.

---

## 3. The Principle in One Sentence

> **Skills describe behavior. Ontology defines concepts. Config holds values. Policies define rules. Contracts define shapes. Examples illustrate execution. Evals score quality. No overlap.**

A skill that needs to know "what does 'severity' mean in this domain" consults `ontology/`. A skill that needs to know "what severity levels exist" reads them from `config/`. A skill that needs to apply "given evidence X and Y, what's the maximum confidence allowed" reads the matrix from `policies/`. A skill that emits a `Finding` reads its shape from `contracts/`. A skill that uses few-shot demonstrations reads them from `examples/`. A skill's quality bar — what counts as a passing output — is defined in `evals/` and enforced by CI. None of these live inside skill prose.

---

## 4. The Standard Layout

```text
<platform-root>/
├── skills/             # behavior — prose, agent/skill definitions
├── ontology/           # concepts — domain definitions and relationships (YAML/Markdown)
├── config/             # values — enums, thresholds, paths, toggles (YAML)
├── policies/           # rules — declarative decision matrices (YAML)
├── contracts/          # shapes — typed data schemas (YAML)
├── examples/           # demonstrations — concrete I/O pairs (YAML/JSON)
└── evals/              # quality gates — golden sets, rubrics, thresholds (YAML)
```

Specific platforms may scope this differently (e.g., per-farm subdirectories), but the seven-category split is invariant.

---

## 5. How Skills Consume Reference Content

Skills declare what they consume (at runtime) and what they are evaluated by (at validation time) in their frontmatter, nested under `metadata.observe` so the manifest is **schema-compliant with host runtimes** (VS Code Copilot Workspace, Claude Code, etc.) that recognize only a fixed set of top-level frontmatter attributes. The `metadata:` key is one of those supported attributes; nesting OBSERVE fields under `metadata.observe:` keeps the host schema happy while preserving OBSERVE semantics for the orchestrator that reads them.

```yaml
---
name: example-skill
description: "Short description..."

metadata:
  observe:
    consumes_ontology:
      - ontology/concepts.yaml#severity
      - ontology/concepts.yaml#evidence
    consumes_config:
      - config/enums.yaml#severity
      - config/thresholds.yaml#confidence
    consumes_policies:
      - policies/severity-criteria.yaml
    consumes_contracts:
      - contracts/Evidence.schema.yaml
    produces_contracts:
      - contracts/Finding.schema.yaml
    consumes_examples:
      - examples/severity-classification.yaml
    # consumes_counter_examples:                  # opt-in: surface what-NOT-to-do cases
    #   - examples/severity-classification.yaml#case-bad-7
    evaluated_by:
      - evals/severity-classification.yaml
    min_eval_score: 0.85
    safety_critical: false                        # true ⇒ requires ≥1 human-authored eval case
---
```

Field summary:

- `consumes_<category>:` — declared runtime references. The loader injects only what is declared (§7's selective injection rule).
- `produces_contracts:` — output shapes the skill emits; parent agents MAY use this to validate return values.
- `evaluated_by:` + `min_eval_score:` — the quality SLO and the gate that enforces it (§9).
- `safety_critical:` — when `true`, the skill is subject to stricter governance: it MUST have at least one human-authored eval case (§9 Content provenance) and breaking changes to its dependencies require explicit human review (§9 Schema evolution).
- `consumes_counter_examples:` — opt-in surface for what-NOT-to-do cases; see §9 Example/eval coherence.

The `metadata.observe:` namespace also future-proofs against further extensions: a hypothetical platform-specific extension could live under `metadata.platform:`, an audit-specific extension under `metadata.audit:`, etc. The convention is "the host runtime sees `metadata:` as opaque; each consumer reads its own namespace inside it."

At runtime, the loader (orchestrator, runtime, or tooling) reads the manifest and injects **only the declared references** into the skill's delegation prompt. Labeled blocks (`ONTOLOGY_CONTEXT`, `CONFIG_CONTEXT`, `POLICY_CONTEXT`, `CONTRACT_CONTEXT`, `EXAMPLES_CONTEXT`) with `# Source:` provenance comments carry the injected content.

At validation time, the CI reads `evaluated_by` and `min_eval_score`, runs the eval set against the skill, and gates the PR on the result.

**Selective injection is mandatory.** Blanket-loading all ontology/configs/policies/contracts/examples is an architectural violation that nullifies OBSERVE's token benefits. (Evals are validation-time only and are never injected into prompts, so the selective-injection rule does not apply to them.)

### 5.1 Manifest Maintenance

Manifest churn is bounded to *dependency* changes (new ref, renamed file, removed ref) — *content* changes inside referenced files (adding a severity tier to the enum, refining a concept definition) do **not** require touching consumer manifests. Skills change less often than their references do.

Three mechanisms keep manifest size and maintenance cost manageable:

- **Transitive consumption via cross-references (§8).** A skill consuming `policies/severity-criteria.yaml` does not redeclare the ontology/config refs that policy already declares in its own header. The loader walks the graph and injects transitively, audit-logging each hop. Manifests stay shallow — name the leaf-most thing the skill cares about, and let the reference files carry their own deps.

- **Bundles.** Common groupings of refs live as named bundle files; skills include them with one line:

  ```yaml
  metadata:
    observe:
      includes:
        - bundles/severity-classification.bundle.yaml
      consumes_examples:
        - examples/skill-specific.yaml   # only the skill-unique bit
  ```

  One edit to the bundle propagates to every including skill. Bundles MAY themselves include other bundles, but circular includes are a governance error. This is also the right answer when a manifest starts feeling large — extract the shared refs to a bundle rather than splitting the manifest into a sibling file (which fragments the skill, breaks atomicity, and creates a pairing invariant that nothing enforces).

  Bundles MUST be **tightly scoped** — they exist to factor out genuinely shared refs across multiple skills, not to bypass selective injection by bundling everything-a-skill-might-need. Governance flags any bundle whose refs are not actually injected at runtime by at least one consuming skill (the no-orphans rule, applied at the bundle level).

- **Lint and autocomplete tooling.** An OBSERVE-aware editor plugin or CLI detects unused declarations (listed but not injected at runtime), missing declarations (referenced in skill prose but not declared), and broken `#fragment` paths. This makes manual maintenance tractable in the way typechecking makes type annotations tractable.

A typical skill manifest stays under ~20 lines once bundles and cross-references are in use. The manifest belongs in the skill's frontmatter, not in a sibling file — host runtimes (Claude Code, VS Code Copilot Workspace, etc.) parse frontmatter natively, and keeping prose and manifest physically attached prevents the "edited one, forgot the other" class of bug.

---

## 6. Delegation Flow

The skill manifest is a contract between the skill author and the **loader** — not between the skill author and the LLM that runs the skill. The LLM never reads its own manifest; the loader resolves it on the skill's behalf, ahead of invocation.

When a parent agent delegates to a skill:

```text
1. Parent agent decides to invoke skill X
       ↓
2. Orchestrator looks up skill X's metadata.observe manifest
       ↓
3. Loader resolves each consumes_* entry:
   • reads the referenced file (or #fragment)
   • walks cross-references transitively
   • emits an audit-log entry per resolution {path, commit_sha, fragment, ts}
       ↓
4. Loader composes the delegation prompt:
   • skill prose                                  (the behavior — the base)
   • + ONTOLOGY_CONTEXT block + # Source: ...     (concept definitions)
   • + CONFIG_CONTEXT   block + # Source: ...     (values)
   • + POLICY_CONTEXT   block + # Source: ...     (rules)
   • + CONTRACT_CONTEXT block + # Source: ...     (schemas)
   • + EXAMPLES_CONTEXT block + # Source: ...     (selected few-shot)
       ↓
5. Composed prompt → sub-LLM (or sub-agent) for execution
       ↓
6. Sub-LLM does the work using the injected context;
   it never sees the manifest itself
       ↓
7. Return path: output MAY be validated against `produces_contracts`
   before returning to the parent agent
```

Three consequences follow from this separation:

- **OBSERVE-conformance is a platform property, not a model property.** The LLM does not need to understand OBSERVE semantics. As long as a platform has *some* orchestrator step between "decide to delegate" and "send prompt to LLM," OBSERVE can be inserted there. No retraining or fine-tuning is required.
- **Parent agents MAY inspect manifests.** A parent deciding whether to delegate may check `produces_contracts` (to know the output shape), `safety_critical` (to apply extra wrapping), or `min_eval_score` (to confirm the skill is well-tested). This is a parent-side concern, separate from the running-skill concern.
- **A loader is a hard prerequisite.** Platforms that let an LLM read a skill file *directly* with no resolution step (some bare-bones agentic setups) cannot adopt OBSERVE without first adding a loader. The loader is where selective injection, cross-reference resolution, and audit-binding happen — there is no out-of-process alternative.

---

## 7. Canonical Source Is Absolute

Skills MUST NOT carry inline concept definitions, inline value lists, inline rule restatements, inline schema fragments, or inline few-shot examples, even as parenthetical fallback hints. Every concept, value, rule, shape, demonstration, and quality bar has exactly one source: the relevant file in `ontology/`, `config/`, `policies/`, `contracts/`, `examples/`, or `evals/`.

If the loader fails to inject a required runtime reference (ontology, config, policies, contracts, or examples), the delegation **halts** with an audit-logged error. The skill does not silently fall back to embedded values.

This is non-negotiable. The alternative — keeping inline summaries "just in case" — recreates the drift problem OBSERVE was designed to eliminate.

**Operating modes.** The halt-on-missing-injection contract applies in **strict mode** (CI, staging, production). In **permissive mode** (local development only), missing injections MAY log and continue with an explicit `[INJECTION_FALLBACK]` audit marker. The mode is platform-configured and every audit log entry records which mode was active at injection time. Permissive mode exists to keep development unblocked when manifests are mid-edit — it is not a graceful-degradation path for production.

**Eval contract is separate.** Evals are not subject to the halt-on-missing-injection rule (they are not injected at runtime), but they are subject to a parallel rule: a skill without an `evaluated_by` declaration and a minimum eval score is blocked from merging into an OBSERVE-conformant farm.

**Loader caching contract.** The audit-log binding (§9) is per-delegation, not per-process. Loaders MAY cache injected content by content-hash to avoid redundant I/O, but each delegation MUST emit its own audit-log entry with the resolved `commit_sha` — a cached read is still a consumption event. Caching that elides audit entries violates the binding-at-consumption rule.

---

## 8. Fragment Resolution

`ontology/` and `config/` files support `#fragment` references to specific keys; `policies/`, `contracts/`, `examples/`, and `evals/` are loaded whole or by named case ID.

```text
ontology/concepts.yaml#severity         → top-level concept "severity"
ontology/concepts.yaml#severity.critical → nested concept (max depth: 2)
config/enums.yaml#severity              → top-level key "severity"
config/thresholds.yaml#confidence.high  → nested key (max depth: 2)
policies/severity-criteria.yaml         → entire file (no fragment)
contracts/Finding.schema.yaml           → entire file (no fragment)
examples/severity-classification.yaml   → entire file (default), OR
examples/severity-classification.yaml#case-12 → single named example (optional)
evals/severity-classification.yaml      → entire file (no fragment)
```

Deeper nesting than two levels in `ontology/` or `config/` signals the file should be restructured. Example files MAY support case-level addressing for skills that want only a subset of demonstrations as few-shot context.

**Cross-references between reference files.** Reference files MAY use the same `#fragment` syntax to link to other reference files — most importantly, `config/`, `policies/`, and `contracts/` linking to `ontology/` concepts (so an enum's members are bound to their definitions), and `policies/` linking to `config/` keys (so a rule's thresholds are bound to their configured values rather than defensively inlined). Cross-references are resolved by the same loader path as skill manifests and produce audit-log entries at every hop, preserving end-to-end provenance from a decision back to every concept and value it depended on.

---

## 9. Governance and Validation

An OBSERVE-conformant platform requires governance / CI validation across all six reference directories:

- **YAML schema validity** — every file in `ontology/`, `config/`, `policies/`, `contracts/`, `examples/`, `evals/` conforms to a meta-schema.
- **Reference integrity** — every `#fragment` declared in a skill's manifest or in a cross-reference resolves to an existing key.
- **No orphans** — every reference file is consumed (runtime) or referenced (validation) by at least one skill or another reference file.
- **Ontology consistency** — every concept defined in `ontology/` MUST be referenced by at least one skill, policy, config, or contract (else it is removed). Renaming or restructuring a concept requires an ADR; governance flags all consumers at the rename, since concept-level changes cascade across categories.
- **No inline duplication** — skills do not redefine concepts/values/rules/shapes/examples that exist in the reference directories.
- **Impact analysis** — when a concept, contract field, policy rule, or eval threshold changes, governance flags all consuming or evaluated skills.
- **Audit-log binding** — every runtime injection event MUST record `{file_path, commit_sha, fragment, timestamp}` in the audit log. Every CI eval run MUST record `{eval_file_path, commit_sha, score, threshold, pass/fail}` similarly. Git history alone is insufficient for compliance: the binding from a decision (or a quality gate) to its source version must be captured *at the moment of consumption*, not reconstructed retrospectively.
- **Quality gate enforcement** — every skill declared in `skills/` MUST have an `evaluated_by` declaration pointing to at least one eval set, and a `min_eval_score`. PRs that drop the skill's eval score below its declared threshold are blocked unless an ADR explicitly accepts the regression.
- **Example/eval coherence** — examples used as few-shot context (runtime) and examples used as eval cases (validation) MAY share a file but MUST be tagged with `purpose: training | test | both | counter-example`; no example case may be used to both train and grade the same skill. Counter-examples are never used as positive few-shot demonstrations and never used as the assertion target of an eval case — they teach what NOT to do, and are surfaced only when a skill explicitly opts in via a `consumes_counter_examples:` declaration.
- **Eval staleness** — every eval file carries a `last_reviewed: YYYY-MM-DD` field. Governance flags eval files untouched for more than N months (platform-configurable, default 6) and gates merges that depend on stale eval sets until they are reviewed and re-affirmed (or refreshed). Without this, "all green CI" eventually means "you've stopped looking."
- **Content provenance** — examples and eval cases declare `provenance: human | synthetic | hybrid`. Synthetic-only cases MAY NOT be the sole grading basis for safety-critical skills (those declaring `safety_critical: true`); at least one human-authored case must be present. Hybrid cases (human-edited synthetic) are treated as synthetic for this rule unless reviewer attribution is recorded.
- **Schema evolution discipline** — `contracts/` changes are classified additive (new optional field, no consumer impact), evolutionary (deprecation with a window), or breaking (removed/renamed field). Breaking changes require an ADR plus a deprecation window before removal; governance flags all consuming and producing skills at each transition so refactors can be batched rather than scrambled. The same classification applies to `policies/`, `ontology/`, and `evals/` schema-level changes that affect skill manifests.

Two-tier enforcement keeps governance from becoming a bottleneck: pure YAML checks run as automated CI; architectural judgments (new-skill manifests, breaking changes, ontology rename, eval-threshold changes) require human review.

---

## 10. What OBSERVE Is Not

OBSERVE is deliberately bounded:

- **Not a runtime.** OBSERVE defines content organization; it does not prescribe how agents execute. It can be applied alongside any agent runtime or farm pattern.
- **Not a behavior framework.** Skills, prompts, and agent definitions remain in the platform's behavioral layer.
- **Not an eval framework.** OBSERVE defines *where* eval sets live and *what governance* applies to them. The choice of eval tooling (Braintrust / Promptfoo / OpenAI Evals / DeepEval / custom) is platform-specific.
- **Not a knowledge graph or triplestore.** Ontology files are prose+YAML designed for prompt injection. OBSERVE does not require RDF, OWL, or SPARQL; skills consume concept definitions as injected context, not as queryable graph data.
- **Not a synthesis or extension of another architecture.** OBSERVE is independent. Where it appears alongside other architectures, the two are orthogonal.
- **Not a Reference Architecture in the IEEE 42010 sense.** OBSERVE is a *principle* — a teachable rule with a directory convention and a manifest format. A full Reference Architecture would additionally specify stakeholder concerns, quality-attribute scenarios, viewpoints, and variability points validated across multiple instances. That work has not been done; OBSERVE may grow into a reference architecture once it is validated in 2+ independent farms.
- **Not a security framework.** OBSERVE provides forensic traceability (audit-log binding, canonical sources, versioned ontology, schema-evolution discipline) and structural integrity (reference-integrity checks, no orphans, no inline duplication) — but it does **not** address:
  - **Access control** on reference directories — anyone who can edit `config/severity.yaml` changes the behavior of every consuming skill. Code-review-as-control is implicit, not specified.
  - **Cryptographic signing** of references or audit logs — `provenance: human` is whatever the author claims; signed authorship is out of scope.
  - **Audit-log integrity** — OBSERVE requires the log be written, not that it be append-only, signed, tamper-evident, or stored separately from the platform that writes it. A compromised platform can rewrite its own audit trail.
  - **Prompt injection via reference content** — edits to `examples/`, `ontology/`, or `config/` flow directly into consuming skills' prompts. OBSERVE does not specify trust boundaries between reference categories or RBAC on reference editing.
  - **Sensitive data in `examples/`** — golden eval cases often contain realistic inputs (PII, credentials, internal URLs). Redaction, encryption-at-rest, and read-access on `examples/` are out of scope.
  - **Permissive-mode enforcement** — §7 says permissive mode is local-dev only, but ensuring strict mode is actually on in CI/staging/prod is platform-level work, not OBSERVE-level.

  Adopters in regulated or high-risk environments MUST layer their own controls on top of OBSERVE; nothing here substitutes for proper security engineering.
- **Hybrid adoption surrenders the guarantees.** Within a defined scope (e.g., a single farm), OBSERVE is either followed wholesale or not — partial adoption (some artifacts canonical, others inline) creates the worst of both worlds. Different farms within the same platform MAY adopt independently; the principle is not transitive across runtime boundaries.

---

## 11. Performance Contracts

### Token contract

A correctly implemented OBSERVE targets at minimum **token-neutrality** versus an inline-everything baseline. The net direction (reduction vs. regression) is platform-specific and depends on (a) how heavily shared content was inlined before adoption, (b) cross-skill overlap of references, (c) selective-injection discipline. Both outcomes are observable in practice — reduction is most likely for skills with heavy pre-existing inline duplication; near-neutral or slight regression is most likely for already-lean skills.

The labeled-block injection format (`ONTOLOGY_CONTEXT:`, `# Source:` provenance comments, separator structure) adds per-block overhead — so a small ref injected as one of many blocks may cost more than its inline equivalent. Net reduction comes from amortizing large shared refs across many skills, not from per-skill efficiency.

A baseline measurement before adoption is required; the success bar is "no increase," with reduction as upside.

**Measurement protocol.** A defensible neutrality claim requires:

- **Workload**: a representative set of N delegations covering the platform's primary use cases (not a curated best-case).
- **Metric**: tokens per delegation (prompt + injected context, including ontology and examples), measured at p50 and p95.
- **Comparison**: same workload run against an inline-everything baseline vs. OBSERVE, with identical task inputs.
- **Attribution**: per-skill breakdown distinguishing manifest size, injected reference payload (by category), and injected example payload — so regressions can be traced to their cause.

### Quality contract

An OBSERVE-conformant skill carries an explicit quality SLO (`min_eval_score`). The platform's eval CI enforces this SLO on every PR touching the skill or any of its OBSERVE dependencies. Without `evals/`, the platform has no way to enforce quality; with `evals/`, regressions become PR-blocking and surface during code review rather than in production.

The eval threshold itself is a versioned artifact in `evals/` — raising or lowering it requires an ADR, the same as changing a concept, policy, or contract.

Without these protocols, OBSERVE's neutrality and quality claims are unfalsifiable. Each platform adopting OBSERVE SHOULD publish baseline token numbers and initial eval scores alongside the adoption ADR.

### Resolution-cost contract

OBSERVE introduces a per-delegation processing tax: manifest parse → fragment resolution → transitive cross-reference walk → audit-log writes → prompt composition. Content-hash caching (§7) amortizes file I/O across delegations, but the audit-log writes are per-delegation by spec and must run on the critical path of every consumption.

Implications by scale:

- **Low-throughput platforms** (≤10 delegations/sec): the tax is negligible. No special engineering required.
- **High-throughput platforms** (thousands of delegations/sec): the audit-log path becomes a real bottleneck. Engineering work — async buffered writes, batched commits, sharded storage — is required. Naive synchronous file-append will not scale.
- **Cold-cache scenarios** (first delegation after deploy): pay full file I/O cost. Pre-warming caches at process start helps if cold latency matters.

Cross-reference depth multiplies the tax: a 3-hop chain (skill → policy → config → ontology) requires 3 reads + 3 audit entries per resolved reference. Deep transitive graphs are a smell — keep cross-reference chains shallow.

---

## 12. About the Name

"OBSERVE" is both a mnemonic and a stance. The seven content categories — **O**ntology, **B**ehavior, **S**hapes, **E**vals, **R**ules, **V**alues, **E**xamples — share a common discipline: they are *observed*, in the auditor's sense, at every consumption. Every injection records its source commit; every eval run records its score; every rule fires with traceable provenance back to the concepts and values it depended on. The principle is named for what it requires the platform to do: observe its own conduct, in a way that is machine-verifiable rather than asserted in prose.

The acronym is a recall aid, not an ordering — the categories are parallel artifact kinds, and the teaching order used in §1 (Behavior → Ontology → Values → Rules → Shapes → Examples → Evals) follows logical buildup rather than letter sequence.

Two letters denote singular forms (*E*val, *E*xample) for acronym convenience; the corresponding directories are plural (`evals/`, `examples/`). This is cosmetic.

The principle is portable to any agentic platform regardless of the host runtime's branding.

---

## 13. Relationship to Established Patterns

OBSERVE shares DNA with several well-established patterns from outside the agentic context. Honest positioning matters for adopters evaluating whether OBSERVE is novel or a recombination:

| Pattern | What it shares with OBSERVE | What OBSERVE adds |
|---|---|---|
| **Policy-as-code** (Open Policy Agent / Rego, ~2016) | Decision rules separated from runtime behavior, declaratively defined | Rules are consumed by LLM agents via declared manifests and selective injection — not evaluated by a policy engine at the network edge |
| **Schema registries** (Confluent, Apicurio, JSON Schema repositories) | Typed contracts as first-class artifacts with reference integrity | Skills declare consumed/produced contracts in frontmatter; the orchestrator delivers them per-delegation rather than at message-bus serialization time |
| **12-factor configuration** (Heroku, ~2011) | Values externalized from behavior, environment-aware | Values live as fragment-addressable YAML with audit-logged provenance, not as environment variables — and they flow into prompts, not process startup |
| **Ontologies / knowledge graphs** (RDF, OWL, schema.org, ~2004) | Domain concepts as first-class, structured, referenceable artifacts with explicit relationships | OBSERVE ontologies are prose+YAML designed for prompt injection — not RDF/OWL — and are consumed by LLM agents directly without a triplestore or query layer; the discipline (canonical source, audit-binding, governance) applies the same way as for values and rules |
| **Test fixtures and golden sets** (xUnit, pytest fixtures, HELM, BIG-bench) | Examples and expected outputs as first-class versioned artifacts | Examples are dual-purpose (runtime few-shot + validation cases) and carry the same audit-log binding as concepts/values/rules/shapes — unified under one declarative manifest convention |
| **Eval-driven prompt development** (Braintrust, Promptfoo, OpenAI Evals, DeepEval) | Golden eval sets + automated graders + CI regression gates | Evals are organized under the same canonical-source/no-inline-duplication discipline as the other reference categories; quality SLO is part of the skill manifest, not an external configuration |

The novel contribution is the **integration of all six with selective context injection and audit-logged provenance for LLM agents** — making the audit, drift, and quality guarantees machine-verifiable in a setting where the consuming runtime is prose, not code.

---

## Appendix: Adoption Pattern

Farms or platforms adopting OBSERVE after the fact (rather than greenfield) typically follow a phased pattern:

1. **Baseline** — measure current DRY violations, token cost, and (where possible) current output quality on a representative workload.
2. **Extract concepts** — populate `ontology/`; this often surfaces hidden disagreements about what domain terms mean, which is itself valuable.
3. **Extract values** — populate `config/`; bind enum members to their ontology definitions via cross-references.
4. **Extract rules** — populate `policies/`.
5. **Extract shapes** — populate `contracts/`.
6. **Extract examples** — populate `examples/`; tag each case as `training | test | both | counter-example` and `provenance: human | synthetic | hybrid`.
7. **Build initial eval sets** — populate `evals/` per skill, starting with the most safety-critical skills; set initial `min_eval_score` thresholds and `last_reviewed` dates.
8. **Refactor skills** — add `consumes_*`, `evaluated_by`, `min_eval_score` manifests; remove inline duplications.
9. **Governance** — extend validation to cover the new directories, the cross-reference resolver, and the quality-gate enforcement.
10. **Documentation** — update pattern catalog and onboarding.

Platform-specific adoption plans provide concrete examples of this pattern. Phases 6 and 7 (examples and evals) MAY be sequenced after phases 2–5 (ontology, values, rules, shapes) are stable, to reduce the size of the first migration. Phase 2 (ontology) SHOULD come early — concept definitions anchor the value, rule, and contract extraction that follows.

---

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-28 | Draft | Initial draft published as APR-002. |
