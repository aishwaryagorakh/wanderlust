const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap");
const { isLoggedIn } = require("../middlewares/middlewares");
const { redirectUrl } = require("../middlewares/middlewares");

router.get("/signup", async (req, res) => {
  res.render("users/signup.ejs");
});

// Register Route
router.post(
  "/signup",
  asyncWrap(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      // console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Wanderlust");
        res.redirect("/listings");
      });
    } catch (e) {
      console.log(e);
      req.flash("error", e.message); // This should correctly set the error flash message
      res.redirect("/signup");
    }
  })
);

// Login Route
router.get("/login", async (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  redirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    console.log(redirectUrl);
    res.redirect(redirectUrl);
  }
);

// Logout Route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  req.flash("success", "Logged out successfully");
  res.redirect("/listings");
});

module.exports = router;
