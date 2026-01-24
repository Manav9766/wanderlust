const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync");
const ctrl = require("../../controllers/api/listings");
const { requireLoginApi } = require("../../middleware/apiAuth");
const { requireOwnerApi } = require("../../middleware/apiPermissions");

const reviewsRouter = require("./reviews");

// image upload (parity with EJS form)
const multer = require("multer");
const { storage } = require("../../cloudConfig");
const upload = multer({ storage });

router.get("/", wrapAsync(ctrl.index));
router.get("/:id", wrapAsync(ctrl.show));

///api/listings/:id/reviews
router.use("/:id/reviews", reviewsRouter);

router.post("/", requireLoginApi, upload.single("image"), wrapAsync(ctrl.create));

router.put("/:id", requireLoginApi, requireOwnerApi, wrapAsync(ctrl.update));
router.delete("/:id", requireLoginApi, requireOwnerApi, wrapAsync(ctrl.remove));

module.exports = router;
