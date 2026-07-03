import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Loader2, Star, Plus, Minus } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 1. เพิ่ม State สำหรับเก็บจำนวนสินค้าที่ต้องการซื้อ
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("ไม่พบสินค้า");
        const data = await res.json();
        setProduct(data);
        // รีเซ็ตจำนวนเป็น 1 เสมอเมื่อโหลดสินค้าใหม่
        setQuantity(1);
      } catch (err) {
        console.error(err);
        alert("ไม่พบสินค้าที่คุณค้นหา");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // ฟังก์ชันลดจำนวน
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // ฟังก์ชันเพิ่มจำนวน (เช็คไม่ให้เกินสต็อก)
  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const addToCart = async () => {
    if (!product) return;

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
          // 2. เปลี่ยนมาส่งค่า quantity ตามที่ผู้ใช้เลือก
          quantity: quantity,
        }),
      });

      if (res.ok) {
        // ยิง event บอก Header ให้อัปเดตจำนวนตะกร้าทันที โดยไม่ต้องเปลี่ยนหน้า
        window.dispatchEvent(new Event("cartUpdated"));
        alert(`เพิ่ม "${product.name}" จำนวน ${quantity} ชิ้น ลงในตะกร้าแล้ว!`);
      } else {
        const errorData = await res.json();
        alert(`เพิ่มสินค้าไม่สำเร็จ: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> กลับไปหน้าสินค้า
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col md:flex-row">
          {/* รูปภาพสินค้า */}
          <div className="md:w-1/2 h-[400px] md:h-auto bg-stone-100">
            {product.imageUrl ? (
              <img
                src={`${API_URL}${product.imageUrl}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                ไม่มีรูปภาพ
              </div>
            )}
          </div>

          {/* รายละเอียด */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <span className="text-sm font-bold text-amber-600 mb-2 uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-black text-stone-900">
                ฿{Number(product.price).toLocaleString()}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-amber-700">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold">{product.rating}</span>
                </div>
              )}
            </div>

            <p className="text-stone-500 leading-relaxed mb-8">
              {product.description || "ไม่มีคำอธิบายสำหรับสินค้านี้"}
            </p>

            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-sm text-stone-500 block mb-1">
                  สถานะสินค้า
                </span>
                {product.stock > 0 ? (
                  <span className="inline-block bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full text-sm">
                    มีสินค้า ({product.stock} ชิ้น)
                  </span>
                ) : (
                  <span className="inline-block bg-red-50 text-red-700 font-semibold px-3 py-1 rounded-full text-sm">
                    สินค้าหมด
                  </span>
                )}
              </div>
            </div>

            {/* 3. ส่วนควบคุมจำนวนสินค้า */}
            {product.stock > 0 && (
              <div className="mb-8">
                <span className="text-sm text-stone-500 block mb-2">จำนวน</span>
                <div className="inline-flex items-center gap-4 bg-stone-50 border border-stone-200 rounded-full px-2 py-1">
                  <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-white rounded-full transition-colors text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-stone-900 w-8 text-center">{quantity}</span>
                  <button
                    onClick={handleIncrease}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-white rounded-full transition-colors text-stone-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={addToCart}
              disabled={product.stock <= 0}
              className={`mt-auto w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                product.stock > 0
                  ? "bg-stone-900 hover:bg-stone-800 text-white"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock > 0 ? `หยิบใส่ตะกร้า (฿${Number(product.price * quantity).toLocaleString()})` : "สินค้าหมด"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}