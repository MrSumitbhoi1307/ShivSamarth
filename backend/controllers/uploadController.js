const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image file is required",
      });
    }

    if (req.files.length < 4) {
      return res.status(400).json({
        success: false,
        message: "At least 4 product images are required",
      });
    }

    const imageUrls = req.files.map((file) => file.path);

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: imageUrls,
    });
  } catch (error) {
    console.error("Upload Images Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while uploading images",
    });
  }
};

module.exports = {
  uploadImages,
};