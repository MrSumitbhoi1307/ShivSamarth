import React from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  ShoppingBag,
  Truck,
  CreditCard,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const CustomerCare = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ==================================================
          HERO SECTION
      ================================================== */}
      <section className="bg-green-600 px-4 py-14 text-white sm:py-16">
        <div className="mx-auto max-w-6xl text-center">

          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <MessageCircle size={34} strokeWidth={2} />
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Customer Care
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-green-50 sm:text-base">
            "We are always here to help you. Please contact us if you face any issues regarding your order, delivery, payment, or product."
          </p>

        </div>
      </section>

      {/* ==================================================
          CONTACT OPTIONS
      ================================================== */}
      <section className="px-4 py-12 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">

          {/* ================= CALL ================= */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Phone size={26} />
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Call Us
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Speak directly with our Customer Care team.
            </p>

            <a
              href="tel:+919999999999"
              className="mt-4 inline-block font-semibold text-green-600 transition hover:text-green-700"
            >
              +91 99999 99999
            </a>

          </div>

          {/* ================= EMAIL ================= */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Mail size={26} />
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Email Us
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              "Send us your query via email."
            </p>

            <a
              href="mailto:support@shivsamarth.com"
              className="mt-4 inline-block break-all font-semibold text-green-600 transition hover:text-green-700"
            >
              support@shivsamarth.com
            </a>

          </div>

          {/* ================= WORKING HOURS ================= */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Clock size={26} />
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Working Hours
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Monday - Sunday
            </p>

            <p className="mt-2 font-semibold text-green-600">
              8:00 AM - 10:00 PM
            </p>

          </div>

        </div>
      </section>

      {/* ==================================================
          QUICK HELP
      ================================================== */}
      <section className="px-4 pb-14 sm:pb-16">
        <div className="mx-auto max-w-6xl">

          {/* Heading */}
          <div className="mb-8 text-center">

            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              How Can We Help You?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
             "Select the option related to your issue below."
            </p>

          </div>

          {/* Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* ================= ORDER ================= */}
            <Link
              to="/orders"
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-100">
                <ShoppingBag size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                Order Related
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                "Get your order status, order details, and order-related help."
              </p>

              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600">
                View Orders
                <ArrowRight size={16} />
              </div>

            </Link>

            {/* ================= DELIVERY ================= */}
            <Link
              to="/orders"
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-100">
                <Truck size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                Delivery
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
               "Check delivery status, timing, and delivery-related issues."
              </p>

              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600">
                Track Order
                <ArrowRight size={16} />
              </div>

            </Link>

            {/* ================= PAYMENT ================= */}
            <Link
              to="/orders"
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-100">
                <CreditCard size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                Payment
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                "Get payment and transaction-related help."
              </p>

              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600">
                View Orders
                <ArrowRight size={16} />
              </div>

            </Link>

            {/* ================= SUPPORT ================= */}
            <Link
              to="/support"
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600 transition group-hover:bg-green-100">
                <RotateCcw size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                Help & Support
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                "Get answers to FAQs and general support queries."
              </p>

              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600">
                Visit Support
                <ArrowRight size={16} />
              </div>

            </Link>

          </div>
        </div>
      </section>

      {/* ==================================================
          SUPPORT CTA
      ================================================== */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white p-8 text-center shadow-sm sm:p-10">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <MessageCircle size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
            Need More Help?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            "Didn't find the answer to your question? Check the FAQs on our Help & Support page."
          </p>

          <Link
            to="/support"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            <MessageCircle size={18} />
            Help & Support
            <ArrowRight size={17} />
          </Link>

        </div>
      </section>

    </div>
  );
};

export default CustomerCare;