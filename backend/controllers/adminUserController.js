const User = require("../models/User");

// ==========================================
// GET ALL USERS - ADMIN
// ==========================================

const getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    const filter = {};

    // Role filter
    if (role && role !== "All") {
      filter.role = role;
    }

    // Active / Inactive filter
    if (status && status !== "All") {
      if (status === "Active") {
        filter.isActive = true;
      }

      if (status === "Inactive") {
        filter.isActive = false;
      }
    }

    let users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    // Search
    if (search && search.trim()) {
      const searchText = search.trim().toLowerCase();

      users = users.filter((user) => {
        const name = user.name?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";

        return (
          name.includes(searchText) ||
          email.includes(searchText)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// ==========================================
// GET SINGLE USER - ADMIN
// ==========================================

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};

// ==========================================
// UPDATE USER STATUS - ADMIN
// ==========================================

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin cannot deactivate himself
    if (
      user._id.toString() === req.user.userId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password"
    );

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating user status",
    });
  }
};

// ==========================================
// UPDATE USER ROLE - ADMIN
// ==========================================

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin cannot change his own role
    if (
      user._id.toString() === req.user.userId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    user.role = role;

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password"
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update User Role Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating user role",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
};