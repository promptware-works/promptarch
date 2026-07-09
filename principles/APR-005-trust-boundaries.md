---
apr: 5
title: "A Trust-Boundary and Untrusted-Input Principle for Promptware"
abstract: "Classify every input and injected reference by trust; treat untrusted content as data, never instructions; make trust boundaries between content categories and between authors explicit and enforced, with recorded provenance — so promptware resists prompt injection and unauthorized behavior change."
status: Draft
class: architectural
version: 0.2.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-31
last-updated: 2026-07-09
audience: Architects and framework authors of agentic AI platforms; security reviewers of agentic systems; anyone whose promptware processes content from outside its trust boundary
supersedes: []
superseded-by: []
related:
  - APR-001
  - APR-002
  - APR-003
  - APR-004
  - APR-015
  - APR-016
  - APR-017
tags:
  - security
  - trust-boundary
  - untrusted-input
  - prompt-injection
  - provenance
---

# APR-005 — A Trust-Boundary and Untrusted-Input Principle for Promptware

> **Every input and every injected reference carries a trust classification; untrusted content is tagged and treated as data, never as instructions; trust boundaries — between content categories, and between who may author them — are explicit and enforced.**

*Injectable summary (for feeding to an LLM): [`digests/APR-005-trust-boundaries.md`](digests/APR-005-trust-boundaries.md). This full APR is canonical.*

## Motivation

Promptware composes a prompt from many sources: operator-authored skills and reference content, but also user input, third-party documents, scraped web content, tool/sub-agent output, and — per [APR-002 OBSERVE](APR-002-observe.md) — injected ontology/config/examples, and — per [APR-004](APR-004-canonical-source.md) — materialized files. It all lands in one context window, where the model **cannot reliably separate "instructions from my operator" from "text that merely contains instructions."** That is prompt injection (OWASP LLM01), the dominant risk in LLM applications. Two failure modes follow:

- **Injection.** Untrusted content carries instructions the agent then follows.
- **Unauthorized behavior change.** Reference content drives *every* consuming skill, so whoever can edit `config/severity.yaml` silently changes platform-wide behavior ([OBSERVE §10](APR-002-observe.md) flags exactly this) — with no authority boundary and no provenance.

[OBSERVE §10](APR-002-observe.md) ("not a security framework"), [ASPECT](APR-001-aspect.md)'s "security-sensitive components" mode, and [APR-003](APR-003-code-prompt-boundary.md) ("not a security framework") all gesture at this and explicitly punt. None defines the trust discipline they each lean on. This APR does.

## The principle

> **Author and operate promptware around an explicit trust boundary: classify content by trust at the boundary, keep untrusted content as data, and gate who may change behavior-driving content — with provenance throughout.**

Three commitments: (1) **trust classification** of all inputs and references; (2) **untrusted content is data, never instructions**; (3) **explicit, enforced boundaries** between content categories and between authors, with **provenance**.

## Scope and applicability

### When this applies

- Any promptware that ingests or injects content not fully operator-controlled — user input, external documents, web content, tool/sub-agent output, third-party skills or references.

### When this does NOT apply

- Fully closed systems where every input and reference is operator-authored and trusted (rare in practice).
- It is the *promptware-layer* trust discipline, **not a complete security program** — see *What this principle is NOT*.

## The trust model

