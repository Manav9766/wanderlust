const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpressError = require("../utils/ExpressError.js");


// POST /api/listings/:id/reviews
module.exports.create = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  const review = new Review(req.body);
  review.author = req.user._id;

  await review.save();

  listing.reviews.push(review._id);
  await listing.save();

  res.status(201).json({
    message: "Review added",
    data: review
  });
};

// DELETE /api/listings/:id/reviews/:reviewId
module.exports.remove = async (req, res) => {
  const { id, reviewId } = req.params;

  // req.listing + req.review are attached by requireReviewAuthor middleware
  const listing = req.listing;

  // remove review reference from listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  // update stats on listing
  const stats = await recalculateRating(listing._id);

  res.json({
    message: "Review deleted",
    stats,
  });
};
