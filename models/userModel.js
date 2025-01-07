const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
    // unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },
  // passwordConfirm: {
  //   type: String,
  //   required: true,
  //   validate: {
  //     validator: function (el) {
  //       return el === this.password;
  //     },
  //     message: "Passwords are not the same",
  //   },
  // },
  isVerfied: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
  changedPasswordAt: Date,
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.changedPasswordAt = Date.now() - 1000;
  next();
});

module.exports = mongoose.model("user", userSchema);
