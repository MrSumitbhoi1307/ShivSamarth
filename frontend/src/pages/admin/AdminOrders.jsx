import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  Eye,
  X,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

import API from "../../api/axios";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (statusFilter !== "All") {
        params.status = statusFilter;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await API.get("/orders/admin/all", {
        params,
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setError(
          response.data.message ||
            "Unable to fetch orders."
        );
      }
    } catch (error) {
      console.error("Fetch Orders Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to fetch orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredOrders = useMemo(() => {
    if (!search.trim()) {
      return orders;
    }

    const searchText = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId =
        order._id?.toLowerCase() || "";

      const userName =
        order.user?.name?.toLowerCase() || "";

      const userEmail =
        order.user?.email?.toLowerCase() || "";

      return (
        orderId.includes(searchText) ||
        userName.includes(searchText) ||
        userEmail.includes(searchText)
      );
    });
  }, [orders, search]);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/orders/admin/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      if (!response.data.success) {
        setError(
          response.data.message ||
            "Unable to update order status."
        );

        return;
      }

      const updatedOrder = response.data.order;

      // Update orders list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? updatedOrder
            : order
        )
      );

      // Update selected order
      setSelectedOrder((prevOrder) =>
        prevOrder?._id === orderId
          ? updatedOrder
          : prevOrder
      );

      setSuccess(
        "Order status updated successfully."
      );
    } catch (error) {
      console.error(
        "Update Order Status Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Confirmed":
        return "bg-blue-100 text-blue-700";

      case "Shipped":
        return "bg-purple-100 text-purple-700";

      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================
  // TOTAL ITEMS
  // ==========================================

  const getTotalItems = (order) => {
    if (!order?.items) return 0;

    return order.items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  };

  // ==========================================
  // CLEAR MESSAGES
  // ==========================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-6 lg:p-8">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-sm font-semibold text-green-600">
            Shiv Samarth Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Order Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage customer orders and update
            delivery status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            clearMessages();
            fetchOrders();
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={18}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh Orders
        </button>
      </div>

      {/* ======================================
          SUCCESS
      ====================================== */}

      {success && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">

        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by order ID, customer name or email..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              clearMessages();
            }}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
          >
            <option value="All">
              All Orders
            </option>

            {STATUS_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* ======================================
          ORDERS TABLE
      ====================================== */}

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <ShoppingBag size={30} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No Orders Found
            </h2>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              There are no orders matching your
              current search or filter.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Items
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredOrders.map((order) => (

                  <tr
                    key={order._id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* ORDER */}

                    <td className="px-6 py-5">

                      <div>
                        <p className="font-bold text-gray-900">
                          #{order._id
                            ?.slice(-8)
                            .toUpperCase()}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(
                            order.createdAt
                          )}
                          {" "}
                          {formatTime(
                            order.createdAt
                          )}
                        </p>
                      </div>

                    </td>

                    {/* CUSTOMER */}

                    <td className="px-6 py-5">

                      <p className="font-semibold text-gray-900">
                        {order.user?.name ||
                          "Customer"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {order.user?.email ||
                          "-"}
                      </p>

                    </td>

                    {/* ITEMS */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                          <Package size={18} />
                        </div>

                        <span className="text-sm font-semibold text-gray-700">
                          {getTotalItems(order)}
                          {" "}
                          {getTotalItems(order) === 1
                            ? "item"
                            : "items"}
                        </span>

                      </div>

                    </td>

                    {/* AMOUNT */}

                    <td className="px-6 py-5">

                      <p className="font-bold text-gray-900">
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </p>

                    </td>

                    {/* PAYMENT */}

                    <td className="px-6 py-5">

                      <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                        {order.paymentMethod ||
                          "COD"}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-5 text-right">

                      <button
                        type="button"
                        onClick={() => {
                          clearMessages();
                          setSelectedOrder(order);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700 transition hover:bg-green-100"
                      >
                        <Eye size={17} />
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ======================================
          ORDER DETAILS MODAL
      ====================================== */}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-5">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                  Order Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  #
                  {selectedOrder._id
                    ?.slice(-8)
                    .toUpperCase()}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="space-y-6 p-6">

              {/* CUSTOMER */}

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">

                <h3 className="font-bold text-gray-900">
                  Customer Information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-xs text-gray-500">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedOrder.user?.name ||
                        selectedOrder.shippingAddress
                          ?.fullName ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                      {selectedOrder.user?.email ||
                        "-"}
                    </p>
                  </div>

                </div>

              </div>

              {/* SHIPPING */}

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">

                <h3 className="font-bold text-gray-900">
                  Shipping Address
                </h3>

                <div className="mt-4 space-y-2 text-sm text-gray-600">

                  <p>
                    <span className="font-semibold text-gray-900">
                      Name:
                    </span>{" "}
                    {selectedOrder.shippingAddress
                      ?.fullName || "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-900">
                      Phone:
                    </span>{" "}
                    {selectedOrder.shippingAddress
                      ?.phone || "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-900">
                      Address:
                    </span>{" "}
                    {selectedOrder.shippingAddress
                      ?.addressLine || "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-900">
                      City:
                    </span>{" "}
                    {selectedOrder.shippingAddress
                      ?.city || "-"}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-900">
                      Pincode:
                    </span>{" "}
                    {selectedOrder.shippingAddress
                      ?.pincode || "-"}
                  </p>

                </div>

              </div>

              {/* PRODUCTS */}

              <div>

                <h3 className="mb-4 font-bold text-gray-900">
                  Ordered Products
                </h3>

                <div className="divide-y rounded-xl border">

                  {selectedOrder.items?.map(
                    (item, index) => (

                      <div
                        key={
                          item.product?._id ||
                          index
                        }
                        className="flex items-center gap-4 p-4"
                      >

                        {/* IMAGE */}

                        {item.product?.images?.[0] ? (
                          <img
                            src={
                              item.product
                                .images[0]
                            }
                            alt={item.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                            <Package size={24} />
                          </div>
                        )}

                        {/* INFO */}

                        <div className="min-w-0 flex-1">

                          <p className="font-semibold text-gray-900">
                            {item.name}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            ₹
                            {Number(
                              item.price || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                            {" × "}
                            {item.quantity}
                          </p>

                        </div>

                        <p className="font-bold text-gray-900">
                          ₹
                          {Number(
                            (item.price || 0) *
                              (item.quantity ||
                                0)
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* PAYMENT + TOTAL */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-gray-50 p-5">

                  <p className="text-xs text-gray-500">
                    Payment Method
                  </p>

                  <p className="mt-2 font-bold text-gray-900">
                    {selectedOrder.paymentMethod ||
                      "COD"}
                  </p>

                </div>

                <div className="rounded-xl bg-green-50 p-5">

                  <p className="text-xs text-green-700">
                    Total Amount
                  </p>

                  <p className="mt-2 text-2xl font-bold text-green-700">
                    ₹
                    {Number(
                      selectedOrder.totalAmount ||
                        0
                    ).toLocaleString("en-IN")}
                  </p>

                </div>

              </div>

              {/* STATUS UPDATE */}

              <div className="rounded-xl border border-green-100 bg-green-50 p-5">

                <div className="mb-3">

                  <h3 className="font-bold text-gray-900">
                    Update Order Status
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Change the current order status.
                  </p>

                </div>

                <select
                  value={
                    selectedOrder.status ||
                    "Pending"
                  }
                  disabled={updatingStatus}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedOrder._id,
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}

                </select>

                {updatingStatus && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700">

                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />

                    Updating order status...
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
};

export default AdminOrders;