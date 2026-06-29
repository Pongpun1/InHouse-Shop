import express from 'express';
import Cart from '../models/Cart.js';
  import Product from '../models/Product.js'; 
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

// ── GET /api/cart — ดึงตะกร้าของ user ที่ login อยู่ ──
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: 'โหลดตะกร้าไม่สำเร็จ', error: err.message });
  }
});

// ── POST /api/cart/add — เพิ่มสินค้าเข้าตะกร้า (แก้ไขใหม่ เช็คสต็อก) ──
router.post('/add', async (req, res) => {
  try {
    const { productId, name, price, imageUrl, category, quantity = 1 } = req.body;

    // ไปดึงข้อมูลสินค้าตัวนี้มาจาก Database เพื่อดูสต็อกจริง
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้าในระบบ' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.productId.toString() === productId
    );

    // คำนวณจำนวนรวมที่จะอยู่ในตะกร้า (ถ้ามีของเดิม ให้เอาของเดิม + ของใหม่)
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantityInCart + quantity;

    // 2. เช็คว่าจำนวนรวมเกินสต็อกที่มีหรือไม่
    if (newTotalQuantity > product.stock) {
      return res.status(400).json({ 
        message: `ไม่สามารถเพิ่มได้! สินค้าเหลือ ${product.stock} ชิ้น (คุณมีในตะกร้าแล้ว ${currentQuantityInCart} ชิ้น)` 
      });
    }

    if (existingItem) {
      existingItem.quantity = newTotalQuantity;
    } else {
      cart.items.push({ productId, name, price, imageUrl, category, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'เพิ่มสินค้าไม่สำเร็จ', error: err.message });
  }
});

// ── PUT /api/cart/item/:productId — อัปเดตจำนวนสินค้า (แก้ไขใหม่ เช็คสต็อก) ──
router.put('/item/:productId', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // เช็คสต็อกก่อนอัปเดต (เผื่อ User กดปุ่ม + รัวๆ ในหน้า Cart)
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'ไม่พบสินค้าในระบบ' });
    }
    
    if (quantity > product.stock) {
      return res.status(400).json({ 
        message: `มีสินค้าในสต็อกเพียง ${product.stock} ชิ้นเท่านั้น` 
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'ไม่พบตะกร้า' });

    const item = cart.items.find(
      item => item.productId.toString() === req.params.productId
    );
    if (!item) return res.status(404).json({ message: 'ไม่พบสินค้าในตะกร้า' });

    if (quantity < 1) {
      cart.items = cart.items.filter(
        item => item.productId.toString() !== req.params.productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'อัปเดตสินค้าไม่สำเร็จ', error: err.message });
  }
});

// ── DELETE /api/cart/item/:productId — ลบสินค้าออกจากตะกร้า ──
router.delete('/item/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'ไม่พบตะกร้า' });

    cart.items = cart.items.filter(
      item => item.productId.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'ลบสินค้าไม่สำเร็จ', error: err.message });
  }
});

// ── DELETE /api/cart — ล้างตะกร้าทั้งหมด ──
router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'ล้างตะกร้าเรียบร้อย' });
  } catch (err) {
    res.status(500).json({ message: 'ล้างตะกร้าไม่สำเร็จ', error: err.message });
  }
});

export default router;