# APR Statuses

Every APR carries a `status` field in its frontmatter. The allowed values and transitions are defined here.

## States

| Status | Meaning | Can be cited as authoritative? |
|---|---|---|
| `Draft` | Author is actively writing. Content may change at any time. | No. |
| `Proposed` | Author considers the draft complete and is seeking review. Content is stable enough to evaluate but may still change in response to review. | Cautiously — note the status when citing. |
| `Accepted` | The APR has been reviewed and merged. Editorial fixes are allowed; semantic changes require a version bump or a new APR. | **Yes.** |
| `Deprecated` | The APR is no longer recommended but has no direct replacement. Reasons (changed industry context, scope contracted) should be recorded in the APR's "Change Log" section. | No — flag the deprecation when citing historically. |
| `Superseded` | A newer APR replaces this one. The `superseded-by` field MUST be populated. | No — cite the superseding APR instead. |
| `Withdrawn` | The APR was retracted before acceptance (only valid from `Draft` or `Proposed`). The file is kept for historical reference but not maintained. | No. |

## Transitions

```text
Draft ──────► Proposed ─────► Accepted ─┬──► Deprecated
   │              │                     │
   │              │                     └──► Superseded   (also requires superseded-by)
   │              │
   ▼              ▼
Withdrawn     Withdrawn
```

Notes:

- An `Accepted` APR cannot be returned to `Proposed` or `Draft`. To revise the principle, either (a) bump the version of the same APR for editorial / minor changes, or (b) author a new APR that *supersedes* the existing one for semantic changes.
- An APR cannot move from `Deprecated` back to `Accepted`. To revive a deprecated principle, author a new APR.
- `Withdrawn` is terminal — no further transitions.

## Version field

The `version` field is independent of `status`. A typical lifecycle:

| Event | Status | Version |
|---|---|---|
| First draft committed | `Draft` | `0.1.0` |
| Re-drafted after review | `Draft` | `0.2.0` |
| Submitted for final review | `Proposed` | `0.2.0` |
| Merged | `Accepted` | `1.0.0` |
| Editorial fix months later | `Accepted` | `1.0.1` |
| Wording tightened, no semantic shift | `Accepted` | `1.1.0` |
| Replaced by APR-NNN | `Superseded` | (frozen at last accepted version) |

The first `Accepted` version is conventionally `1.0.0`. Drafts use `0.x` to signal pre-acceptance.
