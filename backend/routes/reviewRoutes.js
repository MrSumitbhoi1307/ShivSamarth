const express = require("express");

const {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protect, addReview);
router.put("/:reviewId", protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;