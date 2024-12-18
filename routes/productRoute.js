const express = require("express");
const route = express.Router();
const productController = require("../controllers/productController");

route.post("/addProduct", productController.addProduct);

route.get("/getAllProducts", productController.getAllProducts);
route.get("/productDetail", productController.productDetail);
route.get("/showbooks", productController.getProductByCategory);
route.get("/searchProduct", productController.searchProduct);

module.exports = route;
