import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft,
  Loader2, User, Search, ChevronLeft, ChevronRight,
  SlidersHorizontal, TrendingUp
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const STATUS_CONFIG = {
  Pending:   { text: "รอดำเนินการ", color: "bg-amber-100 text-amber-700 border-amber-200",   dot: "bg-amber-500" },
  Paid:      { text: "ชำระเงินแล้ว", color: "bg-blue-100 text-blue-700 border-blue-200",    dot: "bg-blue-500" },
  Shipped:   { text: "กำลังจัดส่ง", color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  Delivered: { text: "จัดส่งสำเร็จ", color: "bg-green-100 text-green-700 border-green-200",  dot: "bg-green-500" },
  Cancelled: { text: "ยกเลิก",       color: "bg-red-100 text-red-700 border-red-200",        dot: "bg-red-500" },
};

const formatDate = (str) =>
  new Date(str).toLocaleDateString("th-TH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const formatTHB = (n) => `฿${Number(n).toLocaleString()}`;

// ── สถิติสรุปด้านบน ─────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-2xl border p-5 ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-stone-900">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Badge สถานะ ──────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { text: status, color: "bg-stone-100 text-stone-600 border-stone-200", dot: "bg-stone-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.text}
    </span>
  );
}

// ── การ์ดคำสั่งซื้อ ──────────────────────────────────────────────
function OrderCard({ order, onStatusChange, updatingId }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      {/* หัวการ์ด */}
      <div className="px-5 py-4 flex flex-wrap items-center gap-3 border-b border-stone-100">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-stone-400 font-mono truncate">#{order._id}</p>
          <p className="text-sm font-bold text-stone-900 mt-0.5">
            {order.userId?.username || "ผู้ใช้ทั่วไป"}
            <span className="text-stone-400 font-normal ml-2 text-xs">{order.userId?.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-xs text-stone-400 hidden sm:block">{formatDate(order.createdAt)}</p>
          <StatusBadge status={order.status} />
          <p className="text-base font-black text-amber-600">{formatTHB(order.totalAmount)}</p>
        </div>
      </div>

      {/* รายการสินค้า (พับได้) */}
      <div className="px-5 py-3">
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 cursor-pointer"
        >
          {open ? "ซ่อนรายการ" : `ดูรายการสินค้า (${order.items.length} ชิ้น)`}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-90" : ""}`} />
        </button>

        {open && (
          <div className="mt-3 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-t border-stone-50">
                <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                  {item.imageUrl
                    ? <img src={`${API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs text-stone-300">ไม่มีรูป</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{item.name}</p>
                  <p className="text-xs text-stone-400">{item.quantity} ชิ้น × {formatTHB(item.price)}</p>
                </div>
                <p className="text-sm font-bold text-stone-900 shrink-0">{formatTHB(item.price * item.quantity)}</p>
              </div>
            ))}

            {/* ที่อยู่จัดส่ง */}
            <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
              <p className="font-semibold text-stone-700 mb-1">ที่อยู่จัดส่ง</p>
              <p>{order.shippingAddress?.name} · {order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.address} {order.shippingAddress?.province} {order.shippingAddress?.zipCode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer: เปลี่ยนสถานะ */}
      <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
        <p className="text-xs text-stone-400">{formatDate(order.createdAt)}</p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500 font-medium">เปลี่ยนสถานะ:</label>
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order._id, e.target.value)}
            disabled={updatingId === order._id}
            className="text-xs border border-stone-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer disabled:opacity-50"
          >
            {Object.keys(STATUS_CONFIG).map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].text}</option>
            ))}
          </select>
          {updatingId === order._id && <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-400" />}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function AdminOrderPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    fetch(`${API_URL}/api/orders/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) { navigate("/login"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setOrders(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── เปลี่ยนสถานะออเดอร์ ──
  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── สถิติสรุป ──
  const stats = useMemo(() => {
    const total = orders.reduce((s, o) => s + o.totalAmount, 0);
    const pending = orders.filter((o) => o.status === "Pending").length;
    const today = orders.filter((o) =>
      new Date(o.createdAt).toDateString() === new Date().toDateString()
    ).length;
    return { total, pending, today, count: orders.length };
  }, [orders]);

  // ── Filter + Search ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) => {
      const matchStatus = filterStatus === "all" || o.status === filterStatus;
      const matchSearch = !q ||
        o._id.toLowerCase().includes(q) ||
        (o.userId?.username || "").toLowerCase().includes(q) ||
        (o.userId?.email || "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, search, filterStatus]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // reset หน้าเมื่อ filter เปลี่ยน
  useEffect(() => setPage(1), [search, filterStatus, pageSize]);

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-500" /> คำสั่งซื้อทั้งหมด
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">จัดการและติดตามคำสั่งซื้อของลูกค้า</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="ออเดอร์ทั้งหมด" value={stats.count} color="border-stone-200" />
          <StatCard label="รอดำเนินการ" value={stats.pending} color="border-amber-200" sub="ต้องการความสนใจ" />
          <StatCard label="วันนี้" value={stats.today} color="border-blue-200" sub="ออเดอร์ใหม่" />
          <StatCard label="รายได้รวม" value={formatTHB(stats.total)} color="border-green-200" />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          {/* ค้นหา */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาด้วย ชื่อผู้ใช้, อีเมล หรือ รหัสออเดอร์..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* กรองสถานะ */}
            <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-2.5">
              <SlidersHorizontal className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm bg-transparent focus:outline-none cursor-pointer text-stone-700"
              >
                <option value="all">ทุกสถานะ</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.text}</option>
                ))}
              </select>
            </div>

            {/* จำนวนต่อหน้า */}
            <div className="flex items-center gap-2 border border-stone-200 rounded-xl px-3 py-2.5">
              <TrendingUp className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-sm bg-transparent focus:outline-none cursor-pointer text-stone-700"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} รายการ/หน้า</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ผลลัพธ์ */}
        <p className="text-sm text-stone-500 mb-4">
          แสดง <span className="font-bold text-stone-900">{filtered.length}</span> รายการ
          {search && ` · ค้นหา "${search}"`}
        </p>

        {/* List */}
        {paginated.length > 0 ? (
          <div className="space-y-4">
            {paginated.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={handleStatusChange}
                updatingId={updatingId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-900 mb-1">ไม่พบคำสั่งซื้อ</h3>
            <p className="text-stone-400 text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะ</p>
            {(search || filterStatus !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterStatus("all"); }}
                className="mt-4 text-amber-600 text-sm hover:underline cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-stone-500">
              หน้า <span className="font-bold text-stone-900">{safePage}</span> จาก <span className="font-bold text-stone-900">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1">
              {/* ปุ่มก่อนหน้า */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-full hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* ปุ่มเลขหน้า */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`dot-${i}`} className="px-2 text-stone-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                        safePage === item
                          ? "bg-stone-900 text-white"
                          : "hover:bg-stone-200 text-stone-600"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-full hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}