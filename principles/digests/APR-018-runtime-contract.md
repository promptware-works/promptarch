# APR-018 — Runtime-Conformance Profile for Harnesses — Digest

> **Generated digest of [APR-018 — A Runtime-Conformance Profile for Promptware Harnesses](../APR-018-runtime-contract.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** The runtime obligations scattered across the corpus — inject only what's declared, halt-and-audit, propagate trust, enforce the delegation envelope, govern memory and failure — collected by reference into one checkable conformance profile for harnesses, so no APR becomes a runtime specification.

**Principle.** A conforming promptware harness satisfies a single collected contract — the union of the runtime obligations the corpus imposes — assembled by reference, never redefined. It is a **profile**, not a new rulebook: every obligation is owned by another APR, the owner wins on conflict, and it defines the **interface a runtime must satisfy, not the mechanism** (so it honors every "not a runtime" limit).

## Why

Promptware has no compiler; the harness *is* the runtime, and nearly every APR assumes it does certain things — but each states only its own slice and none collects them. So you cannot certify a harness without reading the whole corpus, and an obligation no APR clearly owns is invisible. The recent revisions added "enforce-in-code" obligations (per-call window re-derivation, memory-scope in code, fail-closed that constrains the action space), enlarging and scattering the surface further.

## The contract — collected obligations (each owned elsewhere)

The harness MUST:

- **R1** inject only declared references; resolve transitively; audit-log each hop — APR-002.
- **R2** assemble the window per declared precedence/budget; re-derive every model call; protected tier verbatim/present-or-fail-closed; log a composition manifest — APR-015.
- **R3** classify at ingress and propagate trust taint through every hop; monotone on derivation; unforgeable labels; untrusted = data — APR-005.
- **R4** validate LLM output against its declared schema at the seam; halt, don't guess — APR-003.
- **R5** keep delegation inside the declared envelope; attenuate authority; guarantee termination; audit-log delegations — APR-006.
- **R6** weave applied patterns from canonical source; never inline; log the version — APR-007.
- **R7** govern memory: write-time floor stamp via least-privilege path, scope default-deny in code, no recall elevation, append-only where integrity-bearing, cascading tombstoned erasure — APR-016.
- **R8** place human oversight by declared reversibility/blast-radius; concrete diff + approver before irreversible; no fatigue lever skips a safety gate — APR-009.
- **R9** handle failure by declared property: fail-closed enforced in code (constrain the action space), retry only idempotent, run-level degradation budget, mark degraded at boundary, escalation timeout fails closed — APR-017.
- **R10** audit-log at consumption `{source, version, timestamp}` on one shared substrate (immutable audit floor); attribute + budget cost (hard cap → halt) — APR-010/011.
- **R11** emit derivation edges as a side effect of producing each node — APR-013.
- **R12** read metadata from frontmatter only; never parse the body for metadata; never inject frontmatter — APR-014.
- **R13** across a federation boundary, authenticate participants; least-privilege, non-transitive cross-domain trust — APR-012.

Conformance of the whole = passing the union of the owners' runtime-facing governance checks; partial conformance is per-obligation and testable.

## Extension

Closed for modification. New obligations are **registered by their owning APR** (a short *Runtime obligations* note), not added here — the DECLARE-registry pattern, avoiding a god-object. A machine-readable runtime-obligations registry + checker is deferred until the list proliferates.

## Governance checks

Profile completeness (every obligation cites a live owner; no redefinition) · conformance report exists listing R1–R13 + each owner's check + pass/fail · no new checks introduced (indexes existing governance) · extensions owner-registered.

## Scope limits — do NOT misapply

Not a runtime / reference implementation / execution model (the interface, not the scheduler/bus/store) · not a new set of requirements (defines nothing; owner wins) · not APR-010 (that is the conformance *machinery*; this is the *index* it verifies) · not a certification/compliance program · not a god-object (closed for modification; owner-registered) · excludes build-time materialization (APR-004 is not a runtime obligation).

---
*Source: [APR-018 — A Runtime-Conformance Profile for Promptware Harnesses](../APR-018-runtime-contract.md) v0.1.0 · regenerate this digest whenever the source changes.*
