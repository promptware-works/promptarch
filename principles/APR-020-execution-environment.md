---
apr: 20
title: "An Execution-Environment and Sandboxing Principle for Promptware"
abstract: "Anything the model can cause to run — a tool, generated code, a shell command — executes in an isolated environment with bounded resources and no ambient credentials; capability is granted explicitly per action, never inherited from the harness's own environment."
status: Draft
class: architectural
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-07-10
last-updated: 2026-07-10
audience: Architects and framework authors building agent/skill runtimes that execute tools, code, or shell on a model's behalf; anyone hardening a harness against prompt-injection blast radius
supersedes: []
superseded-by: []
related:
  - APR-005
  - APR-006
  - APR-009
  - APR-017
  - APR-018
  - APR-019
  - APR-022
tags:
  - execution-environment
  - sandboxing
  - isolation
  - least-privilege
  - ambient-authority
  - blast-radius
---

# APR-020 — An Execution-Environment and Sandboxing Principle for Promptware

> **Anything the model can cause to execute — a tool, generated code, a shell command — MUST run in an isolated environment with bounded resources and no ambient credentials; capability is granted explicitly, per action, at least privilege, never inherited from the harness's own environment.**

*Injectable summary (for feeding to an LLM): [`digests/APR-020-execution-environment.md`](digests/APR-020-execution-environment.md). This full APR is canonical.*

## Motivation

A promptware harness that executes tools, code, or shell commands on a model's behalf turns *text the model produced* into *effects on the world*. The model's output is only as trustworthy as the least-trusted content in its context ([APR-005](APR-005-trust-boundaries.md)) — a prompt injection three hops upstream, a confabulated command, a poisoned tool result. If that output runs with the **harness's own ambient authority** — the operator's cloud credentials, an unrestricted network, the host filesystem — then a single injected instruction has the blast radius of the whole host.

The corpus governs *what the model is told* (trust labels, delegation envelope) but has had no principle for *the environment its actions run in*. Two failures follow, both catalogued as live risks in harness-engineering practice:

- **Ambient authority.** "The workspace *is* the credential store," so isolation is nominal: the sandbox contains the process but the process can read the operator's keys off disk or from the environment. Isolation without credential-scoping is theatre.
- **The exfiltration leg of the lethal trifecta.** An agent with access to private data *and* untrusted content *and* a way to send data out is exploitable ([APR-005](APR-005-trust-boundaries.md)). Unrestricted network egress from the execution environment is that third leg, handed over by default.

## The principle

> **Executable actions run in an isolated, resource-bounded environment with no ambient authority.** The harness grants each action only the capabilities it declares it needs — scoped credentials, a bounded filesystem, explicit network egress — injected per action and revoked after. Capability is never inherited from the harness's environment.

The rule is the runtime counterpart of least privilege: the model proposes an action; the *environment*, owned in code, disposes of how much of the world that action can touch. This is distinct from **whether the action is allowed** (authority — [APR-005](APR-005-trust-boundaries.md)/[APR-006](APR-006-composition-topology.md)) and from **what the action's contract is** ([APR-022](APR-022-tools.md)); this APR governs **the box it runs in**.

## Scope and applicability

### When this applies

- Any harness that executes **tools, generated code, shell, or MCP servers** on a model's behalf — i.e. where model output becomes a side-effecting action.
- Especially as the **action-space** widens (shell access, write/destructive tools) and the **horizon** lengthens (many autonomous steps before a human sees output): execution isolation becomes more load-bearing, not less.

### When this does NOT apply

- A **pure text-generation** loop with no tool execution — there is no action environment to isolate.
- The **content-trust model** itself ([APR-005](APR-005-trust-boundaries.md)) — this APR does not classify content; it bounds what executing code can reach.
- The **choice of sandbox technology.** This APR mandates the *properties* (isolation, resource bounds, no ambient authority), not the mechanism (container, microVM, gVisor/Firecracker, WASM, seccomp, a remote exec service).

## Prescription

- Executable actions **MUST** run in an environment **isolated** from the harness's own process and from other principals' actions (process, container, microVM, or WASM — mechanism-agnostic).
- The environment **MUST** enforce **resource bounds** — CPU, memory, wall-clock, disk, and process/handle limits — as hard caps outside the model (the resource face of [APR-011](APR-011-observability.md) budget and [APR-006](APR-006-composition-topology.md) termination).
- The environment **MUST NOT** expose **ambient credentials**. Credentials are **scoped per action** to the least privilege the action declares ([APR-022](APR-022-tools.md)), injected for the call and revoked after; secrets are never readable from the workspace, environment, or a shared mount.
- **Network egress MUST default-deny.** Outbound access is an explicitly granted capability, not a default — closing the exfiltration leg of the lethal trifecta ([APR-005](APR-005-trust-boundaries.md)).
- The isolation boundary **SHOULD** align with the **principal / container** boundary ([APR-019](APR-019-identity.md)): actions of different principals do not share an environment, and a subagent's environment attenuates — never widens — its parent's ([APR-006](APR-006-composition-topology.md)).
- On resource-bound breach or isolation failure, the action **MUST fail closed** ([APR-017](APR-017-graceful-degradation.md)) — terminated and denied, not retried with the bound relaxed.

