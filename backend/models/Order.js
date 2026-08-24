const mongoose = require("mongoose");

// ==========================================
// ORDER ITEM SCHEMA
// ==========================================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

// ==========================================
// SHIPPING ADDRESS SCHEMA
// ==========================================

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// ORDER SCHEMA
// ==========================================

const orderSchema = new mongoose.Schema(
  {
    // ======================================
    // USER
    // ======================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ======================================
    // ORDER ITEMS
    // ======================================

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },

        message: "Order must contain at least one product",
      },
    },

    // ======================================
    // TOTAL AMOUNT
    // ======================================

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ======================================
    // SHIPPING ADDRESS
    // ======================================

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // ======================================
    // PAYMENT METHOD
    // ======================================

    paymentMethod: {
      type: String,

      enum: {
        values: ["COD", "Online"],
        message: "Invalid payment method",
      },

      default: "COD",
    },

    // ======================================
    // PAYMENT STATUS
    // ======================================

    paymentStatus: {
      type: String,

      enum: {
        values: [
          "Pending",
          "Paid",
          "Failed",
          "Refunded",
        ],

        message: "Invalid payment status",
      },

      default: "Pending",
    },

    // ======================================
    // ORDER STATUS
    // ======================================

    status: {
      type: String,

      enum: {
        values: [
          "Pending",
          "Confirmed",
          "Shipped",
          "Delivered",
          "Cancelled",
        ],

        message: "Invalid order status",
      },

      default: "Pending",

      index: true,
    },

    // ======================================
    // ORDER NUMBER
    // ======================================

    orderNumber: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

    // ======================================
    // CANCELLATION REASON
    // ======================================

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    // ======================================
    // DELIVERED DATE
    // ======================================

    deliveredAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // CANCELLED DATE
    // ======================================

    cancelledAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// ==========================================
// GENERATE ORDER NUMBER
// ==========================================

orderSchema.pre("save", function () {
  if (!this.isNew || this.orderNumber) {
    return;
  }

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  this.orderNumber = `SS-${Date.now()}-${randomNumber}`;
});

// ==========================================
// AUTOMATIC PAYMENT STATUS
// ==========================================

orderSchema.pre("save", function () {
  if (this.isModified("paymentMethod")) {
    if (this.paymentMethod === "COD") {
      this.paymentStatus = "Pending";
    }
  }
});

// ==========================================
// AUTOMATIC DELIVERY / CANCELLATION DATE
// ==========================================

orderSchema.pre("save", function () {
  if (
    this.isModified("status") &&
    this.status === "Delivered"
  ) {
    this.deliveredAt = new Date();
  }

  if (
    this.isModified("status") &&
    this.status === "Cancelled"
  ) {
    this.cancelledAt = new Date();
  }
});

// ==========================================
// VIRTUAL — ITEM COUNT
// ==========================================

orderSchema.virtual("itemCount").get(function () {
  if (!this.items || !Array.isArray(this.items)) {
    return 0;
  }

  return this.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
});

// ==========================================
// JSON VIRTUALS
// ==========================================

orderSchema.set("toJSON", {
  virtuals: true,
});

orderSchema.set("toObject", {
  virtuals: true,
});

// ==========================================
// EXPORT
// ==========================================

module.exports = mongoose.model("Order", orderSchema);