const express = require("express");

const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
  applyCoupon,
  getActiveCoupons,
} = require("../controllers/couponController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// ADMIN ROUTES
// ======================================================

// GET ALL COUPONS
// GET /api/coupons/admin
router.get(
  "/admin",
  protect,
  adminOnly,
  getAllCoupons
);

// GET SINGLE COUPON
// GET /api/coupons/admin/:id
router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getCouponById
);

// CREATE COUPON
// POST /api/coupons
router.post(
  "/",
  protect,
  adminOnly,
  createCoupon
);

// UPDATE COUPON
// PUT /api/coupons/:id
router.put(
  "/:id",
  protect,
  adminOnly,
  updateCoupon
);

// UPDATE COUPON STATUS
// PATCH /api/coupons/:id/status
router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateCouponStatus
);

// DELETE COUPON
// DELETE /api/coupons/:id
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCoupon
);

// ======================================================
// CUSTOMER ROUTES
// ======================================================

// GET ACTIVE COUPONS (for browsing on checkout page)
// GET /api/coupons/active
router.get(
  "/active",
  protect,
  getActiveCoupons
);

// APPLY COUPON
// POST /api/coupons/apply
router.post(
  "/apply",
  protect,
  applyCoupon
);

module.exports = router;