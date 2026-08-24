const Banner = require("../models/Banner");

// ==========================================
// HELPER — SAFELY PARSE BOOLEAN VALUES
// (form-data मधून string "true"/"false" येऊ शकतं)
// ==========================================

const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return value === true || value === "true";
};

// ==========================================
// GET ACTIVE BANNERS
// PUBLIC
// GET /api/banners
// ==========================================

const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error("Get Active Banners Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load banners",
    });
  }
};

// ==========================================
// GET ALL BANNERS
// ADMIN
// GET /api/banners/admin
// ==========================================

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({
      order: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error("Get All Banners Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load banners",
    });
  }
};

// ==========================================
// GET SINGLE BANNER
// ADMIN
// GET /api/banners/:id
// ==========================================

const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error("Get Banner By Id Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load banner",
    });
  }
};

// ==========================================
// CREATE BANNER
// ADMIN
// POST /api/banners
// ==========================================

const createBanner = async (req, res) => {
  try {
    const {
      title,
      description,
      badge,
      buttonText,
      buttonLink,
      image,
      position,
      order,
      isActive,
    } = req.body;

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner title is required",
      });
    }

    if (!image || !image.trim()) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    // ---------------------------------------------
    // CREATE
    // ---------------------------------------------

    const banner = await Banner.create({
      title: title.trim(),

      description:
        typeof description === "string" ? description.trim() : "",

      badge:
        typeof badge === "string" && badge.trim()
          ? badge.trim()
          : "SHIV SAMARTH",

      buttonText:
        typeof buttonText === "string" && buttonText.trim()
          ? buttonText.trim()
          : "Shop Now",

      buttonLink:
        typeof buttonLink === "string" && buttonLink.trim()
          ? buttonLink.trim()
          : "/shop",

      image: image.trim(),

      position:
        typeof position === "string" && position.trim()
          ? position.trim()
          : "50% 50%",

      order:
        order !== undefined && order !== null && order !== ""
          ? Number(order)
          : 0,

      isActive: parseBoolean(isActive, true),
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    console.error("Create Banner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create banner",
    });
  }
};

// ==========================================
// UPDATE BANNER
// ADMIN
// PUT /api/banners/:id
// ==========================================

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    const {
      title,
      description,
      badge,
      buttonText,
      buttonLink,
      image,
      position,
      order,
      isActive,
    } = req.body;

    // ---------------------------------------------
    // UPDATE ONLY PROVIDED FIELDS
    // ---------------------------------------------

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Banner title cannot be empty",
        });
      }

      banner.title = title.trim();
    }

    if (description !== undefined) {
      banner.description =
        typeof description === "string" ? description.trim() : "";
    }

    if (badge !== undefined) {
      banner.badge = typeof badge === "string" ? badge.trim() : "";
    }

    if (buttonText !== undefined) {
      banner.buttonText =
        typeof buttonText === "string" ? buttonText.trim() : "";
    }

    if (buttonLink !== undefined) {
      banner.buttonLink =
        typeof buttonLink === "string" ? buttonLink.trim() : "";
    }

    if (image !== undefined) {
      if (!image.trim()) {
        return res.status(400).json({
          success: false,
          message: "Banner image cannot be empty",
        });
      }

      banner.image = image.trim();
    }

    if (position !== undefined) {
      banner.position =
        typeof position === "string" ? position.trim() : "50% 50%";
    }

    if (order !== undefined) {
      banner.order = order === "" ? 0 : Number(order);
    }

    if (isActive !== undefined) {
      banner.isActive = parseBoolean(isActive, banner.isActive);
    }

    await banner.save();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    console.error("Update Banner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update banner",
    });
  }
};

// ==========================================
// DELETE BANNER
// ADMIN
// DELETE /api/banners/:id
// ==========================================

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await Banner.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete Banner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete banner",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};