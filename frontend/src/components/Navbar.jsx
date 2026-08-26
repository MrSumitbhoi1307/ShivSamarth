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
    `text-sm font-semibold transition ${
      isActive
        ? "text-green-600"
        : "text-gray-700 hover:text-green-600"
    }`;

  // =====================================================
  // UI
  // =====================================================

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md">

      {/* =====================================================
          MAIN NAVBAR ROW
          Logo, desktop links, search bar, cart, profile,
          hamburger — all in one row
      ===================================================== */}

      <div className="mx-auto flex h-16 md:h-20 max-w-7xl items-center gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-green-600 text-lg md:text-xl font-bold text-white shadow-md">
            SS
          </div>

          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold leading-none text-green-700">
              Shiv Samarth
            </h1>

            <p className="mt-1 text-[9px] md:text-[10px] font-medium uppercase tracking-wider text-gray-500">
              Fresh • Quality • Delivered
            </p>
          </div>
        </Link>

        {/* =================================================
            DESKTOP NAV LINKS
            Home / Shop / Categories — large screens only,
            since the mobile quick-links bar covers these
        ================================================= */}

        <nav className="hidden lg:flex items-center gap-6 ml-4">
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
            SEARCH BAR
            Visible on ALL screen sizes (mobile + desktop)
        ================================================= */}

        <form
          onSubmit={handleSearch}
          className="flex-1 min-w-0 max-w-[220px] sm:max-w-xs md:max-w-md mx-1 md:mx-4"
        >
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groceries..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-xs md:py-2.5 md:pl-10 md:pr-4 md:text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            />
          </div>
        </form>

        {/* =================================================
            RIGHT SIDE ACTIONS
        ================================================= */}

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {/* ---------------- Desktop-only extras ---------------- */}

          <Link
            to="/customer-care"
            className="hidden xl:flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
          >
            <MessageCircle size={16} />
            Customer Care
          </Link>

          <Link
            to="/support"
            className="hidden xl:flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <LifeBuoy size={16} />
            Support
          </Link>

          <Link
            to="/wishlist"
            className="hidden md:flex relative rounded-full p-2 text-gray-600 transition hover:bg-green-50 hover:text-green-600"
          >
            <Heart size={20} />

            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* ---------------- Cart (always visible) ---------------- */}

          <Link
            to="/cart"
            className="relative rounded-full p-2 text-gray-700 transition hover:bg-green-50 hover:text-green-600"
          >
            <ShoppingCart size={22} />

            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ---------------- Desktop profile / login ---------------- */}

          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 transition hover:bg-green-50"
                >
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user?.name || "User"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <span className="hidden xl:block max-w-24 truncate text-sm font-medium text-gray-700">
                    {user?.name || "User"}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* -------- Profile dropdown -------- */}

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                    <div className="border-b border-gray-100 px-3 py-2">
                      <p className="font-semibold text-sm text-gray-800">
                        {user?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {user?.email || ""}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-green-50"
                      >
                        <User size={16} /> My Profile
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-green-50"
                      >
                        <ShoppingCart size={16} /> My Orders
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-green-50"
                      >
                        <User size={16} /> Settings
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full border-t border-gray-100 px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Login
              </Link>
            )}
          </div>

          {/* ---------------- Hamburger (mobile only) ---------------- */}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-1.5 text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE QUICK-LINKS BAR
          Home / Shop / Categories — always visible on mobile,
          right under the main row
      ===================================================== */}

      <div className="flex md:hidden justify-around py-2 border-t border-gray-100 bg-green-50/50">
        <NavLink to="/" onClick={closeMobileMenu} className={navLinkClass}>
          Home
        </NavLink>

        <NavLink to="/products" onClick={closeMobileMenu} className={navLinkClass}>
          Shop
        </NavLink>

        <NavLink to="/categories" onClick={closeMobileMenu} className={navLinkClass}>
          Categories
        </NavLink>
      </div>

      {/* =====================================================
          HAMBURGER DRAWER
          Everything that doesn't fit the main row on mobile:
          Wishlist, Customer Care, Support, Profile/Orders/
          Settings/Logout (or Login if logged out)
      ===================================================== */}

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 shadow-xl md:hidden space-y-2">

          {/* -------- User card / Login button -------- */}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="block w-full rounded-xl bg-green-600 px-4 py-2.5 text-center font-semibold text-white shadow-sm hover:bg-green-700 mb-3"
            >
              Login / Register
            </Link>
          )}

          {/* -------- Wishlist -------- */}

          <Link
            to="/wishlist"
            onClick={closeMobileMenu}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50"
          >
            <span className="flex items-center gap-3">
              <Heart size={18} /> Wishlist
            </span>

            {wishlistCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* -------- Customer Care -------- */}

          <Link
            to="/customer-care"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-green-700 hover:bg-green-50"
          >
            <MessageCircle size={18} /> Customer Care
          </Link>

          {/* -------- Support -------- */}

          <Link
            to="/support"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <LifeBuoy size={18} /> Help & Support
          </Link>

          {/* -------- Authenticated-only links -------- */}

          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50"
              >
                <User size={18} /> My Profile
              </Link>

              <Link
                to="/orders"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50"
              >
                <ShoppingCart size={18} /> My Orders
              </Link>

              <Link
                to="/settings"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50"
              >
                <User size={18} /> Settings
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 mt-2 border-t border-gray-100"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;