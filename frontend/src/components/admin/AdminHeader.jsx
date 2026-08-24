import {
  Menu,
  Bell,
  UserCircle,
} from "lucide-react";

const AdminHeader = ({ onMenuClick }) => {
  return (
    <header
      className="
        sticky top-0 z-30
        h-20
        w-full
        border-b border-gray-200
        bg-white
        shadow-sm
      "
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">

        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-3">

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="
              rounded-xl
              p-2
              text-gray-700
              transition
              hover:bg-gray-100
              lg:hidden
            "
          >
            <Menu size={23} />
          </button>

          {/* Welcome */}
          <div>
            <p className="text-xs font-medium text-gray-500">
              Welcome back
            </p>

            <h2 className="text-lg font-bold text-gray-900">
              Admin
            </h2>
          </div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-3">

          {/* Notification */}
          <button
            type="button"
            className="
              relative
              rounded-xl
              p-2.5
              text-gray-600
              transition
              hover:bg-gray-100
            "
          >
            <Bell size={21} />

            {/* Notification Dot */}
            <span
              className="
                absolute
                right-2
                top-2
                h-2
                w-2
                rounded-full
                bg-red-500
              "
            />
          </button>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          {/* Admin Profile */}
          <div className="flex items-center gap-3">

            {/* Profile Icon */}
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-green-50
                text-green-600
              "
            >
              <UserCircle size={34} />
            </div>

            {/* Profile Name */}
            <div className="hidden sm:block">

              <p className="text-sm font-bold text-gray-900">
                Administrator
              </p>

              <p className="text-xs font-medium text-gray-500">
                Admin
              </p>

            </div>

          </div>

        </div>

      </div>
    </header>
  );
};

export default AdminHeader;