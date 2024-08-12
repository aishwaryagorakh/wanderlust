const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/asyncWrap.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const {
  index,
  renderNewForm,
  showListing,
  createListing,
  renderEditForm,
  updateListing,
  destroyListing,
} = require("../controllers/listing.js");
const {
  isLoggedIn,
  isOwner,
  isReviewAuthor,
} = require("../middlewares/middlewares.js");

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    next(new ExpressError(400, error.details[0].message));
  } else {
    next();
  }
};

// Index Router
router.get("/", wrapAsync(index));

router.post(
  //create route
  isLoggedIn,
  validateListing,
  upload.single("listing[image]"),

  wrapAsync(createListing)
);

// listing.js
router.get("/new", isLoggedIn, renderNewForm);

// Show Route
router.get("/:id", wrapAsync(showListing));

// Create Route
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  wrapAsync(createListing)
);

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(renderEditForm));

// Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  wrapAsync(updateListing)
);

// Delete Route
router.delete(
  "/:id",

  isLoggedIn,

  isOwner,
  wrapAsync(destroyListing)
);

module.exports = router;
