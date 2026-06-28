import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingCart, User, LogOut } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0); // จำนวนรวมสินค้าในตะกร้า

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
      setCartCount(0); // ถ้าไม่ได้ login ให้เคลียร์จำนวนด้วย
      return;
    }

    // ดึงจำนวนสินค้าในตะกร้าจาก MongoDB
    // ทำทุกครั้งที่เปลี่ยนหน้า เพื่อให้ตัวเลขอัปเดตทันที
    // เช่น กดหยิบสินค้าใน ProductsPage แล้วกลับมา Header จะโชว์จำนวนใหม่
    if (token) {
      fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.items) {
            // รวมจำนวนสินค้าทุกชิ้น (quantity) ไม่ใช่แค่นับจำนวน item
            // เช่น โคมไฟ x2 + แจกัน x3 = 5 ไม่ใช่ 2
            const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(total);
          }
        })
        .catch(() => {}); // ถ้า network error ไม่ต้องแสดง error ใน header
    }
  }, [location]); // ทำงานทุกครั้งที่เปลี่ยนหน้า

  const getNavLinks = () => {
    const baseLinks = [
      { to: "/home", label: "หน้าแรก" },
      { to: "/products", label: "สินค้าทั้งหมด" },
    ];

    if (user?.role === "admin") {
      return [
        ...baseLinks,
        { to: "/manage", label: "จัดการสินค้า" },
        { to: "/order", label: "คำสั่งซื้อทั้งหมด" },
      ];
    }
    return [...baseLinks, { to: "/history", label: "ประวัติการสั่งซื้อ" }];
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setCartCount(0);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

        {/* โลโก้ + เมนู */}
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
            {getNavLinks().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive ? "text-amber-400 font-medium" : "text-stone-300 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ส่วนขวา */}
        <div className="flex items-center gap-4">

          {/* ปุ่มตะกร้า + badge จำนวนสินค้า */}
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="ตะกร้าสินค้า"
          >
            <ShoppingCart className="w-5 h-5" />

            {/* Badge — โชว์เฉพาะตอนที่มีสินค้าในตะกร้า */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-900 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center leading-none">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-stone-700">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-stone-400" />
                </div>
                <span className="text-sm font-medium text-stone-200">{user.username}</span>
              </div>
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
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm font-medium px-4 py-2 rounded-full transition-colors cursor-pointer"
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