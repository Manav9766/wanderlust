const Listing = require("../models/listing");
const Review = require("../models/review");

async function recalculateRating(listingId) {
  const reviews = await Review.find({ listing: listingId }).select("rating");

  const reviewCount = reviews.length;

  const avg =
    reviewCount === 0
      ? 0
      : reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount;

  await Listing.findByIdAndUpdate(listingId, {
    avgRating: Number(avg.toFixed(2)),
    reviewCount,
  });
}

module.exports = recalculateRating;
