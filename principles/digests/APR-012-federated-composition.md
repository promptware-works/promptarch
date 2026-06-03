# APR-012 — Federated Composition Across Trust Domains — Digest

> **Generated digest of [APR-012 — A Federated-Composition Principle for Promptware Across Trust Domains](../APR-012-federated-composition.md) v0.1.0.** The full APR is authoritative — read it for motivation, prior art, and worked detail. Do not edit by hand.

**Abstract.** When farms compose across a trust/identity boundary (a federation), the boundary is explicit: membership is governed (central authority by default), participants are authenticated, and cross-domain trust is non-transitive and least-privilege. Membership proves identity, not blanket trust.

**Principle.** A federation boundary is a trust boundary. Crossing it is explicit: prove identity (authenticate), govern who may join (membership), and grant only least-privilege, non-transitive trust — never inherit it from membership. The inter-system layer above APR-006.

## Scope vocabulary

- **Farm** — an orchestrated multi-agent system (APR-006's domain).
- **Federation** — a set of farms sharing one trust/identity domain, with governed membership.
- **Cross-federation (L4)** — peer-to-peer between federations (no shared domain); a noted extension, not the core.

## Normative rules

- Cross-boundary composition MUST treat the boundary as explicit; **ambient cross-domain trust is forbidden**.
- Membership MUST be governed by an explicit authority — **central by default** at the federation scale; decentralized permitted (and expected cross-federation).
- A participant farm MUST be **authenticated** before participating; identity is **farm-level by default, agent-level where finer authz is needed** (SPIFFE-style).
- Membership establishes **identity, not trust**; cross-farm trust MUST be explicit, per-relationship, least-privilege — **non-transitive**.
- A federated peer's authority MUST be bounded by its domain's grant (APR-006 attenuation across the boundary); its output is untrusted input (APR-005); escalation MUST be explicit and audited (APR-009).
- Membership and cross-domain trust changes MUST be governed (APR-010: ADR + audit).

## Cross-federation (L4)

Inherently peer-to-peer: no central authority, so trust is **pairwise and negotiated** between domains (cf. inter-AS peering). The principles still hold; the authority is mutual rather than central. Noted, not fully specified.

## Governance checks

*(Shared model — two-tier, audit-binding, change-via-ADR — per APR-010.)* Explicit boundary (no ambient trust) · membership authority governs join/leave/suspend (audited) · participants authenticated · cross-farm grants explicit/per-relationship/least-privilege (non-transitive) · no peer exceeds its domain's granted authority.

## Scope limits — do NOT misapply

Not a reference architecture / levels model (a principle about the boundary) · not an identity/AuthN protocol (OIDC/SPIFFE/SAML implement it) · not intra-farm composition (that's APR-006) · not a guarantee against a compromised member (bounds blast radius, doesn't eliminate it) · not a full spec of cross-federation/L4 (noted only).

---
*Source: [APR-012 — A Federated-Composition Principle for Promptware Across Trust Domains](../APR-012-federated-composition.md) v0.1.0 · regenerate this digest whenever the source changes.*
