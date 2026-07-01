---
apr: 14
title: "DECLARE — The Frontmatter Contract for Promptware Components"
abstract: "Every packaged promptware component is governed by a two-layer contract: a structured frontmatter block that holds all machine-readable metadata — organized into typed scope clusters — and a body restricted to functional prose only. Tooling, dispatch, governance, and audit derive from the frontmatter; the body is the only layer injected into an LLM context. Classification, operability, provenance, evaluation, and composition attributes each live in their owning cluster; the component's format, name, or folder never implies any of them."
status: Draft
version: 0.2.1
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
  - "Claude Sonnet 4.6 (Anthropic)"
created: 2026-06-26
last-updated: 2026-07-01
audience: Architects and framework authors of agentic platforms; anyone defining how loadable agent/skill/pattern/instruction components declare what they are and what they need to operate
supersedes: []
superseded-by: []
related:
  - APR-001
  - APR-002
  - APR-003
  - APR-005
  - APR-006
  - APR-007
  - APR-008
  - APR-010
  - APR-011
tags:
  - frontmatter
  - declaration
  - metadata
  - classification
  - operability
  - composition
  - orthogonality
  - token-efficiency
  - governance
---

# APR-014 DECLARE — The Frontmatter Contract for Promptware Components

> **Every packaged promptware component is governed by a two-layer contract: a structured frontmatter block carrying all machine-readable metadata in typed scope clusters, and a body restricted to functional prose only. Tooling, dispatch, governance, and audit read exclusively from the frontmatter; the body is the only layer injected into an LLM context. No metadata in the body; no behavior in the frontmatter.**

## Motivation

[APR-001 ASPECT](APR-001-aspect.md) defines the *body* of an agent or skill specification and explicitly states that a **separate frontmatter layer** — "tool grants, schema references, invocability flags, policies, evaluation pins" — is its **sibling that it assumes but does not define**. That sibling is undefined corpus-wide. Several principles already *require fields* in it — [APR-003](APR-003-code-prompt-boundary.md) an exec-form declaration, [APR-006](APR-006-composition-topology.md) a declared delegation envelope and granularity, [APR-007](APR-007-pattern-mechanism.md) `applies_patterns` and `skill_kind`, [APR-008](APR-008-artifact-lifecycle.md) a model-validated-against pin, [APR-002 OBSERVE](APR-002-observe.md) `evaluated_by` — yet no principle states the **contract of the frontmatter layer itself**: that it exists, is structured, and is the single authoritative source for all machine-readable component metadata.

The gap causes five failures:

- **Costume.** A multi-step orchestration ships as a single "skill" because the packaging format allows it. From the outside it looks like a leaf transform; it is actually a coordinator with a hidden delegation graph ([APR-006](APR-006-composition-topology.md)). Its fan-out is invisible to approval and audit because nothing on the unit declares it.
- **Substrate invisibility.** Reading a component, you cannot tell whether its behavior is guaranteed code or probabilistic prompt ([APR-003](APR-003-code-prompt-boundary.md)) because nothing declares its substrate.
- **Conflation.** One overloaded noun ("skill") is silently read as several independent claims — leaf, model-run, stateless, invocable — so changing one cannot be expressed, and tooling that switches on the label is wrong for every off-diagonal case.
- **Metadata bleed.** Classification, version, ticket, evaluation thresholds, and model pins live inside the prose body. They are injected into the LLM context on every invocation, consuming tokens unnecessarily and making them invisible to fast, deterministic tooling.
- **Prose-locked governance.** Because metadata is embedded in prose, governance checks — "does this component declare its trust level?", "is the version bumped?" — require LLM evaluation or brittle prose parsing instead of sub-second schema validation.

The deeper problem behind all five is the same: **no contract governing the frontmatter layer**. Without one, metadata drifts into the body, classification is inferred from format or name, and governance is slow, probabilistic, and fragile.

## The principle

> **A packaged promptware component is a two-layer unit. The frontmatter layer is the machine-readable contract: structured, orthogonal, authoritative, organized into typed scope clusters, never inferred from format or name. The body layer is functional prose only: the behavioral instructions injected into an LLM context. Nothing machine-readable belongs in the body; nothing behavioral belongs in the frontmatter.**

DECLARE is the contract governing both layers as a unit — the frontmatter sibling [APR-001 ASPECT](APR-001-aspect.md) names but leaves undefined, combined with the body-restriction discipline that keeps governance deterministic and token cost minimal. It does **not** define the individual field values — each field defers to its owning principle.

## Scope and applicability

### When this applies

- Any platform where components are **packaged as loadable units** (skill files, agent specs, pattern files, instruction files, tool manifests) and a single format can host more than one architectural role — which is the normal case for agentic platforms.
- Applies to all component kinds: `skill_kind: capability`, `skill_kind: pattern`, agent specifications, and instruction files.

