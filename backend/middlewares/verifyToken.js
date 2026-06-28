import jwt from 'jsonwebtoken';

// Middleware ตรวจสอบ JWT Token ก่อนเข้าถึง route ที่ต้องการ login
// ใช้ได้โดยใส่ไว้ก่อน handler เช่น router.get('/', verifyToken, handler)
export default function verifyToken(req, res, next) {
  // Token จะถูกส่งมาใน Header รูปแบบ "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // ตัด "Bearer " ออก เหลือแค่ token

  if (!token) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อน' });
  }

  try {
    // verify จะตรวจสอบว่า token ถูกต้องและไม่หมดอายุ
    // ถ้าผ่าน จะ decode แล้วเก็บข้อมูล user ไว้ใน req.user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, iat, exp }
    next(); // ผ่านแล้ว ไปต่อได้เลย
  } catch (err) {
    return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่' });
  }
}