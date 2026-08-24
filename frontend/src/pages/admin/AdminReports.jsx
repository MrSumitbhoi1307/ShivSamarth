import React, { useEffect, useState } from "react";
import API from "../../api/axios";

// ==========================================
// ADMIN REPORTS
// ==========================================

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // GET REPORT
  // ========================================

  const getReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/reports/admin");

      if (response.data?.success) {
        setReport(response.data.report);
      } else {
        setError(
          response.data?.message ||
            "Failed to load report"
        );
      }
    } catch (error) {
      console.error(
        "Get Report Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load report"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD REPORT
  // ========================================

  useEffect(() => {
    getReport();
  }, []);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>

            <p className="text-gray-600">
              Loading reports...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Unable to load report
          </h2>

          <p className="mb-6 text-gray-600">
            {error}
          </p>

          <button
            onClick={getReport}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // SAFE DATA
  // ========================================

  const users = report?.users || {};

  const products = report?.products || {};

  const orders = report?.orders || {};

  const revenue = report?.revenue || {};

  // ========================================
  // FORMAT CURRENCY
  // ========================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  // ========================================
  // REPORT CARD
  // ========================================

  const ReportCard = ({
    title,
    value,
    icon,
    description,
  }) => {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {title}
            </p>

            <h3 className="mt-2 text-2xl font-bold text-gray-900">
              {value}
            </h3>

            {description && (
              <p className="mt-1 text-xs text-gray-400">
                {description}
              </p>
            )}
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of your store performance
          </p>
        </div>

        <button
          onClick={getReport}
          className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
        >
          ↻ Refresh Report
        </button>
      </div>

      {/* ================================== */}
      {/* REVENUE + ORDERS */}
      {/* ================================== */}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <ReportCard
          title="Total Revenue"
          value={formatCurrency(
            revenue.total
          )}
          icon="₹"
          description="Delivered & paid orders"
        />

        <ReportCard
          title="Total Orders"
          value={orders.total || 0}
          icon="🛒"
          description="All orders"
        />

        <ReportCard
          title="Completed Orders"
          value={orders.completed || 0}
          icon="✓"
          description="Successfully delivered"
        />

        <ReportCard
          title="Total Customers"
          value={users.total || 0}
          icon="👥"
          description="Registered customers"
        />

      </div>

      {/* ================================== */}
      {/* PRODUCT STATS */}
      {/* ================================== */}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <ReportCard
          title="Total Products"
          value={products.total || 0}
          icon="📦"
          description="All products"
        />

        <ReportCard
          title="Active Products"
          value={products.active || 0}
          icon="🟢"
          description="Currently active"
        />

        <ReportCard
          title="Out of Stock"
          value={products.outOfStock || 0}
          icon="⚠️"
          description="Need restocking"
        />

        <ReportCard
          title="Cancelled Orders"
          value={orders.cancelled || 0}
          icon="❌"
          description="Cancelled orders"
        />

      </div>

      {/* ================================== */}
      {/* ORDER STATUS */}
      {/* ================================== */}

      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Order Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current order status breakdown
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl bg-yellow-50 p-5">
            <p className="text-sm font-medium text-yellow-700">
              Pending Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-800">
              {orders.pending || 0}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-5">
            <p className="text-sm font-medium text-green-700">
              Completed Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-green-800">
              {orders.completed || 0}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              Cancelled Orders
            </p>

            <p className="mt-2 text-3xl font-bold text-red-800">
              {orders.cancelled || 0}
            </p>
          </div>

        </div>
      </div>

      {/* ================================== */}
      {/* REVENUE SECTION */}
      {/* ================================== */}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Revenue Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Overall store revenue generated from
            delivered and paid orders
          </p>
        </div>

        <div className="rounded-xl bg-green-50 p-6">

          <p className="text-sm font-medium text-green-700">
            Total Revenue
          </p>

          <p className="mt-2 text-4xl font-bold text-green-800">
            {formatCurrency(revenue.total)}
          </p>

        </div>

      </div>

    </div>
  );
};

export default AdminReports;