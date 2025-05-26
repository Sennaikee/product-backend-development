const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, isSuperAdmin, isAdminOrSuperAdmin, isVerified } = require("../middleware/auth");

router.put("/make-admin/:userId", protect, isSuperAdmin, isVerified, adminController.makeAdmin);
router.get("/", protect, isAdminOrSuperAdmin, adminController.getAllUsers);
router.delete("/", protect, isSuperAdmin, adminController.deleteOneOrManyOrAllUsers);
router.delete( "/:id", protect, adminController.deleteOneOrManyOrAllUsers);

module.exports = router;