### When this does NOT apply

- A single inlined prompt with no packaging or loading layer — there is no unit to declare and nothing to separate layers within.
- DECLARE does **not** define which field values are valid within any cluster — that is each owning principle's job. It defines that the frontmatter exists, is structured into clusters, and is authoritative.

## The two layers

### Frontmatter: the machine-readable contract

The frontmatter block is the **authoritative source** for all metadata about a component. It is:

- **Structured** — organized into named scope clusters (§ *The frontmatter skeleton*), each governed by an owning principle.
- **Orthogonal** — each independent attribute is its own field; no single field stands in for two independent attributes. The test: if two attributes can vary separately, they are orthogonal and MUST be separate fields.
- **Authoritative** — folders, names, loaders, dispatch switches, and approval/audit surfaces MUST derive from declared fields. Where a folder or name also encodes a class (a navigation convenience), it MUST agree with the declaration; on conflict the declaration wins and the divergence is a validation error.
- **Not injected** — the frontmatter is read by loaders and tooling at load/governance time. It MUST NOT be injected into an LLM context. Per-invocation token cost equals body size only.

### Body: functional prose only

The body is the **only layer injected into an LLM context**. It MUST contain exclusively behavioral instructions — the prose the model reads to know how to behave. It MUST NOT contain:

- Classification attributes (exec_form, skill_kind, trust level, substrate)
- Operational metadata (version, ticket, resolution, tracing anchors)
- Governance metadata (principals, status, evaluation thresholds)
- Composition declarations (applies_patterns, delegation envelope)
- Typed I/O schemas or contracts (those belong in the `evaluation` or `composition` cluster)

If information is machine-readable, structured, or consumed by tooling — it belongs in the frontmatter. The body is for the LLM; the frontmatter is for everything else.

## The frontmatter skeleton

The frontmatter is organized into **scope clusters** — named groups of related attributes, each governed by one or more owning principles. Platforms SHOULD use the canonical cluster names below for interoperability; they MAY add platform-specific clusters. Each owning principle defines which of its fields are required on a given component type; DECLARE defines the structural home.

### Canonical clusters

**`classification`** — what kind of thing this component is architecturally. Governed by [APR-003](APR-003-code-prompt-boundary.md), [APR-005](APR-005-trust-boundaries.md), [APR-006](APR-006-composition-topology.md), [APR-007](APR-007-pattern-mechanism.md).

```yaml
classification:
  exec_form: prompt        # code | prompt  (APR-003)
  skill_kind: capability   # capability | pattern  (APR-007)
  trust_level: trusted     # trusted | semi-trusted | untrusted  (APR-005)
  agency: leaf             # leaf | coordinator  (APR-006)
```

**`operability`** — what the component needs and tracks to run. Governed by [APR-008](APR-008-artifact-lifecycle.md), [APR-011](APR-011-observability.md).

```yaml
operability:
  version: 1.2.0
  ticket: "jira:PLAT-441"
  resolution: "loader://skills/summarise"
  trace_anchor: "skill.summarise"
  direction: "Summarise a document into key decisions and open questions"
```

**`provenance`** — who made it and when. Governed by [APR-010](APR-010-governance.md).

```yaml
provenance:
  principals:
    - D. Maxios
  created: 2026-06-26
  last-updated: 2026-06-26
  status: Draft            # Draft | Stable | Deprecated
```

**`evaluation`** — quality gates and model provenance. Governed by [APR-002](APR-002-observe.md), [APR-008](APR-008-artifact-lifecycle.md).

```yaml
evaluation:
  evaluated_by: evals/summarise.yaml
  min_eval_score: 0.85
  model_pin: claude-sonnet-4-6
```

**`composition`** — how this component relates to other components. Governed by [APR-006](APR-006-composition-topology.md), [APR-007](APR-007-pattern-mechanism.md).

```yaml
composition:
  applies_patterns:
    - evidence-grounding
    - untrusted-input-tagging
  delegation_envelope:
    max_depth: 2
    allowed_skills:
      - extract-entities
      - format-output
```

### Suggested cluster → component-kind mapping

The table below is **non-normative** — a navigation aid showing which clusters naturally apply to each component kind. Which clusters are *required* on a given component is determined by the applicable owning principles.

| Component kind | Typical clusters | Less common |
| --- | --- | --- |
| `skill_kind: capability`, `exec_form: prompt` | classification, operability, evaluation | composition, provenance |
| `skill_kind: capability`, `exec_form: code` | classification, operability | provenance |
| `skill_kind: pattern` | classification, composition | evaluation (on host), provenance |
| Agent | classification, operability, composition | evaluation, provenance |
| Instruction file | classification | provenance |

## Prescription

