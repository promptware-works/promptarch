# Study: Harness-standard coverage — what the APR corpus covers, and the gaps

*Status: design study (informative). A coverage/gap analysis of the PROMPTARCH APR
corpus against the concerns of an agentic-AI **harness**. Feeds candidate backlog
items and a possible "runtime contract" consolidation. Not itself an APR.*

## Question

Do the defined APRs (APR-000 … APR-014) cover the main aspects of a *harness
standard*, if such a standard exists — and what should be added to close the gap?

## Is there a "harness standard"?

**No single canonical one exists.** There is no IETF/ISO-style document that defines
"the agentic harness" the way there is for, say, HTTP. What exists instead is:

- **A de-facto concern set** that has stabilized across frontier agent runtimes
  (Claude Code, coding agents, orchestration frameworks): the *agent loop*, *context
  assembly and management*, *memory/state*, *tool interface and dispatch*,
  *multi-agent orchestration*, *human oversight*, *observability/cost*, *permissions
  and sandboxing*, *failure handling*, and *governance/eval*.
- **Point protocols** that standardize slices of it — MCP (tool/resource access),
  A2A / ACP (agent-to-agent), OpenAI/Anthropic tool-use schemas — but no protocol
  spans the whole harness.
- **Vendor-specific harnesses** that each implement the concern set their own way.

So "the harness standard" is best read as *the concern set a competent harness must
address*. The useful question becomes: **for each of those concerns, does PROMPTARCH
say something durable and citable — and if not, should it?**

By "harness" this study means the **runtime scaffolding around the model**: the loop
that assembles a context window, calls the model, dispatches tools, manages memory and
state, enforces permissions, and orchestrates delegation — everything between "a
request arrives" and "an action is taken."

## The scope tension that frames everything

PROMPTARCH is, by explicit and repeated design, a discipline for **content,
specification, and governance** — *not* a runtime. Nearly every APR carries a "not a
runtime / not a scheduler / not a message bus" scope limit (APR-000 §Runtime
architecture; APR-001, APR-002, APR-003, APR-004, APR-006 all disclaim it). The
corpus disciplines *what the harness is fed and how that content is governed*, not
*how the harness executes*.

That means "does PROMPTARCH cover the harness standard?" has two faces, and they must
be answered separately:

- **The specification/governance face** — how a component, its tools, its trust, its
  composition, its lifecycle are *declared and governed*. Here coverage is **strong
  and largely complete.**
- **The runtime-mechanism face** — schedulers, buses, dispatch loops, sandboxes.
  Here coverage is **deliberately absent**, and mostly *should stay that way* — it is
  generic systems engineering, not a promptware-specific principle.

The gaps that matter are the ones that fall in **neither** bucket cleanly: concerns
that are genuinely *promptware-architectural* (about the operative content and its
behavior) yet are currently unaddressed. There are a small number of these, and they
are real.

## Coverage matrix

Legend: ✅ covered as a durable principle · ◑ partially covered (spec/governance face
only, or via a neighbouring APR) · ⛔ out of scope **by design** (generic runtime /
platform security) · **GAP** = promptware-architectural but unaddressed.

