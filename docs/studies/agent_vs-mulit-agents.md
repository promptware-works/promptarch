# Structured Agent vs Multi.Agents

There is no standard definition. The vocabulary is genuinely unsettled — The Multi-Agent System (MAS) literature from distributed AI assumed heterogeneous, independently-motivated agents; current framework usage calls almost any two coordinated LLM calls "multi-agent." Nothing authoritative will resolve this for you. So define it internally, and define it so the label *does work*.

**The design rule: draw the line where an obligation changes, not where the philosophy is cleanest.** A definition that doesn't change what you owe is decoration.

That gives you the discriminator: **not topology, but principal.**

> **Structured agent (with subagents):** all constituent loops share one principal — one credential set, one permission envelope, one trust domain — and one deterministic control point that owns loop termination, budget, and halt. Subagents are a *decomposition of attention*, not of authority.
>
> **Multi-agent system:** two or more loops are distinct principals — independently scoped authority, and/or a control plane not owned by a single parent — such that authority *composes* across the boundary.

**Three questions, applied per run:**

1. **Principal** — do they all act with the same credentials and permission set? (Different → multi-agent.)
2. **Control** — is there exactly one deterministic place that owns termination, budget, and halt? (No → multi-agent.)
3. **Containment** — does halting one halt or quiesce the rest? (No → multi-agent.)

Any "no" means you owe the cross-boundary authority principle: reachable-graph permission analysis, delegation-narrows-privilege, distributed degradation budget. All "yes" means you owe only context-laundering discipline within one envelope.

**What *doesn't* discriminate**, despite being used constantly: number of LLM calls, number of personas or "roles," hierarchical vs. flat topology, separate processes or containers, and whether the framework has "multi-agent" in its docs. Copilot subagents are hierarchical, separately-invoked, and unambiguously one principal.

Two things to bake in so the definition survives contact with operations. First, **it's a per-run classification, not an architecture label** — attach an MCP server that is itself an agent holding its own credentials, and a single structured agent becomes multi-agent at runtime, with no code change and no one filing a design doc. Your classifier has to run at composition time. Second, **one obligation is unconditional on both sides**: any loop's output entering another loop's context is untrusted content. Subagents don't get a trust exemption for sharing a principal. That's Principle 1, and it does not care about this taxonomy at all.

The line only tells you whether authority composes. It never tells you that trust does.