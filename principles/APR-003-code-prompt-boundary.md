---
apr: 003
title: "A Code/Prompt Boundary Principle for Promptware"
status: Draft
version: 0.1.1
authors:
  - D. Maxios
co-authors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-29
last-updated: 2026-05-30
audience: Architects and framework authors of agentic AI platforms; anyone deciding whether logic executes as code or as a prompt
supersedes: []
superseded-by: []
related:
  - APR-000
  - APR-001
  - APR-002
tags:
  - determinism
  - code-prompt-boundary
  - architecture
  - verifiability
  - tool-use
---

# APR-003 — A Code/Prompt Boundary Principle for Promptware

> **Deterministic, verifiable, or safety-critical behavior MUST be implemented in code; open-ended judgment, synthesis, and natural-language understanding belong in prompts; the boundary between the two MUST be explicit, typed, and independently testable.**

## 1. Motivation

[APR-000 PROMPTWARE](APR-000-promptware.md) defines promptware as software whose behavior is shaped by content read at execution time by LLM agents. It deliberately does **not** say where the line sits — what should remain ordinary code. This principle draws that line.

Without it, the boundary is decided ad hoc, per author, and promptware fails in two opposite directions:

- **Over-prompting** — asking the model to do what code should own: arithmetic, routing a fixed switch, schema validation, deduplication, idempotent transforms. The result is non-deterministic where determinism was available, unverifiable, token-expensive, and prone to *silent regression across model versions*. A prompt that "usually" sums a column correctly is a defect, not a feature.
- **Under-prompting** — hard-coding fuzzy judgment as brittle regex or rule tables that cannot handle the open-ended cases an LLM handles well, making the system rigid exactly where it should be adaptive.

The deeper failure is **invisibility**. Reading a skill today, you cannot tell which parts are *guaranteed* and which are *probabilistic*. That invisibility blocks every downstream judgment that matters:

- **Correctness** — you cannot unit-test a behavior whose substrate you cannot identify.
- **Cost** — probabilistic substrate carries token and latency cost that deterministic substrate does not.
- **Blast radius** — a safety-critical decision can be silently delegated to a probabilistic model with nobody having decided that on purpose.
- **Verification strategy** — you cannot tell whether a behavior needs a *unit test* (deterministic) or an *eval* ([APR-002 OBSERVE](APR-002-observe.md) `evals/`, probabilistic).

## 2. The principle

> **Every unit of behavior has a dominant *assurance mode* — Deterministic or Probabilistic. Implement it in the substrate that matches its mode (code for Deterministic, prompt for Probabilistic), and make every crossing between substrates an explicit, typed, testable seam.**

The two assurance modes are **Deterministic** (a single correct output, guaranteed and verifiable) and **Probabilistic** (best-effort judgment over open-ended input). The *seam* is the boundary itself — the typed interface where deterministic code hands off to a probabilistic prompt and back.

This is not "use less AI." It is "put each behavior where its guarantees can be honored." A platform that follows this principle can point at any behavior and say *this is guaranteed and unit-tested* or *this is best-effort and eval-gated* — never "we're not sure which."

## 3. The two assurance modes

| | **Deterministic mode → code** | **Probabilistic mode → prompt** |
|---|---|---|
| **Question it answers** | "What is the one correct output?" | "What is a good output given open-ended input?" |
| **Typical work** | Arithmetic, sorting, routing on a fixed key, schema validation, dedup, idempotent transforms, access checks, ID generation, parsing a known grammar | Classification of ambiguous text, summarization, synthesis, intent extraction, drafting, judgment under incomplete information |
| **Guarantee** | Same input → same output, every time | Best-effort; output distribution, not a point guarantee |
| **Verified by** | Unit tests, type checks, property tests | Evals against golden sets + graders ([OBSERVE](APR-002-observe.md) `evals/`) |
| **Failure mode if misplaced** | Silent nondeterminism, regression on model upgrade, wasted tokens | Brittleness; cannot handle inputs outside the hard-coded rules |

A behavior whose dominant mode is Deterministic but which is *currently* implemented as a prompt is a violation of this principle **only when a deterministic implementation is reasonably available**. When none exists (the deterministic version is itself an unsolved problem), the prompt is the legitimate home — see §4.

