const User = require("../../models/user");
const Listing = require("../../models/listing");
const ExpressError = require("../../utils/ExpressError");

// GET /api/users/me/favorites
module.exports.getFavorites = async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  res.json({ data: user.favorites });
};

// POST /api/users/me/favorites/:listingId
module.exports.addFavorite = async (req, res) => {
  const { listingId } = req.params;

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ExpressError(404, "Listing not found");

  await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favorites: listingId } }, // add only if not already present
    { new: true }
  );

  res.status(201).json({ message: "Added to favorites" });
};

// DELETE /api/users/me/favorites/:listingId
module.exports.removeFavorite = async (req, res) => {
  const { listingId } = req.params;

  await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { favorites: listingId } },
    { new: true }
  );

  res.json({ message: "Removed from favorites" });
};
