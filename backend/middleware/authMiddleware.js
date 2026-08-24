const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================================================
// PROTECT ROUTES
// ======================================================

const protect = async (req, res, next) => {
  try {
    let token = null;

    // ==================================================
    // 1. CHECK AUTHORIZATION HEADER
    // ==================================================

    const authHeader = req.headers.authorization;

    if (
      authHeader &&
      authHeader.startsWith("Bearer ")
    ) {
      token = authHeader.split(" ")[1];
    }

    // ==================================================
    // 2. CHECK COOKIE
    // ==================================================

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // ==================================================
    // 3. TOKEN NOT FOUND
    // ==================================================

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // ==================================================
    // 4. VERIFY TOKEN
    // ==================================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // ==================================================
    // 5. GET USER
    // ==================================================

    const userId =
      decoded.userId ||
      decoded.id ||
      decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(userId).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // ==================================================
    // 6. CHECK BLOCKED USER
    // ==================================================

    if (user.isBlocked === true) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    // ==================================================
    // 7. ATTACH USER TO REQUEST
    // ==================================================

    req.user = {
      userId: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// ======================================================
// ADMIN PROTECTION
// ======================================================

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};

