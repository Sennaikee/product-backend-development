const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/userModel")

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(" ")[1];
    console.log(token)

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId).select('username email role verified');
    // req.user = user;
    // console.log("Decoded user:", user);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

exports.isSuperAdmin = async(req, res, next) => {
  const user = await User.findById(req.user.userId);
  // console.log(user.role)
  if (user.role !== "superadmin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

exports.isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  // console.log(user.role)
  if (user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// middleware/roleCheck.js
exports.isAdminOrSuperAdmin = async(req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role === "admin" || user.role === "superadmin") {
      return next();
    }
    return res.status(403).json({ success: false, message: "Forbidden" });
  } catch (error) {
    console.error("Role check error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// exports.isVerified = async(req, res, next) => {
//   try {
//     // const user = await User.findById(req.user.userId).select(
//     //   "password verified email"
//     // );
//     const email =req.body.email;
//     const user = await(User.findById(req.params.userId).select(
//         "password verified email"
//       )) || await (User.findOne({email}).select("password verified email"));
//     console.log(user)
//     if (user.verified) {
//       return next()
//     }return res.status(401).json({
//         success: false,
//         message: "User is not verified",
//       });
//   } catch (error) {
//     console.log(error)
//   }
// }

exports.isVerified = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const email =
      (req.body && req.body.email) ||
      (req.user && req.user.email) ||
      req.params.email;

    let user = null;

    if (userId) {
      user = await User.findById(userId).select("verified email");
      console.log("Checked with userId:", user);
    } else if (email) {
      user = await User.findOne({ email }).select("verified email");
      console.log("Checked with email:", user);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.verified) {
      return next();
    }

    return res.status(401).json({
      success: false,
      message: "User is not verified",
    });
  } catch (error) {
    console.error("isVerified error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

