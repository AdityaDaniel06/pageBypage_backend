const USER = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const { clear } = require("console");

const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    //check if the user already exists
    const user = await USER.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ status: "fail", message: "User already exists" });
    }

    // hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new USER({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    res.status(201).json({
      status: "success",
      message: "Account Created Successfully",
      data: savedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ status: "fail", message: err });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if the user exists
    const user = await USER.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", message: "User not found" });
    }

    // compare hashed password with the stored password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid password" });
    }
    // generate JWT token
    const tokenData = {
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ status: "fail", message: err });
  }
};

const forgotPassword = async (req, res, next) => {
  // 1) Get user based in POST email
  const user = await USER.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(404)
      .json({ status: "fail", message: "No user found with that email" });
  }
  // 2) generate a random reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  // 3) hash the reset token and set it to the user's passwordResetToken field
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false }); // Disable validation to allow partial updates

  // 4) send plane token to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/user/resetPassword/${resetToken}`;

  const message = `Forgot your password? Login with your new password and passwordConfirm to: 
  ${resetURL}.
  If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "Reset password email sent to your email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });
  }
};

const resetPassword = async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await USER.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() },
  });

  // 2) if token has not been expired, and there is user , SET NEW PASSWORD
  if (!user) {
    return res
      .status(400)
      .json({ status: "fail", message: "Token is invalid or has expired" });
  }
  // hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  user.password = hashedPassword;
  // user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  // generate JWT token
  const tokenData = {
    id: user._id,
    email: user.email,
  };
  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({
    status: "success",
    token,
  });
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
};
