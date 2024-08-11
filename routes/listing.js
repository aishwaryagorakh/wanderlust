const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/asyncWrap.js");
const ExpressError = require("../utils/expressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
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
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  })
);
// listing.js
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    res.render("listings/show", { listing });
  })
);

// Create Route
router.post(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listings");
  })
);

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    res.render("listings/edit", { listing });
  })
);

// Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    // let { id } = req.params;
    // const listing = await Listing.findById(id);
    // if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    //   req.flash("error", "you do not have permission to edit");
    //   return res.redirect(`/listings/${req.params.id}`);
    // }
    await Listing.findByIdAndUpdate(req.params.id, { ...req.body.listing });
    res.redirect(`/listings/${req.params.id}`);
  })
);

// Delete Route
router.delete(
  "/:id",

  isLoggedIn,

  isOwner,
  wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect("/listings");
  })
);

module.exports = router;
