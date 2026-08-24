import React, { useEffect, useState } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import API from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    lowStock: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/admin/dashboard");

        if (response.data?.success) {
          setStats(response.data.stats || {});
          setRecentOrders(response.data.recentOrders || []);
        } else {
          setError(
            response.data?.message ||
              "Failed to load dashboard"
          );
        }
      } catch (err) {
        console.error("Admin Dashboard Error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-green-600">
          <Loader2
            size={25}
            className="animate-spin"
          />

          <span className="font-semibold">
            Loading dashboard...
          </span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-700">
            Unable to Load Dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: "Total Sales",
      value: `₹${Number(stats.totalSales || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-green-600">
          Shiv Samarth Admin
        </p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage your grocery store from one place.
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Icon size={24} />
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {/* RECENT ORDERS */}
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest customer orders
          </p>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">
              No orders available
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="px-4 py-3">
                    Order
                  </th>

                  <th className="px-4 py-3">
                    Customer
                  </th>

                  <th className="px-4 py-3">
                    Amount
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {order.orderNumber || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">
                        {order.user?.name || "Unknown"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {order.user?.email || ""}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </section>

    </main>
  );
};

export default AdminDashboard;