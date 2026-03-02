const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

router.use(auth);

// Summary (balance starts at 0 if no transactions)
router.get("/summary", async (req, res) => {
  const txs = await Transaction.find({ userId: req.user.id });

  let income = 0, expenses = 0, savings = 0;
  for (const t of txs) {
    const amount = Number(t.amount || 0);
    if (t.type === "income") {
      income += amount;
    } else {
      expenses += amount;
      if (String(t.category || "").toLowerCase() === "savings") {
        savings += amount;
      }
    }
  }

  res.json({ income, expenses, savings, balance: income - expenses });
});

// Spending by category (pie chart)
router.get("/spending-by-category", async (req, res) => {
  const data = await Transaction.aggregate([
    { $match: { userId: req.user.id, type: "expense" } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } }
  ]);

  res.json(data);
});

// Monthly trends (line chart)
router.get("/monthly-trends", async (req, res) => {
  const data = await Transaction.aggregate([
    { $match: { userId: req.user.id } },
    {
      $group: {
        _id: { month: { $month: "$date" }, type: "$type" },
        total: { $sum: "$amount" }
      }
    },
    { $sort: { "_id.month": 1 } }
  ]);

  res.json(data);
});

// Get all transactions (for user)
router.get("/", async (req, res) => {
  const items = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(items);
});

// Create transaction (income/expense/savings)
router.post("/", async (req, res) => {
  try {
    const tx = await Transaction.create({ ...req.body, userId: req.user.id });
    res.status(201).json(tx);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Delete transaction (for user)
router.delete("/:id", async (req, res) => {
  const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!deleted) return res.status(404).json({ message: "Transaction not found" });
  res.json({ message: "Transaction deleted" });
});

module.exports = router;
