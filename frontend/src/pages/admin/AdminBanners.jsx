import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  X,
  Save,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

// ==========================================
// AUTH HEADER HELPER
// ==========================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const EMPTY_FORM = {
  title: "",
  description: "",
  badge: "SHIV SAMARTH",
  buttonText: "Shop Now",
  buttonLink: "/shop",
  image: "",
  position: "50% 50%",
  order: 0,
  isActive: true,
};

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  // ==========================================
  // FETCH BANNERS
  // ==========================================

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/banners/admin`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        setBanners(response.data.banners || []);
      } else {
        setBanners([]);
        setError(
          response.data?.message || "Unable to load banners"
        );
      }
    } catch (error) {
      console.error("Get Banners Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load banners"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ==========================================
  // CLEAR MESSAGES
  // ==========================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ==========================================
  // FORM INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const handleAddBanner = () => {
    clearMessages();

    setEditingBanner(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleEditBanner = (banner) => {
    clearMessages();

    setEditingBanner(banner);

    setForm({
      title: banner.title || "",
      description: banner.description || "",
      badge: banner.badge || "SHIV SAMARTH",
      buttonText: banner.buttonText || "Shop Now",
      buttonLink: banner.buttonLink || "/shop",
      image: banner.image || "",
      position: banner.position || "50% 50%",
      order: banner.order ?? 0,
      isActive: banner.isActive ?? true,
    });

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingBanner(null);
    setForm(EMPTY_FORM);
  };

  // ==========================================
  // CREATE / UPDATE BANNER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!form.title.trim()) {
      setError("Banner title is required.");
      return;
    }

    if (!form.image.trim()) {
      setError("Banner image URL is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        badge: form.badge.trim() || "SHIV SAMARTH",
        buttonText: form.buttonText.trim() || "Shop Now",
        buttonLink: form.buttonLink.trim() || "/shop",
        image: form.image.trim(),
        position: form.position.trim() || "50% 50%",
        order: Number(form.order) || 0,
        isActive: Boolean(form.isActive),
      };

      let response;

      if (editingBanner?._id) {
        response = await axios.put(
          `${API_URL}/api/banners/${editingBanner._id}`,
          payload,
          {
            headers: getAuthHeaders(),
            withCredentials: true,
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/api/banners`,
          payload,
          {
            headers: getAuthHeaders(),
            withCredentials: true,
          }
        );
      }

      if (response.data?.success) {
        setSuccess(
          editingBanner
            ? "Banner updated successfully."
            : "Banner created successfully."
        );

        setShowModal(false);
        setEditingBanner(null);
        setForm(EMPTY_FORM);

        await fetchBanners();
      } else {
        setError(
          response.data?.message ||
            "Unable to save banner."
        );
      }
    } catch (error) {
      console.error("Save Banner Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to save banner."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE BANNER
  // ==========================================

  const handleDelete = async (banner) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${banner.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(banner._id);
      clearMessages();

      const response = await axios.delete(
        `${API_URL}/api/banners/${banner._id}`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        setSuccess("Banner deleted successfully.");

        setBanners((prev) =>
          prev.filter(
            (item) => item._id !== banner._id
          )
        );
      } else {
        setError(
          response.data?.message ||
            "Unable to delete banner."
        );
      }
    } catch (error) {
      console.error("Delete Banner Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete banner."
      );
    } finally {
      setDeletingId("");
    }
  };

  // ==========================================
  // TOGGLE STATUS
  // ==========================================

  const handleToggleStatus = async (banner) => {
    try {
      clearMessages();

      const response = await axios.put(
        `${API_URL}/api/banners/${banner._id}`,
        {
          isActive: !banner.isActive,
        },
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        setBanners((prev) =>
          prev.map((item) =>
            item._id === banner._id
              ? response.data.banner
              : item
          )
        );

        setSuccess(
          banner.isActive
            ? "Banner deactivated."
            : "Banner activated."
        );
      } else {
        setError(
          response.data?.message ||
            "Unable to update banner status."
        );
      }
    } catch (error) {
      console.error(
        "Toggle Banner Status Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update banner status."
      );
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredBanners = banners.filter((banner) => {
    const searchText = search
      .trim()
      .toLowerCase();

    if (!searchText) return true;

    return (
      banner.title
        ?.toLowerCase()
        .includes(searchText) ||
      banner.description
        ?.toLowerCase()
        .includes(searchText) ||
      banner.badge
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // ==========================================
  // STATS
  // ==========================================

  const totalBanners = banners.length;

  const activeBanners = banners.filter(
    (banner) => banner.isActive
  ).length;

  const inactiveBanners = banners.filter(
    (banner) => !banner.isActive
  ).length;

  // ==========================================
  // DATE FORMAT
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

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <p className="text-sm font-semibold text-green-600">
            Shiv Samarth Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Banner Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage homepage banners, images and promotions
          </p>
        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={fetchBanners}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handleAddBanner}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus size={18} />

            Add Banner
          </button>

        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* STATS */}

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Banners
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            {totalBanners}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Active Banners
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {activeBanners}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Inactive Banners
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {inactiveBanners}
          </h2>
        </div>

      </div>

      {/* SEARCH */}

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

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
            placeholder="Search banners..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
          />

        </div>

      </div>

      {/* BANNERS */}

      <div className="rounded-2xl bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-5">

          <h2 className="text-lg font-bold text-gray-900">
            All Banners
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {filteredBanners.length} banner(s) found
          </p>

        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">

              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

              <p className="text-sm text-gray-500">
                Loading banners...
              </p>

            </div>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center px-5">
            <div className="text-center">

              <ImageIcon
                size={45}
                className="mx-auto mb-3 text-gray-300"
              />

              <h3 className="text-lg font-bold text-gray-700">
                No banners found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create your first homepage banner.
              </p>

              <button
                type="button"
                onClick={handleAddBanner}
                className="mt-4 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
              >
                Add Banner
              </button>

            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-gray-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Banner
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Button
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredBanners.map((banner) => {

                  const isDeleting =
                    deletingId === banner._id;

                  return (
                    <tr
                      key={banner._id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* BANNER */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-4">

                          <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                            {banner.image ? (
                              <img
                                src={banner.image}
                                alt={banner.title}
                                className="h-full w-full object-cover"
                                style={{
                                  objectPosition:
                                    banner.position ||
                                    "50% 50%",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-400">
                                <ImageIcon size={25} />
                              </div>
                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="font-bold text-gray-900">
                              {banner.title}
                            </p>

                            {banner.badge && (
                              <span className="mt-1 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
                                {banner.badge}
                              </span>
                            )}

                            {banner.description && (
                              <p className="mt-1 max-w-md truncate text-sm text-gray-500">
                                {banner.description}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* BUTTON */}

                      <td className="px-5 py-5">

                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {banner.buttonText || "Shop Now"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {banner.buttonLink || "/shop"}
                          </p>
                        </div>

                      </td>

                      {/* ORDER */}

                      <td className="px-5 py-5">

                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-gray-100 px-2 text-sm font-bold text-gray-700">
                          {banner.order ?? 0}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(
                              banner
                            )
                          }
                          className={
                            banner.isActive
                              ? "inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700"
                              : "inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700"
                          }
                        >

                          <span
                            className={
                              banner.isActive
                                ? "h-1.5 w-1.5 rounded-full bg-green-600"
                                : "h-1.5 w-1.5 rounded-full bg-red-600"
                            }
                          />

                          {banner.isActive
                            ? "Active"
                            : "Inactive"}

                        </button>

                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-5 text-sm text-gray-600">
                        {formatDate(
                          banner.createdAt
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditBanner(
                                banner
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                          >
                            <Edit size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() =>
                              handleDelete(
                                banner
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 size={15} />

                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
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

      {/* ==========================================
          MODAL
      ========================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {editingBanner
                    ? "Edit Banner"
                    : "Add New Banner"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure your homepage banner.
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid gap-6 lg:grid-cols-2">

                {/* LEFT */}

                <div className="space-y-5">

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Title *
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Fresh Groceries Delivered"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Write a short banner description..."
                      className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Badge
                    </label>

                    <input
                      type="text"
                      name="badge"
                      value={form.badge}
                      onChange={handleChange}
                      placeholder="SHIV SAMARTH"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Button Text
                      </label>

                      <input
                        type="text"
                        name="buttonText"
                        value={form.buttonText}
                        onChange={handleChange}
                        placeholder="Shop Now"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Button Link
                      </label>

                      <input
                        type="text"
                        name="buttonLink"
                        value={form.buttonLink}
                        onChange={handleChange}
                        placeholder="/shop"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      />

                    </div>

                  </div>

                </div>

                {/* RIGHT */}

                <div className="space-y-5">

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Image URL *
                    </label>

                    <input
                      type="text"
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                    />

                  </div>

                  {/* PREVIEW */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Preview
                    </label>

                    <div className="relative aspect-[16/7] overflow-hidden rounded-xl bg-gray-100">

                      {form.image ? (
                        <>
                          <img
                            src={form.image}
                            alt="Banner Preview"
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition:
                                form.position ||
                                "50% 50%",
                            }}
                          />

                          <div className="absolute inset-0 bg-black/30" />

                          <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">

                            {form.badge && (
                              <p className="mb-2 text-xs font-bold uppercase tracking-widest">
                                {form.badge}
                              </p>
                            )}

                            <h3 className="max-w-md text-2xl font-bold">
                              {form.title ||
                                "Banner Title"}
                            </h3>

                            {form.description && (
                              <p className="mt-2 max-w-md text-sm text-white/90">
                                {form.description}
                              </p>
                            )}

                          </div>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <div className="text-center">

                            <ImageIcon
                              size={35}
                              className="mx-auto mb-2"
                            />

                            <p className="text-sm">
                              Image preview
                            </p>

                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Position
                      </label>

                      <input
                        type="text"
                        name="position"
                        value={form.position}
                        onChange={handleChange}
                        placeholder="50% 50%"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Display Order
                      </label>

                      <input
                        type="number"
                        name="order"
                        value={form.order}
                        onChange={handleChange}
                        min="0"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100"
                      />

                    </div>

                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">

                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 accent-green-600"
                    />

                    <div>

                      <p className="text-sm font-bold text-gray-800">
                        Active Banner
                      </p>

                      <p className="text-xs text-gray-500">
                        Show this banner on the website.
                      </p>

                    </div>

                  </label>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : editingBanner
                    ? "Update Banner"
                    : "Create Banner"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </main>
  );
};

export default AdminBanners;