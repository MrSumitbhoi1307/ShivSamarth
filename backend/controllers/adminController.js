const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ==========================================
// GET ADMIN PROFILE
// ==========================================

const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId).select(
      "-password"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching admin profile",
    });
  }
};

// ==========================================
// UPDATE ADMIN PROFILE
// NAME + EMAIL + PHONE
// ==========================================

const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const admin = await User.findById(req.user.userId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ======================================
    // ADMIN CHECK
    // ======================================

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // ======================================
    // NAME
    // ======================================

    if (name !== undefined) {
      const normalizedName = name.trim();

      if (!normalizedName) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      if (normalizedName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Name must contain at least 2 characters",
        });
      }

      if (normalizedName.length > 50) {
        return res.status(400).json({
          success: false,
          message:
            "Name cannot exceed 50 characters",
        });
      }

      admin.name = normalizedName;
    }

    // ======================================
    // EMAIL
    // ======================================

    if (email !== undefined) {
      const normalizedEmail =
        email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address",
        });
      }

      // Check another account using this email
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: admin._id,
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "This email is already registered",
        });
      }

      admin.email = normalizedEmail;
    }

    // ======================================
    // PHONE
    // ======================================

    if (phone !== undefined) {
      const normalizedPhone = phone.trim();

      if (
        normalizedPhone &&
        !/^[6-9]\d{9}$/.test(normalizedPhone)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid 10-digit mobile number",
        });
      }

      admin.phone = normalizedPhone;
    }

    // ======================================
    // SAVE
    // ======================================

    await admin.save();

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,
      message:
        "Admin profile updated successfully",

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone || "",
        role: admin.role,
        profilePhoto:
          admin.profilePhoto || "",
        isBlocked: admin.isBlocked,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Update Admin Profile Error:",
      error
    );

    // Duplicate email
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This email is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating admin profile",
    });
  }
};

// ==========================================
// CHANGE ADMIN PASSWORD
// ==========================================

const changeAdminPassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    // ======================================
    // VALIDATION
    // ======================================

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least 6 characters",
      });
    }

    // ======================================
    // GET ADMIN + PASSWORD
    // ======================================

    const admin = await User.findById(
      req.user.userId
    ).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ======================================
    // ADMIN CHECK
    // ======================================

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // ======================================
    // CHECK CURRENT PASSWORD
    // ======================================

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        admin.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    // ======================================
    // SAME PASSWORD CHECK
    // ======================================

    const samePassword =
      await bcrypt.compare(
        newPassword,
        admin.password
      );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // ======================================
    // HASH NEW PASSWORD
    // ======================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );

    admin.password = hashedPassword;

    await admin.save();

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,
      message:
        "Admin password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change Admin Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while changing password",
    });
  }
};

// ==========================================
// GET ADMIN DASHBOARD
// ==========================================

const getAdminDashboard = async (req, res) => {
  try {
    // ======================================
    // TOTAL USERS
    // ======================================

    const totalUsers = await User.countDocuments({
      role: "user",
    });

    // ======================================
    // TOTAL PRODUCTS
    // ======================================

    const totalProducts =
      await Product.countDocuments();

    // ======================================
    // TOTAL ORDERS
    // ======================================

    const totalOrders =
      await Order.countDocuments();

    // ======================================
    // TOTAL SALES
    // Cancelled orders excluded
    // ======================================

    const salesResult =
      await Order.aggregate([
        {
          $match: {
            status: {
              $ne: "Cancelled",
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: {
              $sum: "$totalAmount",
            },
          },
        },
      ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    // ======================================
    // PENDING ORDERS
    // ======================================

    const pendingOrders =
      await Order.countDocuments({
        status: "Pending",
      });

    // ======================================
    // LOW STOCK
    // ======================================

    const lowStock =
      await Product.countDocuments({
        stockQuantity: {
          $lte: 5,
        },
        isActive: true,
      });

    // ======================================
    // RECENT ORDERS
    // ======================================

    const recentOrders =
      await Order.find()
        .populate(
          "user",
          "name email"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .select(
          "orderNumber totalAmount status paymentStatus createdAt user"
        );

    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales,
        pendingOrders,
        lowStock,
      },

      recentOrders,
    });
  } catch (error) {
    console.error(
      "Get Admin Dashboard Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching dashboard data",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdminDashboard,
};