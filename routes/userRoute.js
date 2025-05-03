const express = require('express')
const User = require("../models/userModel")
const router = express.Router();
const userController = require("../controllers/userController")
const {protect} = require("../middleware/auth")


router.get('/getProfile', protect, userController.getProfile)
router.put("/updateProfile", protect, userController.updateProfile);


module.exports = router;