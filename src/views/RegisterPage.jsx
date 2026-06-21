import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Eye, EyeOff } from "lucide-react";
import BrandHeader from "../components/BrandHeader";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // state สำหรับจัดการปุ่มตอนกำลังโหลดข้อมูล
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async () => {
    const { username, email, phone, password, confirmPassword } = form;

    if (
      !username.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (!email.includes("@")) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!acceptTerms) {
      setError("กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัครสมาชิก");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // ส่งข้อมูลที่จำเป็นไป
        body: JSON.stringify({
          username,
          email,
          phone,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('สมัครสมาชิกสำเร็จ!');
        navigate('/login');
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white border border-stone-200 rounded-2xl shadow-sm p-8">
        <BrandHeader subtitle="เข้าสู่ระบบเพื่อเลือกซื้อสินค้า" />

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-stone-600 mb-1.5 block">
              ชื่อผู้ใช้งาน
            </label>
            <input
              type="text"
              value={form.username}
              onChange={updateField("username")}
              onKeyDown={handleKeyDown}
              placeholder="username"
              className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-sm text-stone-600 mb-1.5 block">อีเมล</label>
            <input
              type="email"
              value={form.email}
              onChange={updateField("email")}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-sm text-stone-600 mb-1.5 block">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={updateField("phone")}
              onKeyDown={handleKeyDown}
              placeholder="08X-XXX-XXXX"
              className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-sm text-stone-600 mb-1.5 block">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField("password")}
                onKeyDown={handleKeyDown}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-stone-600 mb-1.5 block">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={updateField("confirmPassword")}
                onKeyDown={handleKeyDown}
                placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="accent-amber-600 mt-0.5"
            />
            <span>
              ยอมรับ{" "}
              <span className="text-amber-600 hover:text-amber-700">
                เงื่อนไขการใช้งาน
              </span>{" "}
              และ
              <span className="text-amber-600 hover:text-amber-700">
                {" "}
                นโยบายความเป็นส่วนตัว
              </span>
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer
              ${isLoading ? 'bg-stone-400 cursor-not-allowed' : 'bg-stone-900 hover:bg-stone-800'}
            `}
          >
            {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            to="/login"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
