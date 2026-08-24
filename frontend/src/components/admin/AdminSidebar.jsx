import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Image,
  TicketPercent,
  BarChart3,
  X,
  UserCircle,
  Loader2,
} from "lucide-react";

import API from "../../api/axios";

const AdminSidebar = ({ open, onClose }) => {
  const [admin, setAdmin] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  // ==========================================
  // MENU ITEMS
  // ==========================================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Tags,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Banners",
      path: "/admin/banners",
      icon: Image,
    },
    {
      name: "Coupons",
      path: "/admin/coupons",
      icon: TicketPercent,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: BarChart3,
    },
  ];

  // ==========================================
  // FETCH ADMIN PROFILE
  // ==========================================

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await API.get("/admin/profile");

        if (response.data?.success) {
          setAdmin(response.data.admin);
        }
      } catch (error) {
        console.error(
          "Sidebar Admin Profile Error:",
          error
        );
      } finally {
        setLoadingAdmin(false);
      }
    };

    fetchAdmin();
  }, []);

  // ==========================================
  // PROFILE INITIAL
  // ==========================================

  const getAdminInitial = () => {
    if (!admin?.name) {
      return "A";
    }

    return admin.name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  return (
    <>
      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-72
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* ====================================
            LOGO
        ==================================== */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b px-6">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              Shiv Samarth
            </h1>

            <p className="text-xs font-semibold text-green-600">
              ADMIN PANEL
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* ====================================
            MENU
        ==================================== */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 rounded-xl px-4 py-3
                  text-sm font-semibold transition
                  ${
                    isActive
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                  }
                  `
                }
              >
                <Icon size={19} />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ====================================
            ADMIN PROFILE
        ==================================== */}

        <div className="shrink-0 border-t border-gray-200 p-4">
          <NavLink
            to="/admin/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `
              flex items-center gap-3 rounded-xl p-3
              transition
              ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "hover:bg-gray-50"
              }
              `
            }
          >
            {/* =================================
                PROFILE PHOTO
            ================================= */}

            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 text-green-700">
              {loadingAdmin ? (
                <Loader2
                  size={22}
                  className="animate-spin"
                />
              ) : admin?.profilePhoto ? (
                <img
                  src={admin.profilePhoto}
                  alt={admin.name || "Admin"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">
                  {getAdminInitial()}
                </span>
              )}
            </div>

            {/* =================================
                ADMIN NAME + ROLE
            ================================= */}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900">
                {loadingAdmin
                  ? "Loading..."
                  : admin?.name || "Admin"}
              </p>

              <p className="truncate text-xs capitalize text-gray-500">
                {admin?.role || "Administrator"}
              </p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
