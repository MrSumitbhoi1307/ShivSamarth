const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ==========================================
// GET CART
// ==========================================

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId }).populate(
      "items.product",
      "name actualPrice offerPrice images stockQuantity"
    );

    if (!cart) {
      cart = { user: req.user.userId, items: [] };
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

// ==========================================
// ADD TO CART
// ==========================================

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
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

    let cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += Number(quantity);
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name actualPrice offerPrice images stockQuantity"
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
    });
  }
};

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================

const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name actualPrice offerPrice images stockQuantity"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating cart",
    });
  }
};

// ==========================================
// REMOVE ITEM FROM CART
// ==========================================

const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name actualPrice offerPrice images stockQuantity"
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: populatedCart,
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while removing item",
    });
  }
};

// ==========================================
// CLEAR CART
// ==========================================

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while clearing cart",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};