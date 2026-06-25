import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Loader2, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProductDetailPage() {
  const { id } = useParams(); // รับ ID จาก URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("ไม่พบสินค้า");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        alert("ไม่พบสินค้าที่คุณค้นหา");
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const addToCart = () => {
    if (!product) return;
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItemIndex = existingCart.findIndex(item => item._id === product._id);
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(existingCart));
    alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> กลับไปหน้าสินค้า
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col md:flex-row">
          {/* รูปภาพสินค้า */}
          <div className="md:w-1/2 h-[400px] md:h-auto bg-stone-100">
            {product.imageUrl ? (
              <img src={`${API_URL}${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">ไม่มีรูปภาพ</div>
            )}
          </div>

          {/* รายละเอียด */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <span className="text-sm font-bold text-amber-600 mb-2 uppercase tracking-wider">{product.category}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-black text-stone-900">฿{Number(product.price).toLocaleString()}</span>
              {product.rating && (
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-amber-700">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold">{product.rating}</span>
                </div>
              )}
            </div>

            <p className="text-stone-500 leading-relaxed mb-8">{product.description || "ไม่มีคำอธิบายสำหรับสินค้านี้"}</p>
            
            <div className="mb-8">
              <span className="text-sm text-stone-500 block mb-1">สถานะสินค้า</span>
              {product.stock > 0 ? (
                <span className="inline-block bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full text-sm">มีสินค้า ({product.stock} ชิ้น)</span>
              ) : (
                <span className="inline-block bg-red-50 text-red-700 font-semibold px-3 py-1 rounded-full text-sm">สินค้าหมด</span>
              )}
            </div>

            <button 
              onClick={addToCart}
              disabled={product.stock <= 0}
              className={`mt-auto w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                product.stock > 0 ? 'bg-stone-900 hover:bg-stone-800 text-white' : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-5 h-5" /> 
              {product.stock > 0 ? 'หยิบใส่ตะกร้า' : 'สินค้าหมด'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}