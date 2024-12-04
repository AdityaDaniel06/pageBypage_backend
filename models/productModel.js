const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: [true, "A Book should have a title"],
    trim: true,
    minlength: 2,
    maxlength: 30,
  },
  author: {
    type: String,
    // required: [true, "A Book should have an author"],
    trim: true,
  },
  genre: {
    type: String,
    // required: [true, "A Book should have a genre"],
  },
  year: {
    type: Number,
  },
  binding: {
    type: String,
  },
  language: {
    type: String,
    // required: [true, "A Book should have a language"],
  },
  rating: { type: Number, default: 4.5 },
  isSeries: { type: Boolean, default: false },
  category: {
    type: String,
    // required: [true, "A Book should belong to a category"],
  },
  description: {
    type: String,
    trim: true,
    // required: [true, "A tour must have a description"],
  },
  price: {
    type: Number,
    // required: [true, "A Book should have a price"],
    min: 0,
    max: 10000,
    // validate: {
    //   validator: function (value) {
    //     return value > 0;
    //   },
    //   message: "Price must be a positive number",
    // },
  },
  priceDiscount: {
    type: Number,
    default: 0,
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("product", productSchema);
