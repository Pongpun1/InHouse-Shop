import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const categories = ['เฟอร์นิเจอร์', 'ของตกแต่ง', 'โคมไฟ', 'สิ่งทอและพรม', 'ต้นไม้ประดับ', 'เครื่องหอม', 'โต๊ะอาหาร'];

const emptyForm = { name: '', description: '', category: categories[0], price: '', stock: '' };

export default function ManagePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);       // ไฟล์รูปที่เลือก
  const [imagePreview, setImagePreview] = useState('');   // URL preview ก่อนอัปโหลด
  const [error, setError] = useState('');

  // โหลดสินค้าจาก MongoDB
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch {
      setError('โหลดสินค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // เปิด Modal เพิ่มสินค้าใหม่
  const handleAddClick = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setError('');
    setIsModalOpen(true);
  };

  // เปิด Modal แก้ไขสินค้า
  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price,
      stock: product.stock,
    });
    setImageFile(null);
    setImagePreview(product.imageUrl ? `${API_URL}${product.imageUrl}` : '');
    setError('');
    setIsModalOpen(true);
  };

  // เลือกไฟล์รูป แสดง preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file)); // สร้าง URL ชั่วคราวแสดงตัวอย่าง
  };

  // บันทึกข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ถ้าเพิ่มใหม่ต้องมีรูป แต่ถ้าแก้ไขไม่จำเป็นต้องเปลี่ยนรูป
    if (!editingId && !imageFile) {
      setError('กรุณาเลือกรูปภาพสินค้า');
      return;
    }

    setSubmitting(true);
    setError('');

    // ใช้ FormData เพราะต้องส่งไฟล์รูปพร้อมกับข้อมูลอื่น
    // fetch แบบปกติ (JSON) ส่งไฟล์ไม่ได้ ต้องใช้ FormData แทน
    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('category', formData.category);
    form.append('price', formData.price);
    form.append('stock', formData.stock);
    if (imageFile) form.append('image', imageFile); // ชื่อ 'image' ต้องตรงกับ upload.single('image') ใน backend

    try {
      const url = editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: form });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'เกิดข้อผิดพลาด');
      }

      await fetchProducts(); // โหลดรายการสินค้าใหม่จาก DB
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ลบสินค้า
  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) return;
    try {
      await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p._id !== id));
    } catch {
      alert('ลบสินค้าไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 font-sans text-stone-800">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900">จัดการสินค้า</h1>
            <p className="text-stone-500 mt-1">เพิ่ม แก้ไข และลบสินค้าในระบบของคุณ</p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-5 h-5" /> เพิ่มสินค้าใหม่
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-100/50 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">สินค้า</th>
                  <th className="px-6 py-4 font-semibold">หมวดหมู่</th>
                  <th className="px-6 py-4 font-semibold">ราคา</th>
                  <th className="px-6 py-4 font-semibold">สต็อก</th>
                  <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-stone-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      กำลังโหลดสินค้า...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-stone-500">
                      ยังไม่มีสินค้าในระบบ
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {product.imageUrl ? (
                            <img src={`${API_URL}${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 m-3 text-stone-300" />
                          )}
                        </div>
                        <span className="font-medium text-stone-900">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 text-stone-600">{product.category}</td>
                      <td className="px-6 py-4 font-medium text-stone-900">฿{Number(product.price).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          product.stock > 10 ? 'bg-green-100 text-green-700'
                          : product.stock > 0 ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} ชิ้น
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEditClick(product)} className="text-stone-400 hover:text-amber-600 p-2 transition-colors cursor-pointer" title="แก้ไข">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="text-stone-400 hover:text-red-500 p-2 transition-colors cursor-pointer" title="ลบ">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">
                {editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* อัปโหลดรูปภาพ */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  รูปภาพสินค้า {editingId && <span className="text-stone-400 font-normal">(ไม่เลือก = ใช้รูปเดิม)</span>}
                </label>
                {/* พื้นที่ preview รูป */}
                <div className="w-full h-40 rounded-xl border-2 border-dashed border-stone-300 overflow-hidden mb-2 flex items-center justify-center bg-stone-50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-stone-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs">ยังไม่มีรูปภาพ</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-stone-100 file:text-stone-700 file:font-medium file:cursor-pointer hover:file:bg-stone-200"
                />
                <p className="text-xs text-stone-400 mt-1">รองรับ .jpg .png .webp ขนาดไม่เกิน 5MB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">ชื่อสินค้า</label>
                <input required type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  placeholder="เช่น โคมไฟตั้งโต๊ะ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">รายละเอียดสินค้า</label>
                <textarea rows={2} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all resize-none"
                  placeholder="อธิบายสินค้าสั้นๆ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">หมวดหมู่</label>
                <select value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all bg-white"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">ราคา (บาท)</label>
                  <input required type="number" min="0" value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">จำนวนสต็อก</label>
                  <input required type="number" min="0" value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}