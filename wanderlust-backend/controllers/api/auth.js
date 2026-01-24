const User = require("../../models/user");
const ExpressError = require("../../utils/ExpressError");
const { signToken, setAuthCookie, clearAuthCookie } = require("../../utils/jwt");

// POST /api/auth/signup
module.exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password) {
    throw new ExpressError(400, "username and password are required");
  }

  const user = new User({ username, email });

  // passport-local-mongoose provides .register(user, password)
  const registeredUser = await User.register(user, password);

  const token = signToken(registeredUser);
  setAuthCookie(res, token);

  res.status(201).json({
    message: "Signup successful",
    user: { id: registeredUser._id, username: registeredUser.username, email: registeredUser.email },
  });
};

// GET /api/auth/me
module.exports.me = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
  });
};

// POST /api/auth/logout
module.exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};