- A **trust boundary** separates operator-controlled content (**trusted**) from everything else (**untrusted**).
  - *Trusted*: skills and agent specs, the canonical promptware root ([APR-004](APR-004-canonical-source.md)), reference content authored and reviewed by authorized principals.
  - *Untrusted*: user input, external documents, web content, tool/sub-agent output, third-party skills/refs, **and model-generated content that incorporates or derives from any of these** (the agent's own scratchpad, plans, reflections, and summaries — see *Derivation, self-authored content, and unforgeable labels* below).
- Trust is a property of **origin**, assigned **at ingress** (the point content enters), and **carried with the content** (taint-style) through every hop — including transitive injection (OBSERVE cross-references), materialization (APR-004), and **derivation** (summarization, merge, reflection, paraphrase).
- Two tiers are the minimum; platforms MAY add finer ones (e.g., *reviewed-external*).

## Untrusted content is data, not instructions

This is the load-bearing rule. Untrusted content **MUST** be delivered to the model as clearly delimited *data*, never merged into the instruction channel; the agent **MUST NOT** extract or act on instructions found in untrusted content; and consequential or safety-critical actions **MUST NOT** be driven solely by untrusted content.

*Enforcement is the platform's choice* — delimiting plus an explicit "treat as data" instruction, quarantine, a dual-LLM / CaMeL design (a privileged model never sees untrusted content directly), or capability limits on what untrusted-influenced steps may do. The principle mandates the **discipline**, not one architecture.

**But enforcement strength MUST scale with blast radius.** Delimiting plus a "treat as data" instruction is the weakest form and is known to be bypassable; it MAY suffice for low-consequence, read-only paths, but it MUST NOT be the *only* safeguard on a safety-critical or high-blast-radius path. There, stronger isolation is required — quarantine, a dual-LLM / CaMeL design where the privileged path never acts on untrusted content directly, or capability limits on untrusted-influenced steps — composing with [APR-003](APR-003-code-prompt-boundary.md)'s deterministic gate and [ASPECT](APR-001-aspect.md)'s blast-radius declaration.

## Derivation, self-authored content, and unforgeable labels

The "carried with the content" rule above has three consequences that adversaries exploit and that a bare labeling scheme misses:

- **Derivation is monotone (min, never max).** Content produced by transforming other content — a summary, a merge, a reflection, a paraphrase — inherits the **least-trusted** label among its inputs. A summary of one trusted and one untrusted source is **untrusted**. Transformation MUST NOT be a trust-elevation channel; without this rule, "carried taint" holds for direct copies but breaks the moment the agent summarizes or aggregates — which it does constantly.
- **Self-authored content is not trusted by origin.** Output is not trusted merely because the model produced it. Model-generated content that incorporates or derives from untrusted input carries that input's trust floor; the agent's own scratchpad, plans, and reflections that re-enter the context window MUST be labeled by the floor of their inputs, not as operator-trusted. Otherwise the agent loop is a free elevation channel: launder untrusted text through one "summarize" step and it re-enters as if trusted.
- **The label must be unforgeable from within content.** A trust label enforced by in-band string markers (e.g. a fixed `<untrusted>…</untrusted>` delimiter) can be **forged**: a fetched page or an email can contain the closing marker and then impersonate trusted instructions. The boundary MUST be unforgeable from within segment content — untrusted content MUST NOT be able to reproduce the labeling/delimiting scheme to escalate itself. Prefer out-of-band structural separation (the API's own message-role boundaries) or per-run unpredictable sentinels over fixed in-band delimiters.

The single elevation path that *is* legitimate is an **explicit, governed promotion** — a reviewed step that raises trust deliberately and is audit-logged — never a side effect of processing (this is the trust-side twin of [APR-016](APR-016-memory.md)'s memory *graduation*).

## Trust boundaries inside the platform

Beyond ingress, two internal boundaries:

- **Between content categories.** Because editing reference content changes the behavior of every consumer, *editing is a privileged action*. Authority to modify each category (`ontology/`, `config/`, `policies/`, …) **MUST** be explicit and enforced — code-review-as-control at minimum, `CODEOWNERS` / tooling better. Safety-critical categories require stricter authorization.
- **Provenance.** Every behavior-driving artifact records its origin and authorship (extending OBSERVE's `provenance: human | synthetic | hybrid`). Provenance is *claimed* by default, but **SHOULD** be cryptographically verifiable (signed) for safety-critical or externally-sourced content.

## Prescription

- All inputs and injected references **MUST** be classified trusted/untrusted at ingress, and the label **MUST** propagate with the content through every hop (injection, cross-reference, materialization, **derivation**).
- Content **derived** from multiple sources (summary, merge, reflection, paraphrase) **MUST** inherit the **least-trusted** label among its inputs; transformation **MUST NOT** elevate trust. Trust **MUST** rise only through an explicit, governed, audit-logged promotion — never as a side effect of processing.
- **Model-generated content is not trusted by origin.** Output that incorporates or derives from untrusted input **MUST** carry that input's trust floor; the agent's own scratchpad, plans, and reflections re-entering the context window **MUST** be labeled by the floor of their inputs, not as operator-trusted.
- Untrusted content **MUST** be delivered as delimited data, never via the instruction channel; the agent **MUST NOT** act on instructions found in untrusted content.
- The trust label and its channel boundary **MUST** be **unforgeable from within segment content**: untrusted content **MUST NOT** be able to reproduce the labeling/delimiting scheme to escalate itself. Enforcement **SHOULD** use out-of-band structural separation (message-role boundaries) or per-run unpredictable sentinels rather than fixed in-band string delimiters.
- The **strength** of that enforcement **MUST** scale with blast radius: delimiting alone **MUST NOT** be the sole safeguard on a safety-critical or high-blast-radius path, which **MUST** use stronger isolation (quarantine, dual-LLM / CaMeL, or capability limits).
- Consequential or safety-critical actions **MUST NOT** rest solely on untrusted content; a deterministic check or an authorized human **MUST** gate them (composes with [APR-003](APR-003-code-prompt-boundary.md)).
- Authority to author/modify each reference category **MUST** be explicit and enforced; modifying safety-critical categories **MUST** require stricter authorization.
- Every behavior-driving artifact **MUST** record provenance (origin + authorship); safety-critical or external content **SHOULD** carry verifiable (signed) provenance.
- A skill or agent that processes untrusted input **MUST** declare it (composes with ASPECT's trust markers and security-sensitive mode).

## Governance and validation

The shared governance model — two-tier enforcement, audit-log binding, and change-via-ADR — is defined in [APR-010](APR-010-governance.md); the checks below are this APR's domain-specific additions.

A conformant platform checks, in review or CI:

- **Labeling & propagation** — inputs/references carry trust labels; untrusted content never reaches the instruction channel.
- **Derivation monotonicity** — derived/summarized/merged content carries the *min* label of its sources; no elevation without a governed, logged promotion.
- **Self-authored labeling** — model output that incorporates untrusted input is labeled at its input floor, not as operator-trusted.
- **Unforgeable boundaries** — the label/delimiter scheme cannot be reproduced from within untrusted content (structural separation or per-run sentinels); a delimiter-forgery attempt lives in the red-team `evals/` cases.
- **Category authority** — `CODEOWNERS` / review gates enforce who may edit each reference category; safety-critical categories are gated more strictly.
- **Provenance** — recorded for behavior-driving artifacts; signatures verified where required.
- **Untrusted-input declarations** — skills that take untrusted input carry the ASPECT security-sensitive treatment.
- **Injection evals** — red-team / prompt-injection cases live in `evals/` (composes with OBSERVE) and gate merges, so resistance is *measured*, not asserted.

## What this principle is NOT

- **Not a complete security program.** It does not replace transport security, secrets management, sandboxing/isolation, authentication/authorization infrastructure, or audited deployment. It composes with them; regulated or high-risk adopters layer platform controls on top.
- **Not a guarantee against prompt injection.** It reduces and bounds the risk; no current method fully eliminates injection. ("By design" mitigations lower exposure, they don't zero it.)
- **Not a content-filter or guardrail product.** It is a boundary-and-classification discipline, not a specific filter or model.
- **Not end-user access control for the running application.** That is the application's authorization concern; this governs the trust of *content that drives agent behavior*.
- **Not a replacement for ASPECT, OBSERVE, or APR-003** — it is the trust layer they compose with.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **OWASP Top 10 for LLM Applications** (LLM01: Prompt Injection) | Names prompt injection as the top risk | A positive *principle* (classify → quarantine → bound authority) rather than a threat catalogue |
| **Taint tracking / dataflow integrity** (appsec) | Untrusted data tracked to sinks, never unsanitized | Applied to the prompt: untrusted text never reaches the instruction "sink" |
| **Capability-based security / least privilege** | Authority is explicit and minimal | Authority to edit behavior-driving reference content is explicit and enforced |
| **Dual-LLM / CaMeL** (defeating injection by design) | A privileged model never sees untrusted content directly | One valid *enforcement* of "untrusted = data"; the APR mandates the discipline, not this architecture |
| **Provenance & signing** (SLSA, Sigstore, C2PA) | Verifiable origin of artifacts | Provenance on behavior-driving promptware content, escalating to signing for safety-critical/external content |
| **Threat modeling (STRIDE)** | Systematic trust-boundary analysis | Promptware-specific boundaries: ingress, between content categories, between authors |

The novel contribution is a **promptware-specific trust discipline** unifying ingress classification, the untrusted-as-data rule, category/author authority boundaries, and provenance — composing with ASPECT (security-sensitive specs), OBSERVE (the RBAC/injection/provenance gaps §10 lists), APR-003 (deterministic gating of safety decisions), and APR-004 (provenance of materialized content).

## Metadata registrations

Component-metadata fields this APR owns, registered per [APR-014 §The metadata registry](APR-014-declare.md) in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml):

| Field | Path | Type | Values | Status |
|---|---|---|---|---|
| `trust_level` | core.classification | enum | `trusted, semi-trusted, untrusted` | active |

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. OWASP. *OWASP Top 10 for LLM Applications — LLM01: Prompt Injection*. <https://genai.owasp.org/llm-top-10/>
2. Willison, S. *The Dual LLM pattern for building AI assistants that can resist prompt injection*. 2023. <https://simonwillison.net/2023/Apr/25/dual-llm-pattern/>
3. Debenedetti, E. et al. *Defeating Prompt Injections by Design* (CaMeL). arXiv:2503.18813, 2025. <https://arxiv.org/abs/2503.18813>
4. SLSA. *Supply-chain Levels for Software Artifacts*. <https://slsa.dev/>
5. Sigstore. *Sigstore — software signing and transparency*. <https://www.sigstore.dev/>
6. C2PA. *Coalition for Content Provenance and Authenticity*. <https://c2pa.org/>

## Adoption notes

- **Map ingress first.** Identify every point where non-operator content enters (user input, tools, web, external refs) and assign trust labels there — you cannot quarantine what you haven't located.
- **Make untrusted-as-data the default delivery**, and add red-team injection cases to `evals/` so resistance is measured every PR.
- **Gate reference categories** with `CODEOWNERS` / review, starting with the safety-critical ones (`policies/`, safety-driving `config/`).
- **Record provenance now; sign later** — start with claimed provenance everywhere, escalate to signed provenance for safety-critical and externally-sourced content.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-31 | Draft | Initial draft published as APR-005. |
| 0.1.1 | 2026-05-31 | Draft | Enforcement strength of "untrusted = data" MUST scale with blast radius — delimiting alone is insufficient for safety-critical/high-blast-radius paths, which require stronger isolation (quarantine, dual-LLM, capability limits). |
| 0.2.0 | 2026-07-09 | Draft | Added the trust-mechanics the APR-015/016/017 drafts lean on: taint propagates through **derivation** and is **monotone** (derived content takes the least-trusted input's label; transformation never elevates); **self-authored content** is a trust origin (model output inheriting untrusted input's floor; scratchpad/reflections re-entering context labeled accordingly); **labels MUST be unforgeable** from within content (structural separation / per-run sentinels over in-band delimiters). Governed promotion is the only elevation path. Added `related:` APR-015/016/017. |
