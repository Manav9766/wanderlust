const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,

    image: {
      url: String,
      filename: String, // match controller + cloudinary
    },

    price: Number,
    location: String,
    country: String,

    category: {
      type: String,
      enum: [
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Mountains",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Arctic",
        "Domes",
        "Boats",
      ],
      required: true,
    },

    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],

    owner: { type: Schema.Types.ObjectId, ref: "User" },

    geometry: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true },
    },

    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true } // createdAt/updatedAt
);

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
