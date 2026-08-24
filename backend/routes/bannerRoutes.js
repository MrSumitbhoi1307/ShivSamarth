const express = require("express");

const {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// Get active banners
router.get("/", getActiveBanners);

// ==========================================
// ADMIN
// ==========================================

// Get all banners
router.get("/admin", protect, adminOnly, getAllBanners);

// Get single banner
router.get("/:id", protect, adminOnly, getBannerById);

// Create banner
router.post("/", protect, adminOnly, createBanner);

// Update banner
router.put("/:id", protect, adminOnly, updateBanner);

// Delete banner
router.delete("/:id", protect, adminOnly, deleteBanner);

module.exports = router;