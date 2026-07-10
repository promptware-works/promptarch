---
apr: 22
title: "A Tool-Contract and Least-Privilege Principle for Promptware"
abstract: "A tool is a narrow, schema-validated, permission-tiered contract between the model and the world: one job each, input and output validated, tiered by effect (read / write / destructive) at least privilege, returning errors the model can self-correct from."
status: Draft
class: architectural
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-10
last-updated: 2026-07-10
audience: Architects and framework authors designing the tools/functions a model may call; anyone building a tool registry or MCP server for a promptware harness
supersedes: []
superseded-by: []
related:
  - APR-003
  - APR-005
  - APR-009
  - APR-014
  - APR-017
  - APR-018
  - APR-020
tags:
  - tools
  - function-calling
  - least-privilege
  - schema-validation
  - permission-tier
---

# APR-022 — A Tool-Contract and Least-Privilege Principle for Promptware

> **A tool is a contract between the model and the world: narrow scope, one job each, schema-validated input *and* output, tiered by effect (read / write / destructive) at least privilege by default, and returning errors the model can self-correct from.**

*Injectable summary (for feeding to an LLM): [`digests/APR-022-tools.md`](digests/APR-022-tools.md). This full APR is canonical.*

## Motivation

Tools are how a model *acts on the world* — the surface where fuzzy model output becomes a definite effect. The corpus governs the trust of what enters the model ([APR-005](APR-005-trust-boundaries.md)), the code/prompt seam of what leaves it ([APR-003](APR-003-code-prompt-boundary.md)), and the box an action runs in ([APR-020](APR-020-execution-environment.md)) — but it has had no principle for **what a tool itself is**. Three consequences follow:

- **Broad, ambient tools widen the blast radius.** A single `run_shell` or an over-scoped `admin_api` tool hands the model a large action-space; a confabulated or injected instruction ([APR-005](APR-005-trust-boundaries.md)) then has that whole space to act in. Effect-tiering and least privilege are how the action-space is bounded at the contract.
- **Unvalidated output is trusted by accident.** Input schemas are common; **output** schemas are usually forgotten. A tool result flows straight into the next model call as fact — including tool *errors* and tool *output*, which are untrusted content ([APR-005](APR-005-trust-boundaries.md)), not instructions.
- **Human-oriented errors teach the model nothing.** `invalid input` gives a model no way to recover; `date must be YYYY-MM-DD, you sent 'tomorrow'` lets it self-correct on the next turn. Every tool will be called wrong; a tool that cannot be recovered from wastes a turn and a budget slice.

## The principle

> **Design each tool as a narrow contract.** One job; a declared input schema and a declared **output** schema, both validated; a declared **effect tier** — read, write, or destructive — that governs its privilege and its oversight; least privilege by default; and machine-actionable error messages. The model chooses *which* contract to invoke; the contract, owned in code, bounds *what that invocation can do*.

A tool contract is the unit at which the model's action-space is enumerated and bounded. It composes with — but is distinct from — the environment the tool runs in ([APR-020](APR-020-execution-environment.md)) and the oversight a consequential effect requires ([APR-009](APR-009-human-in-the-loop.md)).

## Scope and applicability

### When this applies

- Any harness that exposes **tools / functions / MCP servers** a model may call to read or change state.
- Especially where tools include **write or destructive** effects, or where an ecosystem of third-party tools ([APR-012](APR-012-federated-composition.md)) is assembled.

### When this does NOT apply

- A **pure text** interaction with no callable tools.
- The **environment** a tool executes in ([APR-020](APR-020-execution-environment.md)) — this APR defines the *contract*; that one defines the *box*.
- The **general code/prompt seam** ([APR-003](APR-003-code-prompt-boundary.md)) — tools are one crossing of that seam; this APR specializes it to the tool contract.

## Prescription

- A tool **MUST** declare and **validate both an input schema and an output schema**; raw, unvalidated tool I/O never crosses into a privileged action or the next model call ([APR-003](APR-003-code-prompt-boundary.md)).
- A tool **MUST** declare an **effect tier** — `read`, `write`, or `destructive` (registered below, [APR-014](APR-014-declare.md)) — and be granted the **least privilege** its tier requires, by default nothing more.
- **Destructive or irreversible** tools **MUST** gate behind human oversight ([APR-009](APR-009-human-in-the-loop.md)) and **fail closed** on ambiguity ([APR-017](APR-017-graceful-degradation.md)); a destructive tool is never invoked on unvalidated model output alone.
- A tool **SHOULD** do **one job**; broad multi-purpose tools are decomposed so privilege and validation are per-effect, not lowest-common-denominator.
- Tool **output and errors are untrusted content** ([APR-005](APR-005-trust-boundaries.md)) — delivered to the model as data, never as instructions.
- Error messages **MUST be machine-actionable**: state what was wrong and what shape is expected, so the model can self-correct rather than retry blindly.

## Metadata registrations

