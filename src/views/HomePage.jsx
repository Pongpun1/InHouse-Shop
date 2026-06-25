import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  ArrowRight,
  Star,
  Truck,
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ── Hero Slides ──────────────────────────────────────────────────────────────
const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80",
    eyebrow: "NEW COLLECTION 2026",
    heading: ["เปลี่ยนบ้านของคุณ", "ให้อบอุ่นกว่าที่เคย"],
    sub: "ของตกแต่งบ้านสไตล์มินิมอล คัดสรรมาเพื่อทุกมุมที่คุณรัก",
    cta: "เลือกซื้อเลย",
    to: "/products",
  },
  {
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80",
    eyebrow: "LIVING ROOM EDIT",
    heading: ["โซฟาที่ใช่", "สำหรับห้องที่คุณฝัน"],
    sub: "เฟอร์นิเจอร์ไม้แท้และผ้าลินินคุณภาพสูง จัดส่งฟรีทั่วประเทศ",
    cta: "ดูเฟอร์นิเจอร์",
    to: "/products",
  },
  {
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80",
    eyebrow: "BEDROOM COLLECTION",
    heading: ["พักผ่อนอย่างที่", "คุณสมควรได้รับ"],
    sub: "ชุดเครื่องนอน โคมไฟ และของตกแต่งห้องนอนที่ออกแบบมาเพื่อความผ่อนคลาย",
    cta: "จัดห้องนอน",
    to: "/products",
  },
];

