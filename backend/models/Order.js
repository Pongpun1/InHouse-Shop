import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    province: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['credit_card', 'promptpay', 'cod'] // บังคับว่าต้องเป็น 3 ค่านี้เท่านั้น
  },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled']
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);