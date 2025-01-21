const USER = require("../models/userModel");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Email = require("../utils/email");

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
    const url = `${req.protocol}://${req.get("host")}/user/me`;
    await new Email(newUser, url).sendWelcomeEmail();
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
      data: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
      },

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

  try {
    // 4) send plane token to user's email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/user/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendResetPasswordEmail();
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
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    token,
  });
};

const updatePassword = async (req, res, next) => {
  // 1) Get user from the collection
  // 2) Check if POSTed current password is correct
  // 3) If so, update password
  // 4) Log user in, send JWT
};

const protect = async (req, res, next) => {
  let token;
  //1) checking of token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    // console.log("token: " + token);
    if (!token) {
      return next(
        res
          .status(401)
          .json({ status: "fail", message: "You are not logged in!" })
      );
    }
  }
  //2) Check if token is valid(verfication)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  //3) Check of user exists
  //4) if user changed password after token was issued
  next();
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
};
