---
apr: 9
title: "A Human-in-the-Loop Oversight-Placement Principle for Promptware"
abstract: "Place human oversight by reversibility and blast radius: irreversible/high-blast actions need plan-and-approve (gate before); reversible/low-blast use fire-and-judge (review after). Reversibility defaults to irreversible when unknown; safety-critical gates are never sampled away."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-31
last-updated: 2026-05-31
audience: Architects of agentic systems that take consequential actions; framework authors building approval/review UX; teams in regulated or high-blast-radius domains
supersedes: []
superseded-by: []
related:
  - APR-001
  - APR-003
  - APR-005
  - APR-006
tags:
  - human-in-the-loop
  - oversight
  - approval
  - autonomy
  - reversibility
---

# APR-009 — A Human-in-the-Loop Oversight-Placement Principle for Promptware

> **Human oversight is placed by reversibility and blast radius: irreversible or high-blast actions require *plan-and-approve* — a human gate before execution; reversible, low-blast actions use *fire-and-judge* — human review after. Reversibility selects the mode; blast radius tunes the rigor.**

*Injectable summary (for feeding to an LLM): [`digests/APR-009-human-in-the-loop.md`](digests/APR-009-human-in-the-loop.md). This full APR is canonical.*

## Motivation

Agentic promptware takes consequential actions — writing to shared state, calling external systems, applying code changes, spending money. [APR-001 ASPECT](APR-001-aspect.md) declares autonomy *levels* (L0–L5), and [APR-005](APR-005-trust-boundaries.md) / [APR-006](APR-006-composition-topology.md) require *escalation* to a human — but nothing defines **where the human gate sits relative to the action**. Without that, oversight fails two ways:

- **Over-gating** → the human approves everything, rubber-stamps, and real oversight evaporates.
- **Under-gating** → high-blast, irreversible actions execute silently.
- And the gate, when present, is **ad hoc** — no contract for what the human sees, decides, or can undo, and placement that doesn't track risk (a reversible draft and an irreversible deletion treated the same).

## The principle

> **An action's oversight mode is set by whether it can be undone; how heavy that oversight is, is set by how much it affects.**

- **Reversibility selects the mode.** Irreversible → **plan-and-approve** (gate *before*). Reversible → **fire-and-judge** (review *after*) — you can only judge-after what you can undo.
- **Blast radius tunes the rigor** — sampling rate, notification, rollback speed, batching — not the mode.

## Scope and applicability

### When this applies

- Wherever an agent takes actions a human should oversee: consequential, irreversible, safety-critical, or externally visible.

### When this does NOT apply

- Pure-advisory / read-only agents whose output a human consumes before any action (the human is already the actor).
- It is an *oversight-placement* principle, **not** a UX specification or an approval-workflow engine — it says where the gate sits and what it must carry, not how the UI works.

## The two modes

- **Plan-and-approve** (a-priori control). The agent presents its intended action; a human approves, rejects, or modifies it **before** execution. The action does not run until approved.
- **Fire-and-judge** (a-posteriori control). The agent executes; the action is captured and a human reviews it **after**. Valid only where the action is **reversible**, so a bad outcome can be rolled back.

## The placement rule

| | Reversible | Irreversible |
|---|---|---|
| **Low blast** | fire-and-judge (light: sampled) | plan-and-approve (lightweight / batchable) |
| **High blast** | fire-and-judge (heavy: notify, fast rollback, high sampling) | plan-and-approve (individual, mandatory) |

**Reversibility picks the column → the mode; blast radius picks the row → the rigor.** This resolves the mixed cells cleanly: a reversible-but-high-blast bulk edit is still fire-and-judge, but with immediate notification and easy rollback; an irreversible-but-low-blast single email is still plan-and-approve, but may be lightweight or batched.

## Reversibility is declared, not guessed

- Reversibility is **declared metadata** on the action/tool (like blast radius in an ASPECT Autonomy Profile), recording whether and how its effects can be undone.
- The agent **MUST NOT** self-assess reversibility ad hoc — letting a probabilistic model decide a safety property is an [APR-003](APR-003-code-prompt-boundary.md) violation; reversibility is deterministic metadata, not a model guess.
- **When reversibility is unknown or unclear, default to irreversible → plan-and-approve** (fail-safe, per [APR-005](APR-005-trust-boundaries.md)).

## What each mode must carry

**Plan-and-approve** — before execution, the human **MUST** be shown:

- the **intent** (what and why);
- the **concrete action/diff preview** — the *actual* change, not a model-written summary (the key anti-rubber-stamp rule);
- the **predicted blast radius**;
- the **rollback plan**, or an explicit "irreversible — no rollback" flag.

The decision (approve / reject / modify) is recorded with the **approver's identity**.

**Fire-and-judge** — it **MUST**:

- **capture** the action, its inputs, and outputs for review;
- record the **judgment** (accept / flag / correct) with the **reviewer's identity**;
- **feed back** — corrections become eval cases ([APR-008](APR-008-artifact-lifecycle.md) / OBSERVE) and may become patterns ([APR-007](APR-007-pattern-mechanism.md)), so judgments improve the system rather than being discarded.

## Avoiding approval fatigue

Fatigue is real: a human who must approve everything stops reading and rubber-stamps, which is *worse* than no gate. The answer is **tunable levers under a hard safety floor** — cut fatigue by *not gating trivia*, never by lightening the gates that matter:

