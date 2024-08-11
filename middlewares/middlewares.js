const Listing = require("../models/listing");
const Review = require("../models/reviews");

module.exports.isLoggedIn = (req, res, next) => {
  console.log(req);
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to access this resource.");
    return res.redirect("/login");
  }
  next();
};

module.exports.redirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "you do not have permission to edit");
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "you did not created this review");
    return res.redirect(`/listings/${req.params.id}`);
  }
  next();
};
