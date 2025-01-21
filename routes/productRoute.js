const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

// only admin can add books
router.post("/addProduct", productController.addProduct);

router.get(
  "/getAllProducts",
  authController.protect,
  productController.getAllProducts
);
router.get("/productDetail", productController.productDetail);
router.get("/showbooks", productController.getProductByCategory);
router.get("/searchProduct", productController.searchProduct);

router.post("/order", authController.protect, productController.order);
router.post("verify", productController.verify);

module.exports = router;
