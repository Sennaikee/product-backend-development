// Get user profile
const User = require("../models/userModel")
const {updateProfileSchema} = require("../middleware/validator")
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const {username, email} = value;
    const newUser = {username, email}
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, newUser, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// exports.updateProfile = async (req, res) => {
//   try {
//     const updates = {
//       username: req.body.username,
//       email: req.body.email,
//     };

//     const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
//       new: true,
//       runValidators: true,
//     }).select("-password -__v");

//     res.status(200).json({ success: true, user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Update failed" });
//   }
// };