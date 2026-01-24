const Listing = require("../../models/listing");
const ExpressError = require("../../utils/ExpressError");
const { geocodePlace } = require("../../utils/geocode");

function buildQuery({ category, search }) {
  const query = {};
  if (category) query.category = category;

  if (search) {
    const r = new RegExp(search, "i");
    query.$or = [{ title: r }, { location: r }, { country: r }, { description: r }];
  }
  return query;
}

function buildSort(sort) {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "rating_desc":
      return { avgRating: -1 }; 
    case "newest":
    default:
      return { _id: -1 }; //safe without timestamps
  }
}

module.exports.index = async (req, res) => {
  const { page = 1, limit = 9, category, search, sort = "newest" } = req.query;

  const p = Math.max(1, Number(page));
  const l = Math.min(48, Math.max(1, Number(limit)));
  const skip = (p - 1) * l;

  const query = buildQuery({ category, search });
  const sortObj = buildSort(sort);

  const [totalItems, data] = await Promise.all([
    Listing.countDocuments(query),
    Listing.find(query).sort(sortObj).skip(skip).limit(l),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / l));

  res.json({
    data,
    meta: {
      totalItems,
      totalPages,
      currentPage: p,
      hasNextPage: p < totalPages,
      hasPrevPage: p > 1,
    },
  });
};

module.exports.show = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id).populate({
    path: "reviews",
    populate: { path: "author", select: "username" },
    options: { sort: { createdAt: -1 } },
  });

  if (!listing) throw new ExpressError(404, "Listing not found");
  res.json({ data: listing });
};

module.exports.create = async (req, res) => {
  const body = req.body || {};

  const listingData = {
    title: body.title,
    description: body.description,
    category: body.category,
    location: body.location,
    country: body.country,
    price: Number(body.price),
  };

  // Image (cloudinary)
  if (req.file) {
    listingData.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  } else if (body.imageUrl || body.image) {
    listingData.image = body.imageUrl || body.image;
  }

  // Geocode location for map
  const placeText = [body.location, body.country].filter(Boolean).join(", ");
  const geo = await geocodePlace(placeText);

  listingData.geometry = geo || { type: "Point", coordinates: [0, 0] };

  const listing = new Listing(listingData);
  listing.owner = req.user._id;

  await listing.save();
  res.status(201).json({ data: listing });
};

module.exports.update = async (req, res) => {
  const { id } = req.params;

  //if location/country updated, re-geocode
  const body = req.body || {};
  if (body.location || body.country) {
    const placeText = [body.location, body.country].filter(Boolean).join(", ");
    const geo = await geocodePlace(placeText);
    if (geo) body.geometry = geo;
  }

  const updated = await Listing.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ message: "Listing not found" });

  res.json({ message: "Listing updated", data: updated });
};

module.exports.remove = async (req, res) => {
  const { id } = req.params;

  const deleted = await Listing.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Listing not found" });

  res.json({ message: "Listing deleted" });
};
