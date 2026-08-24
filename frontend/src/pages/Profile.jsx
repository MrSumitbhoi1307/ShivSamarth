import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Save,
  Loader2,
} from "lucide-react";

import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // GET PROFILE
  // =========================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/auth/profile");

      if (response.data.success) {
        const profile = response.data.user;

        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
        });

        if (setUser) {
          setUser(profile);
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =========================
  // UPDATE PROFILE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    // Name validation
    if (!name) {
      setError("Name is required.");
      return;
    }

    // Email validation
    if (!email) {
      setError("Email is required.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Phone validation
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await API.put(
        "/auth/profile",
        {
          name,
          email,
          phone,
        }
      );

      if (response.data.success) {
        setMessage(
          "Profile updated successfully."
        );

        const updatedUser = response.data.user;

        // Update AuthContext
        if (setUser) {
          setUser(updatedUser);
        }

        // Update form with latest database values
        setFormData({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || "",
        });
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2
          size={35}
          className="animate-spin text-green-600"
        />
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-10 sm:px-6">

      <div className="mx-auto max-w-5xl">

        {/* =========================
            CENTER HEADER
        ========================= */}

        <div className="mb-10 text-center">

          <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
            Manage your personal information and
            keep your account details up to date.
          </p>

        </div>

        {/* =========================
            PROFILE + EDIT
        ========================= */}

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">

          {/* =========================
              PROFILE CARD
          ========================= */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex flex-col items-center text-center">

              {/* PROFILE PHOTO */}

              {user?.profilePhoto ? (

                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="h-28 w-28 rounded-full object-cover shadow-md"
                />

              ) : (

                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-4xl font-bold text-green-700 shadow-sm">
                  {user?.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </div>

              )}

              {/* NAME */}

              <h2 className="mt-5 text-lg font-bold text-gray-900">
                {user?.name}
              </h2>

              {/* EMAIL */}

              <p className="mt-1 max-w-full truncate text-sm text-gray-500">
                {user?.email}
              </p>

              {/* PHONE */}

              {user?.phone && (
                <p className="mt-1 text-sm text-gray-500">
                  {user.phone}
                </p>
              )}

              {/* ROLE */}

              <span className="mt-4 rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-700">
                {user?.role === "admin"
                  ? "Administrator"
                  : "Customer"}
              </span>

            </div>

          </div>

          {/* =========================
              EDIT PROFILE
          ========================= */}

          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">

            <h2 className="text-xl font-bold text-gray-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your account details below.
            </p>

            {/* SUCCESS */}

            {message && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              {/* =========================
                  NAME
              ========================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                </div>

              </div>

              {/* =========================
                  EMAIL
              ========================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                </div>

                <p className="mt-2 text-xs text-gray-400">
                  You can update your email address.
                </p>

              </div>

              {/* =========================
                  PHONE
              ========================= */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Mobile Number
                </label>

                <div className="relative">

                  <Phone
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Your existing mobile number will remain unless
                  you change it.
                </p>

              </div>

              {/* =========================
                  SAVE
              ========================= */}

              <div className="flex justify-center pt-2 sm:justify-start">

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
};

export default Profile;