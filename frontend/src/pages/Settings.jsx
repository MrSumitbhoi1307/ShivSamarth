import { useState } from "react";
import {
  Bell,
  MapPin,
  Lock,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

import API from "../api/axios";
import AddressManager from "../components/AddressManager";

const Settings = () => {
  // =========================
  // Notifications
  // =========================

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });

  // =========================
  // Change Password
  // =========================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // Password Input Change
  // =========================

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
    setError("");
  };

  // =========================
  // Change Password
  // =========================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Validate fields
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError("Please fill all password fields.");
      return;
    }

    // Confirm password
    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setError("New passwords do not match.");
      return;
    }

    // Minimum password length
    if (passwordData.newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await API.put(
        "/auth/change-password",
        {
          currentPassword:
            passwordData.currentPassword,

          newPassword:
            passwordData.newPassword,
        }
      );

      if (response.data.success) {
        setMessage(
          "Password changed successfully."
        );

        // Clear fields
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-10 dark:bg-gray-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="mb-8">
          <p className="text-sm font-semibold text-green-600">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage your app preferences and account security.
          </p>
        </div>

        <div className="space-y-5">

          {/* =========================
              NOTIFICATIONS
          ========================= */}

          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">

            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Bell size={20} />
              Notifications
            </h2>

            <div className="mt-4 space-y-3">

              {/* Email Notifications */}

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-700">

                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email Notifications
                </p>

                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) =>
                    setNotifications((prev) => ({
                      ...prev,
                      email: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded accent-green-600"
                />

              </div>

              {/* SMS Notifications */}

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-700">

                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  SMS Notifications
                </p>

                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) =>
                    setNotifications((prev) => ({
                      ...prev,
                      sms: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded accent-green-600"
                />

              </div>

            </div>
          </div>

          {/* =========================
              SAVED ADDRESSES
          ========================= */}

          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">

            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <MapPin size={20} />
              Saved Addresses
            </h2>

            <div className="mt-4">
              <AddressManager />
            </div>

          </div>

          {/* =========================
              CHANGE PASSWORD
          ========================= */}

          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">

            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Lock size={20} />
              Change Password
            </h2>

            {/* Success Message */}

            {message && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                {message}
              </div>
            )}

            {/* Error Message */}

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              className="mt-4 space-y-4"
            >

              {/* Current Password */}

              <div className="relative">

                <input
                  type={
                    showCurrent
                      ? "text"
                      : "password"
                  }
                  name="currentPassword"
                  value={
                    passwordData.currentPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-11 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrent((p) => !p)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showCurrent ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {/* New Password */}

              <div className="relative">

                <input
                  type={
                    showNew
                      ? "text"
                      : "password"
                  }
                  name="newPassword"
                  value={
                    passwordData.newPassword
                  }
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-11 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNew((p) => !p)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showNew ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {/* Confirm Password */}

              <input
                type="password"
                name="confirmPassword"
                value={
                  passwordData.confirmPassword
                }
                onChange={handlePasswordChange}
                placeholder="Confirm New Password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />

              {/* Update Button */}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
              >

                {saving ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}

              </button>

            </form>

          </div>

        </div>
      </div>
    </main>
  );
};

export default Settings;