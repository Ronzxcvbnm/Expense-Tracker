const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

const router = express.Router();

function getEmailConfig() {
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
  const secure = String(process.env.SMTP_SECURE || "").trim().toLowerCase() === "true" || port === 465;

  const to = String(
    process.env.SUGGESTIONS_TO_EMAIL || process.env.SUGGESTION_TO_EMAIL || ""
  ).trim();
  const from = String(
    process.env.SUGGESTIONS_FROM_EMAIL || process.env.SUGGESTION_FROM_EMAIL || user || ""
  ).trim();

  return { host, port, secure, user, pass, to, from };
}

function tryRequireNodemailer() {
  try {
    // eslint-disable-next-line global-require
    return require("nodemailer");
  } catch {
    return null;
  }
}

router.use(auth);

router.post(
  "/",
  [
    body("type")
      .optional({ checkFalsy: true })
      .isIn(["suggestion", "bug", "feature"])
      .withMessage("Type must be suggestion, bug, or feature"),
    body("name")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 80 })
      .withMessage("Name must be at most 80 characters"),
    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Email must be a valid email address")
      .normalizeEmail(),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isLength({ max: 2000 })
      .withMessage("Message must be at most 2000 characters")
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { host, port, secure, user, pass, to, from } = getEmailConfig();

    if (!host || !user || !pass || !to) {
      return res.status(400).json({
        message:
          "Email sending is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SUGGESTIONS_TO_EMAIL in backend/.env."
      });
    }

    const nodemailer = tryRequireNodemailer();
    if (!nodemailer) {
      return res.status(400).json({
        message: "Email dependency is missing. Run `cd backend && npm install nodemailer`."
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });

    const currentUser = await User.findById(req.user.id).select("name email").lean();

    const type = String(req.body.type || "suggestion").trim() || "suggestion";
    const submitterName = String(req.body.name || currentUser?.name || "").trim();
    const submitterEmail = String(req.body.email || currentUser?.email || "").trim();
    const message = String(req.body.message || "").trim();

    const submittedAt = new Date().toISOString();
    const subjectName = submitterName ? ` - ${submitterName}` : "";
    const subject = `[Expense Tracker] ${type.toUpperCase()}${subjectName}`;

    const lines = [
      `Type: ${type}`,
      `Name: ${submitterName || "-"}`,
      `Email: ${submitterEmail || "-"}`,
      `User ID: ${req.user.id}`,
      `Submitted: ${submittedAt}`,
      "",
      message
    ];

    try {
      await transporter.sendMail({
        from: from || user,
        to,
        subject,
        text: lines.join("\n"),
        replyTo: submitterEmail || undefined
      });
    } catch {
      return res.status(400).json({
        message:
          "Unable to send email right now. Check SMTP settings in backend/.env (and make sure your email provider allows SMTP)."
      });
    }

    return res.status(201).json({ message: "Suggestion sent. Thank you!" });
  })
);

module.exports = router;

