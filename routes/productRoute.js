const express = require("express");
const Product = require("../models/productModel");
const {protect} = require("../middleware/auth.js")
const router = express.Router();
const productController = require("../controllers/productController.js")

router.post("/", protect, productController.createProduct);
router.put("/:id", protect, productController.updateProduct);
router.delete("/:id", protect, productController.deleteProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.get(
  "/:id/price-in/:currency",
  productController.getProductPriceInCurrency
);



module.exports = router;
