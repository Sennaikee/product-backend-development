const jwt = require("jsonwebtoken");
exports.generateVerificationCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000)); // always 6-digit number
};

exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "8h" });
};
exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error("Token is not valid");
  }
};