## 4. Drawing the seam

To place a unit of behavior, apply this test in order:

1. **Is there a single correct output that a closed-form algorithm could produce?** If yes → **code**. (Summing numbers, validating a schema, choosing a branch on an enum value.)
2. **Does it require understanding open-ended natural language, or judgment under ambiguity?** If yes → **prompt**.
3. **Both?** Then it is *two* behaviors with a seam between them. Decompose: the probabilistic part extracts/judges; the deterministic part validates, routes, or computes on the result. (E.g., "extract the severity from this report" is a prompt; "given a severity enum value, look up the SLA" is code.)
4. **Deterministic in principle but no implementation exists?** → **prompt, provisionally**, with (a) an eval gate and (b) a recorded intent to migrate to code if/when the algorithm becomes available. The seam still applies: type the output so a future code implementation can drop in behind the same contract.

> **Rule of thumb:** if you can write a passing unit test for it, it should be code. If you can only write an eval for it, it should be a prompt.

## 5. The seam is a typed contract

Where deterministic and probabilistic substrates meet, the crossing MUST be a typed contract, not an implicit prose handoff.

- **Prompt → code** (the LLM produces a value that code will act on): the LLM's output MUST conform to a declared schema, and code MUST validate it at the boundary before acting. Tool-use / function-calling argument schemas and [OBSERVE](APR-002-observe.md) `contracts/` are the canonical seam artifacts. Unvalidated LLM output flowing into a deterministic path is a violation of this principle.
- **Code → prompt** (code supplies values, options, or context the prompt reasons over): the injected values MUST come from their canonical source ([OBSERVE](APR-002-observe.md) `config/`, `ontology/`), not be restated inline — preserving provenance across the seam.
- **Halt, don't guess.** If a seam crossing fails validation (LLM output off-schema, required code result missing), the path MUST halt with an audit-logged error rather than letting a probabilistic value silently substitute for a deterministic one, or vice versa.

A correctly drawn seam is what makes a behavior *swappable*: a prompt placeholder behind a typed contract can later be replaced by a code implementation (or a different model) without disturbing its consumers.

## 6. Prescription

- A behavior classified Deterministic (§3–§4) **MUST** be implemented in code and **MUST** carry unit/property tests; it **MUST NOT** be delegated to a prompt where a closed-form implementation is reasonably available.
- A behavior classified Probabilistic **MUST** be eval-gated per [OBSERVE](APR-002-observe.md) (`evaluated_by` + `min_eval_score`); it **MUST NOT** be hard-coded as exhaustive rules that defeat its adaptivity.
- Every substrate crossing **MUST** be a typed, validated seam (§5).
- Safety-critical decisions (allow/deny, severity, exposure, anything affecting access control, secrets, or audit) **MUST NOT** rest solely on a probabilistic substrate; a deterministic check **MUST** gate or bound the probabilistic judgment.
- A component's [ASPECT](APR-001-aspect.md) `Procedure` / `Algorithm` section **SHOULD** mark, per step, whether the step is code or prompt, so the seam is visible in the spec, not just the implementation.
- A behavior placed in `prompt` provisionally (§4.4) **SHOULD** record the intent to migrate and the contract the future code implementation will honor.

## 7. Governance and validation

A conformant platform checks, in review or CI:

- **No deterministic work in prompts.** Reviewers flag prompts performing arithmetic, fixed-key routing, schema validation, or other closed-form work a unit test could cover.
- **Seam typing.** Every tool-call / LLM-output that feeds a deterministic path has a declared schema and a validation step; unvalidated crossings are blocked.
- **Verification matches mode.** Deterministic behaviors have unit tests; probabilistic behaviors have evals. A behavior with neither, or the wrong one, is flagged.
- **Safety gating.** Safety-critical paths show a deterministic check bounding any probabilistic step.
- **Provisional placements are tracked.** §4.4 prompt-placeholders carry their migration intent and contract, so they are not forgotten.

Two-tier enforcement, as in OBSERVE: schema/test presence is automatable; the *classification judgment* (is this behavior really probabilistic?) is a human review concern.

## 8. What this principle is NOT

