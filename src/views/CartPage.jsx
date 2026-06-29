import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const formatTHB = (n) => `฿${Number(n).toLocaleString()}`;

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cart`, { headers: authHeaders() });
      if (res.status === 401) { navigate("/login"); return; }
      const data = await res.json();
      setCartItems(data.items || []);
    } catch {
      setError("โหลดตะกร้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQuantity = async (productId, newQty) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/item/${productId}`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ quantity: newQty }),
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch { setError("อัปเดตสินค้าไม่สำเร็จ"); }
  };

  const removeItem = async (productId) => {
    if (!window.confirm("ต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?")) return;
    try {
      const res = await fetch(`${API_URL}/api/cart/item/${productId}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch { setError("ลบสินค้าไม่สำเร็จ"); }
  };

  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
  const freeShipping = totalPrice >= 2000;

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/products")} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" /> ตะกร้าสินค้า
            </h1>
            {cartItems.length > 0 && (
              <p className="text-xs text-stone-400 mt-0.5">{totalQty} ชิ้น · {cartItems.length} รายการ</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {error && <p className="text-sm text-red-600 mb-4 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* รายการสินค้า */}
            <div className="lg:col-span-3 space-y-3">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                    {item.imageUrl
                      ? <img src={`${API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs text-stone-300">ไม่มีรูป</div>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-900 text-sm line-clamp-2 leading-snug">{item.name}</h3>
                    <p className="text-xs text-stone-400 mt-0.5 mb-3">{item.category}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-stone-200 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="font-black text-stone-900">{formatTHB(item.price * item.quantity)}</p>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-stone-300 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* แถบจัดส่งฟรี */}
              <div className={`rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-medium ${
                freeShipping ? "bg-green-50 text-green-700 border border-green-200" : "bg-stone-100 text-stone-600"
              }`}>
                <Tag className="w-4 h-4 shrink-0" />
                {freeShipping
                  ? "ยอดสั่งซื้อของคุณได้รับสิทธิ์จัดส่งฟรี!"
                  : `สั่งซื้อเพิ่มอีก ${formatTHB(2000 - totalPrice)} เพื่อรับสิทธิ์จัดส่งฟรี`
                }
              </div>
            </div>

            {/* สรุปยอด */}
            <div className="lg:col-span-2">
              <div className="bg-stone-900 text-white rounded-2xl p-6 sticky top-24">
                <h2 className="font-bold text-base mb-5 pb-4 border-b border-stone-700">สรุปคำสั่งซื้อ</h2>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-stone-400">
                    <span>ราคาสินค้า ({totalQty} ชิ้น)</span>
                    <span>{formatTHB(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>ค่าจัดส่ง</span>
                    <span className={freeShipping ? "text-green-400 font-medium" : "text-stone-400"}>
                      {freeShipping ? "ฟรี" : formatTHB(50)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-700 pt-4 mb-6 flex justify-between items-baseline">
                  <span className="text-stone-300">ยอดรวมทั้งหมด</span>
                  <span className="text-2xl font-black text-amber-400">
                    {formatTHB(freeShipping ? totalPrice : totalPrice + 50)}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-900 font-bold py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  ดำเนินการสั่งซื้อ
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="w-full mt-3 text-stone-400 hover:text-white text-sm font-medium py-2 transition-colors cursor-pointer"
                >
                  เลือกซื้อสินค้าเพิ่ม
                </button>
              </div>
            </div>
          </div>

        ) : (
          <div className="bg-white rounded-3xl border border-stone-100 py-24 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-9 h-9 text-stone-300" />
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">ตะกร้าของคุณว่างเปล่า</h2>
            <p className="text-stone-400 text-sm mb-8">ยังไม่ได้เลือกสินค้าใดๆ เข้าตะกร้าเลย</p>
            <button
              onClick={() => navigate("/products")}
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
            >
              เลือกซื้อสินค้า
            </button>
          </div>
        )}
      </div>
    </div>
  );
}