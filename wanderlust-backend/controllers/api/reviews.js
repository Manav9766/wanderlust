const Listing = require("../../models/listing.js");
const Review = require("../../models/review.js");
const ExpressError = require("../../utils/ExpressError.js");
const recalculateRating = require("../../utils/recalculateRating.js");

// POST /api/listings/:id/reviews
module.exports.create = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  const existing = await Review.findOne({ listing: id, author: req.user._id });
  if (existing) throw new ExpressError(400, "You already reviewed this listing");

  const { rating, comment } = req.body;

  try {
    const review = new Review({
      rating: Number(rating),
      comment,
      author: req.user._id,
      listing: id,
    });

    await review.save();

    listing.reviews.push(review._id);
    await listing.save();

    await recalculateRating(id);

    res.status(201).json({ message: "Review created", data: review });
  } catch (err) {
    // ✅ unique index safety net
    if (err?.code === 11000) {
      throw new ExpressError(400, "You already reviewed this listing");
    }
    throw err;
  }
};


// PUT /api/listings/:id/reviews/:reviewId  ✅ add this
module.exports.update = async (req, res) => {
  const { id, reviewId } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);
  if (!review) throw new ExpressError(404, "Review not found");

  // requireReviewAuthor already validated ownership + belongs-to-listing
  review.rating = Number(rating);
  review.comment = comment;

  await review.save();

  await recalculateRating(id);

  res.json({ message: "Review updated", data: review });
};

// DELETE /api/listings/:id/reviews/:reviewId
module.exports.remove = async (req, res) => {
  const { id, reviewId } = req.params;

  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  await recalculateRating(id);

  res.json({ message: "Review deleted" });
};
