import axios from "axios";

// ==========================================
// AXIOS API INSTANCE
// ==========================================

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000/api",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

// ==========================================
// REQUEST INTERCEPTOR
// Automatically attach JWT token
// ==========================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// Handle unauthorized requests
// ==========================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      console.error(
        "Unauthorized API Request:",
        error.response?.data?.message ||
          "Authentication failed"
      );

      // Remove invalid / expired token
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

// ==========================================
// EXPORT
// ==========================================

export default API;
