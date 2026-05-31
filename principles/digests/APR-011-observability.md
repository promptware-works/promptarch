# APR-011 — Observability & Cost Governance — Digest

> **Generated digest of [APR-011 — An Observability and Cost-Governance Principle for Promptware](../APR-011-observability.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Every agent run is end-to-end traceable: spans nest along the delegation graph, capturing content/model versions and per-call cost that rolls up. Audit and observability share one event substrate; drift is caught by sampled re-eval; hard cost caps halt, soft budgets warn.

**Principle.** Instrument every run once, at the point of consumption; from that one substrate, serve the immutable audit record and the operational trace — and make cost a first-class, attributed, budgeted dimension. Observability (debug/tune) is distinct from audit-binding (compliance), but shares its substrate.

## One substrate, two policies

- One instrumentation point (the consumption event). **Audit** = the complete, immutable, compliance-retained subset (its completeness/immutability is a floor). **Observability** = the queryable view enriched with telemetry (latency/cost/errors), which MAY sample/aggregate/expire — but MUST NOT weaken audit's floor.

## The trace

- End-to-end trace; **one span per delegation edge** (APR-006), LLM calls/injections as child events. Each span captures injected-content + model **versions** (APR-008) and per-LLM-call **cost**. Cost/latency **roll up** the graph. Injection-level attribution is SHOULD.

## Normative rules

- Every run MUST emit a delegation-graph-aligned trace capturing version + per-call cost; cost/latency roll up.
- Observability and audit MUST share one instrumentation; observability MUST NOT weaken audit's completeness/immutability.
- Cost MUST be attributed (agent/skill/injection) and budgeted; **hard cap → halt** (APR-006); **soft budget → alert, may require approval to exceed** (APR-009), without stranding in-progress work.
- Production behavior MUST be drift-monitored against the eval baseline by **sampled re-eval**; drift MUST route to APR-008 (migration gate) / APR-009 (fire-and-judge) / evals.
- Captured trace content MUST be redacted / access-controlled / retention-bounded (a trace is a PII sink).

## Governance checks

*(Shared model — two-tier, audit-binding, change-via-ADR — per APR-010.)* Trace presence (version + cost) · one shared instrumentation (audit floor intact) · cost attributed + budgets enforced (hard halt / soft alert) · drift monitored against baseline and routed · trace content redacted/access-controlled/retention-bounded.

## Scope limits — do NOT misapply

Not a specific tool/vendor (OTel, Langfuse, Braintrust) · not audit-binding (that's APR-010; this consumes the same events for ops) · not a billing system (attributes/budgets, doesn't invoice) · not an eval methodology (consumes OBSERVE evals) · not a guarantee against drift/overspend (makes them visible and gated).

---
*Source: [APR-011 — An Observability and Cost-Governance Principle for Promptware](../APR-011-observability.md) v0.1.0 · regenerate this digest whenever the source changes.*
