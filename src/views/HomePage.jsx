import React from 'react';
import { Home } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
          <Home className="w-5 h-5 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">ยินดีต้อนรับสู่ InHouseStore</h1>
        <p className="text-sm text-stone-500 mt-1">เข้าสู่ระบบสำเร็จแล้ว นี่คือหน้า HomePage</p>
      </div>
    </div>
  );
}