---
apr: 12
title: "A Federated-Composition Principle for Promptware Across Trust Domains"
abstract: "When farms compose across a trust/identity boundary (a federation), the boundary is explicit: membership is governed (central authority by default), participants are authenticated, and cross-domain trust is non-transitive and least-privilege. Membership proves identity, not blanket trust."
status: Draft
version: 0.1.0
principals:
  - D. Maxios
generative-contributors:
  - "Claude Opus 4.8 (Anthropic; 1M context)"
created: 2026-05-31
last-updated: 2026-05-31
audience: Architects of multi-farm, multi-team, or cross-organizational agent systems; platform teams running several farms under shared identity; anyone exposing or consuming agents across a trust boundary
supersedes: []
superseded-by: []
related:
  - APR-005
  - APR-006
  - APR-009
  - APR-010
tags:
  - federation
  - cross-domain
  - identity
  - trust
  - multi-farm
---

# APR-012 — A Federated-Composition Principle for Promptware Across Trust Domains

> **When agent systems compose across a trust/identity boundary — a *federation* — the boundary is explicit: membership is governed, newcomer participants are authenticated, and cross-domain trust is least-privilege and non-transitive, never ambient.**

*Injectable summary (for feeding to an LLM): [`digests/APR-012-federated-composition.md`](digests/APR-012-federated-composition.md). This full APR is canonical.*

## Motivation

The corpus stops at the single system. ASPECT specs a component; [APR-006](APR-006-composition-topology.md) governs the delegation graph *within* one system (a **farm**); [APR-005](APR-005-trust-boundaries.md) governs trust at *that* system's ingress. Nothing governs **scale beyond one system** — when multiple farms compose under a shared security/identity domain, or across domains.

Without a principle, cross-farm composition has **no membership governance** (who is in the federation?), **no authentication of newcomer farms** (is this farm who it claims to be?), and **ambient cross-domain trust** — a farm in domain A implicitly trusting calls and outputs from domain B. That is APR-005's trust-boundary failure, reappearing at the inter-system scale. As agent interoperability crosses organizational boundaries (A2A, MCP, agent marketplaces), this is a real and ungoverned surface.

## The principle

> **A federation boundary is a trust boundary. Crossing it is explicit: prove identity (authenticate), govern who may join (membership), and grant only least-privilege, non-transitive trust — never inherit it from membership.**

## Scope vocabulary

Defined terms — *scope vocabulary*, not a tiered reference model:

