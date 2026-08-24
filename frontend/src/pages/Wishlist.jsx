import { Link } from "react-router-dom";
import { Heart, Loader2, Trash2, ShoppingCart } from "lucide-react";

import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const products = wishlist?.products || [];

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (!result.success) {
      alert(result.message || "Unable to remove item.");
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (!result.success) {
      alert(result.message || "Unable to add to cart.");
    }
  };

  if (loading && !wishlist) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center dark:bg-gray-900">
        <Loader2 size={35} className="animate-spin text-green-600" />
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-5 dark:bg-gray-900">
        <Heart size={48} className="text-gray-300" />
        <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-100">
          Your wishlist is empty
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Save items you like for later.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          Explore Products
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-8 dark:bg-gray-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">

        <div className="mb-6">
          <p className="text-sm font-semibold text-green-600">Saved</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {products.length} item{products.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="group relative rounded-2xl bg-white p-3 shadow-sm dark:bg-gray-800"
            >
              <button
                type="button"
                onClick={() => handleRemove(product._id)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-red-500 shadow-md hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                title="Remove from wishlist"
              >
                <Trash2 size={15} />
              </button>

              <Link to={`/products/${product._id}`}>
                <div className="aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-700">
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

                  {product.stockQuantity === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-gray-600 dark:bg-black/50 dark:text-gray-200">
                      Out of Stock
                    </div>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-100">
                  {product.name}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₹{product.offerPrice}
                  </span>
                  {product.offerPrice < product.actualPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.actualPrice}
                    </span>
                  )}
                </div>
              </Link>

              {product.stockQuantity > 0 && (
                <button
                  type="button"
                  onClick={() => handleAddToCart(product._id)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
};

export default Wishlist;