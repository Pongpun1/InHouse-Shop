// ไฟล์: routes/orders.js
import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js'; // 1. ต้อง Import Product เข้ามาด้วยเพื่อไปตัดสต็อก
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

// ── GET /api/orders/all — (สำหรับ Admin) ดึงคำสั่งซื้อทั้งหมดในร้าน ──
router.get('/all', async (req, res) => {
  try {
    // .populate('userId', 'username email') จะดึงชื่อและอีเมลของคนซื้อมาด้วย
    const orders = await Order.find()
      .populate('userId', 'username email') 
      .sort({ createdAt: -1 }); // เรียงจากบิลใหม่ล่าสุดไปเก่าสุด
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'โหลดประวัติคำสั่งซื้อทั้งหมดไม่สำเร็จ', error: err.message });
  }
});

// ── POST /api/orders — สร้างคำสั่งซื้อใหม่ พร้อมตัดสต็อก ──
router.post('/', async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // 1. ดึงข้อมูลจากตะกร้าปัจจุบันของ User
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'ตะกร้าสินค้าว่างเปล่า ไม่สามารถสั่งซื้อได้' });
    }

    // 2. เช็คสต็อกสินค้า "อีกครั้ง" ก่อนสร้างคำสั่งซื้อ (ป้องกันคนกดซื้อพร้อมกัน)
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `ไม่พบสินค้า ${item.name} ในระบบ` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `ขออภัย สินค้า "${item.name}" เหลือสต็อกเพียง ${product.stock} ชิ้น` 
        });
      }
    }

    // 3. คำนวณยอดรวม
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 4. สร้างคำสั่งซื้อใหม่
    const newOrder = new Order({
      userId: req.user.id,
      items: cart.items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: paymentMethod === 'cod' ? 'Pending' : 'Paid'
    });
    await newOrder.save();

    // 5. 🎯 ตัดสต็อกสินค้าใน Database 🎯
    // วนลูปตามสินค้าที่อยู่ในตะกร้า แล้วสั่งลดสต็อก (-item.quantity)
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity } 
      });
    }

    // 6. ล้างตะกร้าสินค้าให้ว่างเปล่าหลังสั่งซื้อและตัดสต็อกเสร็จ
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'สั่งซื้อสำเร็จและตัดสต็อกเรียบร้อย', orderId: newOrder._id });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสั่งซื้อ', error: err.message });
  }
});

// ── GET /api/orders — ดึงประวัติการสั่งซื้อของตัวเอง ──
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'โหลดประวัติไม่สำเร็จ', error: err.message });
  }
});

export default router;