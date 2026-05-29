# Glossary

Terminology used across PROMPTARCH APRs. Definitions here are framework-level — individual APRs MAY refine a term within their own scope, but MUST NOT contradict the framework-level meaning.

## Agent

A *stateful actor* with identity, authority, and routing logic. Agents decide what to do next, hold context across turns, and may invoke skills, tools, or other agents. Contrast with **skill**.

## Agentic AI

A class of AI systems in which one or more LLM-based agents make decisions, invoke tools or other agents, and produce consequential actions — as opposed to single-turn question-answer systems. PROMPTARCH targets the architecture of such systems.

## APR — Architectural Principle Record

A durable, numbered, citable description of one architectural principle for promptware. See [`README.md`](README.md) for the contrast with ADRs.

## ADR — Architectural Decision Record

A point-in-time decision record for one project. PROMPTARCH uses ADRs only in [`meta/decisions/`](meta/decisions/) for decisions about the project itself; everything in [`principles/`](principles/) is an APR.

## Behavioral content

Prompts, skill prose, agent definitions — the imperative content an LLM reads to know *what to do*. Contrast with **non-behavioral content** (concepts, values, rules, shapes, examples, evals). The distinction is the central premise of APR-002 OBSERVE.

## Loader / Orchestrator

The runtime component that sits between "decide to delegate to a skill" and "send a prompt to the LLM." The loader resolves declared references, injects content, and writes audit-log entries. Several APRs assume a loader exists; platforms without one cannot conform to those APRs without first adding one.

## Promptware

Software whose dominant behavior is shaped by prompts and natural-language specifications consumed by LLM agents, rather than by deterministic code paths. Editing a Markdown or YAML file in a promptware system can materially change runtime behavior, because that file is loaded into an agent's context at execution time.

The term exists to distinguish *content-centric* software (where the operative content is prose) from *code-centric*, deterministic software. PROMPTARCH is the principles layer for the former.

## Skill

A *stateless transform* with schema-bound inputs and outputs. Skills do one thing, repeatably, with declared I/O contracts. Contrast with **agent**.

---

Additional terms are defined within the APR that introduces them. Where a term is shared across multiple APRs, it should be promoted to this glossary.
