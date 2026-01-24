const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const mongoose = require("mongoose");

// For routes that need :id
module.exports.requireOwnerApi = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing id");
  }

  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  // req.user comes from requireLoginApi (JWT)
  const ownerId = listing.owner?.toString();
  const userId = req.user?._id?.toString();

  if (!ownerId || ownerId !== userId) {
    throw new ExpressError(403, "You do not have permission to modify this listing");
  }

  // attach for controller (optional convenience)
  req.listing = listing;
  next();
};
