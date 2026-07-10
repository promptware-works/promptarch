# Harness Engineering Primitives

## Claude Code Opus 4.8

**A tightened set**, grouped by what each layer owes:

*Authored (design-time, versioned, reviewed)*

1. Instructions and Skills — governed promptware artifacts

*Authority (cross-checked by everything below)*

2. Principals, Permissions, and Trust Labels

*Per-call composition*

3. Context Assembly
4. Context Reduction

*Capability*

5. Tools
6. Execution Environment

*Persistence*

7. Durable State and Memory

*Control*

8. Orchestration — loop, termination, recursion, delegation
9. Budget and Resource Governance
10. Failure and Degradation Control

*Assurance and interface*

11. Verification — in-path gates
12. Observability — out-of-path traces
13. Human Interaction — escalation, confirmation, disclosure
14. Evaluation — offline, design-time

Fourteen isn't sacred; the groupings are the point. Merge 3+4, merge 9 into 8, and you're back to ten with nothing homeless.

**The decision to force before you publish this:** is Authority a *primitive* or a *cross-cutting concern*? Cross-cutting is intellectually cleaner — it genuinely touches every other primitive. But cross-cutting concerns have no owner, no code home, and no test suite, and they are enforced by convention, which is to say not enforced. Making it a primitive is slightly wrong on the ontology and exactly right on the engineering. I'd take the ontology hit.

## OBSOLETE

1. Instructions
2. Context Delivery
3. Context Management
4. Tools
5. Execution Environment
6. Durable State
7. Orchestration
8. Subagents
9. Skills and Procedure
10. Verification and Observability