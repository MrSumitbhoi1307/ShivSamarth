const Coupon = require("../models/Coupon");

// ======================================================
// CREATE COUPON - ADMIN
// ======================================================

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      startDate,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    // -----------------------------
    // Required fields
    // -----------------------------

    if (
      !code ||
      discountValue === undefined ||
      !startDate ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Code, discount value, start date and expiry date are required",
      });
    }

    // -----------------------------
    // Discount validation
    // -----------------------------

    if (!["percentage", "fixed"].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid discount type",
      });
    }

    if (Number(discountValue) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    // Percentage cannot exceed 100
    if (
      discountType === "percentage" &&
      Number(discountValue) > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    // -----------------------------
    // Date validation
    // -----------------------------

    const start = new Date(startDate);
    const expiry = new Date(expiryDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(expiry.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start or expiry date",
      });
    }

    if (expiry <= start) {
      return res.status(400).json({
        success: false,
        message: "Expiry date must be after start date",
      });
    }

    // -----------------------------
    // Check duplicate coupon
    // -----------------------------

    const existingCoupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // -----------------------------
    // Create coupon
    // -----------------------------

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description: description?.trim() || "",

      discountType,

      discountValue: Number(discountValue),

      minOrderAmount:
        minOrderAmount !== undefined
          ? Number(minOrderAmount)
          : 0,

      maxDiscount:
        maxDiscount !== undefined &&
        maxDiscount !== ""
          ? Number(maxDiscount)
          : null,

      startDate: start,
      expiryDate: expiry,

      usageLimit:
        usageLimit !== undefined &&
        usageLimit !== ""
          ? Number(usageLimit)
          : null,

      isActive:
        isActive === undefined
          ? true
          : Boolean(isActive),
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create Coupon Error:", error);

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// GET ALL COUPONS - ADMIN
// ======================================================

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Get All Coupons Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// GET SINGLE COUPON - ADMIN
// ======================================================

const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error("Get Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// UPDATE COUPON - ADMIN
// ======================================================

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      startDate,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    // -----------------------------
    // Code
    // -----------------------------

    if (code !== undefined) {
      const newCode = code.trim().toUpperCase();

      const duplicate = await Coupon.findOne({
        code: newCode,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      coupon.code = newCode;
    }

    // -----------------------------
    // Description
    // -----------------------------

    if (description !== undefined) {
      coupon.description = description.trim();
    }

    // -----------------------------
    // Discount type
    // -----------------------------

    if (discountType !== undefined) {
      if (
        !["percentage", "fixed"].includes(discountType)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid discount type",
        });
      }

      coupon.discountType = discountType;
    }

    // -----------------------------
    // Discount value
    // -----------------------------

    if (discountValue !== undefined) {
      const value = Number(discountValue);

      if (value <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Discount value must be greater than 0",
        });
      }

      if (
        coupon.discountType === "percentage" &&
        value > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Percentage discount cannot exceed 100%",
        });
      }

      coupon.discountValue = value;
    }

    // -----------------------------
    // Minimum order
    // -----------------------------

    if (minOrderAmount !== undefined) {
      coupon.minOrderAmount = Number(minOrderAmount);
    }

    // -----------------------------
    // Maximum discount
    // -----------------------------

    if (maxDiscount !== undefined) {
      coupon.maxDiscount =
        maxDiscount === ""
          ? null
          : Number(maxDiscount);
    }

    // -----------------------------
    // Dates
    // -----------------------------

    if (startDate !== undefined) {
      coupon.startDate = new Date(startDate);
    }

    if (expiryDate !== undefined) {
      coupon.expiryDate = new Date(expiryDate);
    }

    if (coupon.expiryDate <= coupon.startDate) {
      return res.status(400).json({
        success: false,
        message:
          "Expiry date must be after start date",
      });
    }

    // -----------------------------
    // Usage limit
    // -----------------------------

    if (usageLimit !== undefined) {
      coupon.usageLimit =
        usageLimit === ""
          ? null
          : Number(usageLimit);
    }

    // -----------------------------
    // Active status
    // -----------------------------

    if (isActive !== undefined) {
      coupon.isActive = Boolean(isActive);
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Update Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// UPDATE COUPON STATUS - ADMIN
// ======================================================

const updateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Coupon activated successfully"
        : "Coupon deactivated successfully",
      coupon,
    });
  } catch (error) {
    console.error(
      "Update Coupon Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// DELETE COUPON - ADMIN
// ======================================================

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// APPLY COUPON - CUSTOMER
// ======================================================

const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    // ------------------------------------------
    // Validate coupon code
    // ------------------------------------------

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    // ------------------------------------------
    // Validate order amount
    // ------------------------------------------

    const amount = Number(orderAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // ------------------------------------------
    // Find coupon
    // ------------------------------------------

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // ------------------------------------------
    // Active status
    // ------------------------------------------

    if (coupon.isActive !== true) {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive",
      });
    }

    // ------------------------------------------
    // Current server time
    // ------------------------------------------

    const now = new Date();

    console.log("======================================");
    console.log("COUPON APPLY DEBUG");
    console.log("Coupon:", coupon.code);
    console.log("Server Time:", now.toISOString());
    console.log("Start Date:", coupon.startDate?.toISOString());
    console.log("Expiry Date:", coupon.expiryDate?.toISOString());
    console.log("Order Amount:", amount);
    console.log("======================================");

    // ------------------------------------------
    // Validate dates
    // ------------------------------------------

    if (!coupon.startDate || !coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon date information is missing",
      });
    }

    const startDate = new Date(coupon.startDate);
    const expiryDate = new Date(coupon.expiryDate);

    // Invalid date check
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(expiryDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon date",
      });
    }

    // Coupon not started
    if (now.getTime() < startDate.getTime()) {
      return res.status(400).json({
        success: false,
        message: `This coupon will be active from ${startDate.toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
          }
        )}`,
      });
    }

    // Coupon expired
    if (now.getTime() > expiryDate.getTime()) {
      return res.status(400).json({
        success: false,
        message: `This coupon expired on ${expiryDate.toLocaleString(
          "en-IN",
          {
            timeZone: "Asia/Kolkata",
          }
        )}`,
      });
    }

    // ------------------------------------------
    // Usage limit
    // ------------------------------------------

    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // ------------------------------------------
    // Minimum order amount
    // ------------------------------------------

    const minimumOrder = Number(coupon.minOrderAmount || 0);

    if (amount < minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${minimumOrder}`,
      });
    }

    // ------------------------------------------
    // Calculate discount
    // ------------------------------------------

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount =
        (amount * Number(coupon.discountValue)) / 100;
    } else if (coupon.discountType === "fixed") {
      discount = Number(coupon.discountValue);
    }

    // ------------------------------------------
    // Maximum discount
    // ------------------------------------------

    if (
      coupon.maxDiscount !== null &&
      coupon.maxDiscount !== undefined &&
      discount > Number(coupon.maxDiscount)
    ) {
      discount = Number(coupon.maxDiscount);
    }

    // ------------------------------------------
    // Discount cannot exceed order amount
    // ------------------------------------------

    if (discount > amount) {
      discount = amount;
    }

    // ------------------------------------------
    // Round values
    // ------------------------------------------

    discount = Math.round(discount * 100) / 100;

    const finalAmount =
      Math.round((amount - discount) * 100) / 100;

    // ------------------------------------------
    // SUCCESS
    // ------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",

      coupon: {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
      },

      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Apply Coupon Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// GET ACTIVE/VALID COUPONS - CUSTOMER
// ======================================================

const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,

      startDate: {
        $lte: now,
      },

      expiryDate: {
        $gte: now,
      },
    })
      .select(
        "code description discountType discountValue minOrderAmount maxDiscount startDate expiryDate usageLimit usedCount"
      )
      .sort({
        createdAt: -1,
      });

    // ------------------------------------------
    // Remove coupons whose usage limit reached
    // ------------------------------------------

    const validCoupons = coupons.filter((coupon) => {
      if (
        coupon.usageLimit === null ||
        coupon.usageLimit === undefined
      ) {
        return true;
      }

      return coupon.usedCount < coupon.usageLimit;
    });

    return res.status(200).json({
      success: true,
      coupons: validCoupons,
    });
  } catch (error) {
    console.error(
      "Get Active Coupons Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
  applyCoupon,
  getActiveCoupons,
};