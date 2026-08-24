import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import API from "../api/axios";

const CategoryGrid = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await API.get("/categories");

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
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
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex justify-center py-10">
          <Loader2 size={28} className="animate-spin text-green-600" />
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">

      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-green-600">
            Browse
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Shop by Category
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() => handleCategoryClick(category)}
            className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="h-20 w-20 overflow-hidden rounded-full bg-green-50 sm:h-24 sm:w-24">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-green-600">
                  {category.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>

            <p className="text-center text-sm font-semibold text-gray-800">
              {category.name}
            </p>

          </button>
        ))}
      </div>

    </section>
  );
};

export default CategoryGrid;