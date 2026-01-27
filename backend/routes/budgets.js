const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  const budgets = await Budget.find({ userId: req.user.id }).sort({ category: 1 });
  res.json(budgets);
});

// Create/update budget by category
router.post("/", async (req, res) => {
  const { category, allocated } = req.body;

  const budget = await Budget.findOneAndUpdate(
    { userId: req.user.id, category },
    { $set: { allocated: Number(allocated || 0) } },
    { new: true, upsert: true }
  );

  res.status(201).json(budget);
});

router.put("/:id", async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.id });
  if (!budget) return res.status(404).json({ message: "Budget not found" });

  if (req.body.allocated !== undefined) budget.allocated = Number(req.body.allocated);
  const saved = await budget.save();
  res.json(saved);
});

module.exports = router;
