const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const { validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
 
//SEARCH Route
router.get(
  "/search",
  wrapAsync(listingController.searchListings)
);

//INDEX 
router.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.createListing)
);



//NEW Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  )
  .put( 
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  );

//EDIT Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