| # | Harness concern | Verdict | Where / why |
|---|---|---|---|
| 1 | Component specification (agent/skill shape) | ✅ | [APR-001 ASPECT](../../principles/APR-001-aspect.md) (body) + [APR-014 DECLARE](../../principles/APR-014-declare.md) (frontmatter) |
| 2 | Tool interface & the code/prompt seam | ✅ | [APR-003](../../principles/APR-003-code-prompt-boundary.md) typed seam; ASPECT `Tools & Capabilities`; DECLARE tool grants. Dispatch *mechanism* ⛔ (runtime) |
| 3 | Reusable behavior units | ✅ | [APR-007](../../principles/APR-007-pattern-mechanism.md) patterns |
| 4 | Multi-agent orchestration / delegation | ✅ | [APR-006](../../principles/APR-006-composition-topology.md) topology + bounds; [APR-012](../../principles/APR-012-federated-composition.md) cross-domain. Scheduler ⛔ |
| 5 | Human oversight placement | ✅ | [APR-009](../../principles/APR-009-human-in-the-loop.md) |
| 6 | Trust / prompt-injection / provenance | ✅ | [APR-005](../../principles/APR-005-trust-boundaries.md) (the promptware slice) |
| 7 | Observability, tracing & cost | ✅ | [APR-011](../../principles/APR-011-observability.md) |
| 8 | Governance / conformance | ✅ | [APR-010](../../principles/APR-010-governance.md) two-tier + audit-binding |
| 9 | Content organization & sourcing | ✅ | [APR-002 OBSERVE](../../principles/APR-002-observe.md); [APR-004](../../principles/APR-004-canonical-source.md) canonical source |
| 10 | Artifact lifecycle & model migration | ✅ | [APR-008](../../principles/APR-008-artifact-lifecycle.md); derivation lineage [APR-013](../../principles/APR-013-artifact-graph.md) |
| 11 | Agent loop / iteration / termination | ◑ | Termination *bounds* in APR-006 (depth/cycle/budget → halt). The loop *mechanism* ⛔ (runtime) |
| 12 | **Context assembly & window management** | GAP → ◑ (drafted [APR-015](../../principles/APR-015-context-assembly.md)) | Was the largest gap: OBSERVE governs *which sources* are injected; APR-005 *trust separation* in the window; APR-004 materialization — but nothing governed assembly order, budget, or reduction for the window itself. Now addressed by APR-015 (Draft). |
| 13 | **Memory & session state** | GAP → ◑ (drafted [APR-016](../../principles/APR-016-memory.md)) | Agent is defined as "stateful" (Glossary) but no principle governed *how* memory is tiered, scoped, trusted, expired, or persisted. Now addressed by APR-016 (Draft): tiered, trust-labeled, scope-bound, forgettable memory with a graduation rule. |
| 14 | **Failure handling / graceful degradation** | GAP → ◑ (drafted [APR-017](../../principles/APR-017-graceful-degradation.md)) | Was piecemeal (OBSERVE halt-on-missing-injection, APR-006 termination, APR-003 halt-don't-guess) with no unifying discipline. Now addressed by APR-017 (Draft): fail-closed by declared safety-criticality, declared bounded fallback elsewhere, never silent. |
| 15 | Eval-driven development (methodology) | ◑ | OBSERVE says *where* evals live and the gate; the *methodology* is unaddressed. *Backlog #2 (hold).* |
| 16 | PII / sensitive data in artifacts & traces | ◑ | Flagged out of scope in OBSERVE §10; noted for traces in APR-011. *Backlog #3.* |
| 17 | Permissions / sandboxing / capability grants | ⛔ | APR-005 mentions capability limits as *one* enforcement option; the rest is generic platform security, delegated by design (APR-000, APR-005 §What-this-is-NOT). |
| 18 | Interop protocols (MCP / A2A / ACP) | ⛔ / ◑ | Portability of *authored content* is APR-004; wire protocols are implementation, correctly out of scope. |
| 19 | Transport, secrets, authn/authz, deployment | ⛔ | Generic platform security; delegated by design. |

## The genuine gaps (ranked)

Three concerns were both **squarely promptware-architectural** and **unaddressed** when
this study was written. All three are now drafted — APR-015 (context assembly), APR-016
(memory & state), and APR-017 (graceful degradation). In priority order:

### 1. Context assembly & window management — the largest gap

The context window *is* the operative substrate of promptware — it is where all the
content the corpus disciplines (OBSERVE injections, ASPECT bodies, APR-004
materializations, patterns, history, tool results, untrusted input) actually
converges at execution time. Yet no APR governs *the assembly itself*:

- **Ordering** — precedence layering (system > developer > user > tool output), and
  ordering by volatility (stable/shared content first, volatile/per-request last) for
  cache stability. The backlog already spotted the cache-stability kernel and parked
  it into OBSERVE as a `SHOULD`; it is broader than caching.
- **Budget allocation** — how a finite window is apportioned across instructions,
  injected references, history, and tool results; what gets dropped first under
  pressure, and how that interacts with `safety_critical` content that must *never*
  be dropped.
- **Compaction / truncation / summarization** — when history is summarized, that is a
  *probabilistic* transform (APR-003) over *trusted-and-untrusted-mixed* content
  (APR-005) that changes behavior — it deserves a principle, not ad-hoc trimming.
- **Retrieval** — RAG is scoped out as *infrastructure* (APR-000), but *what trust and
  provenance labels retrieved content carries into the window* is squarely APR-005 /
  OBSERVE territory and is only half-covered.

This is the concern a harness engineer would most expect a promptware standard to
own, and it is the biggest hole. It composes tightly with OBSERVE (sources), APR-005
(trust in the window), APR-011 (cost of the window), and APR-008 (the window is
model-version-sensitive).

**Recommendation (done):** now drafted as
[APR-015 — A Context-Assembly and Window-Discipline Principle](../../principles/APR-015-context-assembly.md)
(Draft, v0.1.0). It governs ordering, budget, and reduction as first-class, declared,
audit-bound decisions with a non-evictable safety floor, deferring source-of-truth to
OBSERVE, trust to APR-005, cost to APR-011, and model-sensitivity to APR-008. It
absorbs the previously-parked prompt-caching kernel as a subordinate SHOULD. Per the
"baseline + sparse override" model of APR-008, it introduces **no new DECLARE field**
in v0.1.0: the assembly policy is a platform baseline artifact, the safety floor reuses
`safety_critical` / `trust_level`, and a per-component `context_assembly_policy`
override is reserved but unshipped. This was the highest-value addition.

### 2. Memory & session state

A stateful agent's memory is neither pure OBSERVE content (it is written at runtime,
per-session) nor pure behavior. Open questions with no principled answer today: is a
memory a trusted or untrusted artifact once it contains user-derived content (APR-005
says untrusted — but recalled memory is routinely re-injected as if trusted)? What is
its lifecycle and scope (session / user / global)? When does a memory become an
OBSERVE artifact or an APR-013 node? How is stale/contradictory memory reconciled?

