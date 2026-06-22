import React, { useState } from 'react';
import { ShoppingCart, ArrowRight, Star, Truck, ShieldCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['ทั้งหมด', 'โซฟาและเก้าอี้', 'ห้องนอน', 'ของตกแต่ง', 'โคมไฟ', 'ต้นไม้ประดับ', 'พรม'];

const mockProducts = [
  { id: 1, name: "โคมไฟตั้งโต๊ะสไตล์มินิมอล", category: "โคมไฟ", price: 1290, rating: 4.8, imageUrl: "https://images.unsplash.com/photo-1507149833265-60c372daea22?w=500&q=80" },
  { id: 2, name: "แจกันเซรามิกทรงเรขาคณิต", category: "ของตกแต่ง", price: 450, rating: 4.5, imageUrl: "https://images.unsplash.com/photo-1612152505975-6454ce066c85?w=500&q=80" },
  { id: 3, name: "หมอนอิงผ้าฝ้ายออร์แกนิก", category: "ห้องนอน", price: 590, rating: 4.9, imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=500&q=80" },
  { id: 4, name: "ต้นไม้ประดับพร้อมกระถางปูนเปลือย", category: "ต้นไม้ประดับ", price: 890, rating: 4.7, imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&q=80" },
  { id: 5, name: "เก้าอี้อาร์มแชร์ไม้โอ๊ค", category: "โซฟาและเก้าอี้", price: 3500, rating: 5.0, imageUrl: "https://images.unsplash.com/photo-1506439089592-a16828cb0f71?w=500&q=80" },
  { id: 6, name: "พรมทอมือลายโบฮีเมียน", category: "พรม", price: 2150, rating: 4.6, imageUrl: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&q=80" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = activeCategory === 'ทั้งหมด'
    ? mockProducts
    : mockProducts.filter(p => p.category === activeCategory);

  const handleAddToCart = (e, productName) => {
    e.stopPropagation(); // ป้องกัน click ลามไปที่การ์ด
    setCartCount(prev => prev + 1);
    // TODO: ทีหลังเปลี่ยนเป็นยิง API จริง POST /api/cart
    console.log('เพิ่มสินค้าลงตะกร้า:', productName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50 pb-0 font-sans">

      {/* ── Hero ── */}
      <div className="relative w-full h-[65vh] min-h-[500px] bg-stone-900 flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80"
            alt="Interior Decor"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold tracking-wider text-xs mb-6">
              NEW COLLECTION 2026
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              เปลี่ยนบ้านของคุณ <br />
              <span className="text-stone-300 font-light">ให้อบอุ่นกว่าที่เคย</span>
            </h1>
            <p className="text-stone-400 text-lg sm:text-xl mb-10 max-w-lg font-light">
              ค้นพบของตกแต่งบ้านสไตล์มินิมอล เฟอร์นิเจอร์ไม้แท้ และไอเทมที่จะทำให้ทุกมุมในบ้านน่าอยู่ขึ้น
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3.5 px-8 rounded-full flex items-center gap-2 transition-transform hover:-translate-y-1 shadow-lg shadow-amber-500/30 cursor-pointer"
            >
              เลือกซื้อสินค้าเลย <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Features Bar ── */}
      <div className="w-full bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-0">
              <Truck className="w-8 h-8 text-amber-600 mb-3" />
              <h3 className="font-bold text-stone-900">จัดส่งฟรีทั่วประเทศ</h3>
              <p className="text-sm text-stone-500 mt-1">เมื่อสั่งซื้อครบ 2,000 บาทขึ้นไป</p>
            </div>
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-0">
              <ShieldCheck className="w-8 h-8 text-amber-600 mb-3" />
              <h3 className="font-bold text-stone-900">รับประกันคุณภาพ</h3>
              <p className="text-sm text-stone-500 mt-1">สินค้าทุกชิ้นรับประกัน 1 ปีเต็ม</p>
            </div>
            <div className="flex flex-col items-center justify-center pt-4 sm:pt-0">
              <Clock className="w-8 h-8 text-amber-600 mb-3" />
              <h3 className="font-bold text-stone-900">ซัพพอร์ต 24 ชั่วโมง</h3>
              <p className="text-sm text-stone-500 mt-1">พร้อมให้คำปรึกษาเรื่องแต่งบ้าน</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">สินค้าแนะนำ</h2>
            <p className="text-stone-500 mt-2">ไอเทมยอดฮิตสำหรับของตกแต่งภายในบ้าน</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="hidden sm:flex text-amber-600 hover:text-amber-700 font-medium items-center gap-1.5 transition-colors cursor-pointer group"
          >
            ดูทั้งหมด <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Category Filter — มี active state แล้ว */}
        <div className="flex flex-wrap gap-3 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p>ไม่มีสินค้าในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate('/products')}
                className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer"
              >
                <div className="relative h-72 overflow-hidden bg-stone-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 shadow-sm">
                    {product.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-stone-900 line-clamp-2 leading-tight pr-4">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 bg-amber-50 px-2 py-1 rounded text-amber-700">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-bold">{product.rating}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <p className="text-2xl font-black text-stone-900">
                      ฿{product.price.toLocaleString()}
                    </p>
                    <button
                      onClick={(e) => handleAddToCart(e, product.name)}
                      className="bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-900 p-3 rounded-full transition-colors cursor-pointer"
                      title="หยิบใส่ตะกร้า"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/products')}
          className="sm:hidden w-full mt-8 border-2 border-stone-200 text-stone-600 font-bold py-3 rounded-xl flex justify-center items-center gap-2 cursor-pointer"
        >
          ดูสินค้าทั้งหมด <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-24 bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold text-white mb-2">
              In<span className="text-amber-400">House</span>Store
            </p>
            <p className="text-sm leading-relaxed">
              ร้านของตกแต่งภายในบ้านสไตล์มินิมอล คัดสรรสินค้าคุณภาพให้บ้านคุณน่าอยู่ขึ้น
            </p>
          </div>
          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">เมนู</p>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/home')} className="hover:text-amber-400 transition-colors cursor-pointer">หน้าแรก</button></li>
              <li><button onClick={() => navigate('/products')} className="hover:text-amber-400 transition-colors cursor-pointer">สินค้าทั้งหมด</button></li>
              <li><button onClick={() => navigate('/history')} className="hover:text-amber-400 transition-colors cursor-pointer">ประวัติการสั่งซื้อ</button></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <p className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">ติดต่อเรา</p>
            <ul className="space-y-2 text-sm">
              <li>📧 support@inhousestore.th</li>
              <li>📞 02-XXX-XXXX</li>
              <li>🕐 จันทร์–ศุกร์ 9:00–18:00 น.</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 text-center text-xs py-4 text-stone-600">
          © 2026 InHouseStore. All rights reserved.
        </div>
      </footer>

    </div>
  );
}