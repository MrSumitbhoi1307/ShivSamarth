const express = require("express");

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
} = require("../controllers/adminUserController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADMIN USER MANAGEMENT
// ==========================================

// Get all users
router.get(
  "/",
  protect,
  adminOnly,
  getAllUsers
);

// Get single user
router.get(
  "/:id",
  protect,
  adminOnly,
  getUserById
);

// Update active/inactive status
router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateUserStatus
);

// Update user role
router.patch(
  "/:id/role",
  protect,
  adminOnly,
  updateUserRole
);

module.exports = router;