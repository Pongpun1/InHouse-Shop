import React, { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // โหลดข้อมูลตะกร้าจาก localStorage เมื่อเปิดหน้านี้
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // ฟังก์ชันบันทึกข้อมูลกลับไปที่ localStorage
  const saveCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // ปรับเปลี่ยนจำนวนสินค้า
  const updateQuantity = (id, delta) => {
    const newCart = cartItems.map(item => {
      if (item._id === id) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; // ห้ามต่ำกว่า 1
      }
      return item;
    });
    saveCart(newCart);
  };

  // ลบสินค้าออกจากตะกร้า
  const removeItem = (id) => {
    if (window.confirm("ต้องการลบสินค้านี้ออกจากตะกร้าใช่หรือไม่?")) {
      const newCart = cartItems.filter(item => item._id !== id);
      saveCart(newCart);
    }
  };

  // คำนวณราคารวมทั้งหมด
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/products')} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-amber-500" /> ตะกร้าสินค้า
          </h1>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* รายการสินค้า */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-4 items-center">
                  <div className="w-24 h-24 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                    {item.imageUrl ? (
                      <img src={`${API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">ไม่มีรูป</div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-bold text-stone-900 line-clamp-1">{item.name}</h3>
                    <p className="text-stone-500 text-sm mb-2">{item.category}</p>
                    <p className="font-black text-amber-600">฿{Number(item.price).toLocaleString()}</p>
                  </div>
                  
                  {/* ปุ่มปรับจำนวน */}
                  <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-full px-1 py-1">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-1.5 hover:bg-white rounded-full transition-colors text-stone-600">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-stone-900 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-1.5 hover:bg-white rounded-full transition-colors text-stone-600">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button onClick={() => removeItem(item._id)} className="p-2 text-stone-300 hover:text-red-500 transition-colors shrink-0 ml-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* สรุปยอดสั่งซื้อ */}
            <div className="bg-stone-900 text-white p-6 rounded-2xl h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6 border-b border-stone-700 pb-4">สรุปคำสั่งซื้อ</h2>
              
              <div className="flex justify-between items-center mb-4 text-stone-300">
                <span>ยอดรวมสินค้า ({cartItems.length} ชิ้น)</span>
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
              
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                ยืนยันการสั่งซื้อ
              </button>
            </div>

          </div>
        ) : (
          /* กรณีตะกร้าว่างเปล่า */
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-100 text-center">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-stone-300" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">ตะกร้าของคุณยังว่างเปล่า</h2>
            <p className="text-stone-500 mb-8">ดูเหมือนคุณจะยังไม่ได้เลือกสินค้าใดๆ เข้าตะกร้าเลย</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-stone-900 hover:bg-stone-800 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              เลือกซื้อสินค้าเลย
            </button>
          </div>
        )}

      </div>
    </div>
  );
}