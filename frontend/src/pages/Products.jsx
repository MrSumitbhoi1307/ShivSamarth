import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ChevronDown,
  Loader2,
  PackageX,
  X,
} from "lucide-react";

import API from "../api/axios";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "low-to-high", label: "Price: Low to High" },
  { value: "high-to-low", label: "Price: High to Low" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null); // "category" | "price" | "sort" | null

  const wrapperRef = useRef(null);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";

  const [priceInputs, setPriceInputs] = useState({
    min: minPrice,
    max: maxPrice,
  });

  useEffect(() => {
    setPriceInputs({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get("/categories");
        if (response.data.success) {
          setCategories(response.data.categories || []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const response = await API.get("/products", { params });

      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleCategorySelect = (catId) => {
    updateParam("category", catId);
    setOpenDropdown(null);
  };

  const handleApplyPrice = () => {
    const next = new URLSearchParams(searchParams);

    if (priceInputs.min) {
      next.set("minPrice", priceInputs.min);
    } else {
      next.delete("minPrice");
    }

    if (priceInputs.max) {
      next.set("maxPrice", priceInputs.max);
    } else {
      next.delete("maxPrice");
    }

    setSearchParams(next);
    setOpenDropdown(null);
  };

  const handleClearPrice = () => {
    setPriceInputs({ min: "", max: "" });
    const next = new URLSearchParams(searchParams);
    next.delete("minPrice");
    next.delete("maxPrice");
    setSearchParams(next);
    setOpenDropdown(null);
  };

  const handleSortSelect = (value) => {
    updateParam("sort", value);
    setOpenDropdown(null);
  };

  const handleClearAll = () => {
    setSearchParams({});
    setPriceInputs({ min: "", max: "" });
  };

  const activeFilterCount =
    (category ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const selectedCategoryName =
    categories.find((c) => c._id === category)?.name || "Category";

  const priceLabel =
    minPrice || maxPrice
      ? `₹${minPrice || "0"} - ₹${maxPrice || "∞"}`
      : "Price";

  const sortLabel =
    sortOptions.find((o) => o.value === sort)?.label || "Sort";

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-green-600">Shop</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {search ? `Results for "${search}"` : "All Products"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Loading..." : `${products.length} products found`}
          </p>
        </div>

        {/* ================= FILTER BAR ================= */}

        <div
          ref={wrapperRef}
          className="relative z-10 mb-6 flex flex-wrap items-center gap-3"
        >

          {/* Category Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("category")}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                category
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {selectedCategoryName}
              <ChevronDown
                size={15}
                className={`transition ${
                  openDropdown === "category" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "category" && (
              <div className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => handleCategorySelect("")}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm ${
                    !category
                      ? "bg-green-50 font-semibold text-green-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All Categories
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => handleCategorySelect(cat._id)}
                    className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm ${
                      category === cat._id
                        ? "bg-green-50 font-semibold text-green-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("price")}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                minPrice || maxPrice
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {priceLabel}
              <ChevronDown
                size={15}
                className={`transition ${
                  openDropdown === "price" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "price" && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                <p className="mb-3 text-sm font-bold text-gray-800">
                  Price Range
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={priceInputs.min}
                    onChange={(e) =>
                      setPriceInputs((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-500"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={priceInputs.max}
                    onChange={(e) =>
                      setPriceInputs((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-green-500"
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleApplyPrice}
                    className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Apply
                  </button>

                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={handleClearPrice}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown("sort")}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {sortLabel}
              <ChevronDown
                size={15}
                className={`transition ${
                  openDropdown === "sort" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "sort" && (
              <div className="absolute left-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSortSelect(opt.value)}
                    className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm ${
                      sort === opt.value
                        ? "bg-green-50 font-semibold text-green-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear All */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 rounded-full px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <X size={14} />
              Clear All
            </button>
          )}
        </div>

        {/* ================= PRODUCTS GRID ================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-green-600" />
          </div>
        )}

        {!loading && products.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
            <PackageX size={40} className="text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              No products found matching your filters.
            </p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group rounded-2xl bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      No Image
                    </div>
                  )}

                  {product.discountPercentage > 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {product.discountPercentage}% OFF
                    </span>
                  )}

                  {product.stockQuantity === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-gray-600">
                      Out of Stock
                    </div>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-sm font-medium text-gray-800">
                  {product.name}
                </p>

                <p className="text-xs text-gray-400">
                  {product.category?.name}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold text-gray-900">
                    ₹{product.offerPrice}
                  </span>
                  {product.offerPrice < product.actualPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.actualPrice}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-[11px] text-gray-400">
                  per {product.unit}
                </p>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
};

export default Products;