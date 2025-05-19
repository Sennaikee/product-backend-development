const User = require("../models/userModel")
const {updateProfileSchema} = require("../middleware/validator")
exports.getProfile = async (req, res) => {
  try {   
    const user = await User.findById(req.user.userId);
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

exports.getAllUsers = async(req, res) => {
  try {
    const products = await User.find({});
    res.status(200).json(products);
  } catch (error) {
    console.log("Error getting all users: ", error);
    res.status(500).json({ message: error.message });
  }
}


exports.deleteOneOrAllUsers = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: "User deleted successfully" });
    }
    else {
      const result = await User.deleteMany({ role: "user" });
      res.status(200).json({
        success: true,
        message: "All regular users deleted successfully",
        deletedCount: result.deletedCount,
      });
    }  
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.deleteAllUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({}); // Deletes all users
    res.status(200).json({
      success: true,
      message: "All users deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



