const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalize payload so downstream routes can safely use req.user.id.
    const normalizedId = decoded.id || decoded.userId || decoded._id;
    if (!normalizedId) {
      return res.status(401).json({ message: "Token payload missing user id" });
    }

    req.user = {
      ...decoded,
      id: normalizedId,
      userId: normalizedId
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
