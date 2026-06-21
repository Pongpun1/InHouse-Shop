import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, User } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();

  const navLinks = [
    { to: '/home', label: 'หน้าแรก' },
    { to: '/products', label: 'สินค้าทั้งหมด' },
    { to: '/manage', label: 'จัดการสินค้า' },
    { to: '/history', label: 'ประวัติการสั่งซื้อ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 border-b border-stone-800">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* กลุ่มซ้าย: โลโก้ + เมนูนำทาง */}
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
                    isActive ? 'text-amber-400 font-medium' : 'text-stone-300 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* กลุ่มขวา: ตะกร้า + เข้าสู่ระบบ */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
            title="ตะกร้าสินค้า"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <User className="w-4 h-4" />
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </header>
  );
}