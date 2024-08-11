const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/asyncWrap.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middlewares/middlewares.js");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body.review);
  if (error) {
    next(new ExpressError(400, error.details[0].message));
  } else {
    next();
  }
};

// Reviews Route
router.post("/", isLoggedIn, async (req, res) => {
  try {
    // Print the review data for debugging
    console.log("Review data received:", req.body.review);

    // Find the listing by ID
    const listing = await Listing.findById(req.params.id);

    // Create a new review
    const newReview = new Review(req.body.review);

    newReview.author = req.user._id;
    // Save the review
    await newReview.save();
    console.log("New Review created:", newReview);

    // Add the review to the listing
    listing.reviews.push(newReview);

    // Save the listing with the new review
    await listing.save();
    console.log("Listing updated with new review:", listing);

    // Redirect back to the listing page
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a review from a listing
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review ID from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the review document from the reviews collection
    await Review.findByIdAndDelete(reviewId);

    // Redirect back to the listing page
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
