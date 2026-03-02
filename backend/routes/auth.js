const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage || ""
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: toPublicUser(user)
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.password) return res.status(400).json({ message: "Use Google login for this account" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: toPublicUser(user)
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role profileImage");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(toPublicUser(user));
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const match = await bcrypt.compare(String(currentPassword), user.password);
      if (!match) return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(String(newPassword), 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile-picture", auth, async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData || typeof imageData !== "string") {
      return res.status(400).json({ message: "Image is required" });
    }

    const isValidImage = /^data:image\/(png|jpe?g|webp);base64,/i.test(imageData);
    if (!isValidImage) {
      return res.status(400).json({ message: "Only PNG, JPG, and WEBP images are allowed" });
    }

    const base64Payload = imageData.split(",")[1] || "";
    const sizeBytes = Buffer.byteLength(base64Payload, "base64");
    if (sizeBytes > 2 * 1024 * 1024) {
      return res.status(400).json({ message: "Image must be 2MB or less" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profileImage: imageData } },
      { new: true, runValidators: true }
    ).select("name email role profileImage");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile picture updated successfully",
      user: toPublicUser(user)
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Google Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5000").replace(/\/+$/, "");
    const name = encodeURIComponent(req.user.name || "");
    res.redirect(`${frontendUrl}/index.html?token=${encodeURIComponent(token)}&name=${name}`);
  }
);

module.exports = router;
