const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Category = require("../models/Category");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  const cats = await Category.find({ userId: req.user.id }).sort({ name: 1 });
  res.json(cats);
});

router.post("/", async (req, res) => {
  try {
    const cat = await Category.create({
      userId: req.user.id,
      name: req.body.name,
      color: req.body.color || "#3B82F6",
      icon: req.body.icon || "📁"
    });
    res.status(201).json(cat);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await Category.findOne({ _id: id, userId: req.user.id });
    if (!category) return res.status(404).json({ message: "Category not found" });

    await Category.deleteOne({ _id: category._id, userId: req.user.id });

    const [budgetDeleteResult, txUpdateResult] = await Promise.all([
      Budget.deleteMany({ userId: req.user.id, category: category.name }),
      Transaction.updateMany(
        { userId: req.user.id, category: category.name },
        { $set: { category: "Uncategorized" } }
      )
    ]);

    res.json({
      message: "Category deleted",
      category: category.name,
      removedBudgets: budgetDeleteResult.deletedCount || 0,
      updatedTransactions: txUpdateResult.modifiedCount || 0
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to delete category" });
  }
});

module.exports = router;
