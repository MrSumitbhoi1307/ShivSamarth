const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// ==========================================
// GET ADMIN REPORT
// ==========================================

const getAdminReport = async (req, res) => {
  try {
    // ----------------------------------------
    // TOTAL USERS
    // ----------------------------------------

    const totalUsers = await User.countDocuments({
      role: "user",
    });

    // ----------------------------------------
    // TOTAL PRODUCTS
    // ----------------------------------------

    const totalProducts = await Product.countDocuments();

    // ----------------------------------------
    // ACTIVE PRODUCTS
    // ----------------------------------------

    const activeProducts = await Product.countDocuments({
      isActive: true,
    });

    // ----------------------------------------
    // OUT OF STOCK PRODUCTS
    // ----------------------------------------

    const outOfStockProducts = await Product.countDocuments({
      stockQuantity: 0,
    });

    // ----------------------------------------
    // TOTAL ORDERS
    // ----------------------------------------

    const totalOrders = await Order.countDocuments();

    // ----------------------------------------
    // COMPLETED ORDERS
    // ----------------------------------------

    const completedOrders = await Order.countDocuments({
      status: "Delivered",
    });

    // ----------------------------------------
    // PENDING ORDERS
    // ----------------------------------------

    const pendingOrders = await Order.countDocuments({
      status: "Pending",
    });

    // ----------------------------------------
    // CANCELLED ORDERS
    // ----------------------------------------

    const cancelledOrders = await Order.countDocuments({
      status: "Cancelled",
    });

    // ----------------------------------------
    // TOTAL REVENUE
    // ----------------------------------------

    const revenueResult = await Order.aggregate([
  {
    $match: {
      status: "Delivered",
    },
  },
  {
    $group: {
      _id: null,
      totalRevenue: {
        $sum: "$totalAmount",
      },
    },
  },
]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    res.status(200).json({
      success: true,

      report: {
        users: {
          total: totalUsers,
        },

        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock: outOfStockProducts,
        },

        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          cancelled: cancelledOrders,
        },

        revenue: {
          total: totalRevenue,
        },
      },
    });
  } catch (error) {
    console.error("Admin Report Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate admin report",
    });
  }
};

module.exports = {
  getAdminReport,
};