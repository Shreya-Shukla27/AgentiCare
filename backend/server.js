const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { runAgentForAllCustomers } = require("./agent/reasoning");

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.join(__dirname, "data", "customers.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "dashboard")));

function loadCustomers() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

// GET raw customer signal data (Stage 1: Signal Ingestion view)
app.get("/api/customers", (req, res) => {
  res.json(loadCustomers());
});

// GET agent decisions for every customer (runs the full pipeline)
app.get("/api/decisions", (req, res) => {
  const customers = loadCustomers();
  const decisions = runAgentForAllCustomers(customers);
  res.json(decisions);
});

// POST simulate a fresh signal tick - nudges a few fields to mimic real-time change
app.post("/api/simulate", (req, res) => {
  const customers = loadCustomers();

  const simulated = customers.map(c => {
    const next = { ...c };
    if (typeof next.daysSinceLastTxn === "number") {
      next.daysSinceLastTxn = Math.max(0, next.daysSinceLastTxn + (Math.random() > 0.5 ? 1 : -1));
    }
    if (typeof next.fdMaturityInDays === "number") {
      next.fdMaturityInDays = Math.max(0, next.fdMaturityInDays - 1);
    }
    if (typeof next.emiDueInDays === "number") {
      next.emiDueInDays = Math.max(0, next.emiDueInDays - 1);
    }
    if (typeof next.lastNudgeDaysAgo === "number") {
      next.lastNudgeDaysAgo = next.lastNudgeDaysAgo + 1;
    }
    return next;
  });

  fs.writeFileSync(DATA_PATH, JSON.stringify(simulated, null, 2));
  const decisions = runAgentForAllCustomers(simulated);
  res.json(decisions);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "agenticare-backend" });
});

app.listen(PORT, () => {
  console.log(`AgentiCare backend running on http://localhost:${PORT}`);
});
