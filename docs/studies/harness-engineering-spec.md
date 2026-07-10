# Harness Engineering: Primitives and Constructions

**Status:** Draft for review · **Audience:** engineers building or operating agent systems

---

## 0. Purpose and how to read this

The harness is everything that is not the model. It is the deterministic, testable layer that owns control flow, authority, and failure. The model is the fuzzy layer inside it.

**The governing rule:** own the control flow in code, not in the model. Push loop termination, budget enforcement, tool routing, and validation down into the harness. Let the model make only the genuinely open-ended judgment calls. If the model decides when to stop looping, you do not have a harness.

This document has two layers, and the second is the one that matters.

- **Primitives** (§2) are *what has an owner.* Fourteen of them.
- **Constructions** (§3) are *how primitives compose without laundering trust, escalating authority, or degrading silently.* Three of them.

Primitives do not compose safely by default. In every field that has primitives, the vulnerabilities live in the composition, not in the primitives — AES and SHA are sound; unauthenticated encryption is where you get owned. The same holds here. Every failure catalogued in §4 is a composition failure. None is a primitive failure.

Read §1 before §2. A list of primitives without a membership test drifts into a list of topics.

---

## 1. Definitions

### 1.1 Membership test

> **A primitive owns an invariant and has exactly one home in code.**

Anything that fails this is a *pattern* (a composition of primitives) or a *topic* (smeared across them, owned by no one, enforced by convention — which is to say, not enforced).

Two corollaries we apply deliberately:

- **Subagents are not a primitive.** A subagent is recursive Orchestration, invoked through the Tools interface, granted an isolated context. It owns no invariant that Orchestration does not already own. "Recursive invocation" is a property of Orchestration.
- **Authority is a primitive, though the ontology resists it.** Authority genuinely cuts across every other primitive, which argues for calling it a cross-cutting concern. We refuse, because cross-cutting concerns have no owner, no code home, and no test suite. Making Authority a primitive is slightly wrong on ontology and exactly right on engineering. We take the ontology hit.

### 1.2 Three strata

The fourteen are not one kind of thing. Flattening them hides the fact that they are owned differently.

| Stratum | Definition | Count |
|---|---|---|
| **Artifacts** | No runtime existence. Versioned, reviewed, evaluated offline. | 2 |
| **Planes** | No stage of their own. Enforcement points distributed across every stage. | 4 |
| **Stages** | In the runtime path. A call passes *through* them. | 8 |

§2 numbers them in that order: authored first, then what constrains every stage, then the stages themselves.

*Planes* is borrowed deliberately from control plane / data plane, where it already means *pervasive, owned, orthogonal to the request path.* That is Authority's exact shape, and it is what "cross-cutting concern" fails to convey.

Note the strain this puts on the membership test: Planes never fail independently — they fail *at* a Stage. Artifacts fail at review time, not runtime. The reconciliation is that a Plane owns an invariant and has one code home (a broker, a policy library) while its *enforcement points* are distributed. That is a coherent thing to be. It is not a stage, and the list must not imply it is.

### 1.3 Classifying a system: structured agent vs. multi-agent

There is no standard definition of "agent" vs. "agentic AI" vs. "multi-agent." The distributed-AI literature assumed heterogeneous, independently-motivated agents; current framework usage calls any two coordinated LLM calls multi-agent. Nothing authoritative will resolve this. Define it internally, and define it so the label does work.

**Draw the line where an obligation changes, not where the philosophy is cleanest.** The discriminator is not topology. It is **principal**.

> **Structured agent (with subagents):** all constituent loops share one principal — one credential set, one permission envelope, one trust domain — and one deterministic control point owning loop termination, budget, and halt. Subagents are a decomposition of *attention*, not of *authority*.
>
> **Multi-agent system:** two or more loops are distinct principals — independently scoped authority, and/or a control plane not owned by a single parent — such that authority *composes* across the boundary.

**Three questions, applied per run:**

1. **Principal** — do all loops act with the same credentials and permission set?
2. **Control** — is there exactly one deterministic place that owns termination, budget, and halt?
3. **Containment** — does halting one halt or quiesce the rest?

Any *no* is a multi-agent system, and you owe cross-boundary authority analysis: reachable-graph permissions, delegation-narrows-privilege, distributed degradation budget. All *yes* and you owe only context-laundering discipline within one envelope.

