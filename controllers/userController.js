const User = require("../models/userModel")
const {updateProfileSchema} = require("../middleware/validator")
exports.getProfile = async (req, res) => {
  try {   
    const user = await User.findById(req.user.userId).select(
      "-verificationCode"
    );
    console.log(user)
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error getting profile: ", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


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
    console.log("Error updating profile: ", error)
    res.status(500).json({ success: false, message: "Usename or email already exists" });
  }
};
