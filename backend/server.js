import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/carts.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const corsOptions = {
  origin: ['http://localhost:5173','http://localhost', 'https://inhouse-shop.vercel.app'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('เชื่อมต่อ MongoDB สำเร็จ'))
  .catch((err) => console.log('เชื่อมต่อ MongoDB ล้มเหลว:', err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); // เพิ่ม users route

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});