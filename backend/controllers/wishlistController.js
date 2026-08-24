const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// ==========================================
// GET WISHLIST
// ==========================================

const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({
      user: req.user.userId,
    }).populate(
      "products",
      "name actualPrice offerPrice images stockQuantity"
    );

    if (!wishlist) {
      wishlist = { user: req.user.userId, products: [] };
    }

    return res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
    });
  }
};

// ==========================================
// ADD TO WISHLIST
// ==========================================

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({
      user: req.user.userId,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.userId,
        products: [productId],
      });
    } else {
      const alreadyExists = wishlist.products.some(
        (id) => id.toString() === productId
      );

      if (alreadyExists) {
        return res.status(409).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      wishlist.products.push(productId);
      await wishlist.save();
    }

    const populatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate(
      "products",
      "name actualPrice offerPrice images stockQuantity"
    );

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist: populatedWishlist,
    });
  } catch (error) {
    console.error("Add To Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist",
    });
  }
};

// ==========================================
// REMOVE FROM WISHLIST
// ==========================================

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user.userId,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate(
      "products",
      "name actualPrice offerPrice images stockQuantity"
    );

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist: populatedWishlist,
    });
  } catch (error) {
    console.error("Remove From Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist",
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};