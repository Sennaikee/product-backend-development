const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.protect = (req, res, next) => {
  try {
    // Get token from Authorization cookie (format: "Bearer <token>")
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Token missing" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded user:", decoded);

    // Attach user data to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Invalid token" });
  }
};
