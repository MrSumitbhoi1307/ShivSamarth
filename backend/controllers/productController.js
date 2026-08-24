const mongoose = require("mongoose");
const Product = require("../models/Product");

// ==========================================
// HELPER — ESCAPE REGEX
// ==========================================

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ==========================================
// HELPER — VALIDATE PRODUCT ID
// ==========================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// HELPER — VALIDATE 4 IMAGES
// ==========================================

const validateImages = (images) => {
  if (!Array.isArray(images)) {
    return {
      valid: false,
      message: "Product images must be an array",
    };
  }

  if (images.length !== 4) {
    return {
      valid: false,
      message: "Exactly 4 product images are required",
    };
  }

  const invalidImage = images.some(
    (image) =>
      typeof image !== "string" ||
      !image.trim()
  );

  if (invalidImage) {
    return {
      valid: false,
      message: "All product images must be valid URLs",
    };
  }

  return {
    valid: true,
  };
};

// ==========================================
// CREATE PRODUCT
// ==========================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      actualPrice,
      offerPrice,
      category,
      description,
      unit,
      stockQuantity,
      images,
    } = req.body;

    // ------------------------------------------
    // REQUIRED FIELDS
    // ------------------------------------------

    if (
      !name ||
      actualPrice === undefined ||
      offerPrice === undefined ||
      !category ||
      !description ||
      !unit ||
      stockQuantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required product fields must be provided",
      });
    }

    // ------------------------------------------
    // VALIDATE CATEGORY ID
    // ------------------------------------------

    if (!isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // ------------------------------------------
    // IMAGE VALIDATION
    // ------------------------------------------

    const imageValidation = validateImages(images);

    if (!imageValidation.valid) {
      return res.status(400).json({
        success: false,
        message: imageValidation.message,
      });
    }

    // ------------------------------------------
    // PRICE VALIDATION
    // ------------------------------------------

    const numericActualPrice = Number(actualPrice);
    const numericOfferPrice = Number(offerPrice);

    if (
      !Number.isFinite(numericActualPrice) ||
      !Number.isFinite(numericOfferPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number",
      });
    }

    if (
      numericActualPrice < 0 ||
      numericOfferPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (numericOfferPrice > numericActualPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Offer price cannot be greater than actual price",
      });
    }

    // ------------------------------------------
    // STOCK VALIDATION
    // ------------------------------------------

    const numericStockQuantity = Number(stockQuantity);

    if (
      !Number.isFinite(numericStockQuantity) ||
      numericStockQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity must be a valid positive number",
      });
    }

    // ------------------------------------------
    // UNIT VALIDATION
    // ------------------------------------------

    const allowedUnits = [
      "kg",
      "gram",
      "litre",
      "ml",
      "piece",
      "pack",
    ];

    if (!allowedUnits.includes(unit)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product unit",
      });
    }

    // ------------------------------------------
    // CLEAN NAME
    // ------------------------------------------

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Product name must contain at least 2 characters",
      });
    }

    // ------------------------------------------
    // DUPLICATE PRODUCT NAME
    // ------------------------------------------

    const existingProduct = await Product.findOne({
      name: {
        $regex: `^${escapeRegex(cleanName)}$`,
        $options: "i",
      },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this name already exists",
      });
    }

    // ------------------------------------------
    // CREATE PRODUCT
    // ------------------------------------------

    const product = await Product.create({
      name: cleanName,

      actualPrice: numericActualPrice,

      offerPrice: numericOfferPrice,

      category,

      description: description.trim(),

      unit,

      stockQuantity: numericStockQuantity,

      images: images.map((image) => image.trim()),

      isActive: true,
    });

    // ------------------------------------------
    // POPULATE CATEGORY
    // ------------------------------------------

    const populatedProduct = await Product.findById(
      product._id
    ).populate("category", "name");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    // Duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A product with this name already exists",
      });
    }

    // Mongoose validation
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

