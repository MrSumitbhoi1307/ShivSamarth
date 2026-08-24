import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================
  // SUBMIT LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = formData.email.trim();
    const password = formData.password;

    // Validation
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message);
        setLoading(false);
        return;
      }

      // ==========================================
      // IMPORTANT:
      // ADMIN → ADMIN DASHBOARD
      // USER  → NORMAL HOME
      // ==========================================

      if (result.user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login Page Error:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-white to-green-100 px-4 py-10 sm:px-6">

      <div className="mx-auto grid min-h-[650px] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* =================================
            LEFT — BRAND SECTION
        ================================= */}

        <div className="relative hidden overflow-hidden bg-green-700 lg:flex">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-500 opacity-40" />

          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-green-800 opacity-60" />

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">

            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-green-700 shadow-lg">
              SS
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-green-100">
              Welcome to
            </p>

            <h1 className="text-5xl font-bold leading-tight text-white">
              Shiv
              <br />
              Samarth
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-green-50">
              Fresh groceries, everyday essentials and quality
              products delivered straight to your doorstep.
            </p>

            <div className="mt-10 space-y-4 text-sm text-green-50">

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  ✓
                </span>
                Fresh & Quality Products
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  ✓
                </span>
                Fast & Reliable Delivery
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  ✓
                </span>
                Secure Shopping
              </div>

            </div>

          </div>

        </div>

        {/* =================================
            RIGHT — LOGIN FORM
        ================================= */}

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">

          <div className="w-full max-w-md">

            {/* Header */}

            <div className="mb-8">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 font-bold text-green-700 lg:hidden">
                SS
              </div>

              <p className="text-sm font-medium text-green-600">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Login to your account
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter your details to continue shopping.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-green-600 hover:text-green-700"
                  >
                    Forgot Password?
                  </Link>

                </div>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

              </div>

              {/* REMEMBER ME */}

              <div className="flex items-center gap-2">

                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-green-600"
                />

                <label
                  htmlFor="rememberMe"
                  className="cursor-pointer text-sm text-gray-600"
                >
                  Remember me
                </label>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}

              </button>

            </form>

            {/* REGISTER */}

            <div className="mt-8 text-center text-sm text-gray-500">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-bold text-green-600 hover:text-green-700"
              >
                Create Account
              </Link>

            </div>

            {/* SECURITY */}

            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              By continuing, you agree to Shiv Samarth's
              terms and privacy policy.
            </p>

          </div>

        </div>

      </div>

    </main>
  );
};

export default Login;