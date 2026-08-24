import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../api/axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // Get Cart
  // =========================

  const getCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);

      const response = await API.get("/cart");

      if (response.data.success) {
        setCart(response.data.cart);
      }
    } catch (error) {
      console.error("Get Cart Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Add To Cart
  // =========================

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await API.post("/cart/add", {
        productId,
        quantity,
      });

      if (response.data.success) {
        await getCart();
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to add product to cart",
      };
    }
  };

  // =========================
  // Update Quantity
  // =========================

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await API.patch("/cart/update", {
        productId,
        quantity,
      });

      if (response.data.success) {
        await getCart();
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to update cart",
      };
    }
  };

  // =========================
  // Remove Item
  // =========================

  const removeFromCart = async (productId) => {
    try {
      const response = await API.delete(
        `/cart/remove/${productId}`
      );

      if (response.data.success) {
        await getCart();
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to remove item",
      };
    }
  };

  // =========================
  // Clear Cart
  // =========================

  const clearCart = async () => {
    try {
      const response = await API.delete("/cart/clear");

      if (response.data.success) {
        await getCart();
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to clear cart",
      };
    }
  };

  // =========================
  // Load cart after login
  // =========================

  useEffect(() => {
    getCart();
  }, []);

  const value = {
    cart,
    loading,
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};