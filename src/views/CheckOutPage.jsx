import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, CreditCard, Banknote, QrCode,
  Loader2, ArrowLeft, CheckCircle, ChevronRight, Package,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const formatTHB = (n) => `฿${Number(n).toLocaleString()}`;

// ── Step indicator ──────────────────────────────────────────────
const STEPS = ["ตะกร้าสินค้า", "ที่อยู่จัดส่ง", "ยืนยันคำสั่งซื้อ"];

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done ? "bg-green-600 text-white" : active ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-400"
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${active ? "text-stone-900" : "text-stone-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-2 mb-5 ${done ? "bg-green-600" : "bg-stone-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all";

// ── Payment option ─────────────────────────────────────────────
function PayOption({ value, current, onChange, icon: Icon, title, sub }) {
  const active = current === value;
  return (
    <label className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
      active ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300 bg-white"
    }`}>
      <input type="radio" name="payment" value={value} checked={active} onChange={() => onChange(value)} className="hidden" />
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${active ? "bg-amber-500 text-stone-900" : "bg-stone-100 text-stone-500"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-bold ${active ? "text-stone-900" : "text-stone-700"}`}>{title}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        active ? "border-amber-500" : "border-stone-300"
      }`}>
        {active && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
      </div>
    </label>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function CheckOutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({ name: "", phone: "", address: "", province: "", zipCode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cart`, { headers: authHeaders() });
        if (res.status === 401) { navigate("/login"); return; }
        const data = await res.json();
        if (!data.items?.length) { navigate("/cart"); return; }
        setCartItems(data.items);
      } catch { setErrorMsg("โหลดตะกร้าไม่สำเร็จ"); }
      finally { setLoading(false); }
    };
    fetchCart();
  }, [navigate]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ shippingAddress: form, paymentMethod }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/history");
      } else {
        setErrorMsg(data.message || "เกิดข้อผิดพลาด");
      }
    } catch { setErrorMsg("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้"); }
    finally { setProcessing(false); }
  };

  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const freeShipping = totalPrice >= 2000;
  const shippingFee = freeShipping ? 0 : 50;

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/cart")} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-stone-900">ชำระเงิน</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <StepBar current={1} />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ซ้าย */}
          <div className="lg:col-span-3 space-y-6">

            {/* ที่อยู่จัดส่ง */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                  <MapPin className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <h2 className="font-bold text-stone-900">ที่อยู่จัดส่ง</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="ชื่อ-นามสกุล ผู้รับ">
                    <input required type="text" name="name" value={form.name} onChange={handleChange} placeholder="เช่น สมชาย ใจดี" className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="เบอร์โทรศัพท์">
                    <input required type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="08X-XXX-XXXX" className={inputCls} />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="ที่อยู่">
                    <textarea required name="address" value={form.address} onChange={handleChange} placeholder="บ้านเลขที่ หมู่บ้าน ซอย ถนน" rows={3} className={`${inputCls} resize-none`} />
                  </Field>
                </div>
                <Field label="จังหวัด">
                  <input required type="text" name="province" value={form.province} onChange={handleChange} placeholder="กรุงเทพมหานคร" className={inputCls} />
                </Field>
                <Field label="รหัสไปรษณีย์">
                  <input required type="text" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="10000" className={inputCls} />
                </Field>
              </div>
            </div>

            {/* วิธีชำระเงิน */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                  <CreditCard className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <h2 className="font-bold text-stone-900">วิธีการชำระเงิน</h2>
              </div>

              <div className="space-y-3">
                <PayOption value="cod" current={paymentMethod} onChange={setPaymentMethod}
                  icon={Banknote} title="เก็บเงินปลายทาง" sub="ชำระเงินตอนรับสินค้า" />
                <PayOption value="promptpay" current={paymentMethod} onChange={setPaymentMethod}
                  icon={QrCode} title="QR Code พร้อมเพย์" sub="สแกนจ่ายผ่านแอปธนาคาร" />
                <PayOption value="credit_card" current={paymentMethod} onChange={setPaymentMethod}
                  icon={CreditCard} title="บัตรเครดิต / เดบิต" sub="Visa, Mastercard, JCB" />
              </div>

              {paymentMethod === "credit_card" && (
                <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <Field label="หมายเลขบัตร">
                    <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="วันหมดอายุ">
                      <input type="text" placeholder="MM/YY" maxLength={5} className={inputCls} />
                    </Field>
                    <Field label="CVV">
                      <input type="text" placeholder="123" maxLength={4} className={inputCls} />
                    </Field>
                  </div>
                </div>
              )}

              {paymentMethod === "promptpay" && (
                <div className="mt-4 p-6 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <div className="w-32 h-32 bg-white rounded-xl border border-stone-200 mx-auto flex items-center justify-center mb-3">
                    <QrCode className="w-20 h-20 text-stone-300" />
                  </div>
                  <p className="text-xs text-stone-500">QR Code จะถูกสร้างหลังยืนยันออเดอร์</p>
                </div>
              )}
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{errorMsg}</p>
            )}
          </div>

          {/* ขวา: สรุปยอด */}
          <div className="lg:col-span-2">
            <div className="bg-stone-900 text-white rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-stone-700">
                <Package className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-sm">สรุปคำสั่งซื้อ ({cartItems.length} รายการ)</h2>
              </div>

              {/* รายการ */}
              <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-800 overflow-hidden shrink-0">
                      {item.imageUrl
                        ? <img src={`${API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-stone-600 text-xs">ไม่มีรูป</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-200 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-amber-400 shrink-0">{formatTHB(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* ยอดรวม */}
              <div className="border-t border-stone-700 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-stone-400">
                  <span>ราคาสินค้า</span><span>{formatTHB(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>ค่าจัดส่ง</span>
                  <span className={freeShipping ? "text-green-400 font-medium" : ""}>
                    {freeShipping ? "ฟรี" : formatTHB(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-t border-stone-700 pt-3 mt-1">
                  <span className="text-stone-200 font-medium">ยอดชำระสุทธิ</span>
                  <span className="text-2xl font-black text-amber-400">{formatTHB(totalPrice + shippingFee)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full mt-6 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังดำเนินการ...</>
                  : <><CheckCircle className="w-4 h-4" /> ยืนยันการสั่งซื้อ</>
                }
              </button>

              <p className="text-center text-xs text-stone-500 mt-3">
                กดยืนยันแสดงว่าคุณยอมรับ<br />เงื่อนไขการซื้อขายของเรา
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}