**What does not discriminate**, despite constant use: number of LLM calls; number of personas or "roles"; hierarchical vs. flat topology; separate processes or containers; whether the vendor's docs say "multi-agent."

**Two properties that keep this honest:**

- **It is a per-run classification, not an architecture label.** Attach an MCP server that is itself an agent holding its own credentials, and a structured agent becomes multi-agent at runtime — no code change, no design doc. The classifier must run at composition time.
- **One obligation is unconditional on both sides.** *Any loop's output entering another loop's context is untrusted content.* Subagents get no trust exemption for sharing a principal. The line tells you whether **authority** composes. It never tells you that **trust** does.

### 1.4 Where harness burden comes from

"Agentic" is best read not as a category but as a property varying along four axes:

- **Autonomy** — who picks the next step
- **Horizon** — how many steps before a human sees output
- **Delegation** — can it spawn or call other loops
- **Action-space breadth** — how much of the world it can touch

Harness burden scales with each independently. A single agent with shell access and a 200-step horizon is more agentic than a three-agent pipeline that only reads and summarizes. As you climb these axes the harness does not shrink; it becomes more load-bearing and moves up a level — from wrapping a model call, to wrapping an agent, to governing a system of agents.

**Corollary: do not build the orchestrator as an LLM.** Orchestration is control flow; control flow belongs in code. Agents at the leaves, deterministic harness at the joints.

---

## 2. The fourteen primitives

Each is stated as **Invariant** (what it guarantees), **Owner** (where it lives), **Signature failure** (how it breaks).

### Artifacts — no runtime existence

**1. Instructions and Skills**
Authored promptware: system instructions, policies, and packaged procedure (instructions + tool/retrieval binding at a coarser granularity).
- *Invariant:* every behavior-shaping instruction is versioned, reviewed, and evaluated before it can enter a context window.
- *Owner:* the prompt repository and its review process.
- *Signature failure:* promptware edited in production without an eval run; nobody can say whether a change fixed a failure or moved it.

**2. Evaluation**
Design-time measurement. The test suite for promptware.
- *Invariant:* no promptware or harness change ships without a regression signal.
- *Owner:* the eval harness and its datasets.
- *Signature failure:* built after the refactor instead of before it, at which point it can only measure the new system against itself.

### Planes — pervasive, no stage of their own

**3. Authority**
Principals, permissions, trust labels, trust boundaries. The spine of this document.
- *Invariant:* every action is taken by a named principal under least privilege; every segment of content carries an unforgeable trust label; trust never elevates automatically.
- *Owner:* a policy/permission broker that Tools, memory writes, and subagent spawns all call. Not a convention. A function with a call site.
- *Signature failure:* the **lethal trifecta** — access to private data + exposure to untrusted content + ability to exfiltrate. Any agent with all three is exploitable. Break at least one leg. Evaluate over the *reachable graph*, not per agent: Agent A may read private data, Agent B may reach the network; each passes review alone, and composing them builds an exfiltration pipeline out of two safe parts.

**4. Budget and Resource Governance**
Tokens, cost, wall-clock, iteration count.
- *Invariant:* every run has hard caps enforced *outside* the model. The model proposes; the harness disposes.
- *Owner:* a budget ledger consulted at every stage boundary.
- *Signature failure:* budgets split between Orchestration and Context Reduction, owned by neither, discovered on the invoice.

**5. Failure and Degradation Control**
Halt semantics, fallback policy, retry as a governed mode, degradation budget, escalation expiry.
- *Invariant:* handling is determined at design time by what a failure blocks; unclassified failures fail closed; degradation reduces capability, never guarantees.
- *Owner:* a failure classifier and degradation ledger, both outside the model.
- *Signature failure:* it does not exist, because "fail closed" was assumed to be a property of good intentions. See Construction III.

**6. Observability**
Structured traces of every step: input, decision, tool call, result, composition manifest, degradation state.
- *Invariant:* out of the control path. Passive. **Must never be able to block.**
- *Owner:* the tracing layer.
- *Signature failure:* bundled with Verification, which buries Verification's blocking authority inside a word that sounds like logging. These are two primitives. One can deny; the other must not.

### Stages — in the runtime path

**7. Context Assembly**
Composition of the window from trust-labeled, canonically-sourced segments under declared precedence.
- *Invariant:* the window is composed, never accumulated. Every segment has a source and a trust label.
- *Owner:* the context composer.
- *Signature failure:* in-band string delimiters as trust markers, which untrusted content can mimic to escalate itself. Use per-run random sentinels, or structural separation via the API's own message boundaries.

