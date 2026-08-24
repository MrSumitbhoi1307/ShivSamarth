import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
} from "lucide-react";

import HeroBanner from "../components/HeroBanner";
import CategoryGrid from "../components/CategoryGrid";

const Home = () => {
  return (
    <main className="bg-white">

      {/* ================= HERO BANNER (auto-slide) ================= */}
      <HeroBanner />

      {/* ================= CATEGORIES ================= */}
      <CategoryGrid />

      {/* ================= QUICK BENEFITS ================= */}
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">

          <div>
            <h3 className="font-bold text-gray-900">Fresh Products</h3>
            <p className="mt-1 text-sm text-gray-500">Carefully selected products</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Best Prices</h3>
            <p className="mt-1 text-sm text-gray-500">Quality products at great prices</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Secure Payments</h3>
            <p className="mt-1 text-sm text-gray-500">Safe & secure checkout</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900">Quick Delivery</h3>
            <p className="mt-1 text-sm text-gray-500">Delivered to your doorstep</p>
          </div>

        </div>
      </section>

    </main>
  );
};

export default Home;