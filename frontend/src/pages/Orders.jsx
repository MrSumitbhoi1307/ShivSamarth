import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  PackageX,
  ChevronRight,
  XCircle,
} from "lucide-react";

import API from "../api/axios";

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/orders/my-orders");

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;

    try {
      setCancellingId(orderId);

      const response = await API.patch(
        `/orders/${orderId}/cancel`
      );

      if (response.data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? { ...o, status: "Cancelled" }
              : o
          )
        );
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to cancel order."
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={35} className="animate-spin text-green-600" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <p className="text-sm font-semibold text-green-600">
            Account
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Track and manage your orders.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {orders.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
            <PackageX size={40} className="text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/products"
              className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              Start Shopping
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs text-gray-400">
                    Order ID
                  </p>
                  <p className="font-semibold text-gray-800">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Placed on
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColors[order.status] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <p className="text-gray-700">
                      {item.name}{" "}
                      <span className="text-gray-400">
                        × {item.quantity}
                      </span>
                    </p>
                    <p className="font-medium text-gray-800">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}

                {order.items?.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{order.items.length - 3} more item(s)
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <p className="font-bold text-gray-900">
                  Total: ₹
                  {Number(order.totalAmount || 0).toLocaleString(
                    "en-IN"
                  )}
                </p>

                <div className="flex items-center gap-2">
                  {(order.status === "Pending" ||
                    order.status === "Confirmed") && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      disabled={cancellingId === order._id}
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancellingId === order._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      Cancel
                    </button>
                  )}

                  <Link
  to={`/orders/${order._id}`}
  className="flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
>
  Track My Order
  <ChevronRight size={14} />
</Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
};

export default Orders;