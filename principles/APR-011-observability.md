---
apr: 11
title: "An Observability and Cost-Governance Principle for Promptware"
abstract: "Every agent run is end-to-end traceable: spans nest along the delegation graph, capturing content/model versions and per-call cost that rolls up. Audit and observability share one event substrate; drift is caught by sampled re-eval; hard cost caps halt, soft budgets warn."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-31
last-updated: 2026-05-31
audience: Architects and framework authors of agentic AI platforms; platform/SRE teams operating promptware in production; anyone debugging multi-agent runs or governing token spend
supersedes: []
superseded-by: []
related:
  - APR-002
  - APR-006
  - APR-008
  - APR-010
tags:
  - observability
  - telemetry
  - cost
  - tracing
  - drift
---

# APR-011 — An Observability and Cost-Governance Principle for Promptware

> **Every agent run is end-to-end traceable — a trace spanning the delegation graph that captures inputs, decisions, injected-content and model versions, and cost — so production behavior is debuggable, drift is detectable, and spend is attributable and budgeted.**

*Injectable summary (for feeding to an LLM): [`digests/APR-011-observability.md`](digests/APR-011-observability.md). This full APR is canonical.*

## Motivation

Two intertwined gaps:

- **No operational visibility.** The series' audit threads — OBSERVE injection logs, APR-006 delegation logs, APR-008 version/model lineage, APR-005/009 audit-binding — are all *compliance/provenance* oriented (defined by [APR-010](APR-010-governance.md)). Nothing unifies them into an **operational** picture: a single trace of a multi-agent run you can *debug*, with latency/error/cost metrics, and the means to detect **behavioral drift in production**. APR-008's eval gate catches regression at *merge*; nothing watches behavior after *deploy*.
- **No cost governance.** Cost is scattered (OBSERVE's token-neutrality contract, APR-006's budget-as-termination-bound, the digest layer's token efficiency). Nothing makes cost a first-class, **attributed, budgeted, enforced** dimension: which agent/skill/injection spent what, against what budget, halted how.

The distinction that organizes this APR: **observability (operational visibility) is not audit-binding (compliance provenance).** Audit answers *"what version drove this decision, for the record"*; observability answers *"what happened, how long, how much, and why — so I can debug and tune."*

## The principle

> **Instrument every run once, at the point of consumption; from that one substrate, serve the immutable audit record and the operational trace — and make cost a first-class, attributed, budgeted dimension of it.**

## Scope and applicability

### When this applies

- Any promptware platform running in (or near) production that must be debuggable and cost-governed.

### When this does NOT apply

- Throwaway/local experiments.
- It is **not** a specific observability vendor or tool (OpenTelemetry, Langfuse, Braintrust…) — it says what must be traceable and attributed, not which backend. It is **not** compliance audit-binding (that is [APR-010](APR-010-governance.md); this consumes it). It is **not** a billing system or an eval methodology.

## Observability and audit share one substrate

- Observability and audit-binding **MUST** share **one instrumentation point** — the consumption event (`{source, version, timestamp}` bound where content is consumed). Do not double-instrument.
- From that substrate, two policies:
  - **Audit** is the **complete, immutable, compliance-retained** subset — accountability evidence. Its completeness and immutability are a **floor**.
  - **Observability** is the **queryable operational view** — the same events enriched with telemetry (latency, cost, errors), which **MAY** sample, aggregate, and expire on top. It **MUST NOT** weaken audit's floor.

## The trace

- Each run emits an **end-to-end trace** whose **spans nest along the delegation graph** ([APR-006](APR-006-composition-topology.md)): **one span per delegation edge**, with LLM calls and injections as **child events**.
- Each span **MUST** capture the **versions** of the injected content and the model in play ([APR-008](APR-008-artifact-lifecycle.md)), and the **cost** (tokens / spend) of its LLM calls.
- **Cost and latency roll *up* the tree** — a parent's cost is its own plus its delegates'. Injection-level attribution is a **SHOULD** (valuable for cost-tuning, not mandatory).

## Cost is a first-class dimension

- Cost **MUST** be **attributed** to the agent / skill / injection that incurred it, and **budgeted**.
- Enforcement on budget exhaustion is **tiered**:
  - A **hard cap** (the [APR-006](APR-006-composition-topology.md) termination backstop, or a safety spend ceiling) **MUST halt** — runaway loops and cost are stopped.
  - A **soft budget** (a cost target/SLO) **SHOULD** alert, and **MAY** require approval to exceed (a consequential action — [APR-009](APR-009-human-in-the-loop.md) plan-and-approve), *without* stranding legitimate in-progress work.

## Drift detection

- Production behavior **MUST** be monitored for **drift against the eval baseline** (OBSERVE eval sets) via **sampled re-evaluation** in production — rate tuned to risk and cost. This catches *in-the-wild* drift that the merge-time eval gate cannot.
- Detected drift **MUST** route to existing machinery: → [APR-008](APR-008-artifact-lifecycle.md)'s migration gate (if it tracks a model change), → [APR-009](APR-009-human-in-the-loop.md) fire-and-judge (human review of flagged outputs), → back into `evals/` as new cases.

## PII in traces

Observability **MUST NOT** become an unmanaged copy of sensitive data. Captured inputs/outputs (which may contain PII, credentials, internal URLs) **MUST** be **redacted, access-controlled, and retention-bounded**, per the platform's data-privacy discipline. A trace is a sink; treat it like one.

## Prescription

- Every run **MUST** emit a delegation-graph-aligned trace; each span **MUST** capture injected-content and model **versions** and per-LLM-call **cost**; cost/latency **MUST** roll up the graph.
- Observability and audit **MUST** share one instrumentation point; observability **MUST NOT** weaken audit's completeness/immutability.
- Cost **MUST** be attributed and budgeted; a hard cap **MUST** halt; a soft budget **SHOULD** alert and **MAY** gate on approval.
- Production behavior **MUST** be drift-monitored against the eval baseline by sampled re-eval; drift **MUST** route to APR-008 / APR-009 / evals.
- Captured trace content **MUST** be redacted / access-controlled / retention-bounded.

## Governance and validation

The shared governance model — two-tier enforcement, audit-log binding, and change-via-ADR — is defined in [APR-010](APR-010-governance.md); the checks below are this APR's domain-specific additions.

A conformant platform checks, in review or CI:

- **Trace presence** — every run emits a delegation-aligned trace with version + cost capture.
- **Shared substrate** — observability and audit share one instrumentation; audit's completeness/immutability is intact.
- **Cost attribution & budgets** — spend is attributed; hard caps halt, soft budgets alert.
- **Drift monitoring** — sampled re-eval runs against the baseline; regressions route correctly.
- **Trace privacy** — captured content is redacted / access-controlled / retention-bounded.

## What this principle is NOT

- **Not a specific tool or vendor.** OpenTelemetry, Langfuse, Braintrust, etc. are implementations; this says what must be traceable.
- **Not audit-binding.** That is APR-010's compliance record; observability consumes the same events for operations.
- **Not a billing system.** It attributes and budgets cost; it does not invoice.
- **Not an eval methodology.** It consumes OBSERVE evals for drift; it does not define them.
- **Not a guarantee against drift or overspend.** It makes both *visible and gated*, not impossible.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **OpenTelemetry** | Spans, trace context, metrics/logs | The trace spans the *LLM delegation graph* and carries content/model versions + cost |
| **LLM observability platforms** (Langfuse, Phoenix, Braintrust) | Traces of agent runs with token/cost capture | A *principle* (what must be traced, attributed, budgeted, drift-monitored), not a tool; tied to OBSERVE / APR-006 / APR-008 |
| **Distributed tracing** (Dapper) | End-to-end traces across services | Across the delegation graph, with cost rolling up the tree |
| **FinOps** (cost attribution, showback) | Attribute and budget spend per owner | Cost attributed to agent/skill/injection; tiered enforcement composing APR-006 + APR-009 |
| **SLOs / error budgets** | Operational-health gating | Drift-against-eval-baseline as the promptware health signal |

The novel contribution is a **promptware-specific observability+cost principle**: a single instrumentation serving both the immutable audit record and a delegation-graph trace, carrying content/model versions and per-call cost that rolls up the graph, with tiered cost budgets and production drift-monitoring against the eval baseline — distinct from, and built on, the audit-binding APR-010 defines.

## Metadata registrations

Component-metadata fields this APR owns, registered per [APR-014 §The metadata registry](APR-014-declare.md) in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml):

