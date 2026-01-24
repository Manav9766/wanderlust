const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");

module.exports = async function requireListingOwner(req, res, next) {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) return next(new ExpressError(404, "Listing not found"));

  const ownerId = listing.owner?.toString();
  const userId = req.user?._id?.toString();

  if (!userId || !ownerId || ownerId !== userId) {
    return next(new ExpressError(403, "Forbidden: not the owner"));
  }

  req.listing = listing;
  next();
};