**8. Context Reduction**
Compaction, re-ranking, truncation, eviction under budget pressure.
- *Invariant:* reduction is per-class, in a declared order of sacrifice, logged as a composition manifest.
- *Owner:* the reducer.
- *Signature failure:* **summarization is not eviction, and it launders trust.** Whichever primitive owns the summarizer inherits the trust-floor obligation, because *compaction manufactures memory.* Decide explicitly whether that is 8 or 11, or it lands in neither.

**9. Tools**
Contracts between the model and the world.
- *Invariant:* narrow scope, one job each, schema-validated input and output, tiered by permission (read / write / destructive), least privilege by default.
- *Owner:* the tool registry and its schema layer.
- *Signature failure:* error messages written for humans. Assume every tool will be called wrong; make it recoverable. `invalid input` teaches the model nothing. `date must be YYYY-MM-DD, you sent 'tomorrow'` lets it self-correct.

**10. Execution Environment**
Sandboxing, isolation, resource limits, credential scope.
- *Invariant:* anything executable runs isolated, resource-limited, with no ambient credentials.
- *Owner:* the sandbox.
- *Signature failure:* the workspace *is* the credential store, so isolation is nominal.

**11. Durable State and Memory**
Tiered, trust-labeled, scope-bound state across runs.
- *Invariant:* stamped at write with the trust floor of its inputs; recalled at origin trust; scope enforced default-deny at the query boundary; retention bounded and forgettable.
- *Owner:* the memory store and its admission gate.
- *Signature failure:* the write path is ungoverned. See Construction II.

**12. Orchestration**
The loop: observe → decide → act → observe. Termination, recursion, delegation, subagent spawn.
- *Invariant:* the loop is deterministic and owned by code. Exactly one control point owns termination and halt.
- *Owner:* the orchestrator — which is not an LLM.
- *Signature failure:* delegation confers the delegator's privileges by default.

**13. Verification**
In-path gates. Schema and policy checks on what crosses into the model and what leaves it.
- *Invariant:* raw model output never directly triggers a privileged action. Verification can **block**; it has authority; it fails closed.
- *Owner:* the validation gates at each boundary.
- *Signature failure:* validating inputs and forgetting outputs. The harness has an input boundary and an **output boundary**; only one usually gets built.

**14. Human Interaction**
Escalation, confirmation gates, disclosure.
- *Invariant:* irreversible and consequential actions gate behind a human. Escalation carries a declared timeout whose expiry fails closed.
- *Owner:* the escalation channel.
- *Signature failure:* **escalate treated as a terminal state.** It is a blocking wait on a channel that can itself fail, with a human who may not answer. Without a declared expiry, "escalate" quietly becomes "wait, then proceed."

---

## 3. Constructions

Declared, reviewed compositions over primitives. These are the safety properties. They are not primitives, and they are where the engineering actually lives.

### Construction I — Context Assembly and Window Discipline
*Composes: 7 Context Assembly · 8 Context Reduction · 3 Authority · 6 Observability · 5 Failure Control*

> The context window is a composed artifact: every model call re-derives it from canonically-sourced, trust-labeled segments under a declared precedence order and per-class token budget. Trust labels carry enforced semantics — sub-threshold content is treated as **data, never as instructions** — and are unforgeable from within segment content. When inputs exceed budget, reduction follows a declared per-class policy applied in a declared **order of sacrifice**, recorded as a full composition manifest. Safety-critical content is a closed, enumerated class that is never silently evicted **or lossily transformed**; if it alone cannot fit, the run **fails closed** rather than degrading.

Notes that give this teeth:

- The unit of composition is the **model call**, not the user turn. Overflow and trust drift accumulate per iteration.
- A composition manifest is not `reduced: true`. It is segment IDs, classes, trust labels, token counts, and which reduction fired. That is what makes a run reconstructable after an incident.
- Declared precedence governs *conflict resolution.* The model's positional and recency bias is a separate force. Your declaration holds only if placement and explicit in-band authority signaling reinforce it — ordering alone will not.
- **Self-authored segments** — the model's own prior plans and scratchpad — re-enter context carrying whatever they summarized. They are not system-trust.

