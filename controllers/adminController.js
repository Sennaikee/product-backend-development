const User = require("../models/userModel");
exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.role = "admin";

    await user.save();
    res.json({ success: true, message: "User promoted to admin" });
  } catch (error) {
    console.log("Error adding admin", error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const products = await User.find({});
    res.status(200).json(products);
  } catch (error) {
    console.log("Error getting all users: ", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOneOrManyOrAllUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body || {};
    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: "User deleted successfully" });
    } else if (userIds) {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No user IDs provided" });
      }
      try {
        const result = await User.deleteMany({ _id: { $in: userIds } });
        res.status(200).json({
          success: true,
          message: `${result.deletedCount} user(s) deleted successfully`,
        });
      } catch (error) {
        console.error("Error deleting users:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    } else {
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
