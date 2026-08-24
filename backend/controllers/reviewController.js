const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==========================================
// GET REVIEWS FOR A PRODUCT
// PUBLIC
// ==========================================

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name profilePhoto")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching reviews",
    });
  }
};

// ==========================================
// ADD REVIEW
// USER ONLY
// ==========================================

const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.userId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.userId,
      rating: numericRating,
      comment: comment.trim(),
    });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name profilePhoto"
    );

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Add Review Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while adding review",
    });
  }
};

// ==========================================
// UPDATE OWN REVIEW
// ==========================================

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOne({
      _id: reviewId,
      user: req.user.userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isFinite(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = numericRating;
    }

    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot be empty",
        });
      }

      review.comment = comment.trim();
    }

    await review.save();

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name profilePhoto"
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Update Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating review",
    });
  }
};

// ==========================================
// DELETE OWN REVIEW
// ==========================================

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID",
      });
    }

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      user: req.user.userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting review",
    });
  }
};

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
};