### Construction II — Memory and State Lifecycle
*Composes: 11 Durable State · 3 Authority · 14 Human Interaction · 8 Context Reduction*

> Agent memory is tiered, trust-labeled, and scope-bound state. **Admission is governed:** memory is stamped at write time with the trust floor of its inputs, by a least-privilege write path, and derived or merged memory inherits its **least-trusted ancestor's** label. Recall re-enters content at its stored origin trust and never elevates it automatically. Scope — tenant, session, agent identity, time — is enforced **default-deny at the query boundary in code**, not by asking the model to be careful. Retention is bounded (expiry, decay) and forgettable (**cascading** erasure that invalidates derived memories, via tombstones that preserve the audit fact without the content). Trust elevation occurs **only** through graduation: a governed, reviewed promotion that is the single audited channel by which memory earns behavior-shaping status.

Notes:

- The vulnerability is the **write path**, not the read path. "Recall at origin trust" presumes origin trust was correctly stamped at admission. A memory derived from a tool result the model paraphrased is untrusted content; if the write path stamps by *where it landed* rather than *where it came from*, laundering happened before recall ever ran.
- On merge of conflicting-trust sources, take the **min**, never the max. Otherwise "never elevates" holds for direct recall and breaks the moment the agent reflects, summarizes, or aggregates — which it does constantly.
- Deleting a row does not undo influence. Erasure must cascade to derived memories, graduated artifacts, and anything trained on it, or it is cosmetic.
- Cross-tenant recall is the catastrophic failure. Name it; do not fold it into a generic word like "scope."
- **Graduation resolves the apparent contradiction** with "never elevates": trust never elevates *automatically*; graduation is the only elevation path, and it is gated by review.

### Construction III — Graceful Degradation and Failure Handling
*Composes: 5 Failure Control · 12 Orchestration · 13 Verification · 6 Observability · 14 Human Interaction*

> A failure's handling is determined **at design time** by what it blocks — its **irreversibility, blast radius, and detectability** — never by runtime model judgment. Safety-critical, irreversible, or consequential paths **fail closed**: new consequential actions are denied, in-flight ones are compensated or rolled back, ambiguous outcomes are **presumed committed**, and the harness constrains the **action space** so the model cannot re-plan around the halt. Other paths may degrade only via a declared fallback that is **never less constrained than the path it replaces** — degradation reduces capability, never guarantees — within a **run-level** degradation budget that may never reach the guardrail or classification machinery itself. **Retries** are governed as a distinct mode, permitted only for idempotent operations under declared limits. **Escalation** carries a declared timeout whose expiry fails closed. **Unclassified failures fail closed.** No failure or degradation is silent: each is logged for the operator, disclosed to the user, and **marked at the artifact boundary** so degraded output is never consumed as full-fidelity.

Notes:

- Classify on **what the failure blocks**, not on error type. Most teams get this wrong by classifying on error type.
- Detectability is the tiebreaker: an irreversible failure you cannot detect afterward is more severe than one you can.
- "Fail closed" delivered to the model as a tool error string is not a halt. The model experiences it as a signal to try a different tool. Denied on `transfer_funds`, it reaches for `execute_script`. Fail closed must terminate or gate the loop **in code**.
- "Never silent" protects the log and the operator. The archetypal silent failure in promptware is **confabulation**: retrieval returns nothing, the tool errors, and the model produces fluent, success-shaped prose over the hole. The failure was logged. The *output* was silent. Hence the artifact-boundary marking.
- Three audiences, three disclosure obligations: operator, user, downstream consumer. What you tell *the model* is separately a manipulation surface — keep it thin.

---

## 4. Composition failure catalogue

Every entry is a composition failure. Use this as a review checklist.

**Trust laundering**
1. *By summarization.* Compaction paraphrases untrusted content into a trusted-looking segment. (I × II)
2. *By derivation.* Derived memory sheds its untrusted lineage on merge. (II)
3. *By repetition.* Untrusted content recalled often enough becomes de facto policy without ever passing graduation. (II)
4. *By reflection.* Model-authored memories about the user or itself get stamped at system trust, bypassing graduation entirely. (II)
5. *By peer.* Subagent or peer-agent output treated as system-trust rather than as model-generated text possibly derived from a poisoned page three hops upstream. (I × §1.3)
6. *By label forgery.* Untrusted content mimics in-band trust delimiters to escalate itself. (7)

