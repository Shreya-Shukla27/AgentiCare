/**
 * FD/RD Maturity Cross-sell Trigger
 * Flags upcoming maturities and proposes renewal or a better-fit investment
 * product, timed to the maturity window.
 */
function evaluateFdMaturity(customer) {
  const { fdMaturityInDays, fdAmount, recentLargeDeposit } = customer;

  if (fdMaturityInDays === null || fdMaturityInDays === undefined) return null;
  if (fdMaturityInDays > 14) return null;

  let score = Math.max(0, 100 - fdMaturityInDays * 5);
  if (fdAmount && fdAmount > 100000) score += 10;
  if (recentLargeDeposit) score += 5;
  score = Math.min(100, Math.round(score));

  return {
    trigger: "fd_maturity_crosssell",
    title: "FD/RD Maturity Cross-sell",
    score,
    reasoning: `Fixed Deposit of ₹${fdAmount.toLocaleString("en-IN")} matures in ${fdMaturityInDays} day(s). ` +
      `High-value maturity window is the optimal moment to offer renewal or a better-fit product.`,
    message: `Your FD of ₹${fdAmount.toLocaleString("en-IN")} matures in ${fdMaturityInDays} day(s). Renew now at a preferential rate, or explore SBI Mutual Fund options.`,
    channel: "in_app_offer"
  };
}

module.exports = { evaluateFdMaturity };
