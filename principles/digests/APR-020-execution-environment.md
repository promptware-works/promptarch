# APR-020 — Execution Environment — Digest

> **Generated digest of [APR-020 — An Execution-Environment and Sandboxing Principle for Promptware](../APR-020-execution-environment.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Anything the model can cause to run — a tool, generated code, a shell command — executes in an isolated environment with bounded resources and no ambient credentials; capability is granted explicitly per action, never inherited from the harness's own environment.

**Principle.** Executable actions run in an isolated, resource-bounded environment with **no ambient authority**. The harness grants each action only the capabilities it declares — scoped credentials, bounded filesystem, explicit egress — injected per action, revoked after. The model proposes; the environment (owned in code) disposes of how much of the world an action can touch. Distinct from *whether* an action is allowed (APR-005/006) and from *what* its contract is (APR-022): this owns **the box it runs in**.

## Prescription

- Executable actions **MUST** run **isolated** from the harness process and other principals (container / microVM / WASM — mechanism-agnostic).
- **MUST** enforce **resource bounds** (CPU, memory, wall-clock, disk) as hard caps outside the model.
- **MUST NOT** expose **ambient credentials** — scoped per action to least privilege (APR-022), injected then revoked; secrets unreadable from the workspace.
- **Network egress MUST default-deny** — closing the exfiltration leg of the lethal trifecta (APR-005).
- Isolation **SHOULD** align with the **principal/container** boundary (APR-019); a subagent's environment attenuates its parent's (APR-006).
- Bound breach / isolation failure **fails closed** (APR-017) — terminated, not retried with the bound relaxed.

## Governance

No ambient authority (canary secret unreachable from inside) · bounds enforced outside the model · egress default-deny · isolation per principal (subagent env ⊆ parent).

## Scope limits — do NOT misapply

Not the trust-label model (APR-005 = content trust; this = execution reach) · not delegation topology (APR-006) · not the tool contract (APR-022 = what a tool is; this = the box it runs in) · not a specific sandbox product · not human oversight (APR-009).

---
*Source: [APR-020 — An Execution-Environment and Sandboxing Principle for Promptware](../APR-020-execution-environment.md) v0.1.0 · regenerate this digest whenever the source changes.*
