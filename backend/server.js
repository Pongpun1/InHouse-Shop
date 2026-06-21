import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Server ทำงานแล้ว!');
});

// เชื่อมต่อ MongoDB
mongoose.connect('mongodb://localhost:27017/my_ecommerce')
  .then(() => console.log('เชื่อมต่อ MongoDB สำเร็จ'))
  .catch((err) => console.log('เชื่อมต่อ MongoDB ล้มเหลว:', err));

// ใช้ Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});