import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import storeBanner from "../assets/banners/store-banner.jpeg";
import freshBanner from "../assets/banners/fresh-banner.jpeg";
import dailyEssentials from "../assets/banners/daily-banner.jpeg";
import megaSale from "../assets/banners/mega-sale-banner.jpeg";
import fastDelivery from "../assets/banners/fast-delivery-banner.jpeg";

// =====================================================
// BANNER DATA
// =====================================================

const banners = [
  {
    id: 1,
    image: storeBanner,
    badge: "SHIV SAMARTH",
    title: "Everything You Need, All in One Place",
    description:
      "Shop fresh groceries, fruits, vegetables and daily essentials at Shiv Samarth.",
    button: "Shop Now",
    link: "/products",
    position: "50% 40%",
  },

  {
    id: 2,
    image: freshBanner,
    badge: "FRESH EVERY DAY",
    title: "Fresh Groceries, Better Living",
    description:
      "Choose fresh fruits and vegetables, carefully selected for your everyday needs.",
    button: "Shop Fresh",
    link: "/products",
    position: "50% 50%",
  },

  {
    id: 3,
    image: dailyEssentials,
    badge: "DAILY ESSENTIALS",
    title: "Everything You Need, Every Day",
    description:
      "Stock up on your everyday grocery and household essentials with ease.",
    button: "Shop Essentials",
    link: "/products",
    position: "50% 50%",
  },

  {
    id: 4,
    image: megaSale,
    badge: "SPECIAL OFFERS",
    title: "Mega Savings Are Here",
    description:
      "Get amazing deals and great prices on your everyday grocery essentials.",
    button: "View Offers",
    link: "/products",
    position: "50% 50%",
  },

  {
    id: 5,
    image: fastDelivery,
    badge: "FAST DELIVERY",
    title: "Fast Delivery. Fresh at Your Door.",
    description:
      "Order your groceries online and get your essentials delivered quickly.",
    button: "Order Now",
    link: "/products",
    position: "50% 40%",
  },
];

// =====================================================
// HERO BANNER
// =====================================================

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);

  // ===================================================
  // AUTO SLIDE
  // Every 5 seconds
  // ===================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => {
        return (prev + 1) % banners.length;
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ===================================================
  // NEXT SLIDE
  // ===================================================

  const nextSlide = () => {
    setCurrent((prev) => {
      return (prev + 1) % banners.length;
    });
  };

  // ===================================================
  // PREVIOUS SLIDE
  // ===================================================

  const prevSlide = () => {
    setCurrent((prev) => {
      return (prev - 1 + banners.length) % banners.length;
    });
  };

  // ===================================================
  // GO TO SPECIFIC SLIDE
  // ===================================================

  const goToSlide = (index) => {
    setCurrent(index);
  };

  const banner = banners[current];

  // ===================================================
  // UI
  // ===================================================

  return (
    <section className="relative w-full overflow-hidden bg-gray-900">

      {/* =================================================
          BANNER CONTAINER
      ================================================= */}

      <div className="relative h-[300px] w-full sm:h-[390px] md:h-[470px] lg:h-[540px]">

        {/* =================================================
            BANNER IMAGE
        ================================================= */}

        <img
          key={banner.id}
          src={banner.image}
          alt={banner.title}
          className="absolute inset-0 h-full w-full object-cover animate-[fadeIn_0.8s_ease-in-out]"
          style={{
            objectPosition: banner.position,
          }}
        />

        {/* =================================================
            LEFT DARK GRADIENT
            Text readable ठेवण्यासाठी
        ================================================= */}

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

        {/* =================================================
            BOTTOM GRADIENT
        ================================================= */}

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="absolute inset-0 flex items-center">

          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">

            <div
              key={banner.id}
              className="max-w-xl text-white animate-[slideUp_0.8s_ease-out]"
            >

              {/* =================================================
                  BADGE
              ================================================= */}

              <div className="mb-3 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1.5 backdrop-blur-md sm:mb-4 sm:px-4 sm:py-2">

                <span className="text-[10px] font-bold tracking-[0.18em] text-green-300 sm:text-xs">
                  {banner.badge}
                </span>

              </div>

              {/* =================================================
                  TITLE
              ================================================= */}

              <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                {banner.title}
              </h1>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/90 sm:mt-5 sm:text-base md:text-lg md:leading-7">
                {banner.description}
              </p>

              {/* =================================================
                  BUTTON
              ================================================= */}

              <div className="mt-5 sm:mt-7">

                <Link
                  to={banner.link}
                  className="inline-flex items-center rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-2xl sm:px-7 sm:py-3.5 sm:text-base"
                >
                  {banner.button}

                  <ChevronRight
                    size={19}
                    className="ml-1"
                  />
                </Link>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            PREVIOUS BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous banner"
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white hover:text-gray-900 sm:left-5 sm:h-11 sm:w-11"
        >
          <ChevronLeft size={21} />
        </button>

        {/* =================================================
            NEXT BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next banner"
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white hover:text-gray-900 sm:right-5 sm:h-11 sm:w-11"
        >
          <ChevronRight size={21} />
        </button>

        {/* =================================================
            DOT INDICATORS
        ================================================= */}

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">

          {banners.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to banner ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                current === index
                  ? "w-8 bg-green-500"
                  : "w-2 bg-white/70 hover:bg-white"
              }`}
            />
          ))}

        </div>

        {/* =================================================
            SLIDE COUNTER
        ================================================= */}

        <div className="absolute bottom-5 right-5 hidden rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:block">
          {current + 1} / {banners.length}
        </div>

      </div>
    </section>
  );
};

export default HeroBanner;