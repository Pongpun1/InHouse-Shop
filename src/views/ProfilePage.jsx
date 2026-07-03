import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Phone, Mail, Lock, Eye, EyeOff,
  ArrowLeft, Loader2, CheckCircle, ShieldCheck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeaders = (json = true) => ({
  ...(json ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50";

// ── Toast แจ้งผลลัพธ์ ────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const isError = type === "error";
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
      isError ? "bg-red-600 text-white" : "bg-stone-900 text-white"
    }`}>
      {isError
        ? <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">!</span>
        : <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
      }
      {msg}
    </div>
  );
}

// ── Section card ────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-600" />
        </div>
        <h2 className="font-bold text-stone-900 text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Field wrapper ───────────────────────────────────────────────
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

// ── Password input ──────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder, name }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputCls} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // form แก้ข้อมูลทั่วไป
  const [infoForm, setInfoForm] = useState({ username: "", phone: "" });
  const [infoLoading, setInfoLoading] = useState(false);

  // form เปลี่ยนรหัสผ่าน
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  // toast
  const [toast, setToast] = useState({ msg: "", type: "" });
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  // โหลดข้อมูล profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    fetch(`${API_URL}/api/users/profile`, { headers: authHeaders() })
      .then((r) => {
        if (r.status === 401) { navigate("/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setProfile(data);
        setInfoForm({ username: data.username, phone: data.phone });
      })
      .catch(() => showToast("โหลดข้อมูลไม่สำเร็จ", "error"))
      .finally(() => setPageLoading(false));
  }, [navigate]);

  // ── บันทึกข้อมูลทั่วไป ──
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(infoForm),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok) {
        setProfile((p) => ({ ...p, ...infoForm }));
        // อัปเดต localStorage ให้ Header โชว์ชื่อใหม่ด้วย
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, username: infoForm.username }));
        window.dispatchEvent(new Event("userUpdated"));
        showToast("อัปเดตข้อมูลสำเร็จ");
      } else {
        showToast(data.message || "เกิดข้อผิดพลาด", "error");
      }
    } catch {
      showToast("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้", "error");
    } finally {
      setInfoLoading(false);
    }
  };

  // ── เปลี่ยนรหัสผ่าน ──
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน", "error");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showToast("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร", "error");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/password`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (res.ok) {
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showToast("เปลี่ยนรหัสผ่านสำเร็จ");
      } else {
        showToast(data.message || "เกิดข้อผิดพลาด", "error");
      }
    } catch {
      showToast("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const roleLabel = { admin: "ผู้ดูแลระบบ", employee: "พนักงาน", customer: "ลูกค้า" };
  const roleColor = { admin: "bg-red-50 text-red-700 border-red-200", employee: "bg-blue-50 text-blue-700 border-blue-200", customer: "bg-green-50 text-green-700 border-green-200" };

  if (pageLoading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans">

      {/* Top bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-stone-900">โปรไฟล์ของฉัน</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Avatar + ข้อมูลสรุป */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-amber-400">
              {profile?.username?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-stone-900 truncate">{profile?.username}</h2>
            <p className="text-sm text-stone-400 truncate">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleColor[profile?.role] || ""}`}>
                <ShieldCheck className="w-3 h-3" />
                {roleLabel[profile?.role] || profile?.role}
              </span>
              <span className="text-xs text-stone-400">
                สมาชิกตั้งแต่ {new Date(profile?.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long" })}
              </span>
            </div>
          </div>
        </div>

        {/* แก้ไขข้อมูลทั่วไป */}
        <SectionCard icon={User} title="ข้อมูลส่วนตัว">
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <Field label="ชื่อผู้ใช้งาน">
              <input
                type="text"
                value={infoForm.username}
                onChange={(e) => setInfoForm((f) => ({ ...f, username: e.target.value }))}
                className={inputCls}
                placeholder="username"
                required
              />
            </Field>

            <Field label="อีเมล">
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className={`${inputCls} pl-10 cursor-not-allowed`}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1.5">อีเมลไม่สามารถเปลี่ยนแปลงได้</p>
            </Field>

            <Field label="เบอร์โทรศัพท์">
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm((f) => ({ ...f, phone: e.target.value }))}
                  className={`${inputCls} pl-10`}
                  placeholder="08X-XXX-XXXX"
                  required
                />
              </div>
            </Field>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={infoLoading}
                className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
              >
                {infoLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
                  : "บันทึกการเปลี่ยนแปลง"
                }
              </button>
            </div>
          </form>
        </SectionCard>

        {/* เปลี่ยนรหัสผ่าน */}
        <SectionCard icon={Lock} title="เปลี่ยนรหัสผ่าน">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field label="รหัสผ่านปัจจุบัน">
              <PasswordInput
                name="currentPassword"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                placeholder="กรอกรหัสผ่านปัจจุบัน"
              />
            </Field>

            <div className="border-t border-stone-100 pt-4 space-y-4">
              <Field label="รหัสผ่านใหม่">
                <PasswordInput
                  name="newPassword"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </Field>

              <Field label="ยืนยันรหัสผ่านใหม่">
                <PasswordInput
                  name="confirmPassword"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                />
                {/* แสดงสีเขียวถ้าตรงกัน */}
                {pwForm.confirmPassword && (
                  <p className={`text-xs mt-1.5 ${
                    pwForm.newPassword === pwForm.confirmPassword
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    {pwForm.newPassword === pwForm.confirmPassword
                      ? "✓ รหัสผ่านตรงกัน"
                      : "✕ รหัสผ่านไม่ตรงกัน"
                    }
                  </p>
                )}
              </Field>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={pwLoading}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-stone-300 text-stone-900 text-sm font-bold px-6 py-2.5 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
              >
                {pwLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...</>
                  : "เปลี่ยนรหัสผ่าน"
                }
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ข้อมูลบัญชี (read-only) */}
        <SectionCard icon={ShieldCheck} title="ข้อมูลบัญชี">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "รหัสบัญชี", value: profile?._id },
              { label: "ระดับผู้ใช้", value: roleLabel[profile?.role] },
              { label: "วันที่สมัคร", value: new Date(profile?.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) },
              { label: "อัปเดตล่าสุด", value: new Date(profile?.updatedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-stone-50 rounded-xl px-4 py-3">
                <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-stone-900 font-medium truncate">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

      </div>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}