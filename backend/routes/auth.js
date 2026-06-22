import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// API สำหรับการ Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // เช็คว่ามีอีเมลนี้ในระบบหรือยัง
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    // เข้ารหัสผ่าน (Hash Password) เพื่อความปลอดภัย
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // สร้าง User ใหม่
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword
    });

    //บันทึกลงฐานข้อมูล
    await newUser.save();

    res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});



// API สำหรับการ Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ค้นหาอีเมลใน Database ว่ามีบัญชีนี้หรือไม่
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' });
    }

    // ถ้ามีอีเมล ให้เอา รหัสผ่านที่พิมพ์มา เทียบกับรหัสผ่านที่เข้ารหัสไว้ใน Database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // เก็บ token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ 
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
});

export default router;