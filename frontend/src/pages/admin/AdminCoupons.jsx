import { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  Search,
  TicketPercent,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Power,
  X,
} from "lucide-react";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  startDate: "",
  expiryDate: "",
  usageLimit: "",
  isActive: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // ======================================================
  // FETCH COUPONS
  // ======================================================

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/coupons/admin");

      if (response.data.success) {
        setCoupons(response.data.coupons || []);
      }
    } catch (error) {
      console.error("Get Coupons Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load coupons"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ======================================================
  // OPEN CREATE MODAL
  // ======================================================

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue ?? "",
      minOrderAmount: coupon.minOrderAmount ?? "",
      maxDiscount:
        coupon.maxDiscount !== null &&
        coupon.maxDiscount !== undefined
          ? coupon.maxDiscount
          : "",
      startDate: coupon.startDate
        ? coupon.startDate.substring(0, 10)
        : "",
      expiryDate: coupon.expiryDate
        ? coupon.expiryDate.substring(0, 10)
        : "",
      usageLimit:
        coupon.usageLimit !== null &&
        coupon.usageLimit !== undefined
          ? coupon.usageLimit
          : "",
      isActive: coupon.isActive ?? true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    if (actionLoading) return;

    setShowModal(false);
    setEditingCoupon(null);
    setForm(emptyForm);
  };

  // ======================================================
  // CREATE / UPDATE COUPON
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setActionLoading("form");
      setError("");
      setSuccess("");

      if (!form.code.trim()) {
        setError("Coupon code is required");
        return;
      }

      if (!form.discountValue) {
        setError("Discount value is required");
        return;
      }

      if (!form.startDate || !form.expiryDate) {
        setError(
          "Start date and expiry date are required"
        );
        return;
      }

      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount:
          form.minOrderAmount === ""
            ? 0
            : Number(form.minOrderAmount),
        maxDiscount:
          form.maxDiscount === ""
            ? ""
            : Number(form.maxDiscount),
        startDate: form.startDate,
        expiryDate: form.expiryDate,
        usageLimit:
          form.usageLimit === ""
            ? ""
            : Number(form.usageLimit),
        isActive: form.isActive,
      };

      let response;

      if (editingCoupon) {
        response = await API.put(
          `/coupons/${editingCoupon._id}`,
          payload
        );
      } else {
        response = await API.post("/coupons", payload);
      }

      if (response.data.success) {
        setSuccess(
          editingCoupon
            ? "Coupon updated successfully"
            : "Coupon created successfully"
        );

        await fetchCoupons();

        setTimeout(() => {
          closeModal();
          setSuccess("");
        }, 700);
      }
    } catch (error) {
      console.error("Save Coupon Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save coupon"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ======================================================
  // DELETE COUPON
  // ======================================================

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Delete coupon "${coupon.code}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(coupon._id);
      setError("");
      setSuccess("");

      const response = await API.delete(
        `/coupons/${coupon._id}`
      );

      if (response.data.success) {
        setCoupons((prev) =>
          prev.filter(
            (item) => item._id !== coupon._id
          )
        );

        setSuccess("Coupon deleted successfully");
      }
    } catch (error) {
      console.error("Delete Coupon Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete coupon"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ======================================================
  // TOGGLE STATUS
  // ======================================================

  const handleStatusChange = async (coupon) => {
    try {
      setActionLoading(coupon._id);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/coupons/${coupon._id}/status`,
        {
          isActive: !coupon.isActive,
        }
      );

      if (response.data.success) {
        setCoupons((prev) =>
          prev.map((item) =>
            item._id === coupon._id
              ? response.data.coupon
              : item
          )
        );

        setSuccess(
          coupon.isActive
            ? "Coupon deactivated"
            : "Coupon activated"
        );
      }
    } catch (error) {
      console.error(
        "Update Coupon Status Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update coupon status"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ======================================================
  // DATE FORMAT
  // ======================================================

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

  // ======================================================
  // COUPON STATUS
  // ======================================================

  const getCouponStatus = (coupon) => {
    const now = new Date();

    const start = new Date(coupon.startDate);
    const expiry = new Date(coupon.expiryDate);

    if (!coupon.isActive) {
      return "Inactive";
    }

    if (now < start) {
      return "Upcoming";
    }

    if (now > expiry) {
      return "Expired";
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return "Limit Reached";
    }

    return "Active";
  };

  // ======================================================
  // FILTER COUPONS
  // ======================================================

  const filteredCoupons = coupons.filter((coupon) => {
    const status = getCouponStatus(coupon);

    const matchesSearch =
      coupon.code
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      coupon.description
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ======================================================
  // STATISTICS
  // ======================================================

  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter(
    (coupon) =>
      getCouponStatus(coupon) === "Active"
  ).length;

  const expiredCoupons = coupons.filter(
    (coupon) =>
      getCouponStatus(coupon) === "Expired"
  ).length;

  const inactiveCoupons = coupons.filter(
    (coupon) =>
      getCouponStatus(coupon) === "Inactive"
  ).length;

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-6 lg:p-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-semibold text-green-600">
            Shiv Samarth Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Coupon Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create and manage discount coupons
          </p>
        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={fetchCoupons}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus size={18} />
            Create Coupon
          </button>

        </div>
      </div>

      {/* ==================================================
          MESSAGES
      ================================================== */}

      {error && !showModal && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {success && !showModal && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* ==================================================
          STATISTICS
      ================================================== */}

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Coupons
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {totalCoupons}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <TicketPercent size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Coupons
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {activeCoupons}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Power size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Expired Coupons
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {expiredCoupons}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <TicketPercent size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive Coupons
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {inactiveCoupons}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <Power size={23} />
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

        <div className="grid gap-4 lg:grid-cols-[1fr_200px]">

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search coupon code or description..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-green-500 focus:bg-white"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

            <option value="Upcoming">
              Upcoming
            </option>

            <option value="Expired">
              Expired
            </option>

            <option value="Limit Reached">
              Limit Reached
            </option>
          </select>

        </div>

      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-5">

          <h2 className="text-lg font-bold text-gray-900">
            All Coupons
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredCoupons.length} coupon(s) found
          </p>

        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

              <p className="text-sm text-gray-500">
                Loading coupons...
              </p>

            </div>

          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center px-5">

            <div className="text-center">

              <TicketPercent
                size={45}
                className="mx-auto mb-3 text-gray-300"
              />

              <h3 className="text-lg font-bold text-gray-700">
                No coupons found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create a coupon or change your filters.
              </p>

            </div>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Coupon
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Discount
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Minimum Order
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Validity
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Usage
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredCoupons.map((coupon) => {

                  const status = getCouponStatus(coupon);

                  const isLoading =
                    actionLoading === coupon._id;

                  return (
                    <tr
                      key={coupon._id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* COUPON */}

                      <td className="px-5 py-5">

                        <div>

                          <p className="font-bold tracking-wide text-gray-900">
                            {coupon.code}
                          </p>

                          <p className="mt-1 max-w-[250px] text-sm text-gray-500">
                            {coupon.description ||
                              "No description"}
                          </p>

                        </div>

                      </td>

                      {/* DISCOUNT */}

                      <td className="px-5 py-5">

                        <span className="rounded-lg bg-green-50 px-3 py-2 text-sm font-bold text-green-700">

                          {coupon.discountType ===
                          "percentage"
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}

                        </span>

                        {coupon.maxDiscount !== null &&
                          coupon.maxDiscount !==
                            undefined && (
                            <p className="mt-2 text-xs text-gray-500">
                              Max ₹
                              {coupon.maxDiscount}
                            </p>
                          )}

                      </td>

                      {/* MINIMUM ORDER */}

                      <td className="px-5 py-5 text-sm font-semibold text-gray-700">
                        ₹
                        {Number(
                          coupon.minOrderAmount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      {/* VALIDITY */}

                      <td className="px-5 py-5">

                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(
                            coupon.startDate
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          to{" "}
                          {formatDate(
                            coupon.expiryDate
                          )}
                        </p>

                      </td>

                      {/* USAGE */}

                      <td className="px-5 py-5">

                        <p className="text-sm font-bold text-gray-700">
                          {coupon.usedCount || 0}
                          {" / "}
                          {coupon.usageLimit ?? "∞"}
                        </p>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                            status === "Active"
                              ? "bg-green-100 text-green-700"
                              : status === "Upcoming"
                              ? "bg-blue-100 text-blue-700"
                              : status === "Expired"
                              ? "bg-red-100 text-red-700"
                              : status ===
                                "Limit Reached"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {status}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              handleStatusChange(
                                coupon
                              )
                            }
                            title={
                              coupon.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                            className={`rounded-lg p-2 transition ${
                              coupon.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            } disabled:opacity-50`}
                          >
                            <Power size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              openEditModal(coupon)
                            }
                            title="Edit"
                            className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              handleDelete(coupon)
                            }
                            title="Delete"
                            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

              <div>

                <p className="text-sm font-semibold text-green-600">
                  Shiv Samarth Admin
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {editingCoupon
                    ? "Edit Coupon"
                    : "Create Coupon"}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading === "form"}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL BODY */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              {(error || success) && (
                <div className="mb-5">

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                      {success}
                    </div>
                  )}

                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">

                {/* CODE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Coupon Code *
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="WELCOME10"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold uppercase outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* DISCOUNT TYPE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Discount Type *
                  </label>

                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-green-500 focus:bg-white"
                  >
                    <option value="percentage">
                      Percentage (%)
                    </option>

                    <option value="fixed">
                      Fixed Amount (₹)
                    </option>
                  </select>
                </div>

                {/* DISCOUNT VALUE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Discount Value *
                  </label>

                  <input
                    type="number"
                    name="discountValue"
                    value={form.discountValue}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder={
                      form.discountType ===
                      "percentage"
                        ? "10"
                        : "100"
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                  {form.discountType ===
                    "percentage" && (
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum 100%
                    </p>
                  )}
                </div>

                {/* MIN ORDER */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Minimum Order Amount
                  </label>

                  <input
                    type="number"
                    name="minOrderAmount"
                    value={form.minOrderAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="500"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* MAX DISCOUNT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Maximum Discount
                  </label>

                  <input
                    type="number"
                    name="maxDiscount"
                    value={form.maxDiscount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="100"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for no maximum.
                  </p>
                </div>

                {/* USAGE LIMIT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    min="1"
                    placeholder="100"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for unlimited usage.
                  </p>
                </div>

                {/* START DATE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Start Date *
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* EXPIRY DATE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Expiry Date *
                  </label>

                  <input
                    type="date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Welcome discount for new customers"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* ACTIVE */}

                <div className="md:col-span-2">

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">

                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="h-5 w-5 accent-green-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        Active Coupon
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Customers can use this coupon when it
                        is active and within the validity period.
                      </p>
                    </div>

                  </label>

                </div>

              </div>

              {/* MODAL ACTIONS */}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading === "form"}
                  className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading === "form"}
                  className="rounded-xl bg-green-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === "form"
                    ? "Saving..."
                    : editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
};
export default AdminCoupons;