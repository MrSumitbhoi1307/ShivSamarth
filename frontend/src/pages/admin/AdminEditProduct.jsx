import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, ImagePlus, Loader2 } from "lucide-react";

import API from "../../api/axios";

const AdminEditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    actualPrice: "",
    offerPrice: "",
    stockQuantity: "",
    category: "",
    unit: "",
  });

  // =========================
  // CATEGORIES
  // =========================

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const response = await API.get("/categories");

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setCategoryLoading(false);
    }
  };

  // =========================
  // IMAGES (4 slots)
  // =========================

  // existingImages[i] -> URL string (already on Cloudinary) or null
  const [existingImages, setExistingImages] = useState([
    null,
    null,
    null,
    null,
  ]);

  // newImageFiles[i] -> File object if user replaced that slot, else null
  const [newImageFiles, setNewImageFiles] = useState([
    null,
    null,
    null,
    null,
  ]);

  // previews[i] -> what to actually show (new file preview OR existing URL)
  const [previews, setPreviews] = useState([null, null, null, null]);

  const handleImageReplace = (index, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }

    const updatedFiles = [...newImageFiles];
    updatedFiles[index] = file;
    setNewImageFiles(updatedFiles);

    const updatedPreviews = [...previews];
    updatedPreviews[index] = URL.createObjectURL(file);
    setPreviews(updatedPreviews);
  };

  // =========================
  // FETCH PRODUCT
  // =========================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/products/admin/${id}`);

      if (response.data.success) {
        const product = response.data.product;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          actualPrice: product.actualPrice || "",
          offerPrice: product.offerPrice || "",
          stockQuantity: product.stockQuantity || "",
          category: product.category?._id || product.category || "",
          unit: product.unit || "",
        });

        const imgs = product.images || [];
        const filledImages = [0, 1, 2, 3].map((i) => imgs[i] || null);

        setExistingImages(filledImages);
        setPreviews(filledImages);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load product details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  // =========================
  // CLOUDINARY UPLOAD
  // =========================

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

  // =========================
  // SUBMIT
  // =========================

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (!formData.actualPrice || !formData.offerPrice) {
      setError("Please enter both actual and offer price.");
      return;
    }

    if (!formData.stockQuantity) {
      setError("Please enter stock quantity.");
      return;
    }

    // At least one image (existing or new) required per slot check
    const hasAnyImage = [0, 1, 2, 3].some(
      (i) => newImageFiles[i] || existingImages[i]
    );

    if (!hasAnyImage) {
      setError("Please add at least one product image.");
      return;
    }

    try {
      setSaving(true);

      // Upload only the slots where a new file was picked;
      // keep existing URL for untouched slots.

      const finalImageUrls = await Promise.all(
        [0, 1, 2, 3].map(async (i) => {
          if (newImageFiles[i]) {
            return await uploadToCloudinary(newImageFiles[i]);
          }
          return existingImages[i];
        })
      );

      const cleanedImages = finalImageUrls.filter((url) => url);

      const response = await API.put(`/products/admin/${id}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        actualPrice: Number(formData.actualPrice),
        offerPrice: Number(formData.offerPrice),
        stockQuantity: Number(formData.stockQuantity),
        category: formData.category,
        unit: formData.unit,
        images: cleanedImages,
      });

      if (response.data.success) {
        navigate("/admin/products");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={35} className="animate-spin text-green-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm transition hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <p className="text-sm font-semibold text-green-600">
            Shiv Samarth Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Edit Product
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update product details below.
          </p>
        </div>

      </div>

      {/* FORM CARD */}

      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* IMAGES — 4 fixed slots, each replaceable */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Images
            </label>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <label
                  key={index}
                  htmlFor={`productImage-${index}`}
                  className="group relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-green-500"
                >

                  {previews[index] ? (
                    <>
                      <img
                        src={previews[index]}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                        <span className="text-xs font-bold text-white">
                          Click to replace
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="truncate text-[11px] font-medium text-white">
                          Image {index + 1}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                        <ImagePlus size={23} />
                      </div>

                      <p className="mt-2 text-xs font-bold text-gray-700">
                        Add Image
                      </p>

                      <p className="mt-1 text-[10px] text-gray-500">
                        Image {index + 1}
                      </p>
                    </>
                  )}

                  <input
                    id={`productImage-${index}`}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) =>
                      handleImageReplace(index, e.target.files[0])
                    }
                    className="hidden"
                  />

                </label>
              ))}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Click any image to replace it. PNG, JPG, JPEG or WEBP. Maximum 5MB.
            </p>

          </div>

          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
            />
          </div>

          {/* CATEGORY + UNIT */}

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={categoryLoading}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              >
                <option value="">
                  {categoryLoading ? "Loading..." : "Select category"}
                </option>

                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Unit
              </label>

              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g. 1kg, 500g, 1pc"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>

          </div>

          {/* PRICE + STOCK */}

          <div className="grid gap-5 sm:grid-cols-3">

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Actual Price (₹)
              </label>

              <input
                type="number"
                name="actualPrice"
                value={formData.actualPrice}
                onChange={handleChange}
                min="0"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Offer Price (₹)
              </label>

              <input
                type="number"
                name="offerPrice"
                value={formData.offerPrice}
                onChange={handleChange}
                min="0"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stock Quantity
              </label>

              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                min="0"
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>

          </div>

          {/* SUBMIT */}

          <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={saving}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={19} />
                  Save Changes
                </>
              )}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
};

export default AdminEditProduct;