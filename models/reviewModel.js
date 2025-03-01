const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "review is required"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // expires: "1h",
    // index: { expires: "1h" },
  },
});

const Review = mongoose.model("Review", reviewSchema);
