const express = require("express");

const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// USER ROUTES
// ======================================================

// Place Order
router.post("/", protect, placeOrder);

// My Orders
router.get("/my-orders", protect, getMyOrders);

// Single Order
router.get("/:id", protect, getOrderById);

// Cancel Order
router.patch("/:id/cancel", protect, cancelOrder);

// ======================================================
// ADMIN ROUTES
// ======================================================

// Get All Orders
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllOrders
);

// Update Order Status
router.patch(
  "/admin/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

module.exports = router;