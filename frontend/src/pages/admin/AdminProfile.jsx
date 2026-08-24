import React, { useEffect, useState } from "react";
import {
  UserCircle,
  ShieldCheck,
  Mail,
  Phone,
  User,
  Loader2,
  Save,
  Lock,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";

import API from "../../api/axios";

const AdminProfile = () => {
  // ==========================================
  // ADMIN PROFILE
  // ==========================================

  const [admin, setAdmin] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // ==========================================
  // PASSWORD
  // ==========================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] =
    useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [passwordError, setPasswordError] =
    useState("");
  const [passwordMessage, setPasswordMessage] =
    useState("");

  // ==========================================
  // PASSWORD VISIBILITY
  // ==========================================

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ==========================================
  // FETCH ADMIN PROFILE
  // ==========================================

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/profile");

      if (response.data?.success) {
        const profile = response.data.admin;

        setAdmin(profile);

        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
        });
      } else {
        setError(
          response.data?.message ||
            "Unable to load admin profile"
        );
      }
    } catch (err) {
      console.error(
        "Admin Profile Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load admin profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // ==========================================
  // PROFILE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // ==========================================
  // PASSWORD INPUT CHANGE
  // ==========================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  // ==========================================
  // UPDATE ADMIN PROFILE
  // ==========================================

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const name = formData.name.trim();
    const email =
      formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    // NAME
    if (!name) {
      setError("Name is required.");
      return;
    }

    if (name.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    // EMAIL
    if (!email) {
      setError("Email is required.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    // PHONE
    if (
      phone &&
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await API.put(
        "/admin/profile",
        {
          name,
          email,
          phone,
        }
      );

      if (response.data?.success) {
        const updatedAdmin =
          response.data.admin;

        setAdmin(updatedAdmin);

        setFormData({
          name: updatedAdmin.name || "",
          email: updatedAdmin.email || "",
          phone: updatedAdmin.phone || "",
        });

        setMessage(
          "Admin profile updated successfully."
        );
      } else {
        setError(
          response.data?.message ||
            "Unable to update profile."
        );
      }
    } catch (err) {
      console.error(
        "Update Admin Profile Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update admin profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    // CURRENT PASSWORD
    if (!currentPassword) {
      setPasswordError(
        "Current password is required."
      );
      return;
    }

    // NEW PASSWORD
    if (!newPassword) {
      setPasswordError(
        "New password is required."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    // CONFIRM PASSWORD
    if (!confirmPassword) {
      setPasswordError(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from current password."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await API.put(
        "/admin/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.data?.success) {
        setPasswordMessage(
          "Password changed successfully."
        );

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(
          response.data?.message ||
            "Unable to change password."
        );
      }
    } catch (err) {
      console.error(
        "Change Password Error:",
        err
      );

      setPasswordError(
        err.response?.data?.message ||
          "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      // Backend logout
      try {
        await API.post("/auth/logout");
      } catch (logoutError) {
        console.log(
          "Backend logout skipped:",
          logoutError.message
        );
      }

      // Remove authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Logout Error:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-green-600">
          <Loader2
            size={24}
            className="animate-spin"
          />

          <span className="font-semibold">
            Loading admin profile...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !admin) {
    return (
      <div className="min-h-[70vh] bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-700">
            Unable to Load Admin Profile
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

      <div className="mx-auto max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your administrator account
            </p>
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Logging out...
              </>
            ) : (
              <>
                <LogOut size={18} />
                Logout
              </>
            )}
          </button>

        </div>

        {/* ======================================
            PROFILE HEADER CARD
        ====================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="bg-green-600 px-6 py-8">

            <div className="flex flex-col items-center gap-4 sm:flex-row">

              {/* PHOTO */}

              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-green-600 shadow-lg">

                {admin.profilePhoto ? (
                  <img
                    src={admin.profilePhoto}
                    alt={admin.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle size={58} />
                )}

              </div>

              {/* NAME */}

              <div className="text-center sm:text-left">

                <h2 className="text-2xl font-bold text-white">
                  {admin.name}
                </h2>

                <p className="mt-1 text-sm text-green-100">
                  Shiv Samarth Administrator
                </p>

              </div>

            </div>

          </div>

          {/* ======================================
              PERSONAL INFORMATION
          ====================================== */}

          <div className="p-6 sm:p-8">

            <div className="mb-6">

              <h3 className="text-xl font-bold text-gray-900">
                Personal Information
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Update your administrator details.
              </p>

            </div>

            {/* MESSAGE */}

            {message && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleProfileSubmit}
              className="space-y-5"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User size={17} />
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    maxLength={50}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Mail size={17} />
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Phone size={17} />
                    Mobile Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Enter 10-digit mobile number"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                </div>

                {/* ROLE - READ ONLY */}

                <div>

                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <ShieldCheck size={17} />
                    Role
                  </label>

                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-semibold capitalize text-green-700">
                    {admin.role}
                  </div>

                </div>

              </div>

              {/* SAVE */}

              <div className="pt-2">

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        {/* ======================================
            CHANGE PASSWORD
        ====================================== */}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-6 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <Lock size={21} />
            </div>

            <div>

              <h3 className="text-xl font-bold text-gray-900">
                Change Password
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Change your administrator login password.
              </p>

            </div>

          </div>

          {/* PASSWORD MESSAGE */}

          {passwordMessage && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {passwordError}
            </div>
          )}

          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-5"
          >

            {/* CURRENT PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Current Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showCurrentPassword
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword(
                      !showCurrentPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* NEW PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                New Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showNewPassword
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={
                    passwordData.newPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(
                      !showNewPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Confirm New Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    passwordData.confirmPassword
                  }
                  onChange={
                    handlePasswordChange
                  }
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>

            {/* CHANGE PASSWORD BUTTON */}

            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-7 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {changingPassword ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Updating...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Change Password
                </>
              )}

            </button>

          </form>

        </div>

        {/* ======================================
            ACCOUNT STATUS
        ====================================== */}

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* STATUS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Account Status
            </label>

            <div
              className={`rounded-xl border px-4 py-3 font-semibold ${
                admin.isActive
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {admin.isActive
                ? "Active"
                : "Inactive"}
            </div>

          </div>

          {/* SECURITY */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Security Status
            </label>

            <div
              className={`rounded-xl border px-4 py-3 font-semibold ${
                admin.isBlocked
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {admin.isBlocked
                ? "Blocked"
                : "Account Secure"}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminProfile;