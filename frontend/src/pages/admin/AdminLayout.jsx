import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">

        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main>
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;