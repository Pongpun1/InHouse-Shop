import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();
router.use(verifyToken);

// ── GET /api/orders/all — admin ดูออเดอร์ทั้งหมด ──
// ⚠️ ต้องวางไว้ก่อน /:id เสมอ
// เพราะถ้าวางหลัง Express จะตีความว่า "all" คือ id แล้วพังเลย
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'โหลดออเดอร์ไม่สำเร็จ', error: err.message });
  }
});

// ── GET /api/orders — ดูประวัติออเดอร์ของตัวเอง ──
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'โหลดประวัติไม่สำเร็จ', error: err.message });
  }
});

// ── POST /api/orders — สร้างออเดอร์ใหม่ พร้อมตัดสต็อก ──
router.post('/', async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'ตะกร้าสินค้าว่างเปล่า ไม่สามารถสั่งซื้อได้' });
    }

    // เช็คสต็อกอีกครั้งก่อน checkout (ป้องกันกรณี race condition)
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

    const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      userId: req.user.id,
      items: cart.items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: paymentMethod === 'cod' ? 'Pending' : 'Paid',
    });
    await newOrder.save();

    // ตัดสต็อก
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // ล้างตะกร้า
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'สั่งซื้อสำเร็จ', orderId: newOrder._id });
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสั่งซื้อ', error: err.message });
  }
});

// ── PUT /api/orders/:id/status — admin เปลี่ยนสถานะออเดอร์ ──
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `สถานะไม่ถูกต้อง ต้องเป็นหนึ่งใน: ${validStatuses.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // คืนค่า document ที่อัปเดตแล้ว
    );

    if (!order) return res.status(404).json({ message: 'ไม่พบออเดอร์' });
    res.json({ message: 'อัปเดตสถานะเรียบร้อย', order });
  } catch (err) {
    res.status(500).json({ message: 'อัปเดตสถานะไม่สำเร็จ', error: err.message });
  }
});

export default router;