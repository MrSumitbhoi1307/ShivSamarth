import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ImagePlus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ArrowRight,
} from "lucide-react";

import API from "../../api/axios";

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_UNITS = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "gram", label: "Gram (gram)" },
  { value: "litre", label: "Litre" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "piece", label: "Piece" },
  { value: "pack", label: "Pack" },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  actualPrice: "",
  offerPrice: "",
  stockQuantity: "",
  category: "",
  unit: "",
};

const createEmptyImages = () => [null, null, null, null];

// =====================================================
// COMPRESS IMAGE BEFORE UPLOAD
// Resizes to max 1000px width/height, converts to JPEG
// This makes uploads significantly faster
//
// NOTE: JPEG has no alpha channel. If the source image
// (PNG/WEBP) has a transparent background, the canvas's
// default transparent fill gets flattened to BLACK when
// exported as JPEG. To prevent that, we paint a white
// background on the canvas before drawing the image.
// =====================================================

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const MAX_DIMENSION = 1000;
      let { width, height } = img;

      if (width > height && width > MAX_DIMENSION) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      // Fill white first so transparent PNG/WEBP images
      // don't turn black when converted to JPEG.
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed."));
            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, "") + ".jpg",
            { type: "image/jpeg" }
          );

          resolve(compressedFile);
        },
        "image/jpeg",
        0.75
      );
    };

    img.onerror = () => reject(new Error("Unable to read image."));
    reader.onerror = () => reject(new Error("Unable to read file."));

    reader.readAsDataURL(file);
  });
};

