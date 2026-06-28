import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper: ดึง token จาก localStorage แนบไปกับทุก request ที่ต้องการ auth
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── โหลดตะกร้าของ user ที่ login อยู่จาก MongoDB ──
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: authHeaders(),
      });

      // ถ้า token หมดอายุหรือไม่มี ให้พาไปหน้า login
      if (res.status === 401) {
        navigate('/login');
        return;
      }

      const data = await res.json();
      setCartItems(data.items || []);
    } catch (err) {
      setError('โหลดตะกร้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  // ── อัปเดตจำนวน (บวก/ลบ) ──
  const updateQuantity = async (productId, newQuantity) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/item/${productId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch {
      setError('อัปเดตสินค้าไม่สำเร็จ');
    }
  };

  // ── ลบสินค้า ──
  const removeItem = async (productId) => {
    if (!window.confirm('ต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?')) return;
    try {
      const res = await fetch(`${API_URL}/api/cart/item/${productId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch {
      setError('ลบสินค้าไม่สำเร็จ');
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/products')} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-amber-500" /> ตะกร้าสินค้า
          </h1>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* รายการสินค้า */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item.productId} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-4 items-center">
                  <div className="w-24 h-24 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                    {item.imageUrl ? (
                      <img src={`${API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">ไม่มีรูป</div>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-stone-900 line-clamp-1">{item.name}</h3>
                    <p className="text-stone-500 text-sm mb-2">{item.category}</p>
                    <p className="font-black text-amber-600">฿{Number(item.price).toLocaleString()}</p>
                  </div>

                  {/* ปรับจำนวน */}
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-full px-1 py-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-white rounded-full transition-colors text-stone-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-stone-900 w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 hover:bg-white rounded-full transition-colors text-stone-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-stone-300 hover:text-red-500 transition-colors shrink-0 ml-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* สรุปยอด */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6 border-b border-stone-700 pb-4">สรุปคำสั่งซื้อ</h2>

              <div className="flex justify-between items-center mb-4 text-stone-300">
                <span>ยอดรวมสินค้า ({cartItems.length} รายการ)</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-stone-300 border-b border-stone-700 pb-6">
                <span>ค่าจัดส่ง</span>
                <span className="text-amber-400">ฟรี</span>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg">ยอดชำระสุทธิ</span>
                <span className="text-3xl font-black text-amber-400">฿{totalPrice.toLocaleString()}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                ดำเนินการสั่งซื้อ
              </button>
            </div>
          </div>

        ) : (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-100 text-center">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-stone-300" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">ตะกร้าของคุณยังว่างเปล่า</h2>
            <p className="text-stone-500 mb-8">ยังไม่ได้เลือกสินค้าใดๆ เข้าตะกร้าเลย</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
            >
              เลือกซื้อสินค้าเลย
            </button>
          </div>
        )}
      </div>
    </div>
  );
}