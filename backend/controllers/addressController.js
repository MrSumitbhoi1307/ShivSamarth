const Address = require("../models/Address");

// GET all addresses of logged-in user
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user.userId,
    }).sort({ isDefault: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get Addresses Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching addresses",
    });
  }
};

// ADD new address
const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (!fullName || !phone || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required",
      });
    }

    // If this is set as default, unset previous default
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.userId },
        { $set: { isDefault: false } }
      );
    }

    // If user has no addresses yet, force this as default
    const existingCount = await Address.countDocuments({
      user: req.user.userId,
    });

    const address = await Address.create({
      user: req.user.userId,
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault: isDefault || existingCount === 0,
    });

    return res.status(201).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Add Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding address",
    });
  }
};

// UPDATE address
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        { user: req.user.userId },
        { $set: { isDefault: false } }
      );
    }

    address.fullName = fullName ?? address.fullName;
    address.phone = phone ?? address.phone;
    address.addressLine = addressLine ?? address.addressLine;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.pincode = pincode ?? address.pincode;
    address.isDefault = isDefault ?? address.isDefault;

    await address.save();

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Update Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating address",
    });
  }
};

// DELETE address
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // If deleted address was default, make another one default (if exists)
    if (address.isDefault) {
      const remaining = await Address.findOne({
        user: req.user.userId,
      }).sort({ createdAt: -1 });

      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting address",
    });
  }
};

// SET default address
const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await Address.updateMany(
      { user: req.user.userId },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.error("Set Default Address Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while setting default address",
    });
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};