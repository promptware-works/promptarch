# APR-003 — Code/Prompt Boundary — Digest

> **Generated digest of [APR-003 — A Code/Prompt Boundary Principle for Promptware](../APR-003-code-prompt-boundary.md) v0.1.3.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Places deterministic, verifiable, or safety-critical behavior in code and open-ended judgment in prompts, with an explicit, typed, testable seam at every code/prompt crossing — so each behavior is verified the right way and no safety decision rests silently on a model.

**Principle.** Deterministic, verifiable, or safety-critical behavior MUST be implemented in code; open-ended judgment, synthesis, and natural-language understanding belong in prompts; the boundary between the two MUST be explicit, typed, and independently testable.

## The two assurance modes

| Deterministic → **code** | Probabilistic → **prompt** |
|---|---|
| One correct output a closed-form algorithm could produce | A good output given open-ended input / ambiguity |
| arithmetic, routing on a fixed key, schema validation, dedup, idempotent transforms, access checks, parsing a known grammar | classification of ambiguous text, summarization, synthesis, intent extraction, drafting, judgment under uncertainty |
| Verified by **unit/property tests** | Verified by **evals** (golden sets + graders) |

## Drawing the seam (decide where logic lives)

1. Single correct output a closed-form algorithm could produce? → **code**.
2. Needs open-ended NL understanding or judgment under ambiguity? → **prompt**.
3. Both? → it's *two* behaviors with a seam — decompose (prompt judges/extracts; code validates/routes/computes).
4. Deterministic in principle but no implementation exists? → **prompt, provisionally** + an eval gate + recorded intent to migrate; type the output so code can later drop in behind the same contract.

> **Rule of thumb:** if you can write a passing unit test for it, it should be code. If you can only write an eval for it, it should be a prompt.

## Normative rules

- Deterministic behavior MUST be code with unit/property tests; MUST NOT be a prompt where a closed-form implementation is reasonably available.
- Probabilistic behavior MUST be eval-gated (`evaluated_by` + `min_eval_score`); MUST NOT be hard-coded as exhaustive rules that defeat its adaptivity.
- Every substrate crossing MUST be a typed, validated seam.
- Safety-critical decisions (allow/deny, severity, exposure, access control, secrets, audit) MUST NOT rest solely on a probabilistic substrate — a deterministic check MUST gate or bound the model's judgment.
- A component's [ASPECT](../APR-001-aspect.md) `Procedure` SHOULD mark, per step, whether it is code or prompt.

## The seam is a typed contract

- **Prompt → code:** the LLM's output MUST conform to a declared schema and code MUST validate it at the boundary before acting (tool-use/function-call schemas, [OBSERVE](../APR-002-observe.md) `contracts/`). Unvalidated LLM output flowing into a deterministic path is a violation.
- **Code → prompt:** injected values MUST come from their canonical source ([OBSERVE](../APR-002-observe.md) `config/`, `ontology/`), not be restated inline.
- **Halt, don't guess:** if a crossing fails validation, the path MUST halt with an audit-logged error — never let a probabilistic value silently substitute for a deterministic one, or vice versa.

## Scope limits — do NOT misapply

Not "minimize AI" (it's mode-matching — forcing genuine judgment into brittle rules violates it too) · not a runtime/execution model · not a tool-use spec (function-calling is one *mechanism* for the seam) · not a verification framework (it says *which* test/eval, not the tooling) · not a security framework (it gates safety-critical decisions but doesn't provide access control or injection defense).

---
*Source: [APR-003 — A Code/Prompt Boundary Principle for Promptware](../APR-003-code-prompt-boundary.md) v0.1.3 · regenerate this digest whenever the source changes.*
