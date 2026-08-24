const mongoose = require("mongoose");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ======================================================
// VALID ORDER STATUSES
// ======================================================

const VALID_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// ======================================================
// HELPER - NORMALIZE STATUS
// ======================================================

const normalizeStatus = (status) => {
  if (!status) return null;

  const cleanStatus = String(status).trim().toLowerCase();

  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  return statusMap[cleanStatus] || null;
};

// ======================================================
// HELPER - VALIDATE OBJECT ID
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// PLACE ORDER
// ======================================================

const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // --------------------------------------------------
    // USER CHECK
    // --------------------------------------------------

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // --------------------------------------------------
    // SHIPPING ADDRESS VALIDATION
    // --------------------------------------------------

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "pincode",
    ];

    for (const field of requiredAddressFields) {
      if (
        shippingAddress[field] === undefined ||
        shippingAddress[field] === null ||
        String(shippingAddress[field]).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    // --------------------------------------------------
    // FIND CART
    // --------------------------------------------------

    const cart = await Cart.findOne({
      user: req.user.userId,
    }).populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // --------------------------------------------------
    // BUILD ORDER ITEMS
    // --------------------------------------------------

    let totalAmount = 0;

    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One of the products in cart no longer exists",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is no longer available`,
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`,
        });
      }

      if (product.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const itemPrice = Number(product.offerPrice);

      if (!Number.isFinite(itemPrice) || itemPrice < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price: itemPrice,
      });

      totalAmount += itemPrice * quantity;
    }

    // --------------------------------------------------
    // PAYMENT METHOD
    // --------------------------------------------------

    const finalPaymentMethod =
      paymentMethod === "Online" ? "Online" : "COD";

    // --------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------

    const order = await Order.create({
      user: req.user.userId,

      items: orderItems,

      totalAmount,

      shippingAddress: {
        fullName: String(shippingAddress.fullName).trim(),
        phone: String(shippingAddress.phone).trim(),
        addressLine: String(shippingAddress.addressLine).trim(),
        city: String(shippingAddress.city).trim(),
        pincode: String(shippingAddress.pincode).trim(),
      },

      paymentMethod: finalPaymentMethod,

      status: "Pending",
    });

    // --------------------------------------------------
    // REDUCE STOCK
    // --------------------------------------------------

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stockQuantity: -Number(item.quantity),
          },
        },
        {
          runValidators: true,
        }
      );
    }

    // --------------------------------------------------
    // CLEAR CART
    // --------------------------------------------------

    cart.items = [];

    await cart.save();

    // --------------------------------------------------
    // POPULATE ORDER
    // --------------------------------------------------

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.product", "name images offerPrice");

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while placing order",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// GET MY ORDERS
// ======================================================

const getMyOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const orders = await Order.find({
      user: req.user.userId,
    })
      .populate("items.product", "name images offerPrice")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// ======================================================
// GET SINGLE ORDER
// ======================================================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------
    // OBJECT ID CHECK
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    // --------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("items.product", "name images offerPrice");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // --------------------------------------------------
    // OWNER / ADMIN CHECK
    // --------------------------------------------------

    const orderUserId = order.user?._id
      ? order.user._id.toString()
      : order.user?.toString();

    const currentUserId = req.user.userId.toString();

    const isOwner = orderUserId === currentUserId;

    const isAdmin =
      String(req.user.role).toLowerCase() === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

// ======================================================
// GET ALL ORDERS - ADMIN
// ======================================================

const getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    // --------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------

    if (status && status !== "All") {
      const normalizedStatus = normalizeStatus(status);

      if (!normalizedStatus) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      filter.status = normalizedStatus;
    }

    // --------------------------------------------------
    // GET ORDERS
    // --------------------------------------------------

    let orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name images offerPrice")
      .sort({
        createdAt: -1,
      });

    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    if (search && search.trim()) {
      const searchText = search.trim().toLowerCase();

      orders = orders.filter((order) => {
        const orderId = order._id
          .toString()
          .toLowerCase();

        const userName =
          order.user?.name?.toLowerCase() || "";

        const userEmail =
          order.user?.email?.toLowerCase() || "";

        return (
          orderId.includes(searchText) ||
          userName.includes(searchText) ||
          userEmail.includes(searchText)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// ======================================================
// UPDATE ORDER STATUS - ADMIN
// ======================================================

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("=================================");
    console.log("UPDATE ORDER STATUS");
    console.log("Order ID:", id);
    console.log("Received Status:", status);
    console.log("User:", req.user);
    console.log("=================================");

    // --------------------------------------------------
    // AUTH CHECK
    // --------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // --------------------------------------------------
    // OBJECT ID CHECK
    // --------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // --------------------------------------------------
    // STATUS CHECK
    // --------------------------------------------------

    if (
      status === undefined ||
      status === null ||
      String(status).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    // --------------------------------------------------
    // NORMALIZE STATUS
    // --------------------------------------------------

    const normalizedStatus = normalizeStatus(status);

    if (!normalizedStatus) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed: Pending, Confirmed, Shipped, Delivered, Cancelled",
      });
    }

    // --------------------------------------------------
    // FIND ORDER
    // --------------------------------------------------

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // --------------------------------------------------
    // PREVIOUS STATUS
    // --------------------------------------------------

    const previousStatus = order.status;

    // --------------------------------------------------
    // SAME STATUS CHECK
    // --------------------------------------------------

    if (previousStatus === normalizedStatus) {
      const existingOrder = await Order.findById(order._id)
        .populate("user", "name email")
        .populate(
          "items.product",
          "name images offerPrice"
        );

      return res.status(200).json({
        success: true,
        message: "Order status is already updated",
        order: existingOrder,
      });
    }

    // --------------------------------------------------
    // STOCK RESTORATION
    //
    // If an order becomes Cancelled, restore stock.
    // If a previously Cancelled order becomes active again,
    // deduct stock again.
    // --------------------------------------------------

    if (
      normalizedStatus === "Cancelled" &&
      previousStatus !== "Cancelled"
    ) {
      for (const item of order.items) {
        if (!item.product) continue;

        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stockQuantity: item.quantity,
            },
          }
        );
      }
    }

    if (
      previousStatus === "Cancelled" &&
      normalizedStatus !== "Cancelled"
    ) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product not found for order item: ${item.name}`,
          });
        }

        if (product.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock to restore this order for ${item.name}`,
          });
        }

        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stockQuantity: -item.quantity,
            },
          }
        );
      }
    }

    // --------------------------------------------------
    // UPDATE STATUS
    // --------------------------------------------------

    order.status = normalizedStatus;

    await order.save();

    // --------------------------------------------------
    // FETCH UPDATED ORDER
    // --------------------------------------------------

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate(
        "items.product",
        "name images offerPrice"
      );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      previousStatus,
      newStatus: normalizedStatus,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("=================================");
    console.error("UPDATE ORDER STATUS ERROR:");
    console.error(error);
    console.error("=================================");

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order data",
        error: error.message,
      });
    }

    // Invalid ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// CANCEL ORDER - USER
// ======================================================

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // --------------------------------------------------
    // OWNER CHECK
    // --------------------------------------------------

    const isOwner =
      order.user.toString() ===
      req.user.userId.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // --------------------------------------------------
    // ONLY PENDING CAN CANCEL
    // --------------------------------------------------

    if (order.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }

    // --------------------------------------------------
    // CANCEL ORDER
    // --------------------------------------------------

    order.status = "Cancelled";

    await order.save();

    // --------------------------------------------------
    // RESTORE STOCK
    // --------------------------------------------------

    for (const item of order.items) {
      if (!item.product) continue;

      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stockQuantity: item.quantity,
          },
        }
      );
    }

    // --------------------------------------------------
    // GET UPDATED ORDER
    // --------------------------------------------------

    const updatedOrder = await Order.findById(order._id)
      .populate("items.product", "name images offerPrice");

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};