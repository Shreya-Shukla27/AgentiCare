const { evaluateDormancy } = require("./triggers/dormancy");
const { evaluateFdMaturity } = require("./triggers/fdMaturity");
const { evaluateEmiProximity } = require("./triggers/emiProximity");
const { applyGuardrails } = require("./guardrails");

const TRIGGER_EVALUATORS = [evaluateDormancy, evaluateFdMaturity, evaluateEmiProximity];

/**
 * Runs the full agentic pipeline for a single customer:
 * 1. Signal Ingestion   -> customer object (already ingested upstream)
 * 2. State Evaluation   -> each trigger evaluator checks thresholds
 * 3. Agent Reasoning     -> pick the single highest-relevance candidate
 * 4. Compliance Guardrail -> validate before execution
 * 5. Action Execution    -> (simulated) dispatch payload
 * 6. Feedback Loop       -> (simulated) logged for future refinement
 */
function runAgentForCustomer(customer) {
  // Stage 2: State Evaluation - gather all candidate actions
  const candidates = TRIGGER_EVALUATORS
    .map(evaluate => evaluate(customer))
    .filter(Boolean);

  // Stage 3: Agent Reasoning - prioritise the single best action
  candidates.sort((a, b) => b.score - a.score);
  const chosen = candidates[0] || null;

  // Stage 4: Compliance Guardrail
  const guardrail = applyGuardrails(customer, chosen);

  // Stage 5: Action Execution (simulated dispatch)
  const executed = guardrail.allowed;

  return {
    customerId: customer.id,
    customerName: customer.name,
    segment: customer.segment,
    candidatesConsidered: candidates.length,
    allCandidates: candidates.map(c => ({ trigger: c.trigger, score: c.score })),
    chosenAction: chosen,
    guardrail,
    executed,
    timestamp: new Date().toISOString()
  };
}

function runAgentForAllCustomers(customers) {
  return customers.map(runAgentForCustomer);
}

module.exports = { runAgentForCustomer, runAgentForAllCustomers };
