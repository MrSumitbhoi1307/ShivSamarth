import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  LifeBuoy,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  // =====================================================
  // WISHLIST COUNT
  // =====================================================

  const wishlistCount = wishlist?.products?.length || 0;

  // =====================================================
  // CART COUNT
  // =====================================================

  const cartCount =
    cart?.items?.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    ) || 0;

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    navigate(`/products?search=${encodeURIComponent(value)}`);

    setSearch("");
    setMobileMenuOpen(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    setProfileOpen(false);
    setMobileMenuOpen(false);

    navigate("/login");
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  };

  // =====================================================
  // NAV LINK STYLE
  // =====================================================

  const navLinkClass = ({ isActive }) =>
    `transition ${
      isActive
        ? "font-semibold text-green-600"
        : "text-gray-700 hover:text-green-600"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:px-8">
        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white shadow-md">
            SS
          </div>

          <div className="hidden sm:block">
            <h1 className="text-xl font-bold leading-none text-green-700">
              Shiv Samarth
            </h1>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Fresh • Quality • Delivered
            </p>
          </div>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="hidden items-center gap-6 lg:flex">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>

          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>
        </nav>

        {/* =================================================
            DESKTOP SEARCH
        ================================================= */}

        <form
          onSubmit={handleSearch}
          className="ml-auto hidden max-w-md flex-1 md:flex"
        >
          <div className="relative w-full">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groceries..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>
        </form>

        {/* =================================================
            DESKTOP ACTIONS
        ================================================= */}

        <div className="hidden items-center gap-2 md:flex">
          {/* =================================================
              CUSTOMER CARE
              CORRECT ROUTE = /customer-care
          ================================================= */}

          <Link
            to="/customer-care"
            className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-semibold text-green-700 transition hover:border-green-300 hover:bg-green-100"
            title="Customer Care"
          >
            <MessageCircle size={18} />

            <span className="hidden xl:inline">
              Customer Care
            </span>
          </Link>

          {/* =================================================
              SUPPORT
              CORRECT ROUTE = /support
          ================================================= */}

          <Link
            to="/support"
            className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
            title="Help & Support"
          >
            <LifeBuoy size={18} />

            <span className="hidden xl:inline">
              Support
            </span>
          </Link>

          {/* =================================================
              WISHLIST
          ================================================= */}

          <Link
            to="/wishlist"
            className="relative rounded-full p-2.5 text-gray-600 transition hover:bg-green-50 hover:text-green-600"
            title="Wishlist"
          >
            <Heart size={21} />

            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* =================================================
              CART
          ================================================= */}

          <Link
            to="/cart"
            className="relative rounded-full p-2.5 text-gray-600 transition hover:bg-green-50 hover:text-green-600"
            title="Cart"
          >
            <ShoppingCart size={22} />

            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* =================================================
              PROFILE / LOGIN
          ================================================= */}

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((prev) => !prev)
                }
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 transition hover:border-green-300 hover:bg-green-50"
              >
                {/* Avatar */}

                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user?.name || "User"}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                    {user?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>
                )}

                <span className="hidden max-w-24 truncate text-sm font-medium text-gray-700 xl:block">
                  {user?.name || "User"}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* =================================================
                  PROFILE DROPDOWN
              ================================================= */}

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  {/* User Information */}

                  <div className="border-b border-gray-100 px-3 py-3">
                    <p className="font-semibold text-gray-800">
                      {user?.name || "User"}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {user?.email || ""}
                    </p>
                  </div>

                  <div className="py-2">
                    {/* My Profile */}

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      <User size={18} />
                      My Profile
                    </Link>

                    {/* My Orders */}

                    <Link
                      to="/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      <ShoppingCart size={18} />
                      My Orders
                    </Link>

                    {/* Customer Care */}

                    <Link
                      to="/customer-care"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      <MessageCircle size={18} />
                      Customer Care
                    </Link>

                    {/* Support */}

                    <Link
                      to="/support"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <LifeBuoy size={18} />
                      Help & Support
                    </Link>

                    {/* Settings */}

                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      <User size={18} />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full border-t border-gray-100 px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              Login
            </Link>
          )}
        </div>

        {/* =================================================
            MOBILE MENU BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen((prev) => !prev)
          }
          className="ml-auto rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-5 shadow-sm md:hidden">
          {/* Mobile Search */}

          <form onSubmit={handleSearch} className="mb-5">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groceries..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </form>

          <div className="space-y-1">
            {/* Home */}

            <Link
              to="/"
              onClick={closeMobileMenu}
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
            >
              Home
            </Link>

            {/* Shop */}

            <Link
              to="/products"
              onClick={closeMobileMenu}
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
            >
              Shop
            </Link>

            {/* Categories */}

            <Link
              to="/categories"
              onClick={closeMobileMenu}
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
            >
              Categories
            </Link>

            {/* Customer Care */}

            <Link
              to="/customer-care"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-green-700 hover:bg-green-50"
            >
              <MessageCircle size={19} />
              Customer Care
            </Link>

            {/* Support */}

            <Link
              to="/support"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-blue-700 hover:bg-blue-50"
            >
              <LifeBuoy size={19} />
              Help & Support
            </Link>

            {/* Wishlist */}

            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center justify-between rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
            >
              <span className="flex items-center gap-3">
                <Heart size={19} />
                Wishlist
              </span>

              {wishlistCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}

            <Link
              to="/cart"
              onClick={closeMobileMenu}
              className="flex items-center justify-between rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={19} />
                Cart
              </span>

              {cartCount > 0 && (
                <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* =================================================
                AUTHENTICATED USER
            ================================================= */}

            {isAuthenticated ? (
              <>
                {/* Profile */}

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <User size={19} />
                  My Profile
                </Link>

                {/* Orders */}

                <Link
                  to="/orders"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <ShoppingCart size={19} />
                  My Orders
                </Link>

                {/* Settings */}

                <Link
                  to="/settings"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-700 hover:bg-green-50 hover:text-green-700"
                >
                  <User size={19} />
                  Settings
                </Link>

                {/* Logout */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="mt-3 block rounded-xl bg-green-600 px-4 py-3 text-center font-semibold text-white hover:bg-green-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;