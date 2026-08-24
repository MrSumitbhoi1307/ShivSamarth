import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Loader2,
  ChevronLeft,
  PackageX,
} from "lucide-react";

import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // =========================
  // Fetch Product
  // =========================

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/products/${id}`);

      if (response.data.success) {
        setProduct(response.data.product);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Fetch Reviews
  // =========================

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);

      const response = await API.get(`/reviews/product/${id}`);

      if (response.data.success) {
        setReviews(response.data.reviews || []);
        setAvgRating(response.data.avgRating || 0);
        setTotalReviews(response.data.totalReviews || 0);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    setActiveImage(0);
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  // =========================
  // Add to Cart
  // =========================

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setAdding(true);

    const result = await addToCart(product._id, quantity);

    if (!result.success) {
      alert(result.message || "Unable to add to cart.");
    }

    setAdding(false);
  };

  // =========================
  // Wishlist Toggle
  // =========================

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  // =========================
  // Submit Review
  // =========================

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (newRating === 0) {
      setReviewError("Please select a rating.");
      return;
    }

    if (!newComment.trim()) {
      setReviewError("Please write a comment.");
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await API.post(`/reviews/product/${id}`, {
        rating: newRating,
        comment: newComment.trim(),
      });

      if (response.data.success) {
        setNewRating(0);
        setNewComment("");
        await fetchReviews();
      }
    } catch (err) {
      setReviewError(
        err.response?.data?.message || "Unable to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center dark:bg-gray-900">
        <Loader2 size={35} className="animate-spin text-green-600" />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center dark:bg-gray-900">
        <PackageX size={40} className="text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
          {error || "Product not found."}
        </p>
        <Link
          to="/products"
          className="mt-5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  const inStock = product.stockQuantity > 0;
  const inWishlist = isInWishlist(product._id);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-8 dark:bg-gray-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-green-600 dark:text-gray-300"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="grid gap-8 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 sm:p-8 lg:grid-cols-2">

          {/* ================= GALLERY ================= */}
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-700">
              {product.images?.[activeImage] ? (
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  No Image
                </div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                      activeImage === idx
                        ? "border-green-600"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= DETAILS ================= */}
          <div>
            <p className="text-sm font-semibold text-green-600">
              {product.category?.name}
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={17}
                    className={
                      star <= Math.round(avgRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {avgRating > 0 ? avgRating : "No ratings"} (
                {totalReviews} review{totalReviews !== 1 ? "s" : ""})
              </span>
            </div>

            {/* Price */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{product.offerPrice}
              </span>

              {product.offerPrice < product.actualPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{product.actualPrice}
                  </span>
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {product.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              per {product.unit}
            </p>

            {/* Stock status */}
            <div className="mt-4">
              {inStock ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  ✓ In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Description
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {product.description}
              </p>
            </div>

            {/* Quantity + Add to Cart + Wishlist */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {inStock && (
                <>
                  <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.max(1, q - 1))
                      }
                      className="p-3 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-10 text-center font-semibold text-gray-800 dark:text-gray-100">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(product.stockQuantity, q + 1)
                        )
                      }
                      className="p-3 text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-70"
                  >
                    {adding ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                    Add to Cart
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`rounded-xl border p-3 transition ${
                  inWishlist
                    ? "border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-900/20"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                title="Add to Wishlist"
              >
                <Heart
                  size={20}
                  className={inWishlist ? "fill-red-500" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ================= REVIEWS SECTION ================= */}
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Customer Reviews
          </h2>

          {/* Add Review Form */}
          <div className="mt-5 rounded-xl bg-gray-50 p-5 dark:bg-gray-700">
            <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Write a Review
            </p>

            {reviewError && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      size={26}
                      className={
                        star <= (hoverRating || newRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
              >
                {submittingReview && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="mt-6 space-y-4">
            {reviewsLoading && (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-green-600" />
              </div>
            )}

            {!reviewsLoading && reviews.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review this product!
              </p>
            )}

            {reviews.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-100 pb-4 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {review.user?.name || "Anonymous"}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>

                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
};

export default ProductDetails;