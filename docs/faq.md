# FAQ

## Is PROMPTARCH a framework I install?

No. PROMPTARCH publishes architectural *principles* (APRs). It is not a runtime, library, or framework. Adopters apply the principles to their own systems; PROMPTARCH may, over time, publish optional tooling under [`tools/`](../tools/) to help validate adoption, but the principles stand on their own.

## How is an APR different from an ADR?

An **ADR** captures a decision for one specific project at one moment in time ("we will use PostgreSQL for the order service, because..."). An **APR** captures a principle intended to hold across projects and to remain durable over years ("non-behavioral content is organised separately from behavioral prose..."). PROMPTARCH uses ADRs only for decisions about *the project itself* (e.g., licence choice); everything in `principles/` is an APR.

See [`meta/apr-process.md`](../meta/apr-process.md) for the APR lifecycle.

## Is PROMPTARCH affiliated with any vendor or platform?

No. PROMPTARCH is intentionally vendor-neutral. APRs MAY mention specific products by name when discussing prior art or examples (e.g., naming "Open Policy Agent" or "Braintrust" in a comparison table) but do not endorse, require, or depend on any specific vendor.

## Can I use an APR before it reaches `Accepted` status?

You can, but cite it with the status noted: "APR-001 ASPECT v0.1.0 (Draft)". A `Draft` APR may change substantively before acceptance, so build with the expectation that you may need to update if and when the APR's `Accepted` form differs from the `Draft` you adopted.

## How do I propose a new APR?

Open an issue in the repository following the structure in [`meta/apr-process.md`](../meta/apr-process.md). Substantive review happens at issue stage — before any prose is written — to avoid wasting effort on proposals that aren't a fit.

## How is PROMPTARCH licensed?

It is dual-licensed: prose and documentation under **CC BY 4.0**, and code (schemas, tooling) under **Apache 2.0**. CC BY fits a citable principles corpus and requires attribution on reuse; Apache 2.0 gives code adopters an explicit patent grant. The full reasoning is in [`meta/decisions/ADR-002-license.md`](../meta/decisions/ADR-002-license.md), which supersedes the project's original MIT decision ([ADR-001](../meta/decisions/ADR-001-license.md)).

## What if I disagree with an APR?

Open an issue. Disagreements expressed with concrete reasoning often produce better APRs — either by improving the existing one or by inspiring a superseding APR. Disagreements expressed as vague displeasure are less useful and may be closed without action.

## Is PROMPTARCH a Reference Architecture in the IEEE 42010 sense?

No, and it deliberately doesn't claim to be. APRs are *principles* — each is a named, teachable rule with clear scope and limits. A Reference Architecture would additionally specify stakeholder concerns, quality-attribute scenarios, viewpoints, and variability points validated across multiple instances. That work has not been done.

If APRs accumulate to the point that a Reference Architecture becomes possible and useful, the project may publish one as a separate artifact, citing the underlying APRs.

## How do I cite an APR in a paper or blog post?

Cite the APR by its full ID, title, version, and source URL. Example:

> APR-001 ASPECT — A Prompt Framework for Agent & Skill Specifications, v0.1.0. PROMPTARCH, 2026. https://github.com/&lt;org&gt;/promptarch/blob/main/principles/APR-001-aspect.md

The version is important — if you cite a `Draft` APR, name the version so future readers can reconstruct what you saw at the time of writing.
