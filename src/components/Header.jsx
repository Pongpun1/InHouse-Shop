import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingCart, User, LogOut } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // เพิ่ม state สำหรับเก็บข้อมูลผู้ใช้

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user"); // ดึงข้อมูล user จาก localStorage
    
    setIsLoggedIn(!!token);
    
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // แปลงข้อความ JSON กลับเป็น Object
    } else {
      setUser(null);
    }
  }, [location]);

  // ฟังก์ชันสำหรับกำหนดเมนูตาม Role
  const getNavLinks = () => {
    // เมนูพื้นฐานที่ทุกคนเห็น
    const baseLinks = [
      { to: "/home", label: "หน้าแรก" },
      { to: "/products", label: "สินค้าทั้งหมด" },
    ];

    if (user?.role === "admin") {
      // ถ้าเป็น admin ให้เพิ่มเมนูจัดการและคำสั่งซื้อทั้งหมด
      return [
        ...baseLinks,
        { to: "/manage", label: "จัดการสินค้า" },
        { to: "/order", label: "คำสั่งซื้อทั้งหมด" }
      ];
    } else {
      // ถ้าเป็น customer (หรือคนทั่วไป) ให้เห็นประวัติการสั่งซื้อ
      return [
        ...baseLinks,
        { to: "/history", label: "ประวัติการสั่งซื้อ" }
      ];
    }
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

        {/* โลโก้ และ เมนู */}
        <div className="flex items-center gap-6">
          <NavLink to="/home" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Home className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              In<span className="text-amber-400">House</span>Store
            </span>
          </NavLink>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "text-amber-400 font-medium"
                      : "text-stone-300 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ส่วนขวา: ตะกร้า และ โปรไฟล์ผู้ใช้ */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="ตะกร้าสินค้า"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-stone-700">
              {/* Profile Mock & Username */}
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center overflow-hidden">
                  <User className="w-5 h-5 text-stone-400" />
                </div>
                <span className="text-sm font-medium text-stone-200">
                  {user.username}
                </span>
              </div>

              {/* ปุ่ม Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <User className="w-4 h-4" />
                เข้าสู่ระบบ
              </button>
              <NavLink
                to="/register"
                className="text-sm font-bold text-white hover:text-amber-400 transition-colors duration-200"
              >
                สมัครสมาชิก
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}