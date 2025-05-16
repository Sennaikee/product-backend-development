const express = require('express')
const User = require("../models/userModel")
const router = express.Router();
const authController = require("../controllers/authController")
const {protect, isSuperAdmin, isVerified} = require("../middleware/auth")


router.post('/signup', authController.signup)
router.post("/signin", isVerified, authController.signin);
router.post("/signout", protect, authController.signout);

router.patch("/sendVerificationCode", authController.sendVerificationCode)
router.patch("/verifyVerificationCode", authController.verifyVerificationCode);

router.put("/make-admin/:userId", protect, isSuperAdmin, isVerified, authController.makeAdmin);

module.exports = router;