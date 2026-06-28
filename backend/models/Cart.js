import mongoose from 'mongoose';

// Schema ของสินค้าแต่ละชิ้นในตะกร้า
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },  // เก็บราคา ณ ตอนที่หยิบ
  imageUrl:  { type: String, default: '' },
  category:  { type: String, default: '' },
  quantity:  { type: Number, required: true, min: 1, default: 1 },
});

// Schema ของตะกร้า — 1 user มีได้แค่ 1 ตะกร้า (unique: true)
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);