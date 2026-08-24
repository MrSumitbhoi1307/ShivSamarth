const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  restoreProduct,
  getAdminProducts,
} = require("../controllers/productController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// ADMIN PRODUCT ROUTES
// ======================================================

// Get all products for Admin
// Includes active + inactive products
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminProducts
);

// Create new product
router.post(
  "/admin/create",
  protect,
  adminOnly,
  createProduct
);

// Update complete product
router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateProduct
);

// Update only stock
router.patch(
  "/admin/:id/stock",
  protect,
  adminOnly,
  updateStock
);

// Soft delete product
router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteProduct
);

// Restore deleted product
router.patch(
  "/admin/:id/restore",
  protect,
  adminOnly,
  restoreProduct
);

// ======================================================
// PUBLIC PRODUCT ROUTES
// ======================================================

// Get all active products
router.get(
  "/",
  getProducts
);

// Get single active product
// IMPORTANT: Keep this route LAST
router.get(
  "/:id",
  getProductById
);

module.exports = router;