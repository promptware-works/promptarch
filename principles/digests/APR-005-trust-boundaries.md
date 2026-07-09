# APR-005 — Trust Boundaries & Untrusted Input — Digest

> **Generated digest of [APR-005 — A Trust-Boundary and Untrusted-Input Principle for Promptware](../APR-005-trust-boundaries.md) v0.2.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Classify every input and injected reference by trust; treat untrusted content as data, never instructions; make trust boundaries between content categories and between authors explicit and enforced, with recorded provenance — so promptware resists prompt injection and unauthorized behavior change.

**Principle.** Every input and every injected reference carries a trust classification; untrusted content is tagged and treated as data, never as instructions; trust boundaries — between content categories, and between who may author them — are explicit and enforced.

## The trust model

- A **trust boundary** separates operator-controlled content (**trusted**: skills, the canonical promptware root, reviewed reference content) from everything else (**untrusted**: user input, external docs, web content, tool/sub-agent output, third-party refs, **and model-generated content that derives from any of these** — scratchpad, plans, reflections, summaries).
- Trust is a property of **origin**, assigned **at ingress**, and **carried with the content** (taint-style) through every hop — injection, cross-reference, materialization, **derivation**. Two tiers minimum.

## Derivation, self-authored content, unforgeable labels

- **Derivation is monotone (min, never max).** Content produced by summarizing/merging/reflecting/paraphrasing inherits the **least-trusted** input's label; transformation is never a trust-elevation channel.
- **Self-authored content is not trusted by origin.** Model output incorporating untrusted input carries that input's floor; the agent's own scratchpad/plans/reflections re-entering context are labeled by their inputs' floor, not as operator-trusted.
- **Labels must be unforgeable from within content.** In-band string delimiters can be forged by untrusted content; prefer out-of-band structural separation (message-role boundaries) or per-run unpredictable sentinels.
- The only legitimate elevation is an **explicit, governed, audit-logged promotion** — never a side effect of processing (trust-side twin of APR-016 memory *graduation*).

## Normative rules

- All inputs and injected references MUST be classified trusted/untrusted at ingress; the label MUST propagate with the content through every hop (injection, cross-reference, materialization, **derivation**).
- Content **derived** from multiple sources MUST inherit the **least-trusted** input's label; transformation MUST NOT elevate trust — only a governed, audit-logged promotion may.
- **Model-generated content is not trusted by origin**: output incorporating untrusted input MUST carry that input's floor; scratchpad/plans/reflections re-entering context MUST be labeled by their inputs' floor.
- Untrusted content MUST be delivered as delimited **data**, never via the instruction channel; the agent MUST NOT act on instructions found in untrusted content.
- The label + channel boundary MUST be **unforgeable from within content**; enforcement SHOULD use out-of-band structural separation or per-run sentinels, not fixed in-band delimiters.
- Enforcement **strength** MUST scale with blast radius: delimiting alone MUST NOT be the sole safeguard on safety-critical / high-blast-radius paths, which MUST use stronger isolation (quarantine, dual-LLM, or capability limits).
- Consequential or safety-critical actions MUST NOT rest solely on untrusted content; a deterministic check or an authorized human MUST gate them (composes with APR-003).
- Authority to author/modify each reference category MUST be explicit and enforced; safety-critical categories MUST require stricter authorization.
- Every behavior-driving artifact MUST record provenance (origin + authorship); safety-critical or external content SHOULD carry verifiable (signed) provenance.
- A skill/agent that processes untrusted input MUST declare it (composes with ASPECT's security-sensitive mode).

*Enforcement of "untrusted = data" is the platform's choice* — delimiting, quarantine, dual-LLM / CaMeL, or capability limits. The principle mandates the discipline, not one architecture.

## Governance checks

Trust labels present and propagated · derivation monotonicity (derived content takes the min label; no elevation without governed promotion) · self-authored content labeled at its input floor · unforgeable boundaries (delimiter-forgery attempt in red-team `evals/`) · untrusted content never reaches the instruction channel · `CODEOWNERS`/review gates on each reference category (stricter for safety-critical) · provenance recorded (signatures verified where required) · untrusted-input skills carry the ASPECT security-sensitive treatment · red-team/prompt-injection cases in `evals/` gate merges.

## Scope limits — do NOT misapply

Not a complete security program (does not replace transport security, secrets, sandboxing, authn/authz, audited deployment) · not a guarantee against injection (reduces and bounds, doesn't zero) · not a content-filter/guardrail product · not end-user app access control · not a replacement for ASPECT/OBSERVE/APR-003 — it is the trust layer they compose with.

---
*Source: [APR-005 — A Trust-Boundary and Untrusted-Input Principle for Promptware](../APR-005-trust-boundaries.md) v0.2.0 · regenerate this digest whenever the source changes.*