// ==========================================
// GET ALL ACTIVE PRODUCTS
// PUBLIC
// ==========================================

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const filter = {
      isActive: true,
    };

    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    if (search && search.trim()) {
      filter.name = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };
    }

    // ------------------------------------------
    // CATEGORY
    // ------------------------------------------

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      filter.category = category;
    }

    // ------------------------------------------
    // PRICE FILTER
    // ------------------------------------------

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.offerPrice = {};

      if (minPrice !== undefined) {
        const min = Number(minPrice);

        if (!Number.isFinite(min) || min < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minimum price",
          });
        }

        filter.offerPrice.$gte = min;
      }

      if (maxPrice !== undefined) {
        const max = Number(maxPrice);

        if (!Number.isFinite(max) || max < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maximum price",
          });
        }

        filter.offerPrice.$lte = max;
      }
    }

    // ------------------------------------------
    // SORT
    // ------------------------------------------

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "low-to-high") {
      sortOption = {
        offerPrice: 1,
      };
    }

    if (sort === "high-to-low") {
      sortOption = {
        offerPrice: -1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    // ------------------------------------------
    // FETCH
    // ------------------------------------------

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// ==========================================
// GET SINGLE ACTIVE PRODUCT
// PUBLIC
// ==========================================

const getProductById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// ==========================================
// UPDATE PRODUCT
// ADMIN ONLY
// ==========================================

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const {
      name,
      actualPrice,
      offerPrice,
      category,
      description,
      unit,
      stockQuantity,
      images,
    } = req.body;

    // ------------------------------------------
    // FIND PRODUCT
    // ------------------------------------------

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ------------------------------------------
    // IMAGE VALIDATION
    // ------------------------------------------

    if (images !== undefined) {
      const imageValidation = validateImages(images);

      if (!imageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: imageValidation.message,
        });
      }
    }

    // ------------------------------------------
    // PRICE
    // ------------------------------------------

    const newActualPrice =
      actualPrice !== undefined
        ? Number(actualPrice)
        : product.actualPrice;

    const newOfferPrice =
      offerPrice !== undefined
        ? Number(offerPrice)
        : product.offerPrice;

    if (
      !Number.isFinite(newActualPrice) ||
      !Number.isFinite(newOfferPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number",
      });
    }

    if (
      newActualPrice < 0 ||
      newOfferPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (newOfferPrice > newActualPrice) {
      return res.status(400).json({
        success: false,
        message:
          "Offer price cannot be greater than actual price",
      });
    }

    // ------------------------------------------
    // STOCK
    // ------------------------------------------

    let newStockQuantity =
      product.stockQuantity;

    if (stockQuantity !== undefined) {
      newStockQuantity = Number(stockQuantity);

      if (
        !Number.isFinite(newStockQuantity) ||
        newStockQuantity < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Stock quantity cannot be negative",
        });
      }
    }

    // ------------------------------------------
    // CATEGORY
    // ------------------------------------------

    if (category !== undefined) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
    }

    // ------------------------------------------
    // UNIT
    // ------------------------------------------

    if (unit !== undefined) {
      const allowedUnits = [
        "kg",
        "gram",
        "litre",
        "ml",
        "piece",
        "pack",
      ];

      if (!allowedUnits.includes(unit)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product unit",
        });
      }
    }

    // ------------------------------------------
    // NAME
    // ------------------------------------------

    if (name !== undefined) {
      const cleanName = name.trim();

      if (cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Product name must contain at least 2 characters",
        });
      }

      if (
        cleanName.toLowerCase() !==
        product.name.trim().toLowerCase()
      ) {
        const existingProduct =
          await Product.findOne({
            _id: {
              $ne: product._id,
            },
            name: {
              $regex: `^${escapeRegex(cleanName)}$`,
              $options: "i",
            },
          });

        if (existingProduct) {
          return res.status(409).json({
            success: false,
            message:
              "A product with this name already exists",
          });
        }
      }

      product.name = cleanName;
    }

    // ------------------------------------------
    // APPLY UPDATE
    // ------------------------------------------

    if (actualPrice !== undefined) {
      product.actualPrice =
        newActualPrice;
    }

    if (offerPrice !== undefined) {
      product.offerPrice =
        newOfferPrice;
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Description is required",
        });
      }

      product.description =
        description.trim();
    }

    if (unit !== undefined) {
      product.unit = unit;
    }

    if (stockQuantity !== undefined) {
      product.stockQuantity =
        newStockQuantity;
    }

    if (images !== undefined) {
      product.images = images.map(
        (image) => image.trim()
      );
    }

    await product.save();

    // ------------------------------------------
    // POPULATE
    // ------------------------------------------

    const populatedProduct =
      await Product.findById(
        product._id
      ).populate("category", "name");

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A product with this name already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating product",
    });
  }
};

// ==========================================
// UPDATE STOCK
// ADMIN ONLY
// ==========================================

const updateStock = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const {
      stockQuantity,
    } = req.body;

    if (stockQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity is required",
      });
    }

    const numericStock =
      Number(stockQuantity);

    if (
      !Number.isFinite(numericStock) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity cannot be negative",
      });
    }

    const product =
      await Product.findByIdAndUpdate(
        productId,
        {
          stockQuantity: numericStock,
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update Stock Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating stock",
    });
  }
};

// ==========================================
// DELETE PRODUCT
// SOFT DELETE
// ADMIN ONLY
// ==========================================

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Product is already deleted",
      });
    }

    product.isActive = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting product",
    });
  }
};

// ==========================================
// RESTORE PRODUCT
// ADMIN ONLY
// ==========================================

const restoreProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Product is already active",
      });
    }

    product.isActive = true;

    await product.save();

    const populatedProduct =
      await Product.findById(
        product._id
      ).populate("category", "name");

    return res.status(200).json({
      success: true,
      message:
        "Product restored successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error(
      "Restore Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while restoring product",
    });
  }
};

// ==========================================
// GET ALL PRODUCTS FOR ADMIN
// ACTIVE + INACTIVE
// ADMIN ONLY
// ==========================================

const getAdminProducts = async (req, res) => {
  try {
    const {
      search,
      status,
    } = req.query;

    const filter = {};

    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

    if (search && search.trim()) {
      filter.name = {
        $regex: escapeRegex(
          search.trim()
        ),
        $options: "i",
      };
    }

    // ------------------------------------------
    // STATUS
    // ------------------------------------------

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    // ------------------------------------------
    // FETCH
    // ------------------------------------------

    const products =
      await Product.find(filter)
        .populate("category", "name")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Get Admin Products Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching admin products",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  restoreProduct,
  getAdminProducts,
};