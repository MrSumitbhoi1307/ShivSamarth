const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// सगळे cart routes login असलेल्या (कुठल्याही role) user साठी आहेत
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.patch("/update", protect, updateCartItem);
router.delete("/remove/:productId", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

module.exports = router;