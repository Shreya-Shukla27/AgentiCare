# Architecture & Process Flow

## Pipeline Overview

```
 SENSE                    DECIDE                       ACT & LEARN
┌──────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  ┌──────────────┐
│   Signal     │→│     State      │→│     Agent      │→│  Compliance   │→│     Action      │→│   Feedback   │
│  Ingestion   │  │   Evaluation   │  │   Reasoning    │  │   Guardrail   │  │   Execution     │  │     Loop     │
└──────────────┘  └───────────────┘  └───────────────┘  └───────────────┘  └────────────────┘  └──────────────┘
```

1. **Signal Ingestion** — Transaction and account event stream (mocked in `backend/data/customers.json`, would be a live Kafka/event-bus feed in production).
2. **State Evaluation** — Each trigger evaluator (`backend/agent/triggers/*.js`) independently checks the customer's current state against its own thresholds and returns a scored candidate action, or `null` if not relevant.
3. **Agent Reasoning** — `backend/agent/reasoning.js` collects all candidate actions and picks the single highest-scoring one. In production this stage would be an LLM agent with tool-calling, reasoning over context in natural language rather than a fixed scoring formula — the current implementation is a deterministic stand-in for that reasoning layer, chosen so the demo runs without external API dependencies.
4. **Compliance Guardrail** — `backend/agent/guardrails.js` performs deterministic checks (marketing consent, notification frequency cap, minimum relevance threshold) that run *after* reasoning and *before* execution. This separation ensures no AI-generated action reaches a customer without passing a hard compliance boundary.
5. **Action Execution** — In this demo, execution is simulated (the action + guardrail outcome is returned via the API). In production this stage would dispatch to the appropriate Yono channel (push notification, in-app card, SMS).
6. **Feedback Loop** — The `/api/simulate` endpoint advances signal state by one tick to illustrate how the agent's decisions would evolve over time as real transaction data changes. In production, actual customer responses (opened / ignored / converted) would feed back into trigger threshold tuning.

## Trigger Design

Each trigger is a pure function: `(customer) => candidateAction | null`. This keeps the system modular — adding a new engagement trigger (e.g. a new life-stage signal) means writing one new file and registering it in `TRIGGER_EVALUATORS`, with no changes needed to the reasoning or guardrail layers.

## Guardrail Design

Guardrails are intentionally deterministic and separate from the reasoning layer, even though reasoning could theoretically be extended to consider consent and frequency itself. Keeping guardrails as a distinct, auditable, rule-based layer means compliance behaviour is predictable and testable independent of any LLM's behaviour — an important property for banking use cases.

## From Demo to Production

| Demo (this repo)                     | Production equivalent                                  |
|---------------------------------------|----------------------------------------------------------|
| `customers.json` mock file            | Live event stream from core banking / Yono data pipeline |
| Deterministic scoring in triggers     | LLM agent (e.g. Claude with tool-calling) for reasoning + personalised message generation |
| `/api/simulate` tick                  | Real-time event-driven orchestration (queue/scheduler)   |
| In-memory decision response           | Postgres-backed decision log for compliance auditability |
| Dashboard "Run Agent Cycle" button    | Automatic, continuous background execution               |
