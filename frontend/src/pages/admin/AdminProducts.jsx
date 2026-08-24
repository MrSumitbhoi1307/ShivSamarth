import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Loader2,
  PackageX,
  Pencil,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

import API from "../../api/axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all"); // all | active | inactive

  const [actionId, setActionId] = useState(null);

  // =========================
  // Fetch Products
  // =========================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) params.search = search.trim();
      if (status !== "all") params.status = status;

      const response = await API.get("/products/admin/all", { params });

      if (response.data?.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // =========================
  // Search (debounced-ish, on submit)
  // =========================

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // =========================
  // Delete (soft delete)
  // =========================

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete (deactivate) this product?")) return;

    try {
      setActionId(productId);

      const response = await API.delete(`/products/admin/${productId}`);

      if (response.data?.success) {
        await fetchProducts();
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to delete product."
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================
  // Restore
  // =========================

  const handleRestore = async (productId) => {
    try {
      setActionId(productId);

      const response = await API.patch(
        `/products/admin/${productId}/restore`
      );

      if (response.data?.success) {
        await fetchProducts();
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Unable to restore product."
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================
  // Derived counts
  // =========================

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const lowStockCount = products.filter(
    (p) => p.isActive && p.stockQuantity > 0 && p.stockQuantity <= 5
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-6 lg:p-8">

      {/* ================= HEADER ================= */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green-600">
            Shiv Samarth Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Loading..." : `Total Products: ${totalCount}`}
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-green-700"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {/* ================= STATS ================= */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Inactive</p>
          <p className="mt-1 text-2xl font-bold text-gray-500">
            {inactiveCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Low Stock</p>
          <p className="mt-1 text-2xl font-bold text-orange-500">
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">

        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
            />
          </div>
        </form>

        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                status === opt.value
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ERROR ================= */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="rounded-2xl bg-white shadow-sm">

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={30} className="animate-spin text-green-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageX size={40} className="text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              No products found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.unit}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {product.category?.name || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{product.offerPrice}
                      </p>
                      {product.offerPrice < product.actualPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{product.actualPrice}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          product.stockQuantity === 0
                            ? "text-red-500"
                            : product.stockQuantity <= 5
                            ? "text-orange-500"
                            : "text-gray-700"
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                      {product.stockQuantity > 0 &&
                        product.stockQuantity <= 5 && (
                          <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold text-orange-500">
                            <AlertTriangle size={10} />
                            Low
                          </span>
                        )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>

                        {product.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            disabled={actionId === product._id}
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Deactivate"
                          >
                            {actionId === product._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestore(product._id)}
                            disabled={actionId === product._id}
                            className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                            title="Restore"
                          >
                            {actionId === product._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <RotateCcw size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminProducts;