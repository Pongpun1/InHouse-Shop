import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  stock:       { type: Number, required: true },
  category:    { type: String, required: true },
  imageUrl:    { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);