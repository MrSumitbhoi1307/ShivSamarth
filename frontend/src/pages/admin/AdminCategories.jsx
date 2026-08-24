import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
  X,
  ImagePlus,
  FolderX,
} from "lucide-react";

import API from "../../api/axios";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // =========================
  // MODAL STATE
  // =========================

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/categories/admin/all");

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // DELETE (soft) / RESTORE
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category? You can restore it later."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(id);

      const response = await API.delete(`/categories/${id}`);

      if (response.data.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, isActive: false } : c
          )
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete category."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      setActionLoadingId(id);

      const response = await API.patch(`/categories/${id}/restore`);

      if (response.data.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, isActive: true } : c
          )
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to restore category."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================
  // OPEN / CLOSE MODAL
  // =========================

  const openAddModal = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // =========================
  // SUCCESS HANDLER
  // =========================

  const handleSaved = (savedCategory) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c._id === savedCategory._id);

      if (exists) {
        return prev.map((c) =>
          c._id === savedCategory._id ? savedCategory : c
        );
      }

      return [savedCategory, ...prev];
    });

    closeModal();
  };

  // =========================
  // FILTERED LIST
  // =========================

  const filteredCategories = categories.filter((c) => {
    if (filter === "active") return c.isActive;
    if (filter === "inactive") return !c.isActive;
    return true;
  });

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={35} className="animate-spin text-green-600" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-8 sm:px-6">

      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-green-600">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Categories
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your product categories.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus size={18} />
            Add Category
          </button>

        </div>

        {/* Filter Tabs */}

        <div className="mb-5 flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === tab.key
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}

        {filteredCategories.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
            <FolderX size={40} className="text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              No categories found.
            </p>
          </div>
        )}

        {/* Categories Grid */}

        {filteredCategories.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >

                <div className="relative h-28 w-full bg-gray-100">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-300">
                      {category.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <span
                    className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      category.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {category.name}
                  </p>

                  {category.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                      {category.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2">

                    <button
                      type="button"
                      onClick={() => openEditModal(category)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    {category.isActive ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(category._id)}
                        disabled={actionLoadingId === category._id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionLoadingId === category._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(category._id)}
                        disabled={actionLoadingId === category._id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-200 text-green-600 hover:bg-green-50 disabled:opacity-50"
                      >
                        {actionLoadingId === category._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                      </button>
                    )}

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL */}

      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

    </main>
  );
};

// =========================================
// MODAL COMPONENT
// =========================================

const CategoryModal = ({ category, onClose, onSaved }) => {
  const isEditMode = Boolean(category);

  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(
    category?.description || ""
  );
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(category?.image || null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleImageSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();

    if (!result.secure_url) {
      throw new Error("Image upload failed");
    }

    return result.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!isEditMode && !imageFile) {
      setError("Please add a category image.");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = category?.image || null;

      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      let response;

      if (isEditMode) {
        response = await API.patch(`/categories/${category._id}`, {
          name: name.trim(),
          description: description.trim(),
          image: imageUrl,
        });
      } else {
        response = await API.post("/categories", {
          name: name.trim(),
          description: description.trim(),
          image: imageUrl,
        });
      }

      if (response.data.success) {
        onSaved(response.data.category);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        {/* Header */}

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditMode ? "Edit Category" : "Add Category"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Image */}

          <div className="flex justify-center">
            <label
              htmlFor="categoryImage"
              className="group relative flex h-28 w-28 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-green-500"
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Category"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                    <span className="text-[11px] font-bold text-white">
                      Replace
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ImagePlus size={22} className="text-green-600" />
                  <p className="mt-1 text-[11px] font-bold text-gray-600">
                    Add Image
                  </p>
                </>
              )}

              <input
                id="categoryImage"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => handleImageSelect(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* Name */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Category Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Fresh Vegetables"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
            />
          </div>

          {/* Description */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
              <span className="ml-1 font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description about this category"
              rows="3"
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
            />
          </div>

          {/* Actions */}

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Plus size={17} />
              )}
              {isEditMode ? "Save Changes" : "Add Category"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AdminCategories;