const Listing = require('../models/listing');
const axios = require("axios");              

const mapToken = process.env.MAP_TOKEN;   // MapTiler key


module.exports.index = async (req, res) => {
  const { category } = req.query;

  let filter = {};
  if (category) {
    filter.category = category;
  }

  const allListings = await Listing.find(filter);
  res.render("listings/index.ejs", { allListings, category });
};


module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
   const listing = await Listing.findById(id)
        .populate({ 
            path: "reviews",
            populate: { 
            path: "author",
            select: "username" // have to ensure that only username is populated
            }
        })
        .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested for does not exist.");
      return res.redirect("/listings");
    }
  
    res.render("listings/show.ejs", { listing });
  };

module.exports.searchListings = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    req.flash("error", "Please enter a search term.");
    return res.redirect("/listings");
  }

  // Case-insensitive search on title, location, or country
  const regex = new RegExp(query, "i");

  const allListings = await Listing.find({
    $or: [
      { title: regex },
      { location: regex },
      { country: regex },
      { description: regex }
    ]
  });

  res.render("listings/index", { allListings, category: null, query });
};

module.exports.createListing = async (req, res, next) => {
  try {
    // Geocode the location with MapTiler
    const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      req.body.listing.location
    )}.json?key=${mapToken}`;

    const geoResp = await axios.get(geoUrl);

    // GeoJSON object: { type: 'Point', coordinates: [lng, lat] }
    const geometry = geoResp.data.features[0].geometry;
    console.log("MapTiler geometry:", geometry);

    // Build the listing
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // MapTiler geometry instead of Mapbox
    newListing.geometry = geometry;

    // Save & redirect
    const savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    next(err);       
  }
};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist.");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if(typeof req.file !== "undefined"){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url, filename};
      await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

