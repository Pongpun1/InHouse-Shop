import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, Eye, EyeOff } from "lucide-react";
import BrandHeader from "../components/BrandHeader";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // ยิงข้อมูลไปให้ Backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/home");
      } else {
        setError(data.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-stone-200 rounded-2xl shadow-sm p-8">
        <BrandHeader subtitle="เข้าสู่ระบบเพื่อเลือกซื้อสินค้า" />

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-stone-600 mb-1.5 block">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              className="w-full border border-stone-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-stone-600">รหัสผ่าน</label>
              <button
                type="button"
                className="text-xs text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
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

          <label className="flex items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-amber-600"
            />
            จดจำฉันไว้ในระบบ
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer
              ${isLoading ? "bg-stone-400 cursor-not-allowed" : "bg-stone-900 hover:bg-stone-800"}
            `}
          >
            {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            เข้าสู่ระบบ
          </button>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          ยังไม่มีบัญชี?{" "}
          <Link
            to="/register"
            className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}
