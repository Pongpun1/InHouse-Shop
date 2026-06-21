import React from 'react';
import { Home } from 'lucide-react';

export default function BrandHeader({ subtitle }) {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mb-3">
        <Home className="w-5 h-5 text-amber-600" />
      </div>
      <h1 className="text-xl font-bold text-stone-900 tracking-tight">
        In<span className="text-amber-600">House</span>Store
      </h1>
      <p className="text-sm text-stone-500 mt-1">{subtitle}</p>
    </div>
  );
}