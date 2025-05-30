const express = require('express')
const router = express.Router();
const authController = require("../controllers/authController")
const {protect} = require("../middleware/authMiddleware")


router.post('/signup', authController.signup)
router.post("/signin", authController.signin);
router.post("/signout", protect, authController.signout);
router.patch("/verifyVerificationCode", authController.verifyVerificationCode);


module.exports = router;