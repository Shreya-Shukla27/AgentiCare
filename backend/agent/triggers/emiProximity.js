/**
 * EMI-Proximity Support Trigger
 * Identifies cash-flow stress ahead of EMI due dates and offers relevant
 * support - reminders, top-up options, or advisory nudges.
 */
function evaluateEmiProximity(customer) {
  const { emiDueInDays, emiAmount, balance } = customer;

  if (emiDueInDays === null || emiDueInDays === undefined) return null;
  if (emiDueInDays > 7) return null;

  const shortfall = emiAmount - balance;
  let score = Math.max(0, 90 - emiDueInDays * 8);
  if (shortfall > 0) score += 25;
  score = Math.min(100, Math.round(score));

  if (score < 30) return null;

  const stressed = shortfall > 0;
  return {
    trigger: "emi_proximity_support",
    title: "EMI-Proximity Support",
    score,
    reasoning: stressed
      ? `EMI of ₹${emiAmount.toLocaleString("en-IN")} is due in ${emiDueInDays} day(s) but current balance ` +
        `(₹${balance.toLocaleString("en-IN")}) falls short by ₹${shortfall.toLocaleString("en-IN")}.`
      : `EMI of ₹${emiAmount.toLocaleString("en-IN")} is due in ${emiDueInDays} day(s). Balance is sufficient; sending a courtesy reminder.`,
    message: stressed
      ? `Your EMI of ₹${emiAmount.toLocaleString("en-IN")} is due in ${emiDueInDays} day(s). Your balance may fall short — explore a quick top-up option to avoid a missed payment.`
      : `Reminder: your EMI of ₹${emiAmount.toLocaleString("en-IN")} is due in ${emiDueInDays} day(s).`,
    channel: stressed ? "in_app_offer" : "push_notification"
  };
}

module.exports = { evaluateEmiProximity };
