# Study: Extensible component-metadata (a registry for DECLARE fields)

*Status: design study (informative). Feeds the APR-014 amendment that introduces a
component-metadata registry. Not itself an APR.*

## Problem

[APR-014 DECLARE](../../principles/APR-014-declare.md) organizes a component's
frontmatter metadata into clusters (`classification`, `operability`, `provenance`,
`evaluation`, `composition`) carried under a top-level `metadata` object. Each
*field* in those clusters is owned by some principle — `exec_form` by APR-003,
`skill_kind` by APR-007, `trust_level` by APR-005, `agency` by APR-006, the
autonomy/escalation set by APR-009, and so on.

Today APR-014 **enumerates** those fields inline (a cluster catalog plus an
"axis → owner" list). That makes every new metadata attribute a change to APR-014:

- **Coupling / god-object.** APR-014 must be edited every time any other APR
  introduces a field. It becomes the one file the whole corpus depends on.
- **Version churn.** APR-014's version bumps on changes that are really about
  APR-003, APR-009, etc. (Observed directly: the `exec_form` rename and the
  APR-009 autonomy ratification both forced APR-014 edits and bumps.)
- **Single edit-contention point.** Two APRs adding fields concurrently both touch
  the same lists.

This violates the Open/Closed Principle at the corpus level: DECLARE should be
*closed for modification, open for extension*.

## Prior art

The canonical solution is **IANA registries governed by RFC 8126 / BCP 26**
("Guidelines for Writing an IANA Considerations Section in RFCs"):

- The base spec defines a **registry** and a **registration policy**; it does not
  enumerate the values.
- Each new spec that needs a value adds an **"IANA Considerations"** section that
  *registers* it — the base spec never changes.
- Registration policies scale the bar: *Specification Required*, *Expert Review*,
  *First Come First Served*, *Standards Action*, plus a *Private Use / vendor tree*
  (`x-`, `vnd.`) for un-registered extensions.

Concrete instances to mirror: the HTTP field-name registry; media types
(RFC 6838) with its `vnd.`/`x.` trees; URI schemes. Adjacent models: OpenAPI `x-`
extensions (namespaced, no central edit); Kubernetes API groups and
domain-prefixed annotations (`prometheus.io/scrape`); RDF / Dublin Core
vocabularies (namespace-owned terms composed by application profiles). PROMPTARCH
is already RFC-flavoured (APRs ≈ RFCs), so an IANA-style registry is a natural fit.

## Proposed mechanism

**A registry file** — `registries/component-metadata.yaml` — as the single source
of truth for canonical fields: `name`, `cluster`, `owner` (APR), `type`/`values`,
`status`, `since`. Plus:

- **Ownership + collision.** Every canonical field has exactly one owning APR;
  names are unique across the registry (collision = validation error).
- **Registration policy** (scaled from RFC 8126):
  - *Corpus/canonical fields* → **"APR Review"**: a field enters the registry only
    via the APR that owns it, through a **"Metadata registrations"** section (the
    IANA-Considerations analogue). On acceptance the entries flow into the registry.
  - *Platform/vendor fields* → **no registration**: they live under `metadata` as
    namespaced custom keys (`x-<vendor>` / reverse-DNS), un-governed by the corpus —
    exactly like IANA's `x-`/vendor tree. (`domain` is an example of a custom field.)
- **APR-014's role shrinks** to defining the `metadata` container, the cluster set,
  the registry's existence, the registration policy, and the collision rule. Its
  inline field lists become a *pointer* to the registry (authoritative), not a
  hand-maintained enumeration.
- **Tooling** (follow-up): one CI check that the registry is internally consistent,
  that every canonical field a component uses is registered (or is a namespaced
  custom key), and — optionally — that any doc "field tables" are generated from the
  registry so they cannot drift.

### Registry entry shape

```yaml
- name: exec_form
  cluster: classification
  owner: APR-003
  type: enum
  values: [code, prompt]
  since: "APR-003 0.1.5"
  status: active
```

## Recommendation

**Amend APR-014** (the registry belongs to the metadata contract's domain) and add
the registry as a **separate machine-readable artifact** (registries live and change
far more often than a frozen principle — the same reason IANA registries are not
inside the RFC). Three pieces:

1. **APR-014 amendment** — define the registry, registration policy, ownership +
   collision rules; replace the inline enumerations with a pointer to the registry.
2. **`registries/component-metadata.yaml`** — seeded with the fields already
   introduced across the corpus.
3. **Template + `apr-process.md` hook** — a "Metadata registrations" section so each
   new APR registers its own fields.

A *new* APR (treating "metadata evolution" as its own principle, adjacent to
APR-010 governance) is defensible but over-splits a single cohesive contract.

**Payoff.** Two standing threads dissolve into local edits: "close the DECLARE loop"
becomes *APR-009 registers its own fields*; "sweep other APRs for metadata-in-body"
becomes *each APR registers what it introduced* — none of them touch APR-014.

## References

1. Cotton, M., Leiba, B., Narten, T. *Guidelines for Writing an IANA Considerations Section in RFCs (RFC 8126 / BCP 26)*. IETF, 2017. <https://datatracker.ietf.org/doc/html/rfc8126>
2. Freed, N., Klensin, J., Hansen, T. *Media Type Specifications and Registration Procedures (RFC 6838)*. IETF, 2013. <https://datatracker.ietf.org/doc/html/rfc6838>
3. IANA. *Protocol Registries*. <https://www.iana.org/protocols>
4. OpenAPI Initiative. *Specification Extensions (`x-`)*. <https://spec.openapis.org/oas/latest.html#specification-extensions>
5. Kubernetes. *Custom Resources & API groups*. <https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/>
