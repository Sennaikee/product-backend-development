const express = require('express')
const router = express.Router();
const userController = require("../controllers/userController")
const { protect } = require("../middleware/authMiddleware");


router.get('/getProfile', protect, userController.getProfile)
router.put("/updateProfile", protect, userController.updateProfile);


module.exports = router;