const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      trim: true,
      required: true,
      maxlength: 2000,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
  },
  { timestamps: true }
);

// one review per (listing, author)
reviewSchema.index({ listing: 1, author: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
