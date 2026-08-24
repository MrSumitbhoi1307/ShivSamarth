const express = require("express");

const router = express.Router();

// ==========================================
// CONTROLLER
// ==========================================

const {
  getAdminReport,
} = require("../controllers/reportController");

// ==========================================
// MIDDLEWARE
// ==========================================

// authMiddleware exports:
// { protect, adminOnly }

const {
  protect,
} = require("../middleware/authMiddleware");

// Separate admin middleware
const adminOnly = require("../middleware/adminMiddleware");

// ==========================================
// GET ADMIN REPORT
// ==========================================

router.get(
  "/admin",
  protect,
  adminOnly,
  getAdminReport
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;