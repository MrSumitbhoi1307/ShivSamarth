const express = require("express");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdminDashboard,
} = require("../controllers/adminController");

const router = express.Router();

// ==========================================
// ADMIN TEST ROUTE
// ==========================================

router.get(
  "/test",
  protect,
  adminOnly,
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Admin access verified successfully",

      admin: {
        id: req.user.userId,
        role: req.user.role,
      },
    });
  }
);

// ==========================================
// GET ADMIN PROFILE
// ==========================================

router.get(
  "/profile",
  protect,
  adminOnly,
  getAdminProfile
);

// ==========================================
// UPDATE ADMIN PROFILE
// NAME + EMAIL + PHONE
// ==========================================

router.put(
  "/profile",
  protect,
  adminOnly,
  updateAdminProfile
);

// ==========================================
// CHANGE ADMIN PASSWORD
// ==========================================

router.put(
  "/change-password",
  protect,
  adminOnly,
  changeAdminPassword
);

// ==========================================
// ADMIN DASHBOARD
// ==========================================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  getAdminDashboard
);

module.exports = router;