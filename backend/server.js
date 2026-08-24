require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const couponRoutes = require("./routes/couponRoutes");
const reportRoutes = require("./routes/reportRoutes");
const addressRoutes = require("./routes/addressRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const connectDB = require("./config/db");

const app = express();

// ===============================
// DATABASE
// ===============================

connectDB();

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===============================
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/products", productRoutes);

app.use("/api/cart", require("./routes/cartRoutes"));

app.use("/api/orders", require("./routes/orderRoutes"));

app.use("/api/banners", bannerRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/admin/users", adminUserRoutes);

app.use("/api/coupons", couponRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/addresses", addressRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/wishlist", wishlistRoutes);

// ===============================
// ROOT ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Shiv Samarth API is running",
  });
});

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Shiv Samarth Server running on port ${PORT}`);
});