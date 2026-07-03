/**
 * Compliance Guardrail Layer
 * Deterministic rule checks applied AFTER agent reasoning and BEFORE
 * dispatch. Any action failing a guardrail is blocked, never sent.
 */
function applyGuardrails(customer, candidateAction) {
  if (!candidateAction) {
    return { allowed: false, reason: "No candidate action generated." };
  }

  if (!customer.consentMarketing) {
    return { allowed: false, reason: "Customer has not consented to marketing/engagement outreach." };
  }

  if (customer.lastNudgeDaysAgo < 1) {
    return { allowed: false, reason: "Notification fatigue guardrail: customer already contacted within the last day." };
  }

  if (candidateAction.score < 30) {
    return { allowed: false, reason: "Relevance score below minimum action threshold (30)." };
  }

  return { allowed: true, reason: "Passed consent, frequency-cap, and relevance checks." };
}

module.exports = { applyGuardrails };
