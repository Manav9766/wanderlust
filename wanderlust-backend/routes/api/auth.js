const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../../utils/wrapAsync");

const auth = require("../../controllers/api/auth");
const { signToken, setAuthCookie } = require("../../utils/jwt");
const { requireLoginApi } = require("../../middleware/apiAuth");

// POST /api/auth/signup
router.post("/signup", wrapAsync(auth.signup));

// POST /api/auth/login
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const token = signToken(req.user);
    setAuthCookie(res, token);

    res.json({
      message: "Login successful",
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
    });
  }
);

// POST /api/auth/logout
router.post("/logout", auth.logout);

// GET /api/auth/me
router.get("/me", requireLoginApi, auth.me);

module.exports = router;
