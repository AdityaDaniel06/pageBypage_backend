const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  razorpay_orderID: String,
  razorpay_paymentID: String,
  razorpay_signature: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const payment = mongoose.model("payment", paymentSchema);