## Governance and validation

The shared conformance model — two-tier CI/human, audit-binding, change-via-ADR — is [APR-010](APR-010-governance.md); the checks below are this APR's additions.

- **No ambient authority** — an executed action cannot read a credential the harness did not scope to it (tested by a canary secret placed in the harness environment that must be unreachable from inside).
- **Bounds are enforced outside the model** — CPU/memory/wall-clock/egress caps are set by the harness, not requested from the model, and a breach halts.
- **Egress is default-deny** — a tool with no declared network need cannot reach the network.
- **Isolation per principal** — two principals' actions do not share a writable environment; a subagent environment is a subset of its parent's.

## What this principle is NOT

- **Not the trust-label model.** [APR-005](APR-005-trust-boundaries.md) governs whether *content* is trusted; this governs what *executing code* can reach. A perfectly-labelled prompt still needs a sandbox.
- **Not the delegation topology.** [APR-006](APR-006-composition-topology.md) governs who may delegate to whom and how authority attenuates; this governs the environment each delegated action runs in.
- **Not the tool contract.** [APR-022](APR-022-tools.md) defines what a tool *is* (schema, permission tier); this defines the *box* the tool executes in.
- **Not a specific sandbox product.** Containers, microVMs, gVisor, Firecracker, WASM, and remote-exec services each satisfy it; none is mandated.
- **Not human oversight.** [APR-009](APR-009-human-in-the-loop.md) gates *consequential decisions*; this bounds the *environment* so that a wrong decision's blast radius is contained.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **OS sandboxing** (seccomp-bpf, namespaces, gVisor, Firecracker microVMs) | Isolating untrusted execution with bounded syscalls/resources | Applied to *model-invoked* actions, tied to per-action credential-scoping and default-deny egress |
| **Capability-based security / POLA** (Saltzer & Schroeder) | Least privilege; authority granted explicitly, not ambient | The grantee is a *model-proposed action*; capability is injected per call and revoked after |
| **The lethal trifecta** (Willison) | private data + untrusted content + exfiltration = exploitable | Makes *default-deny egress* the enforced way to break the third leg at the environment |
| **WASM / capability sandboxes** (WASI) | Deny-by-default host access, explicit capability grants | Positions it as one satisfying mechanism among several for promptware execution |
| **CI/CD ephemeral runners** | Fresh, isolated, credential-scoped, torn down after use | The same hygiene for *agent actions*, per action rather than per job |

The contribution is a **promptware execution-environment invariant**: the box in which model-proposed actions run is isolated, resource-bounded, and ambient-authority-free — the runtime containment that keeps a wrong or injected action from having the blast radius of the host, and the primitive the trust model ([APR-005](APR-005-trust-boundaries.md)) and delegation envelope ([APR-006](APR-006-composition-topology.md)) both assume but neither owns.

## Adoption notes

- **Start with egress and credentials.** Default-deny network and remove ambient secrets first — they close the highest-severity leg with the least work; resource bounds and per-action scoping follow.
- **Ephemeral over persistent.** Prefer a fresh environment per action (or per run) torn down after, over a long-lived workspace that accretes state and credentials.
- **Align the sandbox with the principal.** Let the isolation boundary be the container/principal boundary ([APR-019](APR-019-identity.md)/[APR-006](APR-006-composition-topology.md)) so "who may act" and "in what box" are the same question.

## References

1. Saltzer, J. & Schroeder, M. *The Protection of Information in Computer Systems* — least privilege and capability-based protection. Proc. IEEE, 1975. <https://www.cs.virginia.edu/~evans/cs551/saltzer/>
2. Willison, S. *The lethal trifecta for AI agents: private data, untrusted content, and external communication*. 2025. <https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/>
3. Google. *gVisor: a container sandbox runtime*. <https://gvisor.dev/>
4. Agache, A. et al. *Firecracker: Lightweight Virtualization for Serverless Applications*. USENIX NSDI, 2020. <https://www.usenix.org/conference/nsdi20/presentation/agache>
5. WebAssembly. *WASI: The WebAssembly System Interface* — capability-based host access. <https://wasi.dev/>
6. Bradner, S. *Key words for use in RFCs to Indicate Requirement Levels (RFC 2119 / BCP 14)*. IETF, 1997. <https://datatracker.ietf.org/doc/html/rfc2119>

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-07-10 | Draft | Initial draft. Executable actions run isolated, resource-bounded, with no ambient credentials and default-deny egress; capability scoped per action and aligned to the principal/container boundary. Registers [APR-018](APR-018-runtime-contract.md) R15. Fills the "Execution Environment" harness primitive the corpus previously left unowned. |
