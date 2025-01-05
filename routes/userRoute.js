const express = require("express");
const route = express.Router();

const authController = require("../controllers/authController");

route.post("/signup", authController.signup);
route.post("/login", authController.login);

route.post("/forgotPassword", authController.forgotPassword);

route.post("/resetPassword/:token", authController.resetPassword);

module.exports = route;
