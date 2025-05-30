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
    const { role, page = 1, limit = 5 } = req.query; // from the URL query string
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let query = {};
    
    // Permission check
    if (user.role === "superadmin") {
      // Can get users, admins, or both
      if (role === "admin") {
        query.role = "admin";
      } else if (role === "user") {
        query.role = "user";
      } else {
        query.role = { $in: ["user", "admin"] }; // get all
      }
    } else if (user.role === "admin") {
      // Can only get users
      if (role && role !== "user") {
        return res.status(403).json({ message: "Admins can only view users" });
      }
      query.role = "user";
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query).select("-verificationCode").skip(skip).limit(parseInt(limit));
    res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      results: users.length,
      users,
    });

  } catch (error) {
    console.error("Error getting users:", error);
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
        message: "All regular users and admins deleted successfully!",
        deletedCount: result.deletedCount,
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: error.message });
  }
};
