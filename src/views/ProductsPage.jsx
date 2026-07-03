import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const categories = [
  "ทั้งหมด",
  "เฟอร์นิเจอร์",
  "ของตกแต่ง",
  "โคมไฟ",
  "สิ่งทอและพรม",
  "ต้นไม้ประดับ",
  "เครื่องหอม",
  "โต๊ะอาหาร",
];

export default function ProductsPage() {
  const navigate = useNavigate(); // ย้ายเข้ามาไว้ใน Component
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [sortBy, setSortBy] = useState("recommended");

  // ── โหลดสินค้าจาก MongoDB ──
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("โหลดสินค้าไม่สำเร็จ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "ทั้งหมด") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    switch (sortBy) {
      case "price-asc":
        return result.sort((a, b) => a.price - b.price);
      case "price-desc":
        return result.sort((a, b) => b.price - a.price);
      case "rating-desc":
        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return result;
    }
  }, [products, searchTerm, selectedCategory, sortBy]);

  const addToCart = async (product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          quantity: 1,
        }),
      });

      if (res.ok) {
        // ยิง event บอก Header ให้อัปเดตจำนวนตะกร้าทันที โดยไม่ต้องเปลี่ยนหน้า
        window.dispatchEvent(new Event("cartUpdated"));
        alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว!`);
      } else {
        const errorData = await res.json();
        alert(`เพิ่มสินค้าไม่สำเร็จ: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-stone-900 pt-10 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            สินค้าทั้งหมด
          </h1>
          <p className="text-stone-400">
            ค้นหาไอเทมตกแต่งบ้านที่สะท้อนความเป็นคุณ
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        {/* Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-stone-100 flex flex-col md:flex-row gap-4 justify-between items-center relative z-10">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-stone-700"
            />
          </div>
          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 w-full md:w-auto">
            <ArrowUpDown className="text-stone-400 w-5 h-5 mr-2 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-stone-700 focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="recommended">สินค้าแนะนำ</option>
              <option value="price-asc">ราคา: ต่ำ - สูง</option>
              <option value="price-desc">ราคา: สูง - ต่ำ</option>
              <option value="rating-desc">คะแนนรีวิวสูงสุด</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-6 mt-2">
          <SlidersHorizontal className="w-5 h-5 text-stone-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-stone-900 text-white border-stone-900 shadow-md"
                  : "bg-white text-stone-600 border-stone-200 hover:border-amber-500 hover:text-amber-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-6 text-stone-500 text-sm">
          พบสินค้าทั้งหมด{" "}
          <span className="font-bold text-stone-900">
            {filteredProducts.length}
          </span>{" "}
          รายการ
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <p>กำลังโหลดสินค้า...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                {/* แก้ไขตรงนี้: ย้าย onClick และ cursor-pointer มาใส่ที่ครอบรูปภาพ */}
                <div
                  className="relative h-60 overflow-hidden bg-stone-100 cursor-pointer"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  {product.imageUrl ? (
                    <img
                      src={`${API_URL}${product.imageUrl}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
                      ไม่มีรูปภาพ
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-stone-700 shadow-sm">
                    {product.category}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-stone-900 line-clamp-2 leading-tight pr-2 text-sm sm:text-base">
                      {product.name}
                    </h3>
                    {product.rating && (
                      <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-0.5 rounded text-amber-700">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold">
                          {product.rating}
                        </span>
                      </div>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-xs text-stone-400 line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <p className="text-xl font-black text-stone-900">
                      ฿{Number(product.price).toLocaleString()}
                    </p>
                    {/* แก้ไขตรงนี้: เรียกใช้ฟังก์ชัน addToCart แทน console.log */}
                    <button
                      className="bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-900 p-2.5 rounded-full transition-colors cursor-pointer"
                      title="หยิบใส่ตะกร้า"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 border-dashed mt-4">
            <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              ไม่พบสินค้าที่คุณค้นหา
            </h3>
            <p className="text-stone-500">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่ใหม่
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ทั้งหมด");
              }}
              className="mt-6 text-amber-600 font-medium hover:underline cursor-pointer"
            >
              ล้างการค้นหาทั้งหมด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}