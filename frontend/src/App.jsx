import { Routes, Route } from "react-router-dom";

// =========================
// Components
// =========================

import Navbar from "./components/Navbar";

// =========================
// User Pages
// =========================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import OrderTracking from "./pages/OrderTracking";
import Settings from "./pages/Settings";
import CustomerCare from "./pages/CustomerCare";
import Support from "./pages/Support";

// =========================
// Admin
// =========================

import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminReports from "./pages/admin/AdminReports";
import AdminProfile from "./pages/admin/AdminProfile";


function App() {
  return (
    <Routes>

      {/* =====================================================
          USER WEBSITE
      ===================================================== */}

      {/* =========================
          HOME
      ========================= */}

      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
          </>
        }
      />

      {/* =========================
          LOGIN
      ========================= */}

      <Route
        path="/login"
        element={
          <>
            <Navbar />
            <Login />
          </>
        }
      />

      {/* =========================
          REGISTER
      ========================= */}

      <Route
        path="/register"
        element={
          <>
            <Navbar />
            <Register />
          </>
        }
      />

      {/* =========================
          PRODUCTS / SHOP
      ========================= */}

      <Route
        path="/products"
        element={
          <>
            <Navbar />
            <Products />
          </>
        }
      />

      {/* =========================
          PRODUCT DETAILS
      ========================= */}

      <Route
        path="/products/:id"
        element={
          <>
            <Navbar />
            <ProductDetails />
          </>
        }
      />

      {/* =========================
          CATEGORIES
      ========================= */}

      <Route
        path="/categories"
        element={
          <>
            <Navbar />
            <Categories />
          </>
        }
      />

      {/* =====================================================
          CUSTOMER CARE
      ===================================================== */}

      <Route
        path="/customer-care"
        element={
          <>
            <Navbar />
            <CustomerCare />
          </>
        }
      />

      {/* =====================================================
          HELP & SUPPORT
      ===================================================== */}

      <Route
        path="/support"
        element={
          <>
            <Navbar />
            <Support />
          </>
        }
      />

      {/* =========================
          WISHLIST
      ========================= */}

      <Route
        path="/wishlist"
        element={
          <>
            <Navbar />
            <Wishlist />
          </>
        }
      />

      {/* =========================
          CART
      ========================= */}

      <Route
        path="/cart"
        element={
          <>
            <Navbar />
            <Cart />
          </>
        }
      />

      {/* =========================
          CHECKOUT
      ========================= */}

      <Route
        path="/checkout"
        element={
          <>
            <Navbar />
            <Checkout />
          </>
        }
      />

      {/* =========================
          ORDERS
      ========================= */}

      <Route
        path="/orders"
        element={
          <>
            <Navbar />
            <Orders />
          </>
        }
      />

      {/* =========================
          ORDER TRACKING
      ========================= */}

      <Route
        path="/orders/:id"
        element={
          <>
            <Navbar />
            <OrderTracking />
          </>
        }
      />

      {/* =========================
          PROFILE
      ========================= */}

      <Route
        path="/profile"
        element={
          <>
            <Navbar />
            <Profile />
          </>
        }
      />

      {/* =========================
          SETTINGS
      ========================= */}

      <Route
        path="/settings"
        element={
          <>
            <Navbar />
            <Settings />
          </>
        }
      />


      {/* =====================================================
          ADMIN PANEL
      ===================================================== */}

      <Route element={<AdminRoute />}>

        <Route element={<AdminLayout />}>

          {/* Dashboard */}

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          {/* Products */}

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/products/add"
            element={<AdminAddProduct />}
          />

          <Route
            path="/admin/products/edit/:id"
            element={<AdminEditProduct />}
          />

          {/* Categories */}

          <Route
            path="/admin/categories"
            element={<AdminCategories />}
          />

          {/* Orders */}

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          {/* Users */}

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          {/* Banners */}

          <Route
            path="/admin/banners"
            element={<AdminBanners />}
          />

          {/* Coupons */}

          <Route
            path="/admin/coupons"
            element={<AdminCoupons />}
          />

          {/* Reports */}

          <Route
            path="/admin/reports"
            element={<AdminReports />}
          />

          {/* Admin Profile */}

          <Route
            path="/admin/profile"
            element={<AdminProfile />}
          />

        </Route>

      </Route>

    </Routes>
  );
}

export default App;