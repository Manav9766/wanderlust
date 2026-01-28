if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo").default; // 🔥 FIX
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const ExpressError = require("./utils/ExpressError");

// -------------------- CORS --------------------
const allowedOrigins = [
  "https://wanderlust-6c01.vercel.app",
  "https://wanderlust-beta-three.vercel.app",
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) {
        return cb(null, origin);
      }

      return cb(null, origin);
    },
    credentials: true,
  })
);

// preflight
app.options("*", cors({ origin: allowedOrigins, credentials: true }));


// -------------------- SECURITY --------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// -------------------- DB --------------------
mongoose
  .connect(process.env.ATLASDB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(console.error);

// -------------------- VIEW ENGINE --------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- CORE MIDDLEWARE --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// -------------------- SESSION --------------------
const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: { secret: process.env.SESSION_SECRET },
  touchAfter: 24 * 3600,
});

app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(flash());

// -------------------- PASSPORT --------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- LOCALS --------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// -------------------- RATE LIMIT --------------------
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
  })
);

// -------------------- ROUTES --------------------
app.use("/api/listings", require("./routes/api/listings"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/ai", require("./routes/api/ai"));

app.use("/listings", require("./routes/listing"));
app.use("/listings/:id/reviews", require("./routes/review"));
app.use("/", require("./routes/user"));

// -------------------- 404 --------------------
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  if (req.originalUrl.startsWith("/api")) {
    return res.status(status).json({ message });
  }

  res.status(status).render("error", { message });
});

// -------------------- SERVER --------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