This APR introduces one component-metadata field, registered here and in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml) per [APR-014](APR-014-declare.md) (never by editing APR-014):

| Field | Path | Type | Values | Status |
|---|---|---|---|---|
| `permission_tier` | core.classification | enum | `read, write, destructive` | active |

`permission_tier` classifies a tool component by its effect on the world; it drives least-privilege granting ([APR-020](APR-020-execution-environment.md)), oversight placement ([APR-009](APR-009-human-in-the-loop.md)), and fail-closed handling ([APR-017](APR-017-graceful-degradation.md)).

## Governance and validation

The shared conformance model is [APR-010](APR-010-governance.md); the checks below are this APR's additions.

- **Schemas both ways** — every tool declares and validates input *and* output; a tool missing an output schema is a finding.
- **Tier declared and enforced** — every tool declares a `permission_tier`; a `destructive` tool without an oversight gate ([APR-009](APR-009-human-in-the-loop.md)) is a finding.
- **Least privilege** — a tool's granted capability ([APR-020](APR-020-execution-environment.md)) does not exceed its declared tier.
- **Recoverable errors** — tool errors carry the expected shape, not a bare human string (reviewed at Tier 2).

## What this principle is NOT

- **Not the execution environment.** [APR-020](APR-020-execution-environment.md) isolates where a tool runs; this defines the tool's contract and privilege.
- **Not the general code/prompt boundary.** [APR-003](APR-003-code-prompt-boundary.md) governs any LLM-output crossing; this specializes it to tools.
- **Not the trust model.** [APR-005](APR-005-trust-boundaries.md) labels content; this reaffirms that tool output is data but does not redefine trust.
- **Not a tool-calling wire format.** It mandates *contract properties*, not JSON-Schema vs. OpenAPI vs. MCP specifics.
- **Not human oversight.** [APR-009](APR-009-human-in-the-loop.md) places the gate; this says *which tier* triggers it.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Unix philosophy** ("do one thing well") | Narrow, composable single-purpose tools | Applied to model-invoked tools, with effect-tiering and schema'd output as safety properties |
| **Function calling / tool use** (Anthropic, OpenAI) | Schema-typed callable functions | Mandates *output* validation and a declared effect tier, not just an input schema |
| **Model Context Protocol (MCP)** | A registry of typed tools a model may call | Adds least-privilege effect tiers, self-correcting errors, and untrusted-output discipline as requirements |
| **Capability-based security / POLA** | Least privilege; explicit capability grant | The capability is a *tool contract*; the tier governs privilege and oversight |
| **REST verb semantics** (safe / idempotent / unsafe) | Effect classes drive different handling | `read/write/destructive` drives oversight (APR-009), retry (APR-017), and grant (APR-020) |

The contribution is a **promptware tool-contract principle**: the tool is the unit at which the model's action-space is enumerated, typed, and privilege-bounded — narrow, schema-validated both ways, effect-tiered, and self-correcting — the contract layer between the trust model ([APR-005](APR-005-trust-boundaries.md)), the execution box ([APR-020](APR-020-execution-environment.md)), and human oversight ([APR-009](APR-009-human-in-the-loop.md)).

## Adoption notes

- **Add the output schema first.** Most tools already validate input; the fast win is validating output so tool results stop being trusted by default.
- **Tier before you build.** Assign `permission_tier` at design time — it decides oversight, retry, and grant, so it should not be an afterthought.
- **Write errors for the model.** Every error message is a chance for a free self-correction; spend it.

## References

1. McIlroy, M. D. et al. *Unix Time-Sharing System: Foreword* — "do one thing and do it well". Bell System Technical Journal, 1978. <https://archive.org/details/bstj57-6-1899>
2. Saltzer, J. & Schroeder, M. *The Protection of Information in Computer Systems* — least privilege. Proc. IEEE, 1975. <https://www.cs.virginia.edu/~evans/cs551/saltzer/>
3. Anthropic. *Tool use (function calling)*. <https://docs.anthropic.com/en/docs/build-with-claude/tool-use>
4. Model Context Protocol. *Specification*. <https://modelcontextprotocol.io/>
5. Fielding, R. *Architectural Styles and the Design of Network-based Software Architectures* — safe/idempotent method semantics. 2000. <https://ics.uci.edu/~fielding/pubs/dissertation/top.htm>
6. Bradner, S. *Key words for use in RFCs to Indicate Requirement Levels (RFC 2119 / BCP 14)*. IETF, 1997. <https://datatracker.ietf.org/doc/html/rfc2119>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-10 | Draft | Initial draft. Tools as narrow, schema-validated (input *and* output), effect-tiered (`read`/`write`/`destructive`), least-privilege contracts with self-correcting errors. Registers the `permission_tier` metadata field ([APR-014](APR-014-declare.md)) and [APR-018](APR-018-runtime-contract.md) R16. Fills the "Tools" harness primitive the corpus previously left implicit. |
