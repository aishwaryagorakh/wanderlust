const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/asyncWrap.js");
const ExpressError = require("./utils/expressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/reviews.js");
const Listing = require("./models/listing.js");
const engine = require("ejs-mate");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlusts";
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const app = express();

// Connect to MongoDB
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}
main();

// Set up view engine and static files
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.engine("ejs", engine); // Ensure ejs-mate is correctly used

//session
const sessionOptions = {
  secret: "mysecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Route Handlers
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//passport

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; // Add this if you're using error messages as well
  next();
});

//listing routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
// 404 Route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).render("listings/error", { message });
});

// Start Server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
