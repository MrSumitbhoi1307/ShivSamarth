import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import API from "../api/axios";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  const getWishlist = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setWishlist(null);
      return;
    }

    try {
      setLoading(true);

      const response = await API.get("/wishlist");

      if (response.data.success) {
        setWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.error("Get Wishlist Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const response = await API.post("/wishlist/add", {
        productId,
      });

      if (response.data.success) {
        await getWishlist();
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to add to wishlist",
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await API.delete(
        `/wishlist/remove/${productId}`
      );

      if (response.data.success) {
        await getWishlist();
      }

      return response.data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Unable to remove from wishlist",
      };
    }
  };

  const isInWishlist = (productId) => {
    return (
      wishlist?.products?.some((p) => p._id === productId) || false
    );
  };

  useEffect(() => {
    getWishlist();
  }, []);

  const value = {
    wishlist,
    loading,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};