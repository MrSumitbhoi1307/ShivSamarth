import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  ArrowRight,
} from "lucide-react";

import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const items = cart?.items || [];

  // =========================
  // Totals
  // =========================

  const subtotal = items.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.offerPrice * item.quantity;
  }, 0);

  const originalTotal = items.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.actualPrice * item.quantity;
  }, 0);

  const savings = originalTotal - subtotal;

  const deliveryFee = subtotal > 0 && subtotal < 500 ? 40 : 0;

  const grandTotal = subtotal + deliveryFee;

  // =========================
  // Handlers
  // =========================

  const handleQuantityChange = async (productId, newQty, stock) => {
    if (newQty < 1) return;

    if (newQty > stock) {
      alert(`Only ${stock} in stock.`);
      return;
    }

    setUpdatingId(productId);
    const result = await updateQuantity(productId, newQty);

    if (!result.success) {
      alert(result.message || "Unable to update quantity.");
    }

    setUpdatingId(null);
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    const result = await removeFromCart(productId);

    if (!result.success) {
      alert(result.message || "Unable to remove item.");
    }

    setRemovingId(null);
  };

  const handleClearCart = async () => {
    if (!window.confirm("Remove all items from cart?")) return;

    setClearing(true);
    const result = await clearCart();

    if (!result.success) {
      alert(result.message || "Unable to clear cart.");
    }

    setClearing(false);
  };

  // =========================
  // Loading
  // =========================

  if (loading && !cart) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white">
        <Loader2 size={35} className="animate-spin text-green-600" />
      </main>
    );
  }

  // =========================
  // Empty Cart
  // =========================

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 px-5">
        <ShoppingBag size={48} className="text-gray-300" />
        <h2 className="mt-4 text-xl font-bold text-gray-800">
          Your cart is empty
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/products"
          className="mt-6 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-green-600">Cart</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {items.length} item{items.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            disabled={clearing}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {clearing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Clear Cart
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ================= CART ITEMS ================= */}
          <div className="space-y-4">
            {items.map((item) => {
              if (!item.product) return null;

              const { _id: productId, name, images, offerPrice, actualPrice, stockQuantity } =
                item.product;

              const itemTotal = offerPrice * item.quantity;
              const outOfStock = stockQuantity === 0;
              const overStock = item.quantity > stockQuantity;

              return (
                <div
                  key={productId}
                  className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5"
                >
                  <Link
                    to={`/products/${productId}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:h-24 sm:w-24"
                  >
                    {images?.[0] ? (
                      <img
                        src={images[0]}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
                        No Image
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/products/${productId}`}
                          className="text-sm font-semibold text-gray-800 hover:text-green-600 sm:text-base"
                        >
                          {name}
                        </Link>

                        <p className="mt-1 text-sm font-bold text-gray-900">
                          ₹{offerPrice}
                          {offerPrice < actualPrice && (
                            <span className="ml-2 text-xs font-normal text-gray-400 line-through">
                              ₹{actualPrice}
                            </span>
                          )}
                        </p>

                        {outOfStock && (
                          <p className="mt-1 text-xs font-semibold text-red-500">
                            Out of stock
                          </p>
                        )}

                        {!outOfStock && overStock && (
                          <p className="mt-1 text-xs font-semibold text-orange-500">
                            Only {stockQuantity} left — reduce quantity
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(productId)}
                        disabled={removingId === productId}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        {removingId === productId ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-xl border border-gray-200">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              productId,
                              item.quantity - 1,
                              stockQuantity
                            )
                          }
                          disabled={updatingId === productId}
                          className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold text-gray-800">
                          {updatingId === productId ? (
                            <Loader2 size={13} className="mx-auto animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              productId,
                              item.quantity + 1,
                              stockQuantity
                            )
                          }
                          disabled={updatingId === productId}
                          className="p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="text-sm font-bold text-gray-900">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= ORDER SUMMARY ================= */}
          <div className="h-fit rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {savings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>You Save</span>
                  <span>-₹{savings.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              {deliveryFee > 0 && (
                <p className="text-xs text-gray-400">
                  Add ₹{(500 - subtotal).toLocaleString("en-IN")} more for free delivery
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
              <span className="font-bold text-gray-900">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-semibold text-white hover:bg-green-700"
            >
              Proceed to Checkout
              <ArrowRight size={17} />
            </button>

            <Link
              to="/products"
              className="mt-3 block text-center text-sm font-medium text-green-600 hover:text-green-700"
            >
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Cart;