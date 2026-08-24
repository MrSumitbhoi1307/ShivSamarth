import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD LOGGED-IN USER
  // ==========================================

  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await API.get("/auth/profile");

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("Load User Error:", error);

      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (email, password) => {
    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        // Save JWT
        localStorage.setItem("token", response.data.token);

        // Save logged-in user
        setUser(response.data.user);

        return {
          success: true,
          message: response.data.message,
          user: response.data.user,
        };
      }

      return {
        success: false,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Login Error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Please try again.",
      };
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (
    name,
    phone,
    email,
    password
  ) => {
    try {
      const response = await API.post("/auth/register", {
        name,
        phone,
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);

        setUser(response.data.user);

        return {
          success: true,
          message: response.data.message,
          user: response.data.user,
        };
      }

      return {
        success: false,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Register Error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ==========================================
  // INITIAL USER CHECK
  // ==========================================

  useEffect(() => {
    loadUser();
  }, []);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loadUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = () => {
  return useContext(AuthContext);
};