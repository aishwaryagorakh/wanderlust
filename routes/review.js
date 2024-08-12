const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/asyncWrap.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middlewares/middlewares.js");
const { createReview, destroyReview } = require("../controllers/reviews.js");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body.review);
  if (error) {
    next(new ExpressError(400, error.details[0].message));
  } else {
    next();
  }
};

// Reviews Route
router.post("/", isLoggedIn, createReview);

// Route to delete a review from a listing
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(destroyReview)
);

module.exports = router;
