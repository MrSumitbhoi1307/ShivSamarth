import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  Search,
  MessageCircle,
  ShoppingBag,
  Truck,
  CreditCard,
  PackageX,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const Support = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  // ==========================================
  // FAQ DATA
  // ==========================================

  const faqs = [
    {
      icon: ShoppingBag,
      question: "How can I place an order?",
      answer:
       "Go to the Shop page, select your favorite products, add them to your cart, and proceed to checkout to place your order",
    },

    {
      icon: Truck,
      question: "How can I track my order?",
      answer:
        "Go to the 'My Orders' page to view the current status and delivery information of your order.",
    },

    {
      icon: PackageX,
      question: "Can I cancel my order?",
      answer:
        "You can cancel your order before it is processed or dispatched, provided cancellation is available.",
    },

    {
      icon: CreditCard,
      question: "What payment methods are available?",
      answer:
        "You will see the available payment options on the Checkout page. Select your preferred payment method and complete the payment.",
    },

    {
      icon: PackageX,
      question: "What should I do if I receive a damaged product?",
      answer:
        "If you receive a damaged or incorrect product, contact Customer Care and share your order details along with a photo of the product.",
    },

    {
      icon: Phone,
      question: "How can I contact customer care?",
      answer:
        "Visit the Customer Care page to get in touch with our team via Call, Email, or other available contact options.",
    },

    {
      icon: ShoppingBag,
      question: "How can I add a product to my cart?",
      answer:
        "Go to the Product page and click the 'Add to Cart' button. The product will be automatically added to your cart.",
    },

    {
      icon: CreditCard,
      question: "Is Cash on Delivery available?",
      answer:
        "If Cash on Delivery is available for your location and order, the option will be visible on the checkout page.",
    },
  ];

  // ==========================================
  // SEARCH FAQ
  // ==========================================

  const filteredFaqs = faqs.filter((faq) => {
    const question = faq.question.toLowerCase();
    const answer = faq.answer.toLowerCase();
    const searchValue = search.toLowerCase().trim();

    return (
      question.includes(searchValue) ||
      answer.includes(searchValue)
    );
  });

  // ==========================================
  // TOGGLE FAQ
  // ==========================================

  const handleFaqToggle = (index) => {
    setOpenIndex((prev) =>
      prev === index ? null : index
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section className="bg-white px-4 py-14 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">

          {/* Icon */}

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
            <HelpCircle size={34} strokeWidth={2} />
          </div>

          {/* Heading */}

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Help & Support
          </h1>

          {/* Description */}

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-500">
           "Find answers to your questions here. Search our Frequently Asked Questions to quickly find solutions to your problems."
          </p>

          {/* ==================================================
              FAQ SEARCH
          ================================================== */}

          <div className="relative mx-auto mt-8 max-w-xl">

            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenIndex(null);
              }}
              placeholder="Search your question..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
            />

          </div>

        </div>
      </section>

      {/* ==================================================
          FAQ SECTION
      ================================================== */}

      <section className="px-4 py-12 sm:py-14">
        <div className="mx-auto max-w-4xl">

          {/* Heading */}

          <div className="mb-7">

            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-2 text-sm text-gray-500">
             "Common questions and their answers are provided below."
            </p>

          </div>

          {/* FAQ LIST */}

          <div className="space-y-3">

            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {

                const isOpen = openIndex === index;
                const Icon = faq.icon;

                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                  >

                    {/* QUESTION BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        handleFaqToggle(index)
                      }
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-green-50/50 sm:px-6"
                    >

                      <div className="flex items-center gap-4">

                        {/* FAQ Icon */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                          <Icon size={19} />
                        </div>

                        {/* Question */}

                        <span className="font-semibold text-gray-800">
                          {faq.question}
                        </span>

                      </div>

                      {/* Arrow */}

                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-gray-500 transition-transform duration-200 ${
                          isOpen
                            ? "rotate-180 text-green-600"
                            : ""
                        }`}
                      />

                    </button>

                    {/* ANSWER */}

                    {isOpen && (
                      <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-5 text-sm leading-7 text-gray-600 sm:px-6">
                        {faq.answer}
                      </div>
                    )}

                  </div>
                );
              })
            ) : (

              /* ==================================================
                 NO RESULT
              ================================================== */

              <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <HelpCircle size={30} />
                </div>

                <p className="mt-4 font-semibold text-gray-700">
                  No matching question found.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Try searching with another keyword.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Clear Search
                </button>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* ==================================================
          CUSTOMER CARE CTA
      ================================================== */}

      <section className="px-4 pb-16">

        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-green-600 px-6 py-10 text-center text-white shadow-lg sm:px-10">

          {/* Icon */}

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <MessageCircle size={30} />
          </div>

          {/* Heading */}

          <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
            Still Need Help?
          </h2>

          {/* Description */}

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-green-50 sm:text-base">
            "Didn't find your answer in the FAQs? Contact our Customer Care team. We are always ready to help you."
          </p>

          {/* Button */}

          <Link
            to="/customer-care"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-green-700 shadow-sm transition hover:bg-green-50"
          >
            <MessageCircle size={18} />
            Contact Customer Care
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>

    </div>
  );
};

export default Support;