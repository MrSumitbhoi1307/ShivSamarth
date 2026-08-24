import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Loader2,
  CheckCircle2,
  Wallet,
  Clock,
  X,
  Tag,
  XCircle,
  BadgePercent,
} from "lucide-react";

import API from "../api/axios";
import { useCart } from "../context/CartContext";
import { QRCodeSVG } from "qrcode.react";

const timeSlots = [
  "9:00 AM - 12:00 PM",
  "12:00 PM - 3:00 PM",
  "3:00 PM - 6:00 PM",
  "6:00 PM - 9:00 PM",
];

const emptyForm = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCart } = useCart();

  const items = cart?.items || [];

  // =========================
  // Addresses
  // =========================

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [savingAddress, setSavingAddress] = useState(false);
  const [formError, setFormError] = useState("");

  // =========================
  // Order
  // =========================

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [timeSlot, setTimeSlot] = useState(timeSlots[0]);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  // =========================
  // Coupon
  // =========================

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  // appliedCoupon = { code, discountType, discountValue, discount, finalAmount }

  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [applyingCode, setApplyingCode] = useState(""); // which coupon card is being applied

  // =========================
  // Fetch Addresses
  // =========================

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);

      const response = await API.get("/addresses");

      if (response.data.success) {
        const list = response.data.addresses || [];
        setAddresses(list);

        const defaultAddr = list.find((a) => a.isDefault) || list[0];

        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        }
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
    } finally {
      setAddressLoading(false);
    }
  };

  // =========================
  // Fetch Available Coupons
  // =========================

  const fetchAvailableCoupons = async () => {
    try {
      setCouponsLoading(true);

      const response = await API.get("/coupons/active");

      if (response.data.success) {
        setAvailableCoupons(response.data.coupons || []);
      }
    } catch (err) {
      console.error("Failed to load coupons", err);
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchAvailableCoupons();
  }, []);

  // =========================
  // Totals
  // =========================

  const subtotal = items.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.offerPrice * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 0 && subtotal < 500 ? 40 : 0;

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;

  const grandTotal = Math.max(subtotal + deliveryFee - couponDiscount, 0);

  // If cart changes and coupon no longer meets min order etc, drop it
  useEffect(() => {
    if (appliedCoupon && subtotal === 0) {
      setAppliedCoupon(null);
      setCouponCode("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // =========================
  // Coupon Helpers
  // =========================

  const formatCouponDiscount = (coupon) => {
    if (coupon.discountType === "percentage") {
      return coupon.maxDiscount
        ? `${coupon.discountValue}% OFF (up to ₹${coupon.maxDiscount})`
        : `${coupon.discountValue}% OFF`;
    }
    return `₹${coupon.discountValue} OFF`;
  };

  // =========================
  // Coupon Handlers
  // =========================

  const applyCouponCode = async (code) => {
    setCouponError("");

    if (!code || !code.trim()) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    try {
      setApplyingCode(code.trim().toUpperCase());
      setApplyingCoupon(true);

      const response = await API.post("/coupons/apply", {
        code: code.trim(),
        orderAmount: subtotal,
      });

      if (response.data.success) {
        setAppliedCoupon({
          code: response.data.coupon.code,
          discountType: response.data.coupon.discountType,
          discountValue: response.data.coupon.discountValue,
          discount: response.data.discount,
          finalAmount: response.data.finalAmount,
        });
        setCouponCode(response.data.coupon.code);
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(
        err.response?.data?.message || "Unable to apply coupon."
      );
    } finally {
      setApplyingCoupon(false);
      setApplyingCode("");
    }
  };

  const handleApplyCoupon = () => applyCouponCode(couponCode);

  const handleApplyFromList = (code) => applyCouponCode(code);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // =========================
  // Add New Address
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setFormError("");

    const { fullName, phone, addressLine, city, state, pincode } = formData;

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
      setSavingAddress(true);

      const response = await API.post("/addresses", formData);

      if (response.data.success) {
        await fetchAddresses();
        setSelectedAddressId(response.data.address._id);
        setShowForm(false);
        setFormData(emptyForm);
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Unable to save address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // =========================
  // Place Order (COD or trigger QR for Online)
  // =========================

  const handlePlaceOrder = async () => {
    setPlaceError("");

    const selectedAddress = addresses.find(
      (a) => a._id === selectedAddressId
    );

    if (!selectedAddress) {
      setPlaceError("Please select a delivery address.");
      return;
    }

    // Online payment → show QR first, don't place order yet
    if (paymentMethod === "Online") {
      setShowQR(true);
      return;
    }

    try {
      setPlacing(true);

      const response = await API.post("/orders", {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine: selectedAddress.addressLine,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
        },
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discount: appliedCoupon ? appliedCoupon.discount : 0,
      });

      if (response.data.success) {
        setPlacedOrder(response.data.order);
        await getCart();
      }
    } catch (err) {
      setPlaceError(
        err.response?.data?.message || "Unable to place order."
      );
    } finally {
      setPlacing(false);
    }
  };

  // =========================
  // Confirm UPI Payment (after "I Have Paid" click)
  // =========================

  const handleConfirmUpiPayment = async () => {
    setConfirmingPayment(true);
    setPlaceError("");

    const selectedAddress = addresses.find(
      (a) => a._id === selectedAddressId
    );

    if (!selectedAddress) {
      setPlaceError("Please select a delivery address.");
      setConfirmingPayment(false);
      setShowQR(false);
      return;
    }

    try {
      const response = await API.post("/orders", {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine: selectedAddress.addressLine,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
        },
        paymentMethod: "Online",
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discount: appliedCoupon ? appliedCoupon.discount : 0,
      });

      if (response.data.success) {
        setPlacedOrder(response.data.order);
        setShowQR(false);
        await getCart();
      }
    } catch (err) {
      setPlaceError(
        err.response?.data?.message || "Unable to confirm payment."
      );
      setShowQR(false);
    } finally {
      setConfirmingPayment(false);
    }
  };

  // =========================
  // Order Success Screen
  // =========================

  if (placedOrder) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50 px-5 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
          <CheckCircle2 size={56} className="mx-auto text-green-600" />

          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Order Placed!
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your order #{placedOrder._id.slice(-8).toUpperCase()} has been
            placed successfully.
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Selected slot: {timeSlot}
          </p>

          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            ₹{Number(placedOrder.totalAmount).toLocaleString("en-IN")}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/orders"
              className="rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              View My Orders
            </Link>

            <Link
              to="/products"
              className="rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // UPI QR Screen
  // =========================

  if (showQR) {
    const upiString = `upi://pay?pa=shivsamarth@upi&pn=ShivSamarth&am=${grandTotal}&cu=INR`;

    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50 px-5 dark:bg-gray-900">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm dark:bg-gray-800">

          <button
            type="button"
            onClick={() => setShowQR(false)}
            className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X size={15} />
            Cancel
          </button>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Scan & Pay
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Scan this QR using any UPI app
          </p>

          <div className="mx-auto mt-5 flex w-fit items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-600">
            <QRCodeSVG value={upiString} size={200} />
          </div>

          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            ₹{grandTotal.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Pay to: shivsamarth@upi
          </p>

          {placeError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              {placeError}
            </div>
          )}

          <button
            type="button"
            onClick={handleConfirmUpiPayment}
            disabled={confirmingPayment}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
          >
            {confirmingPayment && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {confirmingPayment ? "Confirming..." : "I Have Paid ✓"}
          </button>

          <p className="mt-3 text-[11px] text-gray-400">
            (Demo QR for project purpose — no real payment is made)
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // Empty Cart Guard
  // =========================

  if (items.length === 0) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Your cart is empty.
        </p>
        <Link
          to="/products"
          className="mt-5 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 px-5 py-8 dark:bg-gray-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">

        <div className="mb-6">
          <p className="text-sm font-semibold text-green-600">Checkout</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Complete Your Order
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

          <div className="space-y-6">

            {/* ================= ADDRESS ================= */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <MapPin size={20} />
                Delivery Address
              </h2>

              {addressLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-green-600" />
                </div>
              )}

              {!addressLoading && addresses.length === 0 && !showForm && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  No saved addresses. Please add one to continue.
                </p>
              )}

              {!addressLoading && addresses.length > 0 && (
                <div className="mt-4 space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address._id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                        selectedAddressId === address._id
                          ? "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                          : "border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === address._id}
                        onChange={() => setSelectedAddressId(address._id)}
                        className="mt-1 h-4 w-4 accent-green-600"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {address.fullName}
                          </p>
                          {address.isDefault && (
                            <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
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
                    </label>
                  ))}
                </div>
              )}

              {!showForm ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-4 flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:border-green-400 hover:text-green-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-green-500"
                >
                  <Plus size={16} />
                  Add New Address
                </button>
              ) : (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      New Address
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setFormError("");
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {formError && (
                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSaveAddress} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <input
                      type="text"
                      name="addressLine"
                      value={formData.addressLine}
                      onChange={handleChange}
                      placeholder="Address (House No, Street, Area)"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    />

                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Pincode"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleChange}
                        className="h-4 w-4 accent-green-600"
                      />
                      Set as default
                    </label>

                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70"
                    >
                      {savingAddress && (
                        <Loader2 size={15} className="animate-spin" />
                      )}
                      Save Address
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* ================= TIME SLOT ================= */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <Clock size={20} />
                Delivery Time Slot
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      timeSlot === slot
                        ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* ================= PAYMENT METHOD ================= */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <Wallet size={20} />
                Payment Method
              </h2>

              <div className="mt-4 space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                    paymentMethod === "COD"
                      ? "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="h-4 w-4 accent-green-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pay when your order arrives
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 ${
                    paymentMethod === "Online"
                      ? "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "Online"}
                    onChange={() => setPaymentMethod("Online")}
                    className="h-4 w-4 accent-green-600"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      UPI / Online Payment
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pay via PhonePe, GPay, Paytm & more
                    </p>
                  </div>
                </label>

                {paymentMethod === "Online" && (
                  <div className="ml-7 grid grid-cols-4 gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-700">
                    {[
                      { name: "PhonePe", color: "bg-purple-600" },
                      { name: "GPay", color: "bg-blue-600" },
                      { name: "Paytm", color: "bg-sky-500" },
                      { name: "UPI", color: "bg-orange-500" },
                    ].map((app) => (
                      <div
                        key={app.name}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full ${app.color} text-xs font-bold text-white`}
                        >
                          {app.name.slice(0, 2)}
                        </div>
                        <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                          {app.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {paymentMethod === "Online" && (
                  <div className="ml-7 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                    🎉 Extra 5% off on prepaid orders!
                  </div>
                )}
              </div>
            </div>

            {/* ================= AVAILABLE COUPONS ================= */}
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <BadgePercent size={20} />
                Available Coupons
              </h2>

              {couponsLoading && (
                <div className="flex justify-center py-6">
                  <Loader2 size={22} className="animate-spin text-green-600" />
                </div>
              )}

              {!couponsLoading && availableCoupons.length === 0 && (
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  No coupons available right now.
                </p>
              )}

              {!couponsLoading && availableCoupons.length > 0 && (
                <div className="mt-4 space-y-3">
                  {availableCoupons.map((coupon) => {
                    const isEligible = subtotal >= (coupon.minOrderAmount || 0);
                    const isThisApplied =
                      appliedCoupon?.code === coupon.code;
                    const isThisApplying =
                      applyingCoupon &&
                      applyingCode === coupon.code;

                    return (
                      <div
                        key={coupon._id}
                        className={`rounded-xl border px-4 py-3 ${
                          isThisApplied
                            ? "border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20"
                            : "border-dashed border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold tracking-wide text-gray-900 dark:text-white">
                              {coupon.code}
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                              {formatCouponDiscount(coupon)}
                            </p>
                            {coupon.description && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {coupon.description}
                              </p>
                            )}
                            <p className="mt-1 text-[11px] text-gray-400">
                              {coupon.minOrderAmount > 0
                                ? `Min order ₹${coupon.minOrderAmount}`
                                : "No minimum order"}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={
                              !isEligible ||
                              isThisApplied ||
                              applyingCoupon
                            }
                            onClick={() =>
                              handleApplyFromList(coupon.code)
                            }
                            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              isThisApplied
                                ? "bg-green-600 text-white"
                                : isEligible
                                ? "bg-gray-900 text-white hover:bg-gray-700 dark:bg-green-600 dark:hover:bg-green-700"
                                : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                            }`}
                          >
                            {isThisApplied ? (
                              "Applied"
                            ) : isThisApplying ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>

                        {!isEligible && (
                          <p className="mt-2 text-[11px] font-medium text-orange-500">
                            Add ₹
                            {(coupon.minOrderAmount - subtotal).toLocaleString(
                              "en-IN"
                            )}{" "}
                            more to unlock this coupon
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ================= ORDER SUMMARY ================= */}
          <div className="h-fit rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Order Summary
            </h2>

            <div className="mt-4 max-h-60 space-y-3 overflow-y-auto">
              {items.map((item) => {
                if (!item.product) return null;
                return (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.product.name}{" "}
                      <span className="text-gray-400">
                        × {item.quantity}
                      </span>
                    </p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      ₹{(item.product.offerPrice * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ================= COUPON (manual entry) ================= */}
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <Tag size={16} />
                Promo Code
              </p>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      if (couponError) setCouponError("");
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon}
                    className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60 dark:bg-green-600 dark:hover:bg-green-700"
                  >
                    {applyingCoupon && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800 dark:bg-green-900/20">
                  <div>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">
                      {appliedCoupon.code} applied
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      You saved ₹{appliedCoupon.discount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-red-500 dark:text-green-400"
                    title="Remove coupon"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              )}

              {couponError && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  {couponError}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Coupon Discount</span>
                  <span>- ₹{appliedCoupon.discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
              <span className="font-bold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>

            {placeError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                {placeError}
              </div>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placing || !selectedAddressId}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {placing && <Loader2 size={17} className="animate-spin" />}
              Place Order
            </button>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Checkout;