# AgentiCare

**An Autonomous Agentic AI Engine for Continuous Customer Engagement on Yono**

Built for the **SBI Hackathon @ GFF 2026** - Focus Area: *Digital Engagement (Pillar 03)*.

AgentiCare is a working demo prototype of an agentic engagement system. Instead of relying on static, manually configured campaign rules, it continuously evaluates customer behavioural signals, autonomously reasons over multiple candidate actions, validates the chosen action against compliance guardrails, and (in this demo) simulates dispatching a personalised nudge - all without a human designing each trigger by hand.

## Problem Statement

Banks today face increasing challenges in acquiring customers at scale, driving adoption of digital products, and creating meaningful long-term engagement. This prototype addresses the **Digital Engagement** pillar: creating AI-driven engagement models that proactively interact with customers based on behaviour, financial patterns, and life events.

## What This Demo Does

1. Loads mock customer signal data (balances, transaction recency, FD maturity dates, EMI due dates, etc.)
2. Runs each customer through three trigger evaluators (Dormancy Reactivation, FD/RD Maturity Cross-sell, EMI-Proximity Support)
3. **Agent Reasoning** picks the single highest-relevance action per customer - avoiding notification fatigue from firing multiple triggers at once
4. **Compliance Guardrail** validates the action (consent check, frequency cap, minimum relevance threshold) before allowing execution
5. Displays the live decision feed on a dashboard, with a "Run Agent Cycle" button that simulates a fresh signal tick

This mirrors the six-stage pipeline described in the pitch deck: **Signal Ingestion → State Evaluation → Agent Reasoning → Compliance Guardrail → Action Execution → Feedback Loop**.

## Project Structure

```
AgentiCare/
├── backend/
│   ├── server.js              # Express API server
│   ├── agent/
│   │   ├── reasoning.js       # Core agent: aggregates triggers, prioritises action
│   │   ├── guardrails.js      # Compliance/consent/frequency-cap validation
│   │   └── triggers/
│   │       ├── dormancy.js
│   │       ├── fdMaturity.js
│   │       └── emiProximity.js
│   ├── data/
│   │   └── customers.json     # Mock customer signal dataset
│   └── package.json
├── dashboard/
│   ├── index.html             # Live decision feed UI
│   ├── style.css
│   └── app.js
└── docs/
    └── architecture.md        # Process flow & architecture notes
```

## Running Locally

Requires Node.js 18+.

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:4000** in your browser. The dashboard is served directly by the backend.

### API Endpoints

| Method | Endpoint          | Description                                              |
|--------|-------------------|------------------------------------------------------------|
| GET    | `/api/customers`  | Raw mock customer signal data                              |
| GET    | `/api/decisions`  | Runs the full agent pipeline, returns a decision per customer |
| POST   | `/api/simulate`   | Nudges signal data forward one "tick" and re-runs the agent |
| GET    | `/api/health`     | Health check                                                |

## Why This Approach

- **Not a chatbot** - the agent doesn't wait to be asked. It observes, decides, and acts.
- **Auditable by design** - every decision includes the reasoning trail and the guardrail outcome, which matters for banking compliance.
- **Modular triggers** - new engagement triggers can be added as independent files under `agent/triggers/` without touching the reasoning or guardrail layers.
- **Production path** - the `agent/reasoning.js` scoring logic is a stand-in for an LLM-based reasoning layer (e.g. Claude with tool-calling) that would replace the rule-based scoring with genuine contextual reasoning, while keeping the same guardrail and execution structure.

## Roadmap

See the pitch deck (`docs/` or hackathon submission) for the full 4-phase roadmap: Pilot → Expand Triggers → Channel Expansion → Bank-wide Rollout.

## License

MIT - see [LICENSE](LICENSE).
