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
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const ExpressError = require("./utils/ExpressError.js");



// Routers (EJS)
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Routers (API)
const apiListingsRouter = require("./routes/api/listings.js");
const apiAuthRouter = require("./routes/api/auth.js");
const apiUsersRouter = require("./routes/api/users.js"); // only if you actually use this
const apiAiRouter = require("./routes/api/ai");



// -------------------- DB --------------------
const dbUrl = process.env.ATLASDB_URL;

mongoose
  .connect(dbUrl)
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

// -------------------- View Engine --------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------- Core Middleware --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Must be BEFORE any route that reads req.cookies
app.use(cookieParser());
app.use("/api/ai", apiAiRouter);

// -------------------- Session / Flash / Passport (EJS auth) --------------------
const sessionSecret = process.env.SESSION_SECRET || "dev_session_secret_change_me";

// handle different export shapes safely
const MongoStoreFactory = MongoStore?.default || MongoStore;
const store = MongoStoreFactory.create({
  mongoUrl: dbUrl,
  crypto: { secret: sessionSecret },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- Locals for EJS --------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.MAP_TOKEN = process.env.MAP_TOKEN;
  next();
});
//-----------SECURITY HARDENING-----------------
const helmet = require("helmet");
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
const rateLimit = require("express-rate-limit");

// Helmet security headers (apply to API to avoid breaking EJS CSP)
app.use(
  "/api",
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS for React (cookies need credentials:true)
const allowedOrigins = [
  process.env.FRONTEND_URL,          // production React URL (later)
  "http://localhost:5173",           // Vite dev
  "http://localhost:3000",           // CRA dev
].filter(Boolean);

app.use(
  "/api",
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Rate limit auth endpoints (protect login/signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,                  // 50 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);

// -------------------- Routes -----------------
// EJS routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// API routes
app.use("/api/listings", apiListingsRouter);
app.use("/api/auth", apiAuthRouter);
app.use("/api/users", apiUsersRouter); 

// -------------------- 404 --------------------
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// -------------------- Error Handler ----------
app.use((err, req, res, next) => {
  // Mongoose validation errors should be 400
  if (err.name === "ValidationError") err.statusCode = 400;

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  // API errors return JSON
  if (req.originalUrl.startsWith("/api")) {
    return res.status(statusCode).json({
      message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  }

  // Web errors render EJS
  res.status(statusCode).render("error.ejs", { message });
});

//Server 
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