**Recommendation (done):** now drafted as
[APR-016 — A Memory and State-Lifecycle Principle](../../principles/APR-016-memory.md)
(Draft, v0.1.0): memory is tiered (working / session / long-term), trust-labeled
(recall never elevates trust — the memory-poisoning defense), scope-bound, retention-
bounded and forgettable, and graduates to a governed artifact once it durably shapes
behavior. Composes with APR-005 (taint given a lifetime), APR-008 (schema/graduation
lifecycle), APR-009 (gated writes, reconciliation), APR-013 (graduation target), and
APR-015 (recalled memory as a window segment).

### 3. Graceful degradation & failure handling

**Recommendation (done):** now drafted as
[APR-017 — A Graceful-Degradation and Failure-Handling Principle](../../principles/APR-017-graceful-degradation.md)
(Draft, v0.1.0): handling is selected by declared safety-criticality — fail closed for
safety-critical/consequential/irreversible paths, a declared bounded fallback
elsewhere, never silent. It **unifies the six local halt rules already in the corpus**
(OBSERVE injection, APR-003 seam, APR-006 termination, APR-011 cost cap, APR-005
consequential-action, APR-015 non-evictable) as instances of one principle rather than
opening new territory — which is why it was the most self-contained of the three.

Eval-driven-development methodology (backlog #2) and PII (backlog #3) remain correctly
lower priority; neither is a harness-runtime gap so much as an adjacent discipline.

## The structural recommendation — make the implicit runtime contract explicit

The most valuable single move is *not* another domain APR. It is this:

**The corpus already imposes a scattered set of obligations on any conforming harness,
but never collects them.** A conforming runtime MUST, per the existing APRs:

- resolve declared references and inject **only** what is declared (OBSERVE);
- **halt with an audit-logged error** on a failed required injection (OBSERVE), a
  failed seam validation (APR-003), or a tripped termination bound (APR-006);
- **audit-log at the moment of consumption** — injection, delegation, application,
  approval — with `{source, version, timestamp}` (APR-010, APR-011);
- **propagate trust labels** taint-style through every hop (APR-005);
- **enforce delegation within the declared envelope** and attenuate authority along
  each edge (APR-006);
- **emit derivation edges as a side effect of producing nodes** (APR-013);
- read metadata **from frontmatter, never from the injected body** (APR-014).

These are, collectively, a **harness conformance profile** — the interface every APR
assumes but none states. The Glossary's "Loader / Orchestrator" entry gestures at it
("several APRs assume a loader exists; platforms without one cannot conform"), but the
obligations are never gathered.

**Recommendation:** publish a *Runtime Contract* consolidation — either a short new
APR ("A Runtime-Conformance Profile for Promptware Harnesses") or a `meta/` reference
doc — that **collects** these obligations by reference (owning-APR-cited, not
redefined, mirroring how APR-010 collects governance and APR-014 collects metadata).
This lets a harness author read *one* checklist to answer "is my harness
PROMPTARCH-conformant?" — without PROMPTARCH ever becoming a runtime spec. It respects
every existing "not a runtime" scope limit because it defines the **interface the
runtime must satisfy**, not the mechanism. This is the cleanest way to "approach the
harness standard" without drifting out of the corpus's chosen lane.

## What NOT to add (holding the line)

Resisting scope creep is as important as filling gaps. The corpus should **not** grow
APRs for: the agent-loop mechanism, schedulers/buses, sandboxing, transport/secrets/
authn, or wire protocols (MCP/A2A/ACP). These are generic platform/runtime concerns
the corpus deliberately delegates; an APR on any of them would be generic advice, not
a promptware principle — the same reasoning that (correctly) kept "general security"
and "general orchestration" out of the backlog.

## Recommendation summary

1. **Context assembly & window discipline — done.** Drafted as
   [APR-015](../../principles/APR-015-context-assembly.md) (Draft, v0.1.0); the biggest
   genuinely-promptware gap is now filled.
2. **Memory & state discipline — done.** Drafted as
   [APR-016](../../principles/APR-016-memory.md) (Draft, v0.1.0); the second high-priority
   gap is now filled.
3. **Graceful degradation — done.** Drafted as
   [APR-017](../../principles/APR-017-graceful-degradation.md) (Draft, v0.1.0); it
   unifies the six local halt rules as one discipline. All three gaps now filled.
4. **Publish a Runtime Contract consolidation** (APR or `meta/` doc) that collects the
   harness obligations the corpus already implies — the highest-leverage structural
   move, and the honest answer to "approach the harness standard."
5. **Hold** eval-methodology and PII at current backlog priority; keep the
   runtime-mechanism concerns explicitly out.

Net: the corpus already covers the **specification and governance** face of the
harness concern set well, and deliberately (and rightly) omits the **runtime
mechanism** face. The real gaps are context assembly, memory/state, and unified
failure handling — plus the untaken opportunity to state, in one place, the runtime
contract the fifteen APRs already presuppose.

## References

1. PROMPTARCH APR corpus, [`principles/README.md`](../../principles/README.md) (index) and [`meta/apr-backlog.md`](../../meta/apr-backlog.md) (candidate APRs).
2. Anthropic. *Building effective agents* and *Effective context engineering for AI agents*. (Agent-loop and context-window discipline as first-order concerns.)
3. Anthropic. *Model Context Protocol (MCP)* — a point protocol for the tool/resource slice of the harness. <https://modelcontextprotocol.io>
4. OWASP. *Top 10 for LLM Applications* — LLM01 prompt injection (grounds APR-005; relevant to context-assembly trust). 
5. IETF. *RFC 8126 / BCP 26 — Guidelines for Writing an IANA Considerations Section* — the "collect by reference, don't redefine" pattern this study recommends for the Runtime Contract (cf. [metadata-extensibility study](metadata-extensibility.md)).