- The frontmatter MUST be the **single authoritative source** for all machine-readable metadata about a component. It MUST NOT be inferred from the packaging format, the file name, or the directory location.
- The body MUST contain **functional prose only** — behavioral instructions for an LLM. Classification, operational, governance, composition, and evaluation metadata MUST NOT appear in the body.
- Each **independent** attribute is its **own field** in the frontmatter. Orthogonal attributes MUST NOT be fused into one overloaded label or enum.
- Frontmatter attributes MUST be **organized into scope clusters** using the canonical cluster names (§ *The frontmatter skeleton*). Platform-specific clusters MAY be added; they MUST NOT reuse a canonical cluster name for a different scope.
- The frontmatter declaration is **authoritative**. Folders, names, loaders, dispatch switches, and approval/audit surfaces MUST derive from declared fields. On conflict between a folder/name encoding and the declaration, the declaration wins and the divergence is a validation error.
- Field values MUST defer to their **owning principle**; DECLARE MUST NOT redefine them. The defined axes and their owners: `exec_form` (`code | prompt`) — [APR-003](APR-003-code-prompt-boundary.md); `skill_kind` (`capability | pattern`) — [APR-007](APR-007-pattern-mechanism.md); trust — [APR-005](APR-005-trust-boundaries.md); agency — [APR-006](APR-006-composition-topology.md); invocability/handoff — [APR-001](APR-001-aspect.md); applied-pattern set — [APR-007](APR-007-pattern-mechanism.md); evaluation gates — [APR-002](APR-002-observe.md); version/lifecycle — [APR-008](APR-008-artifact-lifecycle.md).
- A component that **composes or governs other components** MUST declare its delegation statically in the `composition` cluster, so its fan-out is visible at review. **Agency is declared, never discovered at runtime.**
- The frontmatter MUST NOT be injected into an LLM context. The body MUST NOT be parsed by governance tooling to extract metadata.

## Governance and validation

The shared governance model — two-tier enforcement, audit-log binding, change-via-ADR — is [APR-010](APR-010-governance.md); the checks below are this principle's additions. A conformant platform checks, in review or CI:

- **Body purity** — the body contains only behavioral prose; no structured metadata, classification attributes, or typed schemas are embedded in it. This check is deterministic and requires no LLM.
- **Frontmatter completeness** — every packaged component declares the clusters required by its applicable owning principles; an undeclared required field is a defect, not a default.
- **No conflation** — no single field stands in for two independent attributes; orthogonal axes are separate fields in their owning cluster.
- **Cluster placement** — each field lives in its canonical owning cluster; misplacements (e.g., `version` in `classification`) are flagged.
- **Declaration is authoritative** — any folder/name class-encoding is reconciled against the frontmatter; mismatches fail.
- **Agency is declared** — coordinator components declare their delegation envelope in `composition`; no component dispatches outside its declared envelope.
- **Tooling reads the field, not the path** — loaders, dispatch, and approval surfaces key on frontmatter fields; name/extension/folder sniffing for role is flagged.

## What this principle is NOT

- **Not a schema.** It does not fix field names, value sets, or file format — those are platform-specific and owned by the axis-owning principles. It defines the contract that such a structured frontmatter exists and is authoritative.
- **Not ASPECT.** ASPECT governs the body's content (behavioral semantics); DECLARE governs the frontmatter sibling and the body-restriction rule. The two principles together define the complete component contract.
- **Not APR-003, APR-005, APR-006, or APR-007.** DECLARE does not define what exec_form, trust, agency, or skill_kind mean; it requires that whatever those principles define is declared in the frontmatter and read from there.
- **Not a taxonomy of component kinds.** It mandates orthogonal declared axes in typed clusters; it does not enumerate the kinds.
- **Not a folder or naming convention.** Folders and names may mirror a class for human navigation, but they are derived shadows; the frontmatter is the contract.
- **Not OBSERVE.** APR-002 governs the content and governance of non-behavioral artifacts (config, examples, ontology, evals). The `evaluation` cluster in DECLARE is the frontmatter home for OBSERVE-governed fields; the artifacts themselves are governed by OBSERVE.
- **Not a token-optimisation technique.** The body-restriction rule separates concerns for correctness and governance; the token reduction is a consequence, not the goal.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
| --- | --- | --- |
| **HTTP headers / body separation** | Metadata (headers) separate from payload (body); tooling reads headers, applications read body | Applied to promptware: frontmatter = headers (machine-readable, not injected), body = payload (prose, LLM-injected) |
| **YAML front-matter in static sites** (Jekyll, Hugo) | Structured metadata block above content; tooling reads the block, rendering uses the content | Typed scope clusters, owning-principle governance, and the prescription that no metadata bleeds into the content |
| **Self-describing modules / manifests** (`package.json`, OCI manifest, Java `module-info`) | Role declared in metadata, not guessed from filename | Promptware role axes (substrate, agency, trust) and the *costume* failure mode specific to role-blind agent packaging |
| **MIME types & no content-sniffing** (RFC 2046/6838; `X-Content-Type-Options: nosniff`) | Type is declared and authoritative; sniffing it from the extension is a known hazard | "Don't sniff *architectural role* from a component's format/name/folder," with the declaration as the single source |
| **Make illegal states unrepresentable** (typed tags over stringly-typed enums) | Orthogonal attributes as separate fields, not one overloaded label | Applied to agent/skill classification, where the overloaded noun ("skill") was read as four claims at once |
| **Capability-based security** (Miller) | Authority is explicit and declared, never ambient or inferred | Generalizes "declare, don't infer" from authority to the full component metadata surface |

