# APR-009 — Human-in-the-Loop Oversight Placement — Digest

> **Generated digest of [APR-009 — A Human-in-the-Loop Oversight-Placement Principle for Promptware](../APR-009-human-in-the-loop.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** Place human oversight by reversibility and blast radius: irreversible/high-blast actions need plan-and-approve (gate before); reversible/low-blast use fire-and-judge (review after). Reversibility defaults to irreversible when unknown; safety-critical gates are never sampled away.

**Principle.** An action's oversight mode is set by whether it can be undone; how heavy that oversight is, by how much it affects. Reversibility selects the mode; blast radius tunes the rigor.

## The two modes

- **Plan-and-approve** (before): the agent presents its action; a human approves/rejects/modifies before it runs. For **irreversible** actions.
- **Fire-and-judge** (after): the agent executes; a human reviews the captured action after. For **reversible** actions only (you can only judge-after what you can undo).

## The placement rule

| | Reversible | Irreversible |
|---|---|---|
| Low blast | fire-and-judge (sampled) | plan-and-approve (light/batchable) |
| High blast | fire-and-judge (notify, fast rollback, high sampling) | plan-and-approve (individual, mandatory) |

Reversibility → the column (mode); blast radius → the row (rigor).

## Normative rules

- Every overseeable action MUST have a **declared reversibility**; unknown MUST default to irreversible.
- Mode MUST be set by reversibility (irreversible → plan-and-approve; reversible → fire-and-judge); blast radius sets rigor, not mode.
- Plan-and-approve MUST show the human the **concrete diff** (not a model summary), intent, blast radius, and rollback plan, and record the approver identity, **before** execution.
- Fire-and-judge MUST capture the action, record the judgment + reviewer identity, and feed corrections back to evals/patterns; used only for reversible actions.
- The agent MUST NOT self-assess reversibility (APR-003) — it is declared metadata.
- Fatigue levers (thresholds, sampling, batching) MUST NOT apply to safety-critical or irreversible-high-blast actions — those always get individual approval (the hard safety floor).

## Governance checks

Reversibility declared on every overseeable action (unknown → irreversible) · mode matches reversibility · approval records show the concrete diff + approver identity · fire-and-judge corrections routed to evals/patterns · no sampling/batching/threshold lets a safety-critical or irreversible-high-blast action skip individual approval.

## Scope limits — do NOT misapply

Not a UX/workflow-engine spec · not the autonomy-level definition (ASPECT defines levels; this defines which mode a level selects) · not a guarantee against human error (ensures the human is informed and correctly placed) · not access control/authn (who *may* approve is platform authorization) · not for read-only/advisory agents (the human is already the actor).

---
*Source: [APR-009 — A Human-in-the-Loop Oversight-Placement Principle for Promptware](../APR-009-human-in-the-loop.md) v0.1.0 · regenerate this digest whenever the source changes.*
