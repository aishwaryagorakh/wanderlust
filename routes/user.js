const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const router = express.Router();
const asyncWrap = require("../utils/asyncWrap");
const { isLoggedIn } = require("../middlewares/middlewares");
const { redirectUrl } = require("../middlewares/middlewares");
const {
  signup,
  rendersignupForm,
  renderLoginForm,
  login,
  logout,
} = require("../controllers/users");

router.get("/signup", rendersignupForm);

// Register Route
router.post("/signup", asyncWrap(signup));

// Login Route
router.get("/login", renderLoginForm);

router.post(
  "/login",
  redirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  login
);

// Logout Route
router.get("/logout", logout);

module.exports = router;