// ── Carousel ──────
function HeroCarousel() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (idx) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
      }, 300);
    },
    [animating],
  );

  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(
    () => goTo((current + 1) % SLIDES.length),
    [current, goTo],
  );

  // Auto-play ทุก 5 วินาที
  useEffect(() => {
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [current, next]);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full h-[70vh] min-h-[540px] bg-stone-900 overflow-hidden select-none">
      {/* Background image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}
      >
        <img src={slide.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 h-full flex items-center transition-all duration-500 ${animating ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"}`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10">
          <div className="max-w-xl">
            <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold tracking-widest text-xs mb-5">
              {slide.eyebrow}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-5 tracking-tight">
              {slide.heading[0]}
              <br />
              <span className="text-amber-400">{slide.heading[1]}</span>
            </h1>
            <p className="text-stone-300 text-base sm:text-lg mb-8 leading-relaxed">
              {slide.sub}
            </p>
            <button
              onClick={() => navigate(slide.to)}
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-900 font-bold py-3.5 px-8 rounded-full inline-flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              {slide.cta} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ปุ่ม prev / next */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === current
                ? "w-6 h-2 bg-amber-400"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── HomePage ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "ทั้งหมด",
  "เฟอร์นิเจอร์",
  "ของตกแต่ง",
  "โคมไฟ",
  "สิ่งทอและพรม",
  "ต้นไม้ประดับ",
];

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  // ── ดึงสินค้าจาก MongoDB เอาแค่ 6 ชิ้นแรกมาโชว์ในหน้า Home ──
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("โหลดสินค้าไม่สำเร็จ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = (
    activeCategory === "ทั้งหมด"
      ? products
      : products.filter((p) => p.category === activeCategory)
  ).slice(0, 6); // โชว์แค่ 6 ชิ้น

  const handleAddToCart = (e, productName) => {
    e.stopPropagation();
    // TODO: ต่อ cart API
    console.log("เพิ่มตะกร้า:", productName);
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* ── Hero Carousel ── */}
      <HeroCarousel />

      {/* ── Feature Bar ── */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 text-center">
          {[
            {
              icon: Truck,
              title: "จัดส่งฟรีทั่วประเทศ",
              sub: "เมื่อสั่งซื้อครบ ฿2,000",
            },
            {
              icon: ShieldCheck,
              title: "รับประกันคุณภาพ 1 ปี",
              sub: "ครอบคลุมทุกชิ้นที่สั่งซื้อ",
            },
            {
              icon: Clock,
              title: "ซัพพอร์ต 24 ชั่วโมง",
              sub: "พร้อมให้คำแนะนำเรื่องแต่งบ้าน",
            },
          ].map(({ icon: Icon, title, sub }) => (
            <div
              key={title}
              className="flex flex-col items-center justify-center gap-2 pt-6 sm:pt-0"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-1">
                <Icon className="w-6 h-6 text-amber-600" />
              </div>
              <p className="font-bold text-stone-900 text-sm">{title}</p>
              <p className="text-xs text-stone-500">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Products Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Section header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-2">
              สินค้าของเรา
            </p>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              สินค้าแนะนำ
            </h2>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors group cursor-pointer"
          >
            ดูสินค้าทั้งหมด
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer border ${
                activeCategory === cat
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white border-stone-200 text-stone-600 hover:border-amber-500 hover:text-amber-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">กำลังโหลดสินค้า...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-stone-400">
            <p className="mb-4">ยังไม่มีสินค้าในหมวดหมู่นี้</p>
            <button
              onClick={() => setActiveCategory("ทั้งหมด")}
              className="text-amber-600 text-sm hover:underline cursor-pointer"
            >
              ดูสินค้าทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/products/${product._id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col cursor-pointer"
              >
                {/* รูปสินค้า */}
                  <div className="relative h-64 overflow-hidden bg-stone-100">
                    {product.imageUrl ? (
                      <img
                        src={`${API_URL}${product.imageUrl}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
                        ไม่มีรูปภาพ
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-stone-700">
                      {product.category}
                    </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                      <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        สินค้าหมด
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-stone-900 line-clamp-2 leading-snug pr-2 text-sm sm:text-base flex-1">
                      {product.name}
                    </h3>
                    {product.rating && (
                      <div className="flex items-center gap-0.5 shrink-0 text-amber-600 ml-2">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold">
                          {product.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-xs text-stone-400 line-clamp-1 mb-3">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-100">
                    <p className="text-xl font-black text-stone-900">
                      ฿{Number(product.price).toLocaleString()}
                    </p>
                    <button
                      onClick={(e) => handleAddToCart(e, product.name)}
                      disabled={product.stock === 0}
                      className="bg-stone-900 hover:bg-amber-500 hover:text-stone-900 disabled:bg-stone-200 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-colors cursor-pointer"
                      title="หยิบใส่ตะกร้า"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ปุ่ม mobile */}
        <button
          onClick={() => navigate("/products")}
          className="sm:hidden w-full mt-8 border-2 border-stone-200 text-stone-700 font-bold py-3 rounded-xl flex justify-center items-center gap-2 cursor-pointer hover:border-stone-400 transition-colors"
        >
          ดูสินค้าทั้งหมด <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Banner CTA ── */}
      <div className="mx-4 sm:mx-6 max-w-7xl sm:mx-auto mb-16 rounded-3xl overflow-hidden relative h-52">
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/60 flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-2">
            LIMITED TIME
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            ลด 15% สำหรับสมาชิกใหม่
          </h3>
          <button
            onClick={() => navigate("/register")}
            className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm px-6 py-2.5 rounded-full transition-colors cursor-pointer"
          >
            สมัครสมาชิกฟรี
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <p className="text-lg font-bold text-white mb-3">
              In<span className="text-amber-400">House</span>Store
            </p>
            <p className="text-sm leading-relaxed">
              ร้านของตกแต่งภายในบ้านสไตล์มินิมอล
              คัดสรรสินค้าคุณภาพให้บ้านคุณน่าอยู่ขึ้น
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              เมนู
            </p>
            <ul className="space-y-2 text-sm">
              {[
                ["หน้าแรก", "/home"],
                ["สินค้าทั้งหมด", "/products"],
                ["ประวัติการสั่งซื้อ", "/history"],
              ].map(([label, path]) => (
                <li key={path}>
                  <button
                    onClick={() => navigate(path)}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-white mb-4 uppercase tracking-widest">
              ติดต่อเรา
            </p>
            <ul className="space-y-2 text-sm">
              <li>📧 support@inhousestore.th</li>
              <li>📞 02-XXX-XXXX</li>
              <li>🕐 จันทร์–ศุกร์ 9:00–18:00 น.</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 text-center text-xs py-4 text-stone-600">
          © 2026 InHouseStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