- **Thresholds** — do not gate actions below a declared blast-radius/cost threshold.
- **Risk-weighted sampling** — fire-and-judge reviews a sample, with the rate rising with blast radius and falling with track record.
- **Batching** — homogeneous low-stakes actions may be approved or judged as a batch.

**The hard floor:** safety-critical or irreversible-high-blast actions are **NEVER** sampled-out or batched-away — they always get individual plan-and-approve.

## Prescription

- Every overseeable action **MUST** have a declared **reversibility**; unknown **MUST** default to irreversible.
- Oversight mode **MUST** be set by reversibility (irreversible → plan-and-approve; reversible → fire-and-judge); blast radius sets the rigor, not the mode.
- Plan-and-approve **MUST** show the human the concrete diff, intent, blast radius, and rollback plan, and record the approver's identity, **before** execution.
- Fire-and-judge **MUST** capture the action, record the judgment with reviewer identity, and feed corrections back to evals/patterns; it **MUST** be used only for reversible actions.
- The agent **MUST NOT** self-assess reversibility (APR-003); it is declared metadata.
- Fatigue reduction (thresholds, sampling, batching) **MUST NOT** apply to safety-critical or irreversible-high-blast actions, which always receive individual approval.

## Governance and validation

The shared governance model — two-tier enforcement, audit-log binding, and change-via-ADR — is defined in [APR-010](APR-010-governance.md); the checks below are this APR's domain-specific additions.

A conformant platform checks, in review or CI:

- **Reversibility declared** — every overseeable action/tool carries it; unknown defaults to irreversible.
- **Mode matches reversibility** — irreversible actions are gated before; reversible ones are reviewed after.
- **Approval payload** — plan-and-approve records show the concrete diff and approver identity, not a summary.
- **Judgment feedback** — fire-and-judge corrections are captured and routed to evals/patterns.
- **Safety floor intact** — no sampling/batching/threshold path lets a safety-critical or irreversible-high-blast action skip individual approval.

## What this principle is NOT

- **Not a UX or workflow-engine spec.** It places the gate and defines its payload; the approval UI and routing are the platform's.
- **Not the autonomy-level definition.** ASPECT defines the levels; this defines which oversight *mode* a level selects.
- **Not a guarantee against human error.** It ensures the human is *informed and correctly placed*, not that they decide well.
- **Not access control or authn.** Who *may* approve is the platform's authorization concern; this governs *when and what* is overseen.
- **Not applicable to read-only/advisory agents** — there, the human is already the actor.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **Four-eyes / maker–checker** | Approve-before for high-consequence actions | Mode chosen by reversibility; a concrete-diff payload; a fatigue discipline |
| **One-way vs. two-way doors** (Bezos) | Reversibility as the key decision axis | Maps reversibility directly onto oversight *placement* (before vs. after) |
| **Change-approval / deploy gates** (CI/CD) | Human gate before a consequential change | Generalized to agent actions, with risk-tuned rigor and post-hoc judging |
| **RLHF / human feedback** (Christiano et al.) | Humans judging machine outputs | Fire-and-judge feeds back into evals/patterns at *operation* time, not training |
| **Regulatory human-oversight mandates** (EU AI Act Art. 14; NIST AI RMF) | Required human oversight of AI | A concrete, placement-based mechanism that *implements* such oversight |

The novel contribution is a **promptware-specific oversight-placement principle**: two modes selected by reversibility, rigor tuned by blast radius, with declared (not guessed) reversibility, a concrete-diff approval payload, a judgment-feedback loop, and a fatigue discipline bounded by a hard safety floor — composing with ASPECT autonomy levels, APR-003 (the gate as a deterministic check), APR-005 (fail-safe escalation), and APR-006 (escalation up the graph).

## Metadata registrations

Component-metadata fields this APR owns, registered per [APR-014 §The metadata registry](APR-014-declare.md) in [`registries/component-metadata.yaml`](../registries/component-metadata.yaml):

| Field | Cluster | Type | Values | Status |
|---|---|---|---|---|
| `max_autonomy_level` | classification | enum | `L1, L2, L3, L4, L5` | active |
| `max_blast_radius` | classification | enum | `local-only, project-scoped, cross-project, external` | active |
| `escalation_triggers` | composition | list | — | active |
| `escalation_path` | composition | string | — | active |

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. European Parliament and Council. *Regulation (EU) 2024/1689 (Artificial Intelligence Act)* — Art. 14, Human oversight. 2024. <https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng>
2. NIST. *AI Risk Management Framework (AI RMF 1.0)*. <https://www.nist.gov/itl/ai-risk-management-framework>
3. Christiano, P. et al. *Deep Reinforcement Learning from Human Preferences*. arXiv:1706.03741, 2017. <https://arxiv.org/abs/1706.03741>
4. Bezos, J. *Letter to Shareholders* — Type 1/Type 2 decisions (one-way vs. two-way doors). Amazon. <https://www.aboutamazon.com/news/company-news/2016-letter-to-shareholders>

## Adoption notes

- **Declare reversibility on your action/tool catalogue first** — it's the axis everything else keys off; default unknowns to irreversible.
- **Make the approval payload the concrete diff**, never a model summary — that single rule prevents most rubber-stamping.
- **Wire fire-and-judge into the eval loop** — a correction that doesn't become an eval case is a lesson thrown away.
- **Tune fatigue from the bottom up** — raise thresholds and sample on the trivia; never touch the safety floor.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-31 | Draft | Initial draft published as APR-009. |
