const API_BASE = window.location.origin;

const feedEl = document.getElementById("feed");
const statsEl = document.getElementById("statsRow");
const lastRunEl = document.getElementById("lastRun");
const simulateBtn = document.getElementById("simulateBtn");
const customersTableWrap = document.getElementById("customersTableWrap");
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

let previousScores = {}; // customerId -> score, used to flash changed cards

/* ---------------- Page routing ---------------- */

function showPage(pageName) {
  pages.forEach(p => {
    p.hidden = p.id !== `page-${pageName}`;
  });
  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageName);
  });

  if (pageName === "customers") {
    loadCustomersTable();
  }
}

function getPageFromHash() {
  const hash = window.location.hash.replace("#", "");
  const valid = ["dashboard", "customers", "triggers", "architecture", "about"];
  return valid.includes(hash) ? hash : "dashboard";
}

window.addEventListener("hashchange", () => showPage(getPageFromHash()));

/* ---------------- Dashboard ---------------- */

function renderStats(decisions) {
  const total = decisions.length;
  const executed = decisions.filter(d => d.executed).length;
  const blocked = total - executed;
  const avgScore = Math.round(
    decisions.reduce((sum, d) => sum + (d.chosenAction ? d.chosenAction.score : 0), 0) / (total || 1)
  );

  const stats = [
    { label: "Customers Evaluated", value: total },
    { label: "Actions Executed", value: executed },
    { label: "Blocked by Guardrail", value: blocked },
    { label: "Avg. Relevance Score", value: avgScore }
  ];

  statsEl.innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="value">${s.value}</div>
      <div class="label">${s.label}</div>
    </div>
  `).join("");
}

function renderFeed(decisions) {
  const sorted = [...decisions].sort((a, b) => {
    const scoreA = a.chosenAction ? a.chosenAction.score : -1;
    const scoreB = b.chosenAction ? b.chosenAction.score : -1;
    return scoreB - scoreA;
  });

  feedEl.innerHTML = sorted.map(d => {
    const action = d.chosenAction;
    const blockedClass = d.executed ? "" : "blocked";
    const statusClass = d.executed ? "executed" : "blocked";
    const statusLabel = d.executed ? "Executed" : "Blocked";

    const currentScore = action ? action.score : -1;
    const changed = previousScores[d.customerId] !== undefined && previousScores[d.customerId] !== currentScore;
    const updatedClass = changed ? "updated" : "";

    if (!action) {
      return `
        <div class="decision-card ${blockedClass} ${updatedClass}">
          <div class="row1">
            <span class="customer-name">${d.customerName}</span>
            <span class="segment-tag">${d.segment}</span>
          </div>
          <div class="action-none">No relevant trigger fired — customer state is nominal.</div>
        </div>
      `;
    }

    return `
      <div class="decision-card ${blockedClass} ${updatedClass}">
        <div class="row1">
          <span class="customer-name">${d.customerName}</span>
          <span class="segment-tag">${d.segment}</span>
        </div>
        <div class="action-title">${action.title}</div>
        <div class="reasoning">${action.reasoning}</div>
        <div class="message">"${action.message}"</div>
        <div class="meta-row">
          <span class="score-pill">Score ${action.score}</span>
          <span class="status-pill ${statusClass}">${statusLabel}</span>
        </div>
        <div class="guardrail-note">${d.guardrail.reason}</div>
      </div>
    `;
  }).join("");

  const nextScores = {};
  decisions.forEach(d => { nextScores[d.customerId] = d.chosenAction ? d.chosenAction.score : -1; });
  previousScores = nextScores;
}

async function loadDecisions() {
  const res = await fetch(`${API_BASE}/api/decisions`);
  const decisions = await res.json();
  renderStats(decisions);
  renderFeed(decisions);
  lastRunEl.textContent = `Last run: ${new Date().toLocaleTimeString()}`;
}

async function simulate() {
  simulateBtn.disabled = true;
  simulateBtn.textContent = "Running...";
  try {
    const res = await fetch(`${API_BASE}/api/simulate`, { method: "POST" });
    const decisions = await res.json();
    renderStats(decisions);
    renderFeed(decisions);
    lastRunEl.textContent = `Last run: ${new Date().toLocaleTimeString()}`;
  } catch (err) {
    console.error("Simulate failed:", err);
    alert("Agent cycle failed — check the console for details.");
  } finally {
    simulateBtn.disabled = false;
    simulateBtn.textContent = "Run Agent Cycle";
  }
}

simulateBtn.addEventListener("click", simulate);

/* ---------------- Customers table ---------------- */

async function loadCustomersTable() {
  customersTableWrap.innerHTML = `<p class="muted" style="padding:20px;">Loading...</p>`;
  const res = await fetch(`${API_BASE}/api/customers`);
  const customers = await res.json();

  const rows = customers.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.segment}</td>
      <td>₹${c.balance.toLocaleString("en-IN")}</td>
      <td>${c.daysSinceLastTxn}</td>
      <td>${c.fdMaturityInDays ?? "—"}</td>
      <td>${c.emiDueInDays ?? "—"}</td>
      <td class="${c.consentMarketing ? "consent-yes" : "consent-no"}">${c.consentMarketing ? "Yes" : "No"}</td>
      <td>${c.lastNudgeDaysAgo}</td>
    </tr>
  `).join("");

  customersTableWrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Segment</th><th>Balance</th>
          <th>Days Since Last Txn</th><th>FD Maturity (days)</th>
          <th>EMI Due (days)</th><th>Consent</th><th>Last Nudge (days ago)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/* ---------------- Init ---------------- */

showPage(getPageFromHash());
loadDecisions();
