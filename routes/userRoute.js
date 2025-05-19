const express = require('express')
const router = express.Router();
const userController = require("../controllers/userController")
const {protect, isSuperAdmin, isAdminOrSuperAdmin} = require("../middleware/auth")


router.get('/getProfile', protect, userController.getProfile)
router.put("/updateProfile", protect, userController.updateProfile);
router.get("/", protect, isAdminOrSuperAdmin, userController.getAllUsers);
router.delete("/", protect, isSuperAdmin, userController.deleteOneOrAllUsers);
router.delete( "/:id", protect, isAdminOrSuperAdmin, userController.deleteOneOrAllUsers);

// router.delete("/", protect, isAdminOrSuperAdmin, userController.deleteAllRegularUsers);

module.exports = router;