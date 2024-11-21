const express = require("express");
const route = express.Router();
const productController = require("../controllers/productController");

route.post("/addProduct", productController.addProduct);

route.get("/getAllProducts", productController.getProducts);

module.exports = route;
