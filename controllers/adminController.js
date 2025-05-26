const User = require("../models/userModel");
const mongoose = require("mongoose");

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
    res.status(200).json({ success: true, message: "User promoted to admin" });
  } catch (error) {
    console.log("Error adding admin", error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    let users;
    const user = await User.findById(req.user.userId); 
    if (user.role === "superadmin") {
      users = await User.find({ role: { $in: ["user", "admin"] } }).select(
        "-verificationCode"
      );
    } else if (user.role === "admin") {
      users = await User.find({ role: "user" }).select("-verificationCode");
    } else {
        console.log(req.user)
        console.log(user)
      return res.status(403).json({ message: "Access denied" });    
    }
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error getting all users: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
  

exports.deleteOneOrManyOrAllUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body || {};
    const currentUser = await User.findById(req.user.userId); // assumed set in protect middleware
    const currentUserId = currentUser.userId;
    const currentUserRole = currentUser.role;
    if (id) {
      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check permissions
      if (currentUserRole === "user") {
        if (id !== currentUserId) {
          return res
            .status(403)
            .json({ message: "You can only delete your own account." });
        }
      } else if (currentUserRole === "admin") {
        if (id !== currentUserId && userToDelete.role !== "user") {
          return res
            .status(403)
            .json({
              message: "Admins can only delete users or their own account.",
            });
        }
      }
      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: "User deleted successfully" });
    } else if (userIds) {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No user IDs provided" });
      }

      for (const id of userIds) {
        // Check for valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res
            .status(400)
            .json({ success: false, message: `Invalid user ID: ${id}` });
        }

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
          return res
            .status(404)
            .json({ success: false, message: `User not found: ${id}` });
        }
      }

      // All checks passed, delete users
      try {
        const result = await User.deleteMany({ _id: { $in: userIds } });
        return res.status(200).json({
          success: true,
          message: `${result.deletedCount} user(s) deleted successfully`,
        });
      } catch (error) {
        console.error("Error deleting users:", error);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
    } else {
      const result = await User.deleteMany({
        role: { $in: ["admin", "user"] }
      });
      res.status(200).json({
        success: true,
        message: "All regular users and admins deleted successfully",
        deletedCount: result.deletedCount,
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
