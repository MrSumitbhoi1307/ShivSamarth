import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, FolderX } from "lucide-react";

import API from "../api/axios";

const Categories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/categories");

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      setError("Unable to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category._id}`);
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={35} className="animate-spin text-green-600" />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-10 sm:px-8 lg:px-12">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-green-600">
            Browse
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            All Categories
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Choose a category to explore products.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}

        {categories.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
            <FolderX size={40} className="text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-500">
              No categories available right now.
            </p>
          </div>
        )}

        {/* Grid */}

        {categories.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {categories.map((category) => (
              <button
                key={category._id}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="h-24 w-24 overflow-hidden rounded-full bg-green-50 sm:h-28 sm:w-28">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-green-600">
                      {category.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <p className="text-center text-sm font-semibold text-gray-800">
                  {category.name}
                </p>

                {category.description && (
                  <p className="line-clamp-2 text-center text-xs text-gray-500">
                    {category.description}
                  </p>
                )}

              </button>
            ))}
          </div>
        )}

      </div>
    </main>
  );
};

export default Categories;