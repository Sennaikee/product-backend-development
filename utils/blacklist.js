const TokenBlacklist = require("../models/blacklistTokenModel");

exports.addToBlacklist = async (token, expiresInSeconds) => {
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  try {
    await TokenBlacklist.create({ token, expiresAt });
  } catch (err) {
    console.error("Error adding token to blacklist:", err.message);
  }
};

exports.isTokenBlacklisted = async (token) => {
  const found = await TokenBlacklist.findOne({ token });
  return !!found;
};
