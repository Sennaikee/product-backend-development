const express = require("express");
const {protect, isAdmin, isSuperAdmin, isAdminOrSuperAdmin} = require("../middleware/authMiddleware.js")
const router = express.Router();
const productController = require("../controllers/productController.js")

router.post("/", protect, isAdmin, productController.createProduct);
router.put("/:id", protect, isAdmin, productController.updateProduct);
router.delete("/:id", protect, isAdminOrSuperAdmin, productController.deleteProduct);
router.delete("/",protect, isSuperAdmin, productController.deleteProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.get("/:id/price-in/:currency",productController.getProductPriceInCurrency);

module.exports = router;
