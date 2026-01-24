const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../../utils/wrapAsync");
const { requireLoginApi } = require("../../middleware/apiAuth");
const requireReviewAuthor = require("../../middleware/requireReviewAuthor");
const reviews = require("../../controllers/api/reviews");

// POST /api/listings/:id/reviews
router.post("/", requireLoginApi, wrapAsync(reviews.create));

// PUT /api/listings/:id/reviews/:reviewId  
router.put(
  "/:reviewId",
  requireLoginApi,
  requireReviewAuthor,
  wrapAsync(reviews.update)
);

// DELETE /api/listings/:id/reviews/:reviewId
router.delete(
  "/:reviewId",
  requireLoginApi,
  requireReviewAuthor,
  wrapAsync(reviews.remove)
);

module.exports = router;
