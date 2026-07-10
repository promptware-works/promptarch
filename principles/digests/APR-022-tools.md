# APR-022 — Tools — Digest

> **Generated digest of [APR-022 — A Tool-Contract and Least-Privilege Principle for Promptware](../APR-022-tools.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** A tool is a narrow, schema-validated, permission-tiered contract between the model and the world: one job each, input and output validated, tiered by effect (read / write / destructive) at least privilege, returning errors the model can self-correct from.

**Principle.** Design each tool as a narrow contract — one job; declared and validated input *and* **output** schemas; a declared **effect tier** (read / write / destructive) governing privilege and oversight; least privilege by default; machine-actionable errors. The model chooses *which* contract to invoke; the contract (owned in code) bounds *what that invocation can do*.

## Prescription

- **MUST** validate **both input and output** schemas; raw tool I/O never crosses into a privileged action or the next model call (APR-003).
- **MUST** declare an **effect tier** (`read`/`write`/`destructive`, registered metadata) and receive **least privilege** for it.
- **Destructive/irreversible** tools **MUST** gate behind human oversight (APR-009) and **fail closed** on ambiguity (APR-017).
- **SHOULD** do **one job**; broad tools decomposed so privilege/validation are per-effect.
- Tool **output and errors are untrusted content** (APR-005) — data, never instructions.
- Errors **MUST be machine-actionable** (expected shape stated) for self-correction.

## Metadata registration

`permission_tier` — path `core.classification`, enum `read | write | destructive` (APR-014). Drives least-privilege granting (APR-020), oversight (APR-009), fail-closed (APR-017).

## Governance

Schemas both ways (output schema present) · tier declared + enforced (destructive ⇒ oversight gate) · least privilege (grant ≤ tier) · recoverable errors.

## Scope limits — do NOT misapply

Not the execution environment (APR-020 = the box; this = the contract) · not the general code/prompt seam (APR-003; this specializes it to tools) · not the trust model (APR-005) · not a wire format (JSON-Schema/OpenAPI/MCP) · not human oversight (APR-009 places the gate; this says which tier triggers it).

---
*Source: [APR-022 — A Tool-Contract and Least-Privilege Principle for Promptware](../APR-022-tools.md) v0.1.0 · regenerate this digest whenever the source changes.*