const AdminAddProduct = () => {
  const navigate = useNavigate();

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  // =====================================================
  // CATEGORIES
  // =====================================================

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // =====================================================
  // IMAGES
  // =====================================================

  const [imageFiles, setImageFiles] = useState(createEmptyImages());
  const [previews, setPreviews] = useState(createEmptyImages());

  // =====================================================
  // STATUS
  // =====================================================

  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  const imageCount = imageFiles.filter(Boolean).length;

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        setErrorMessage("");

        const response = await API.get("/categories");

        if (response.data?.success) {
          setCategories(response.data.categories || []);
        } else {
          setCategories([]);
          setErrorMessage(
            response.data?.message || "Unable to load categories."
          );
        }
      } catch (error) {
        console.error("Fetch Categories Error:", error);
        setCategories([]);
        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load categories. Please try again."
        );
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // =====================================================
  // CLEANUP PREVIEWS ON UNMOUNT
  // =====================================================

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // =====================================================
  // IMAGE SELECT
  // =====================================================

  const handleImageSelect = (index, file) => {
    if (!file || saving) return;

    setErrorMessage("");
    setSuccessMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Only JPG, JPEG, PNG or WEBP images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("Each image must be less than 5MB.");
      return;
    }

    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    setImageFiles((previous) => {
      const updated = [...previous];
      updated[index] = file;
      return updated;
    });

    const newPreview = URL.createObjectURL(file);

    setPreviews((previous) => {
      const updated = [...previous];
      updated[index] = newPreview;
      return updated;
    });
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (index, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (saving) return;

    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    setImageFiles((previous) => {
      const updated = [...previous];
      updated[index] = null;
      return updated;
    });

    setPreviews((previous) => {
      const updated = [...previous];
      updated[index] = null;
      return updated;
    });

    setErrorMessage("");
    setSuccessMessage("");
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setImageFiles(createEmptyImages());
    setPreviews(createEmptyImages());
    setUploadProgress(0);
    setStatusText("");
  };

  // =====================================================
  // CLOUDINARY UPLOAD
  // =====================================================

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      throw new Error(
        "Cloudinary cloud name is missing. Check VITE_CLOUDINARY_CLOUD_NAME."
      );
    }

    if (!uploadPreset) {
      throw new Error(
        "Cloudinary upload preset is missing. Check VITE_CLOUDINARY_UPLOAD_PRESET."
      );
    }

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.secure_url) {
      throw new Error(
        result?.error?.message || "Cloudinary image upload failed."
      );
    }

    return result.secure_url;
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    const name = formData.name.trim();
    const description = formData.description.trim();
    const actualPrice = Number(formData.actualPrice);
    const offerPrice = Number(formData.offerPrice);
    const stockQuantity = Number(formData.stockQuantity);

    if (!name) {
      return "Product name is required.";
    }

    if (name.length < 2) {
      return "Product name must contain at least 2 characters.";
    }

    if (!description) {
      return "Product description is required.";
    }

    if (!formData.category) {
      return "Please select a category.";
    }

    if (!formData.unit) {
      return "Please select a product unit.";
    }

    const validUnit = ALLOWED_UNITS.some(
      (item) => item.value === formData.unit
    );

    if (!validUnit) {
      return "Please select a valid product unit.";
    }

    if (formData.actualPrice === "") {
      return "Actual price is required.";
    }

    if (!Number.isFinite(actualPrice) || actualPrice < 0) {
      return "Please enter a valid actual price.";
    }

    if (formData.offerPrice === "") {
      return "Offer price is required.";
    }

    if (!Number.isFinite(offerPrice) || offerPrice < 0) {
      return "Please enter a valid offer price.";
    }

    if (offerPrice > actualPrice) {
      return "Offer price cannot be greater than actual price.";
    }

    if (formData.stockQuantity === "") {
      return "Stock quantity is required.";
    }

    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      return "Please enter a valid stock quantity.";
    }

    if (imageCount !== MAX_IMAGES) {
      return "Please add exactly 4 product images.";
    }

    return "";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setErrorMessage("");
    setSuccessMessage("");
    setRedirectCountdown(0);
    setUploadProgress(0);

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);

      window.scrollTo({ top: 0, behavior: "smooth" });

      return;
    }

    try {
      setSaving(true);

      const selectedImages = imageFiles.filter(Boolean);

      // =============================================
      // COMPRESS + PARALLEL UPLOAD
      // Each image is compressed (resized + reduced
      // quality) before being sent to Cloudinary,
      // which makes the upload noticeably faster.
      // All 4 images are compressed & uploaded together.
      // =============================================

      setStatusText("Compressing & uploading images...");

      const uploadPromises = selectedImages.map(async (file, index) => {
        const compressedFile = await compressImage(file);
        const url = await uploadToCloudinary(compressedFile);

        setUploadProgress((current) => {
          const next = current + 25;
          return next > 100 ? 100 : next;
        });

        console.log(`Image ${index + 1} uploaded successfully`);

        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (uploadedUrls.length !== MAX_IMAGES) {
        throw new Error(
          "All 4 product images must be uploaded successfully."
        );
      }

      setUploadProgress(100);

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        actualPrice: Number(formData.actualPrice),
        offerPrice: Number(formData.offerPrice),
        category: formData.category,
        unit: formData.unit,
        stockQuantity: Number(formData.stockQuantity),
        images: uploadedUrls,
      };

      setStatusText("Saving product...");

      console.log("Creating product:", productData);

      const response = await API.post(
        "/products/admin/create",
        productData
      );

      if (response.data?.success) {
        console.log("Product created successfully:", response.data.product);

        setSaving(false);
        setStatusText("");
        setSuccessMessage("Product Added Successfully! 🎉");

        resetForm();

        window.scrollTo({ top: 0, behavior: "smooth" });

        setRedirectCountdown(3);

        let seconds = 3;

        const countdown = setInterval(() => {
          seconds -= 1;
          setRedirectCountdown(seconds);

          if (seconds <= 0) {
            clearInterval(countdown);
            navigate("/admin/products");
          }
        }, 1000);

        return;
      }

      throw new Error(
        response.data?.message || "Product creation failed."
      );
    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);
      console.error("API RESPONSE:", error.response?.data);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to create product. Please try again."
      );

      setStatusText("");
      setUploadProgress(0);
      setSaving(false);

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // =====================================================
  // CANCEL / BACK
  // =====================================================

  const handleCancel = () => {
    if (saving) return;
    navigate("/admin/products");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="mx-auto mb-8 flex max-w-4xl items-center gap-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <p className="text-sm font-semibold text-green-600">
            Shiv Samarth Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Add Product
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Add your real grocery product details.
          </p>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {successMessage && (
        <div className="fixed left-1/2 top-5 z-[100] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 animate-[fadeIn_.2s_ease-out]">
          <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={25} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-green-800">
                  Product Added Successfully! 🎉
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Your product has been saved successfully.
                </p>

                {redirectCountdown > 0 && (
                  <p className="mt-1 text-xs font-semibold text-green-600">
                    Going back to Products in {redirectCountdown}s...
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuccessMessage("");
                  setRedirectCountdown(0);
                }}
                className="text-xl font-bold text-gray-400 transition hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-700"
              >
                View Products
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">

        {errorMessage && (
          <div className="mb-6 flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle size={23} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">
                Something went wrong
              </p>
              <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
            </div>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-xl font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {saving && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Loader2 size={21} className="animate-spin" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-blue-800">
                  {statusText || "Adding Product..."}
                </p>
                <p className="mt-1 text-xs text-blue-600">Please wait...</p>
              </div>

              <span className="text-sm font-bold text-blue-700">
                {uploadProgress}%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* IMAGES */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">
                Product Images
                <span className="ml-1 text-red-500">*</span>
              </label>

              <span
                className={`text-xs font-bold ${
                  imageCount === 4 ? "text-green-600" : "text-gray-500"
                }`}
              >
                {imageCount}/4
              </span>
            </div>

            <p className="mb-4 text-xs text-gray-500">
              Add exactly 4 product images. JPG, JPEG, PNG or WEBP. Maximum
              5MB each.
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <label
                  key={index}
                  htmlFor={`productImage-${index}`}
                  className={`group relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-gray-50 text-center transition ${
                    previews[index]
                      ? "border-green-300"
                      : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                  } ${saving ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  {previews[index] ? (
                    <>
                      <img
                        src={previews[index]}
                        alt={`Product image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                        <span className="rounded-lg bg-black/60 px-3 py-2 text-xs font-bold text-white">
                          Click to replace
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => removeImage(index, event)}
                        disabled={saving}
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 disabled:opacity-50"
                      >
                        <X size={15} />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                        <p className="text-[11px] font-medium text-white">
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
                    disabled={saving}
                    onChange={(event) => {
                      handleImageSelect(index, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* PRODUCT NAME */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Name
              <span className="ml-1 text-red-500">*</span>
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Tata Salt"
              maxLength={150}
              required
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:opacity-60"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
              <span className="ml-1 text-red-500">*</span>
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter complete product description"
              rows={4}
              maxLength={1000}
              required
              disabled={saving}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:opacity-60"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {formData.description.length}/1000
            </p>
          </div>

          {/* CATEGORY + UNIT */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={categoryLoading || saving}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:opacity-60"
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories..."
                    : categories.length === 0
                    ? "No categories available"
                    : "Select category"}
                </option>

                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {!categoryLoading && categories.length === 0 && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  Please create a category first.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Unit
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={saving}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:opacity-60"
              >
                <option value="">Select unit</option>

                {ALLOWED_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PRICE + STOCK */}
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Actual Price (₹)
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="number"
                name="actualPrice"
                value={formData.actualPrice}
                onChange={handleChange}
                placeholder="e.g. 100"
                min="0"
                step="0.01"
                required
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Offer Price (₹)
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="number"
                name="offerPrice"
                value={formData.offerPrice}
                onChange={handleChange}
                placeholder="e.g. 90"
                min="0"
                step="0.01"
                required
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stock Quantity
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="e.g. 50"
                min="0"
                step="1"
                required
                disabled={saving}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 disabled:opacity-60"
              />
            </div>
          </div>

          {/* SUMMARY */}
          <div className="rounded-xl border border-green-100 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <PackageCheck size={18} className="text-green-600" />
              <h3 className="text-sm font-bold text-green-800">
                Product Summary
              </h3>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-green-700 sm:grid-cols-2">
              <p>
                Images: <strong>{imageCount}/4</strong>
              </p>

              <p>
                Category:{" "}
                <strong>
                  {formData.category ? "Selected" : "Not selected"}
                </strong>
              </p>

              <p>
                Unit: <strong>{formData.unit || "Not selected"}</strong>
              </p>

              <p>
                Stock: <strong>{formData.stockQuantity || "0"}</strong>
              </p>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                categoryLoading ||
                categories.length === 0 ||
                imageCount !== 4
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  {statusText || "Adding Product..."}
                </>
              ) : (
                <>
                  <Plus size={19} />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AdminAddProduct;