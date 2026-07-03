import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();
router.use(verifyToken);

// GET /api/users/profile — ดึงข้อมูลโปรไฟล์ของตัวเอง
router.get('/profile', async (req, res) => {
  try {
    // select('-password') คือไม่ส่ง field password กลับไป ปลอดภัยกว่า
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'โหลดข้อมูลไม่สำเร็จ', error: err.message });
  }
});

// PUT /api/users/profile — แก้ไขข้อมูลทั่วไป (username, phone)
router.put('/profile', async (req, res) => {
  try {
    const { username, phone } = req.body;

    // เช็คว่า username หรือ phone ซ้ำกับคนอื่นไหม (ยกเว้นตัวเอง)
    const existing = await User.findOne({
      $or: [{ username }, { phone }],
      _id: { $ne: req.user.id }, // ไม่นับตัวเอง
    });

    if (existing) {
      if (existing.username === username)
        return res.status(400).json({ message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
      if (existing.phone === phone)
        return res.status(400).json({ message: 'เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { username, phone },
      { new: true }
    ).select('-password');

    res.json({ message: 'อัปเดตข้อมูลสำเร็จ', user: updated });
  } catch (err) {
    res.status(500).json({ message: 'อัปเดตข้อมูลไม่สำเร็จ', error: err.message });
  }
});

// PUT /api/users/password — เปลี่ยนรหัสผ่าน
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้งาน' });

    // ตรวจสอบรหัสผ่านปัจจุบันก่อนเสมอ
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'เปลี่ยนรหัสผ่านไม่สำเร็จ', error: err.message });
  }
});

export default router;