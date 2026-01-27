const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
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
  const deleted = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!deleted) return res.status(404).json({ message: "Category not found" });
  res.json({ message: "Category deleted" });
});

module.exports = router;
