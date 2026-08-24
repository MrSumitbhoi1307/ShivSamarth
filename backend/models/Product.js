const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ==========================================
    // PRODUCT NAME
    // ==========================================

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      unique: true,
    },

    // ==========================================
    // ACTUAL PRICE
    // ==========================================

    actualPrice: {
      type: Number,
      required: [true, "Actual price is required"],
      min: [0, "Actual price cannot be negative"],
    },

    // ==========================================
    // OFFER PRICE
    // ==========================================

    offerPrice: {
      type: Number,
      required: [true, "Offer price is required"],
      min: [0, "Offer price cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.actualPrice;
        },
        message: "Offer price cannot be greater than actual price",
      },
    },

    // ==========================================
    // CATEGORY
    // ==========================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    // ==========================================
    // DESCRIPTION
    // ==========================================

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    // ==========================================
    // UNIT
    // ==========================================

    unit: {
      type: String,
      enum: {
        values: ["kg", "gram", "litre", "ml", "piece", "pack"],
        message: "Invalid product unit",
      },
      required: [true, "Product unit is required"],
    },

    // ==========================================
    // STOCK
    // ==========================================

    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },

    // ==========================================
    // PRODUCT IMAGES
    // MAXIMUM 4 IMAGES
    // ==========================================

    images: {
      type: [String],
      default: [],

      validate: {
        validator: function (images) {
          return images.length <= 4;
        },
        message: "Maximum 4 product images are allowed",
      },
    },

    // ==========================================
    // ACTIVE / INACTIVE
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

// ==========================================
// STOCK STATUS
// ==========================================

productSchema.virtual("stockStatus").get(function () {
  if (this.stockQuantity > 0) {
    return "In Stock";
  }

  return "Out of Stock";
});

// ==========================================
// DISCOUNT PERCENTAGE
// ==========================================

productSchema.virtual("discountPercentage").get(function () {
  if (
    this.actualPrice > 0 &&
    this.offerPrice < this.actualPrice
  ) {
    return Math.round(
      ((this.actualPrice - this.offerPrice) /
        this.actualPrice) *
        100
    );
  }

  return 0;
});

// ==========================================
// JSON SETTINGS
// ==========================================

productSchema.set("toJSON", {
  virtuals: true,
});

productSchema.set("toObject", {
  virtuals: true,
});

// ==========================================
// EXPORT
// ==========================================

module.exports = mongoose.model("Product", productSchema);