| Field | Cluster | Type | Values | Status |
|---|---|---|---|---|
| `trace_anchor` | operability | string | — | active |

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. OpenTelemetry (CNCF). *OpenTelemetry — observability framework for traces, metrics, and logs*. <https://opentelemetry.io/>
2. Langfuse. *Langfuse — open-source LLM engineering and observability platform*. <https://langfuse.com/>
3. Sigelman, B. et al. *Dapper, a Large-Scale Distributed Systems Tracing Infrastructure*. Google, 2010. <https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/>
4. FinOps Foundation. *FinOps — cloud cost management and accountability*. <https://www.finops.org/>
5. Beyer, B. et al. (eds.). *Site Reliability Engineering — Service Level Objectives*. Google. <https://sre.google/sre-book/service-level-objectives/>

## Adoption notes

- **Instrument once, at consumption** — derive both the audit record and the trace from the same event; don't run two pipelines that drift apart.
- **Make cost a span attribute from day one** — retrofitting cost attribution onto an existing trace is painful; capture tokens/spend per LLM call up front.
- **Start drift-monitoring on your safety-critical skills** — sample their production I/O through their evals; route regressions to the migration gate or fire-and-judge.
- **Treat traces as a data sink** — redact and retention-bound before they become your largest uncontrolled PII store.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-31 | Draft | Initial draft published as APR-011. |
