import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft, Loader2, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AdminOrderPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOrders = async () => {
      const token = localStorage.getItem('token');
      // เช็คเพิ่มเติมว่ามีสิทธิ์ไหม (หรือจะใช้ User Context เช็คก็ได้)
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // สังเกตว่าเราเรียกไปที่ /api/orders/all แทน
        const res = await fetch(`${API_URL}/api/orders/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        console.error("โหลดข้อมูลคำสั่งซื้อไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [navigate]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Pending': return { text: 'รอดำเนินการ', color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-4 h-4" /> };
      case 'Paid': return { text: 'ชำระเงินแล้ว', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-4 h-4" /> };
      case 'Shipped': return { text: 'กำลังจัดส่ง', color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-4 h-4" /> };
      case 'Delivered': return { text: 'จัดส่งสำเร็จ', color: 'bg-green-100 text-green-700', icon: <Package className="w-4 h-4" /> };
      case 'Cancelled': return { text: 'ยกเลิก', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> };
      default: return { text: status, color: 'bg-stone-100 text-stone-700', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-amber-500" /> คำสั่งซื้อทั้งหมดในระบบ
          </h1>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status);
              return (
                <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                  
                  {/* ส่วนหัวของบิล + ข้อมูลคนสั่ง */}
                  <div className="bg-stone-900 text-white p-5 sm:px-8 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="text-xs text-stone-400 mb-1">รหัสบิล: {order._id}</p>
                      <p className="text-sm font-bold">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-sm font-bold">ลูกค้า: {order.userId?.username || 'ผู้ใช้ทั่วไป'}</p>
                        <p className="text-xs text-stone-400">{order.userId?.email || 'ไม่มีอีเมล'}</p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold w-fit ${statusDisplay.color}`}>
                        {statusDisplay.icon}
                        {statusDisplay.text}
                      </div>
                    </div>
                  </div>

                  {/* รายการสินค้า */}
                  <div className="p-5 sm:px-8 divide-y divide-stone-50">
                    {order.items.map((item, index) => (
                      <div key={index} className="py-4 first:pt-0 flex items-center gap-4">
                        <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                          {item.imageUrl ? (
                            <img src={`${API_URL}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">ไม่มีรูป</div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-stone-900 line-clamp-1">{item.name}</h4>
                          <p className="text-sm text-stone-500">จำนวน: {item.quantity} ชิ้น</p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <p className="font-bold text-stone-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* สรุปยอดและข้อมูลจัดส่ง */}
                  <div className="bg-stone-50 border-t border-stone-100 p-5 sm:px-8 flex flex-col sm:flex-row justify-between gap-6">
                    <div className="text-sm text-stone-600">
                      <p className="font-bold text-stone-900 mb-1">ข้อมูลการจัดส่ง (ตามที่ลูกค้าระบุ):</p>
                      <p>{order.shippingAddress.name} ({order.shippingAddress.phone})</p>
                      <p className="line-clamp-2">{order.shippingAddress.address} จ.{order.shippingAddress.province} {order.shippingAddress.zipCode}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <p className="text-sm text-stone-500 mb-1">ยอดรวมสุทธิ</p>
                      <p className="text-2xl font-black text-amber-600">฿{order.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-stone-400 mt-1 uppercase">ชำระผ่าน: {order.paymentMethod.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-900 mb-2">ยังไม่มีคำสั่งซื้อในระบบ</h3>
          </div>
        )}
      </div>
    </div>
  );
}