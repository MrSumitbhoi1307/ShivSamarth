import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  PackageX,
  ChevronLeft,
  Package,
  CheckCircle2,
  Truck,
  Home,
  XCircle,
} from "lucide-react";

import API from "../api/axios";

const steps = [
  { key: "Pending", label: "Order Placed", icon: Package },
  { key: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: Home },
];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/orders/${id}`);

      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center dark:bg-gray-900">
        <Loader2 size={35} className="animate-spin text-green-600" />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center dark:bg-gray-900">
        <PackageX size={40} className="text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {error || "Order not found."}
        </p>
        <Link
          to="/orders"
          className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Back to Orders
        </Link>
      </main>
    );
  }

  const isCancelled = order.status === "Cancelled";
  const currentStepIndex = steps.findIndex(
    (s) => s.key === order.status
  );

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-8 dark:bg-gray-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">

        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-green-600 dark:text-gray-300"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 sm:p-8">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5 dark:border-gray-700">
            <div>
              <p className="text-sm font-semibold text-green-600">
                Order Tracking
              </p>
              <h1 className="mt-1 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                statusColors[order.status] || "bg-gray-100 text-gray-600"
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* ================= PROGRESS BAR ================= */}
          <div className="mt-8">
            {isCancelled ? (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 dark:border-red-800 dark:bg-red-900/20">
                <XCircle size={22} className="text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    This order has been cancelled
                  </p>
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Refund (if applicable) will be processed shortly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative flex items-start justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isActive = index === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="relative z-10 flex flex-1 flex-col items-center text-center"
                    >
                      {/* Connector line */}
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute left-1/2 top-5 h-0.5 w-full ${
                            index < currentStepIndex
                              ? "bg-green-600"
                              : "bg-gray-200 dark:bg-gray-600"
                          }`}
                        />
                      )}

                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                          isCompleted
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-gray-200 bg-white text-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500"
                        } ${isActive ? "ring-4 ring-green-100 dark:ring-green-900/40" : ""}`}
                      >
                        <Icon size={18} />
                      </div>

                      <p
                        className={`mt-2 text-xs font-semibold sm:text-sm ${
                          isCompleted
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= SHIPPING ADDRESS ================= */}
          <div className="mt-8 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Delivery Address
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {order.shippingAddress?.fullName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.shippingAddress?.addressLine},{" "}
              {order.shippingAddress?.city} -{" "}
              {order.shippingAddress?.pincode}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📞 {order.shippingAddress?.phone}
            </p>
          </div>

          {/* ================= ITEMS ================= */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-gray-800 dark:text-gray-100">
              Items ({order.items?.length || 0})
            </p>

            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-700"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-700">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-300">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-400">Payment Method</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">Total Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default OrderTracking;