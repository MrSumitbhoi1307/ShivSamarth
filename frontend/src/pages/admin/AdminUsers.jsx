import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  UserPlus,
  X,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

// ==========================================
// AUTH HEADER HELPER
// ==========================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  // "customers" किंवा "admins"
  const [viewMode, setViewMode] = useState("customers");

  const [error, setError] = useState("");

  // ==========================================
  // ADD ADMIN MODAL STATE
  // ==========================================

  const [showAddAdmin, setShowAddAdmin] = useState(false);

  const [addAdminForm, setAddAdminForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  // जर email आधीच existing असेल तर नाव/फोन/पासवर्ड मागायची गरज नाही
  const [existingUserFound, setExistingUserFound] = useState(false);

  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminError, setAddAdminError] = useState("");
  const [addAdminSuccess, setAddAdminSuccess] = useState("");

  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      // viewMode नुसार role नेहमी fixed पाठवायचा
      params.role = viewMode === "admins" ? "admin" : "user";

      if (status !== "All") {
        params.status = status;
      }

      const response = await axios.get(
        `${API_URL}/api/admin/users`,
        {
          params,
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Get Users Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, [status, viewMode]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // ==========================================
  // TOGGLE VIEW (Customers <-> Admins)
  // ==========================================

  const toggleView = () => {
    setSearch("");
    setStatus("All");
    setViewMode((prev) =>
      prev === "customers" ? "admins" : "customers"
    );
  };

  // ==========================================
  // UPDATE USER STATUS (Active / Inactive)
  // ==========================================

  const handleStatusChange = async (user) => {
    try {
      setActionLoading(user._id);
      setError("");

      const response = await axios.patch(
        `${API_URL}/api/admin/users/${user._id}/status`,
        {
          isActive: !user.isActive,
        },
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((item) =>
            item._id === user._id
              ? response.data.user
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "Update User Status Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update user status"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // ADD ADMIN MODAL HELPERS
  // ==========================================

  const openAddAdmin = () => {
    setAddAdminForm({ name: "", phone: "", email: "", password: "" });
    setExistingUserFound(false);
    setAddAdminError("");
    setAddAdminSuccess("");
    setShowAddAdmin(true);
  };

  const closeAddAdmin = () => {
    setShowAddAdmin(false);
    setAddAdminForm({ name: "", phone: "", email: "", password: "" });
    setExistingUserFound(false);
    setAddAdminError("");
    setAddAdminSuccess("");
  };

  const handleAddAdminChange = (field, value) => {
    setAddAdminForm((prev) => ({ ...prev, [field]: value }));

    // email बदलली की आधीचा "existing user" स्टेटस रिसेट कर
    if (field === "email") {
      setExistingUserFound(false);
    }
  };

  // Email टाकल्यावर तो आधीच system मध्ये आहे का ते बघतो (onBlur वर)
  const checkEmailExists = async () => {
    const email = addAdminForm.email.trim().toLowerCase();

    if (!email) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/admin/users`,
        {
          params: { search: email },
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      const foundUsers = response.data?.users || [];

      const matchedUser = foundUsers.find(
        (u) => u.email?.toLowerCase() === email
      );

      setExistingUserFound(!!matchedUser);

      if (matchedUser?.role === "admin") {
        setAddAdminError("This user is already an admin");
      } else {
        setAddAdminError("");
      }
    } catch (error) {
      console.error("Check Email Error:", error);
    }
  };

  // ==========================================
  // ADD ADMIN (submit)
  // ==========================================

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    const email = addAdminForm.email.trim().toLowerCase();
    const name = addAdminForm.name.trim();
    const phone = addAdminForm.phone.trim();
    const password = addAdminForm.password;

    if (!email) {
      setAddAdminError("Please enter an email address");
      return;
    }

    try {
      setAddAdminLoading(true);
      setAddAdminError("");
      setAddAdminSuccess("");

      // Step 1: तो email आधीच existing आहे का बघ
      const searchResponse = await axios.get(
        `${API_URL}/api/admin/users`,
        {
          params: { search: email },
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      const foundUsers = searchResponse.data?.users || [];

      let matchedUser = foundUsers.find(
        (u) => u.email?.toLowerCase() === email
      );

      // ==========================================
      // CASE A: User आधीच existing आहे -> फक्त role बदल
      // ==========================================

      if (matchedUser) {
        if (matchedUser.role === "admin") {
          setAddAdminError("This user is already an admin");
          return;
        }

        const updateResponse = await axios.patch(
          `${API_URL}/api/admin/users/${matchedUser._id}/role`,
          { role: "admin" },
          {
            headers: getAuthHeaders(),
            withCredentials: true,
          }
        );

        if (updateResponse.data.success) {
          setAddAdminSuccess(
            `${matchedUser.name || email} is now an admin`
          );

          if (viewMode === "admins") {
            fetchUsers();
          }
        }

        return;
      }

      // ==========================================
      // CASE B: नवीन user आहे -> account बनव मग admin कर
      // ==========================================

      if (!name || !phone || !password) {
        setAddAdminError(
          "This email is new — please fill Name, Phone and Password too"
        );
        return;
      }

      if (password.length < 6) {
        setAddAdminError("Password must contain at least 6 characters");
        return;
      }

      // नवीन user register कर (public endpoint, token लागत नाही)
      const registerResponse = await axios.post(
        `${API_URL}/api/auth/register`,
        { name, phone, email, password }
      );

      if (!registerResponse.data.success) {
        setAddAdminError(
          registerResponse.data.message || "Unable to create account"
        );
        return;
      }

      const newUserId = registerResponse.data.user.id;

      // नवीन user ला लगेच admin बनव
      const promoteResponse = await axios.patch(
        `${API_URL}/api/admin/users/${newUserId}/role`,
        { role: "admin" },
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      if (promoteResponse.data.success) {
        setAddAdminSuccess(
          `${name} account created and made admin. They can now login with the password you set.`
        );

        setAddAdminForm({ name: "", phone: "", email: "", password: "" });
        setExistingUserFound(false);

        if (viewMode === "admins") {
          fetchUsers();
        }
      }
    } catch (error) {
      console.error("Add Admin Error:", error);

      setAddAdminError(
        error.response?.data?.message || "Unable to add admin"
      );
    } finally {
      setAddAdminLoading(false);
    }
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.isActive
  ).length;

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 p-5 sm:p-6 lg:p-8">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-semibold text-green-600">
            Shiv Samarth Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {viewMode === "admins"
              ? "Admin Users"
              : "User Management"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {viewMode === "admins"
              ? "View and manage admin accounts"
              : "Manage customers and account status"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          {viewMode === "admins" && (
            <button
              type="button"
              onClick={openAddAdmin}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
            >
              <UserPlus size={18} />
              Add Admin
            </button>
          )}

          <button
            type="button"
            onClick={toggleView}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
              viewMode === "admins"
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ShieldCheck size={18} />
            {viewMode === "admins"
              ? "Back to Customers"
              : "View Admins"}
          </button>

          <button
            type="button"
            onClick={fetchUsers}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            <RefreshCw size={18} />
            Refresh
          </button>

        </div>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">

        {/* Total */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                {viewMode === "admins"
                  ? "Total Admins"
                  : "Total Customers"}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {totalUsers}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <Users size={23} />
            </div>

          </div>
        </div>

        {/* Active */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Active
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {activeUsers}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <UserCheck size={23} />
            </div>

          </div>
        </div>

        {/* Inactive */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {inactiveUsers}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <UserX size={23} />
            </div>

          </div>
        </div>

      </div>

      {/* ======================================
          ADD ADMIN MODAL
      ====================================== */}

      {showAddAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Add Admin
              </h3>

              <button
                type="button"
                onClick={closeAddAdmin}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-500">
              {existingUserFound
                ? "This email already has an account — they'll simply be promoted to admin."
                : "If the email belongs to an existing customer, they'll be promoted. Otherwise, fill in all fields to create a new admin account."}
            </p>

            <form onSubmit={handleAddAdmin} className="space-y-4">

              {/* Email */}

              <input
                type="email"
                required
                value={addAdminForm.email}
                onChange={(e) =>
                  handleAddAdminChange("email", e.target.value)
                }
                onBlur={checkEmailExists}
                placeholder="Email address"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
              />

              {/* नवीन user असेल तरच ही fields दाखव */}

              {!existingUserFound && (
                <>
                  <input
                    type="text"
                    value={addAdminForm.name}
                    onChange={(e) =>
                      handleAddAdminChange("name", e.target.value)
                    }
                    placeholder="Full name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                  />

                  <input
                    type="tel"
                    value={addAdminForm.phone}
                    onChange={(e) =>
                      handleAddAdminChange("phone", e.target.value)
                    }
                    placeholder="10-digit phone number"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                  />

                  <input
                    type="password"
                    value={addAdminForm.password}
                    onChange={(e) =>
                      handleAddAdminChange("password", e.target.value)
                    }
                    placeholder="Password (min 6 characters)"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
                  />
                </>
              )}

              {addAdminError && (
                <p className="text-sm font-medium text-red-600">
                  {addAdminError}
                </p>
              )}

              {addAdminSuccess && (
                <p className="text-sm font-medium text-green-600">
                  {addAdminSuccess}
                </p>
              )}

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={closeAddAdmin}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={addAdminLoading}
                  className="flex-1 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addAdminLoading ? "Adding..." : "Add Admin"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

        <form
          onSubmit={handleSearch}
          className="grid gap-4 lg:grid-cols-[1fr_180px_auto]"
        >

          {/* Search */}

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
            />

          </div>

          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium outline-none focus:border-green-500 focus:bg-white"
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          {/* Search Button */}

          <button
            type="submit"
            className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            Search
          </button>

        </form>
      </div>

      {/* ======================================
          USERS TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

        <div className="border-b border-gray-100 px-5 py-5">
          <h2 className="text-lg font-bold text-gray-900">
            {viewMode === "admins" ? "All Admins" : "All Customers"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {users.length} user(s) found
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">

              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

              <p className="text-sm text-gray-500">
                Loading users...
              </p>

            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex min-h-[300px] items-center justify-center px-5">
            <div className="text-center">

              <Users
                size={45}
                className="mx-auto mb-3 text-gray-300"
              />

              <h3 className="text-lg font-bold text-gray-700">
                No users found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>

            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Joined
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {users.map((user) => {

                  const isLoading =
                    actionLoading === user._id;

                  return (
                    <tr
                      key={user._id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* USER */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.name || "Unknown User"}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* ROLE (read-only badge, no dropdown) */}

                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-lg px-3 py-2 text-xs font-bold ${
                            user.role === "admin"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                            Inactive
                          </span>
                        )}

                      </td>

                      {/* JOINED */}

                      <td className="px-5 py-5 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-5">

                        <div className="flex justify-end">

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              handleStatusChange(user)
                            }
                            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                              user.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {isLoading
                              ? "Updating..."
                              : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminUsers;