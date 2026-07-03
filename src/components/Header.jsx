import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingCart, User, LogOut, Menu, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // ตรวจจับการ scroll เพื่อเพิ่ม shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
      setCartCount(0);
      return;
    }

    if (token) {
      fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.items) {
            const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(total);
          }
        })
        .catch(() => {});
    }
  }, [location]);

  // ปิด mobile menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
  const syncUser = () => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  // ฟัง event ที่ ProfilePage ยิงมา
  window.addEventListener("userUpdated", syncUser);
  return () => window.removeEventListener("userUpdated", syncUser);
}, []);

  // ── ฟัง cartUpdated จาก ProductsPage / ProductDetailPage ──
  useEffect(() => {
    const syncCart = () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.items) {
            const total = data.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(total);
          }
        })
        .catch(() => {});
    };
    window.addEventListener("cartUpdated", syncCart);
    return () => window.removeEventListener("cartUpdated", syncCart);
  }, []);

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
    <>
      <style>{`
        .nav-link-item {
          position: relative;
          padding: 6px 2px;
          font-size: 0.875rem;
          color: #a8a29e;
          transition: color 0.2s;
          text-decoration: none;
        }
        .nav-link-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          border-radius: 2px;
          transition: width 0.25s cubic-bezier(.4,0,.2,1);
        }
        .nav-link-item:hover {
          color: #fff;
        }
        .nav-link-item:hover::after,
        .nav-link-item.active::after {
          width: 100%;
        }
        .nav-link-item.active {
          color: #fbbf24;
          font-weight: 600;
        }
        .cart-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: transparent;
          border: 1.5px solid #44403c;
          color: #a8a29e;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cart-btn:hover {
          background: #292524;
          border-color: #78716c;
          color: #fff;
        }
        .cart-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #1c1917;
          font-size: 0.65rem;
          font-weight: 900;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          line-height: 1;
          box-shadow: 0 0 0 2px #1c1917;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #44403c, #292524);
          border: 1.5px solid #57534e;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: #78716c;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }
        .login-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #1c1917;
          font-size: 0.8125rem;
          font-weight: 700;
          padding: 7px 18px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .login-btn:hover {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
        }
        .register-link {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #a8a29e;
          text-decoration: none;
          transition: color 0.2s;
          letter-spacing: 0.01em;
        }
        .register-link:hover {
          color: #fbbf24;
        }
        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: transparent;
          border: 1.5px solid #44403c;
          color: #a8a29e;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mobile-menu-btn:hover {
          background: #292524;
          color: #fff;
        }
        .mobile-nav {
          border-top: 1px solid #292524;
          background: #161412;
          padding: 12px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mobile-nav-link {
          display: block;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #a8a29e;
          text-decoration: none;
          transition: all 0.15s;
        }
        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: #292524;
          color: #fbbf24;
        }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: scrolled
            ? "rgba(21, 17, 14, 0.92)"
            : "rgba(28, 25, 23, 0.98)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(68, 64, 60, 0.6)",
          boxShadow: scrolled
            ? "0 4px 24px rgba(0,0,0,0.4)"
            : "0 1px 0 rgba(68,64,60,0.4)",
          transition: "box-shadow 0.3s, background 0.3s",
        }}
      >
        {/* Amber gradient top line — signature accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, #f59e0b 40%, #fbbf24 60%, transparent 100%)",
            opacity: 0.8,
          }}
        />

        <div
          style={{
            padding: "0 20px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            maxWidth: "1280px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* โลโก้ + เมนู */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <NavLink
              to="/home"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              {/* Icon แบบ geometric แทน circle เรียบๆ */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.08))",
                  border: "1.5px solid rgba(245,158,11,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Home size={15} color="#f59e0b" />
              </div>

              <span
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                In<span style={{ color: "#f59e0b" }}>House</span>
                <span style={{ color: "#78716c", fontWeight: 500 }}> Store</span>
              </span>
            </NavLink>

            {/* Desktop nav */}
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
              className="hidden-mobile"
            >
              {getNavLinks().map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `nav-link-item${isActive ? " active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* ส่วนขวา */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

            {/* ปุ่มตะกร้า */}
            <button
              onClick={() => navigate("/cart")}
              className="cart-btn"
              title="ตะกร้าสินค้า"
            >
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                width: "1px",
                height: "28px",
                background: "#292524",
                margin: "0 4px",
              }}
            />

            {isLoggedIn && user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    padding: "4px 10px 4px 4px",
                    borderRadius: "999px",
                    border: "1.5px solid #292524",
                    transition: "all 0.2s",
                  }}
                  onClick={() => navigate("/profile")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#44403c";
                    e.currentTarget.style.background = "#1c1917";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#292524";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div className="user-avatar">
                    <User size={14} color="#a8a29e" />
                  </div>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#d6d3d1",
                    }}
                  >
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="logout-btn"
                  title="ออกจากระบบ"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button onClick={() => navigate("/login")} className="login-btn">
                  <User size={14} />
                  เข้าสู่ระบบ
                </button>
                <NavLink to="/register" className="register-link">
                  สมัครสมาชิก
                </NavLink>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="mobile-menu-btn show-mobile"
              onClick={() => setMobileMenuOpen((v) => !v)}
              title="เมนู"
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-nav show-mobile">
            {getNavLinks().map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `mobile-nav-link${isActive ? " active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Responsive helpers */}
      <style>{`
        @media (min-width: 640px) {
          .hidden-mobile { display: flex !important; }
          .show-mobile { display: none !important; }
        }
        @media (max-width: 639px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}