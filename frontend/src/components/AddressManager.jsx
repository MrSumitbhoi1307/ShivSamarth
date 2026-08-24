import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  Loader2,
  X,
} from "lucide-react";

import API from "../api/axios";

const emptyForm = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [actionId, setActionId] = useState(null);

  // =========================
  // Fetch
  // =========================

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/addresses");

      if (response.data.success) {
        setAddresses(response.data.addresses || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load addresses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // =========================
  // Form Handling
  // =========================

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingId(address._id);
    setFormData({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      isDefault: address.isDefault || false,
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // Save (Add / Edit)
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
    } = formData;

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      setFormError("Please fill all fields.");
      return;
    }

    try {
      setSaving(true);

      let response;

      if (editingId) {
        response = await API.put(
          `/addresses/${editingId}`,
          formData
        );
      } else {
        response = await API.post("/addresses", formData);
      }

      if (response.data.success) {
        await fetchAddresses();
        closeForm();
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to save address."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      setActionId(id);

      const response = await API.delete(`/addresses/${id}`);

      if (response.data.success) {
        setAddresses((prev) =>
          prev.filter((a) => a._id !== id)
        );
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to delete address."
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================
  // Set Default
  // =========================

  const handleSetDefault = async (id) => {
    try {
      setActionId(id);

      const response = await API.patch(
        `/addresses/${id}/default`
      );

      if (response.data.success) {
        await fetchAddresses();
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to set default address."
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================
  // Render
  // =========================

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={26} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ===== Address List ===== */}

      <div className="space-y-3">
        {addresses.length === 0 && (
          <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
            No saved addresses yet.
          </p>
        )}

        {addresses.map((address) => (
          <div
            key={address._id}
            className={`rounded-xl border px-4 py-4 ${
              address.isDefault
                ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                : "border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700"
            }`}
          >
            <div className="flex items-start justify-between gap-3">

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {address.fullName}
                  </p>

                  {address.isDefault && (
                    <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      DEFAULT
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {address.addressLine}, {address.city},{" "}
                  {address.state} - {address.pincode}
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  📞 {address.phone}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(address._id)}
                    disabled={actionId === address._id}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/30"
                    title="Delete"
                  >
                    {actionId === address._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address._id)}
                    disabled={actionId === address._id}
                    className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 disabled:opacity-50"
                  >
                    <Check size={13} />
                    Set Default
                  </button>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* ===== Add Button ===== */}

      {!showForm && (
        <button
          type="button"
          onClick={openAddForm}
          className="mt-4 flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-green-500"
        >
          <Plus size={18} />
          Add New Address
        </button>
      )}

      {/* ===== Add/Edit Form ===== */}

      {showForm && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-600 dark:bg-gray-700">

          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>

            <button
              type="button"
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={18} />
            </button>
          </div>

          {formError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <input
              type="text"
              name="addressLine"
              value={formData.addressLine}
              onChange={handleChange}
              placeholder="Address (House No, Street, Area)"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />

              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="h-4 w-4 rounded accent-green-600"
              />
              Set as default address
            </label>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
              >
                {saving && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                {editingId ? "Update Address" : "Save Address"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

export default AddressManager;