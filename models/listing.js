const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews"); // Import the Review model
const { ref } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", // Reference the model name as a string
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  await Review.deleteMany({
    _id: { $in: listing.reviews },
  });
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
