const express = require("express");
const router = express.Router();
const wrapAsync = require("../../utils/wrapAsync");

const { requireLoginApi } = require("../../middleware/apiAuth");
const users = require("../../controllers/api/users");

router.get("/me/favorites", requireLoginApi, wrapAsync(users.getFavorites));
router.post("/me/favorites/:listingId", requireLoginApi, wrapAsync(users.addFavorite));
router.delete("/me/favorites/:listingId", requireLoginApi, wrapAsync(users.removeFavorite));

module.exports = router;
