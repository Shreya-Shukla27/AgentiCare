/**
 * Dormancy Reactivation Trigger
 * Detects declining activity and low balances; proposes a reactivation nudge
 * before the account slips into full dormancy.
 */
function evaluateDormancy(customer) {
  const { daysSinceLastTxn, balance, avgMonthlyTxnCount } = customer;

  if (daysSinceLastTxn < 30) return null;

  // Urgency scales with inactivity and low engagement, capped at 100
  let score = Math.min(100, daysSinceLastTxn * 0.6 + (avgMonthlyTxnCount === 0 ? 20 : 0));
  if (balance < 5000) score += 10;
  score = Math.min(100, Math.round(score));

  if (score < 40) return null;

  return {
    trigger: "dormancy_reactivation",
    title: "Dormancy Reactivation",
    score,
    reasoning: `No meaningful activity for ${daysSinceLastTxn} days (avg ${avgMonthlyTxnCount} txns/month). ` +
      `Balance ₹${balance.toLocaleString("en-IN")} is at risk of becoming fully dormant.`,
    message: `We miss you! Come back to Yono and get a small cashback on your next transaction within 7 days.`,
    channel: "push_notification"
  };
}

module.exports = { evaluateDormancy };
