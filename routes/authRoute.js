const express = require('express')
const User = require("../models/userModel")
const router = express.Router();
const authController = require("../controllers/authController")


router.post('/signup', authController.signup)
router.post("/signin", authController.signin);
router.post("/signout", authController.signout);

module.exports = router;