- **Farm** — an orchestrated multi-agent system (APR-006's domain; already used informally in OBSERVE).
- **Federation** — a set of farms sharing one trust/identity domain, with governed membership.
- **Cross-federation** — peer-to-peer interaction *between* federations (no shared domain); a noted extension (below), not the core.

## Scope and applicability

### When this applies

- Agent systems (farms) composing across a trust/identity boundary — within a shared security domain (federation) or across domains.

### When this does NOT apply

- Single-farm composition (that is [APR-006](APR-006-composition-topology.md)).
- It is **not** a reference architecture or a tiered "levels" model — the project declines RA status (OBSERVE §13); this is a *principle* about the boundary.
- It is **not** an identity-provider or AuthN-protocol specification (OIDC, SPIFFE, SAML are implementations); it says the boundary must be governed and authenticated, not which protocol.

## Membership is governed

- Federation membership **MUST** be governed by an **explicit authority**.
- A **central authority** (a "Federation Master" / trust-domain authority, à la SPIFFE) is the **default at the single-domain (federation) scale** — simpler and auditable. **Decentralized / mutual** governance is **permitted**, and is expected for cross-federation interaction.
- Joining, leaving, and suspension are governed events, recorded and audited (per [APR-010](APR-010-governance.md)).

## Participants are authenticated

- A participant farm **MUST** be **authenticated** before it participates — an unauthenticated farm is not a member.
- Identity is at the **farm level by default** (the farm authenticates as a unit); it is at the **agent level where finer cross-domain authorization is required** (SPIFFE-style per-workload identity).

## Cross-domain trust is non-transitive and least-privilege

- **Membership establishes identity, not trust.** Being in the federation lets you *authenticate* a peer; it does **not** grant blanket access.
- Cross-farm trust **MUST** be **explicit, per-relationship, and least-privilege** — **non-transitive**. A compromised member does not thereby reach everyone.
- A federated peer's authority **MUST** be bounded by what its domain is granted — [APR-006](APR-006-composition-topology.md)'s authority attenuation, extended across the boundary; escalation **MUST** be explicit and audited ([APR-009](APR-009-human-in-the-loop.md)).
- A peer farm's calls and outputs are **untrusted input** crossing a domain boundary ([APR-005](APR-005-trust-boundaries.md)); federation authenticates *who*, never *what they may do*.

## Cross-federation (L4) — a noted extension

When federations interact with no shared trust domain (federation-of-federations), the model is inherently **peer-to-peer**: there is no central authority, so trust is **pairwise and negotiated** between domains (analogous to inter-AS peering). The principles above still hold — explicit boundary, authentication, non-transitive least-privilege trust — but the *authority* is mutual rather than central. This APR **notes** this extension; it does not fully specify it, to avoid designing for a scale ahead of practice.

## Prescription

- Composition across a trust/identity boundary **MUST** treat the boundary as explicit; **ambient cross-domain trust is forbidden**.
- Federation membership **MUST** be governed by an explicit authority — central by default at the federation scale; decentralized permitted (and expected cross-federation).
- A participant farm **MUST** be authenticated before participating; identity is farm-level by default, agent-level where finer authorization is needed.
- Federation membership establishes **identity, not trust**; cross-farm trust **MUST** be explicit, per-relationship, and least-privilege (**non-transitive**).
- A federated peer's authority **MUST** be bounded by its domain's grant (attenuation across the boundary); its output is untrusted input (APR-005); escalation **MUST** be explicit and audited.
- Membership and cross-domain trust changes **MUST** be governed (APR-010: ADR + audit).

## Governance and validation

The shared governance model — two-tier enforcement, audit-log binding, and change-via-ADR — is defined in [APR-010](APR-010-governance.md); the checks below are this APR's domain-specific additions.

A conformant platform checks, in review or CI:

- **Explicit boundary** — cross-domain composition declares the federation boundary; no ambient trust.
- **Membership governance** — an authority governs join/leave/suspend; events are audited.
- **Authentication** — participant farms (or agents) are authenticated before participating.
- **Non-transitive trust** — cross-farm grants are explicit, per-relationship, least-privilege; membership grants no implicit access.
- **Attenuation** — no federated peer exceeds the authority its domain was granted; escalations are explicit.

## What this principle is NOT

- **Not a reference architecture or levels model.** It is a principle about the cross-domain boundary; "farm/federation" are scope vocabulary.
- **Not an identity/AuthN protocol.** OIDC, SPIFFE, SAML implement it; it does not mandate one.
- **Not intra-farm composition.** That is APR-006; this is the inter-system layer above it.
- **Not a guarantee against a compromised member.** Non-transitive, least-privilege trust *bounds* the blast radius; it does not eliminate it.
- **Not a full specification of cross-federation (L4).** That peer-to-peer scale is noted, not designed.

## Relationship to established patterns

| Pattern | What it shares with this APR | What this APR adds |
|---|---|---|
| **SPIFFE / SPIRE** (trust domains + federation) | Identity across trust domains with a federation authority | Applied to agent *farms*, with non-transitive least-privilege trust layered on identity |
| **OIDC / SAML identity federation** | Cross-domain authentication | Farm/agent identity federation for promptware; membership = identity, **not** trust |
| **A2A / MCP** (agent & tool interop) | Agents/systems interacting across boundaries | The *governance* the boundary needs — membership, authentication, least-privilege trust — not just the wire protocol |
| **BGP / inter-AS peering** | Peer-to-peer trust between autonomous domains | The cross-federation (L4) analogue — noted, not specified |
| **Kubernetes multi-cluster / service-mesh federation** (Istio) | Composing clusters under federated control | Composing agent farms under a federation authority, with promptware trust semantics |

The novel contribution is a **promptware-specific federated-composition principle**: explicit governed membership, authenticated participants, and non-transitive least-privilege cross-domain trust with authority attenuation — the inter-system layer above APR-006, extending APR-005's trust discipline to the federation boundary.

## References

External sources referenced in this APR; see *Relationship to established patterns* for how each relates.

1. SPIFFE. *SPIFFE — Secure Production Identity Framework for Everyone (trust domains & federation)*. <https://spiffe.io/>
2. OpenID Foundation. *How OpenID Connect works*. <https://openid.net/developers/how-connect-works/>
3. A2A Project. *Agent2Agent (A2A) Protocol*. <https://github.com/a2aproject/A2A>
4. Anthropic. *Model Context Protocol (MCP)*. <https://modelcontextprotocol.io/>
5. Rekhter, Y., Li, T., Hares, S. *RFC 4271 — A Border Gateway Protocol 4 (BGP-4)*. IETF, 2006. <https://www.rfc-editor.org/rfc/rfc4271>

## Adoption notes

- **Start with identity.** Authenticate farms before any cross-domain call; a farm with no verified identity is not a member.
- **Default to non-transitive.** Grant cross-farm authority per relationship, least-privilege — never let membership imply access.
- **Pick a federation authority early** (even a simple central one); decentralize only when you genuinely span trust domains (cross-federation).
- **Treat a peer farm's output as untrusted input** (APR-005) — federation establishes *who*, not *what they may do*.

## Change log

| Version | Date | Status | Change |
|---|---|---|---|
| 0.1.0 | 2026-05-31 | Draft | Initial draft published as APR-012. |
