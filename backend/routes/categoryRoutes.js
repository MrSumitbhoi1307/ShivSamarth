const express = require("express");

const {
  createCategory,
  getCategories,
  getAllCategoriesAdmin,
  updateCategory,
  deleteCategory,
  restoreCategory,
} = require("../controllers/categoryController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.get("/", getCategories);

// ==========================================
// ADMIN ROUTES
// ==========================================

router.get("/admin/all", protect, adminOnly, getAllCategoriesAdmin);
router.post("/", protect, adminOnly, createCategory);
router.patch("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);
router.patch("/:id/restore", protect, adminOnly, restoreCategory);

module.exports = router;