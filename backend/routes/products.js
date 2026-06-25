import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Product from '../models/Product.js';

const router = express.Router();

//  เก็บไฟล์ที่อัปโหลดไว้ในโฟลเดอร์ uploads/ ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์ใหม่เป็น timestamp + นามสกุลเดิม เพื่อกันชนกัน
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('อนุญาตเฉพาะไฟล์ .jpg .png .webp เท่านั้น'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ดึงสินค้าทั้งหมด
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
  }
});

// ดึงข้อมูลสินค้าชิ้นเดียวตาม ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "ไม่พบสินค้า" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// เพิ่มสินค้าใหม่
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const product = new Product({ name, description, price, stock, category, imageUrl });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'เพิ่มสินค้าไม่สำเร็จ', error: err.message });
  }
});

// แก้ไขสินค้า
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const updateData = { name, description, price, stock, category };

    // ถ้ามีอัปโหลดรูปใหม่มา ค่อยเปลี่ยน imageUrl
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;

      // ลบรูปเก่าออกจาก server
      const old = await Product.findById(req.params.id);
      if (old?.imageUrl) {
        const oldPath = `.${old.imageUrl}`;
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: 'ไม่พบสินค้า' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'แก้ไขสินค้าไม่สำเร็จ', error: err.message });
  }
});

// ลบสินค้า
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' });

    // ลบไฟล์รูปออกจาก server ด้วย
    if (product.imageUrl) {
      const filePath = `.${product.imageUrl}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'ลบสินค้าเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ message: 'ลบสินค้าไม่สำเร็จ', error: err.message });
  }
});

export default router;