**Authority escalation**
7. *Permission composition.* Two agents, each individually safe, connected by a message channel, form an exfiltration pipeline. Evaluate the reachable graph. (3)
8. *Delegation inheritance.* Subagents receive the parent's full privileges by default. (12 × 3)
9. *Silent mutation.* An editable memory store lets content be rewritten while the trusted stamp is retained. (11)
10. *Fallback escalation.* The validator times out and the fallback path is the same operation *without* it. Degradation that removes a guarantee is privilege escalation dressed as resilience. (5)

**Silent degradation**
11. *Routing around the halt.* Fail-closed returned as a string; the model re-plans. (5 × 12)
12. *Degradation stacking.* Retrieval degraded, then context truncated, then a weaker model, then a shortened tool schema. Every step within its declared bound; the aggregate far outside spec. Boundedness must be run-level, and degradation state sticky and monotone. (5)
13. *Confabulation over the hole.* Logged, not disclosed, consumed downstream as full fidelity. (5 × 13 × 6)
14. *Blind retry on ambiguous outcome.* The POST timed out; you do not know whether it committed. Never blind-retry a non-idempotent action. (5)
15. *Erasure without cascade.* The origin is deleted; the influence survives in derived memories and graduated artifacts. (11)
16. *Runtime reclassification.* An MCP server that is itself an agent turns a structured agent into a multi-agent system with no code change and no design doc. (§1.3)

---

## 5. Open decisions

These do not have universally right answers. They have *implicit* answers if nobody decides — usually made by whoever writes the storage layer or the retry wrapper, and then silently governing everything above.

1. **Is the protected class only guardrail and policy instructions, or does it also cover task-critical grounding facts?** These want different eviction rules. Collapsing both into one "safety-critical" tier is where Construction I starts leaking in practice.

2. **Is the memory store append-only?** In-place edit opens a silent-mutation laundering path and complicates cascading erasure. Append-only with versioning closes both, costs storage, and makes "update the user's stated preference" more involved than it looks. Mutability convenience vs. provenance integrity.

3. **Is degraded mode a property of a call or of the run?** Per-call, and the agent silently re-enters full fidelity on the next step, the composition manifest stops telling the truth, and memory written during degradation is stamped as if conditions were nominal. Sticky-for-the-run gives honest provenance and a real budget — but then define how a run **recovers**, or every long-lived agent ratchets monotonically downward and the only exit is a fresh run.

4. **Which primitive owns the summarizer — 8 or 11?** Whichever it is inherits the trust-floor obligation. Unassigned, it lands in neither.

5. **How far up the four axes (§1.4) are we actually going?** One loop with a longer horizon needs a fourth Construction on *checkpointing and human-review cadence.* Delegation needs a fourth Construction on *authority and trust across agent boundaries* — and the three above need amendments, not a companion.

6. **Does anything in the codebase have a single owner named `AuthorityPlane` or `FailureControlPlane`?** If yes, this document is a map. If no, it is an aspiration, and publishing the taxonomy before the brokers exist means the words will be used to *describe* code that does not enforce them. **Naming ratifies structure; it does not create it. Build the two brokers first.**

---

## 6. Adoption

**Non-negotiable, in order:**

1. Deterministic loop with hard caps on iterations, wall-clock, and cost, enforced outside the model.
2. An Authority broker with one call site, and unforgeable trust labels.
3. A Failure Control ledger. Unclassified fails closed.
4. Structured traces. A nondeterministic system cannot be debugged from logs alone.
5. An eval set built **before** the refactor.

**Two things worth repeating because they survive every architecture:**

> Tool output is **data**, never instructions.
>
> Any loop's output entering another loop's context is **untrusted content** — whatever the org chart of your agents says.

---

## Appendix: caveats on this document

- The classification in §1.3 is an internal convention, not an industry standard. It is chosen because it changes what you owe. Expect colleagues who use "multi-agent" to mean "more than one prompt."
- Fourteen is not sacred. Merge Context Assembly and Reduction, merge Budget into Orchestration, and you are at twelve with nothing homeless. The **strata** are the point, not the count.
- The term *primitive* is used in the ownership sense (owns an invariant, has one code home), not the atomicity sense. Primitives are irreducible relative to an abstraction layer, never absolutely — a mutex is a synchronization primitive and you can build one from a semaphore. The membership test is stated first (§1.1) precisely so the word survives contact with pedants.
