const express = require("express");
const router = express.Router();
const wrapAsync = require("../../utils/wrapAsync");
const { requireLoginApi } = require("../../middleware/apiAuth");
const ai = require("../../controllers/api/ai");

router.post(
  "/generate-description",
  requireLoginApi,
  wrapAsync(ai.generateDescription)
);

router.post(
  "/summarize-reviews",
  requireLoginApi,
  wrapAsync(ai.summarizeReviews)
);

module.exports = router;
