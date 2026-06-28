// ไฟล์: CheckOutPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Banknote, QrCode, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export default function CheckOutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // State สำหรับฟอร์มที่อยู่และวิธีชำระเงิน
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    province: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cart`, { headers: authHeaders() });
        if (res.status === 401) return navigate('/login');
        
        const data = await res.json();
        if (!data.items || data.items.length === 0) {
          alert("ตะกร้าของคุณว่างเปล่า");
          navigate('/products');
          return;
        }
        setCartItems(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          shippingAddress: formData,
          paymentMethod: paymentMethod
        }),
      });

      if (res.ok) {
        alert("สั่งซื้อสินค้าสำเร็จ! ขอบคุณที่ใช้บริการครับ");
        navigate('/history'); // ส่งไปหน้าประวัติการสั่งซื้อ (ถ้ามี) หรือหน้า Home
      } else {
        const errorData = await res.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.message}`);
      }
    } catch (err) {
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setProcessing(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 font-sans text-stone-800">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/cart')} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-extrabold text-stone-900">ชำระเงิน (Checkout)</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ฝั่งซ้าย: ข้อมูลจัดส่ง และ ชำระเงิน */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* กล่องที่อยู่จัดส่ง */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <MapPin className="text-amber-500 w-6 h-6" /> 1. ที่อยู่ในการจัดส่ง
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-500 mb-1">ชื่อ-นามสกุล ผู้รับ</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none" placeholder="เช่น สมชาย ใจดี" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-500 mb-1">เบอร์โทรศัพท์</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none" placeholder="08X-XXX-XXXX" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-500 mb-1">ที่อยู่ (บ้านเลขที่, หมู่บ้าน, ซอย, ถนน)</label>
                  <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none resize-none" placeholder="กรอกที่อยู่โดยละเอียด..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">จังหวัด</label>
                  <input required type="text" name="province" value={formData.province} onChange={handleInputChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none" placeholder="เช่น กรุงเทพมหานคร" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-500 mb-1">รหัสไปรษณีย์</label>
                  <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none" placeholder="10000" />
                </div>
              </div>
            </div>

            {/* กล่องวิธีการชำระเงิน */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <ShieldCheck className="text-amber-500 w-6 h-6" /> 2. วิธีการชำระเงิน
              </h2>
              
              <div className="space-y-3">
                {/* ตัวเลือก 1: บัตรเครดิต */}
                <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'credit_card' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:bg-stone-50'}`}>
                  <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500" />
                  <div className="ml-3 flex-grow">
                    <span className="block text-sm font-bold text-stone-900 flex items-center gap-2"><CreditCard className="w-5 h-5"/> บัตรเครดิต / เดบิต</span>
                    <span className="block text-xs text-stone-500 mt-1">ชำระผ่านระบบรักษาความปลอดภัย</span>
                    
                    {/* ฟอร์มจำลองบัตรเครดิต (ซ่อนถ้าไม่ได้เลือก) */}
                    {paymentMethod === 'credit_card' && (
                      <div className="mt-4 space-y-3 bg-white p-4 rounded-xl border border-stone-200">
                        <input type="text" placeholder="หมายเลขบัตร 16 หลัก" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg outline-none" required={paymentMethod === 'credit_card'} />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg outline-none" required={paymentMethod === 'credit_card'} />
                          <input type="text" placeholder="CVV" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg outline-none" required={paymentMethod === 'credit_card'} />
                        </div>
                        <input type="text" placeholder="ชื่อบนบัตร" className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg outline-none" required={paymentMethod === 'credit_card'} />
                      </div>
                    )}
                  </div>
                </label>

                {/* ตัวเลือก 2: QR Code */}
                <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'promptpay' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:bg-stone-50'}`}>
                  <input type="radio" name="payment" value="promptpay" checked={paymentMethod === 'promptpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500" />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-stone-900 flex items-center gap-2"><QrCode className="w-5 h-5"/> สแกน QR Code (พร้อมเพย์)</span>
                  </div>
                </label>

                {/* ตัวเลือก 3: เก็บเงินปลายทาง */}
                <label className={`flex items-start p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/50' : 'border-stone-200 hover:bg-stone-50'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-4 h-4 text-amber-600 focus:ring-amber-500" />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-stone-900 flex items-center gap-2"><Banknote className="w-5 h-5"/> เก็บเงินปลายทาง (Cash on Delivery)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ฝั่งขวา: สรุปยอดคำสั่งซื้อ */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900 text-white p-6 md:p-8 rounded-3xl h-fit sticky top-24 shadow-xl">
              <h2 className="text-xl font-bold mb-6 border-b border-stone-700 pb-4">สรุปคำสั่งซื้อ</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-stone-800 rounded-lg overflow-hidden shrink-0">
                      {item.imageUrl && <img src={`${API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium line-clamp-1 text-stone-200">{item.name}</h4>
                      <p className="text-xs text-stone-400 mt-1">จำนวน: {item.quantity}</p>
                      <p className="text-sm font-bold text-amber-400 mt-1">฿{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-700 pt-4 space-y-3 text-sm text-stone-300">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span className="text-amber-400 font-medium">จัดส่งฟรี</span>
                </div>
              </div>

              <div className="border-t border-stone-700 mt-4 pt-4 flex justify-between items-end mb-8">
                <span className="text-lg">ยอดชำระสุทธิ</span>
                <span className="text-3xl font-black text-amber-400">฿{totalPrice.toLocaleString()}</span>
              </div>

              <button 
                type="submit" 
                disabled={processing}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {processing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> กำลังดำเนินการ...</>
                ) : (
                  "ยืนยันการสั่งซื้อ"
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}