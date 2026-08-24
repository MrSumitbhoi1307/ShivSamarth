const Category = require("../models/Category");

// ===============================
// CREATE CATEGORY
// ===============================

const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// GET ALL CATEGORIES (public - active only)
// ===============================

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// GET ALL CATEGORIES (admin - active + inactive)
// ===============================

const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get All Categories Admin Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// UPDATE CATEGORY
// ===============================

const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Duplicate name check (only if name is being changed)
    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        _id: { $ne: category._id },
        name: name.trim(),
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// DELETE CATEGORY (soft delete)
// ===============================

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      category,
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===============================
// RESTORE CATEGORY
// ===============================

const restoreCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category restored successfully",
      category,
    });
  } catch (error) {
    console.error("Restore Category Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getAllCategoriesAdmin,
  updateCategory,
  deleteCategory,
  restoreCategory,
};