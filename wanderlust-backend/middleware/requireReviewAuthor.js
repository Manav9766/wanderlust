const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");
module.exports = async function requireReviewAuthor(req, res, next) {
  const { id, reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError(400, "Invalid listing id"));
  }
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return next(new ExpressError(400, "Invalid review id"));
  }

  const listing = await Listing.findById(id);
  if (!listing) return next(new ExpressError(404, "Listing not found"));

  const review = await Review.findById(reviewId);
  if (!review) return next(new ExpressError(404, "Review not found"));

  // Strong ownership: review must reference this listing
  if (String(review.listing) !== String(id)) {
    return next(new ExpressError(400, "Review does not belong to this listing"));
  }

  const isAuthor = String(review.author) === String(req.user._id);
  if (!isAuthor) {
    return next(new ExpressError(403, "Forbidden: not the review author"));
  }

  req.listing = listing;
  req.review = review;
  next();
};
