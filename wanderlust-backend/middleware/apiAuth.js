const jwt = require("jsonwebtoken");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

async function requireLoginApi(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.id).select("-hash -salt -password");
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.user = user; // attach user for next handlers
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authenticated" });
  }
}

module.exports = { requireLoginApi };
