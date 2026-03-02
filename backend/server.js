const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const passport = require("./config/passport");



const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"]
      }
    }
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET || "mysessionsecret",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());

// Serve frontend files from the same origin for OAuth redirects.
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/budgets", require("./routes/budgets"));
app.use("/api/categories", require("./routes/categories"));

// MongoDB Connection
if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in backend/.env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