The novel contribution is a **promptware-specific two-layer contract**: a structured, clustered frontmatter block as the authoritative machine-readable layer, paired with a strict body-restriction rule — turning governance into deterministic schema checks and reducing per-invocation token cost to body size only.

## Adoption notes

- **Migrate metadata out of bodies first.** Audit existing components for structured metadata embedded in prose; move it to the appropriate frontmatter cluster. The act of migration surfaces what is currently implicit.
- **Name clusters by concern, not by APR.** Use `classification`, `evaluation`, `composition` — not `apr003`, `observe`, `apr007` — so the frontmatter is readable without knowledge of the APR corpus.
- **Backfill classification explicitly.** Tag every existing component with its full `classification` cluster; the act of tagging surfaces coordinators currently disguised as leaves.
- **Add the body-purity lint early.** Detecting structured metadata in the body is a fast, deterministic check; add it before the habit of embedding metadata is established.
- **Add the reconciliation lint early.** A folder/name that encodes a class must be checked against the frontmatter from the start, or the shadow silently becomes a second source of truth.
- **Watch for overloaded nouns.** "Skill," "tool," "agent" each tend to smuggle several claims; split them into separate orthogonal fields under the `classification` cluster.
- **Sequence with APR-006.** Declaring agency in `composition.delegation_envelope` is what makes APR-006's envelope and termination checks enforceable on packaged units.

## References

External sources cited in this APR; see *Relationship to established patterns* for how each relates.

1. npm. *package.json — `type` field (module system declaration)*. <https://nodejs.org/api/packages.html#type>
2. Open Container Initiative. *Image Manifest Specification*. <https://github.com/opencontainers/image-spec/blob/main/manifest.md>
3. Freed, N., Klensin, J., Hansen, T. *Media Type Specifications and Registration Procedures (RFC 6838)*. IETF, 2013. <https://datatracker.ietf.org/doc/html/rfc6838>
4. WHATWG / MIME Sniffing. *MIME Sniffing Standard and `X-Content-Type-Options: nosniff`*. <https://mimesniff.spec.whatwg.org/>
5. Wlaschin, S. *Designing with Types: Making Illegal States Unrepresentable*. 2013. <https://fsharpforfunandprofit.com/posts/designing-with-types-making-illegal-states-unrepresentable/>
6. Miller, M. S. *Robust Composition: Towards a Unified Approach to Access Control and Concurrency Control* (capability security). PhD thesis, 2006. <http://www.erights.org/talks/thesis/markm-thesis.pdf>
7. Jekyll. *Front Matter*. <https://jekyllrb.com/docs/front-matter/>
8. Fielding, R. T. et al. *Hypertext Transfer Protocol — HTTP/1.1 (RFC 2616)*, §4 HTTP Message. IETF, 1999. <https://datatracker.ietf.org/doc/html/rfc2616>

## Change log

| Version | Date | Status | Change |
| --- | --- | --- | --- |
| 0.1.0 | 2026-06-26 | Draft | Initial draft published as APR-014. The declared-classification contract: orthogonal declared axes, authoritative over format/name/location, each axis deferred to its owning principle (APR-001/003/005/006/007). |
| 0.1.1 | 2026-06-26 | Draft | Named `exec_form` and `skill_kind` as the two minimum required axes in Prescription and Governance; updated axis-deferral bullet to list axis names and values explicitly. |
| 0.2.0 | 2026-06-26 | Draft | Major rewrite. Broadened scope from classification-only to the full two-layer frontmatter contract. Added: body-restriction rule (body = functional prose only), structured scope clusters (classification, operability, provenance, evaluation, composition) with examples and component-kind mapping, two new failure modes (metadata bleed, prose-locked governance), HTTP header/body and YAML front-matter in established-patterns table. Moved exec_form/skill_kind minimum-required mandates back to APR-003/APR-007 where they already live. |
| 0.2.1 | 2026-07-01 | Draft | Renamed the `exec_form` values `script`→`code` and `llm`→`prompt` in the classification-cluster example, component-kind mapping, and axis-owner list, tracking the APR-003/APR-000 harmonization (`exec_form: code \| prompt`). No change to the contract. |