- **Not "minimize AI."** This principle is about mode-matching, not prompt-avoidance. A system that forces genuine judgment into brittle rules violates it as surely as one that asks a model to do arithmetic.
- **Not a runtime or an execution model.** It governs *placement of logic*, not how code or prompts execute.
- **Not a tool-use specification.** Function-calling is one *mechanism* for a prompt→code seam; this principle says when to reach for it, not its wire format.
- **Not a verification framework.** It says deterministic behavior needs unit tests and probabilistic behavior needs evals; it does not prescribe the test or eval tooling.
- **Not a security framework.** It requires deterministic gating of safety-critical decisions but does not, by itself, address access control, injection defense, or audit-log integrity — see the trust-boundary principle (proposed) and [OBSERVE §10](APR-002-observe.md).

## 9. Relationship to established patterns

| Pattern | What it shares with this principle | What this principle adds |
|---|---|---|
| **Functional core, imperative shell** (Bernhardt, ~2012) | Isolate the deterministic, testable part from the messy edge | Maps the split onto *code vs. prompt* substrate and onto LLM assurance modes, not pure-vs-effectful code |
| **Mechanism vs. policy** (OS design, ~1970s) | Separate the invariant guaranteed part from the variable part | The "variable" part is probabilistic LLM judgment with its own (eval-based) verification discipline |
| **Hexagonal / ports & adapters** (Cockburn, ~2005) | A typed boundary between a core and the outside | The boundary is specifically the code↔prompt seam, with halt-on-invalid-crossing semantics |
| **Tool-use / function-calling, constrained decoding** (~2023) | LLM calls code for deterministic operations; outputs constrained to schemas | Generalizes the practice into an architectural *placement rule* with a decision procedure, rather than treating it as a model feature |
| **Neuro-symbolic AI** (long-standing) | Compose symbolic (deterministic) and neural (probabilistic) computation | A concrete, promptware-level discipline — typed seams, mode-matched verification, governance — rather than a research architecture |

The novel contribution is a **promptware-specific placement principle**: classify each behavior by assurance mode, implement it in the matching substrate, verify it the matching way, and make every substrate crossing an explicit typed seam — integrated with ASPECT specs and OBSERVE contracts/evals.

## 10. Adoption notes

- **Audit existing skills for over-prompting first** — it is the more common and more expensive violation, and the easiest to demonstrate (replace a "sum these" prompt step with code; watch tokens and flakiness drop).
- **Introduce the seam contract before relocating logic** — type the crossing first, then move the implementation behind it, so consumers never see churn.
- **Expect decomposition.** Many "single" behaviors are a probabilistic judgment plus a deterministic computation fused together; adopting this principle surfaces and splits them, which usually clarifies the spec.

## References

External sources referenced in this APR; see §9 *Relationship to established patterns* for how each relates.

1. Bradner, S. *Key words for use in RFCs to Indicate Requirement Levels (RFC 2119 / BCP 14)*. IETF, 1997. <https://datatracker.ietf.org/doc/html/rfc2119>
2. Bernhardt, G. *Boundaries* (functional core, imperative shell). Talk, 2012. <https://www.destroyallsoftware.com/talks/boundaries>
3. Levin, R., Cohen, E., Corwin, W., Pollack, F., and Wulf, W. *Policy/mechanism separation in Hydra*. Proc. 5th ACM Symposium on Operating Systems Principles (SOSP), 1975.
4. Cockburn, A. *Hexagonal Architecture (Ports and Adapters)*. 2005. <https://alistair.cockburn.us/hexagonal-architecture/>
5. Schick, T. et al. *Toolformer: Language Models Can Teach Themselves to Use Tools*. arXiv:2302.04761, 2023. <https://arxiv.org/abs/2302.04761>
6. Yao, S. et al. *ReAct: Synergizing Reasoning and Acting in Language Models*. arXiv:2210.03629, 2022. <https://arxiv.org/abs/2210.03629>
7. Garcez, A. d'Avila and Lamb, L. C. *Neurosymbolic AI: The 3rd Wave*. arXiv:2012.05876, 2020. <https://arxiv.org/abs/2012.05876>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-29 | Draft | Initial draft published as APR-003. |
| 0.1.1 | 2026-05-30 | Draft | Added References section. No semantic change. |
