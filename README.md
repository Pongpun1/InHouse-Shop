# 🏠 InHouse Shop

ระบบร้านค้าออนไลน์สำหรับสินค้าตกแต่งบ้านและของใช้ภายในบ้าน พัฒนาด้วย React + Node.js พร้อม REST API และ JWT Authentication ครบวงจร

🌐 **Live Demo:** [inhouse-shop.vercel.app](https://inhouse-shop.vercel.app)

---

## 📌 เกี่ยวกับโปรเจค

InHouse Shop เป็น E-Commerce Web Application ที่รองรับผู้ใช้งาน 2 ระดับ

- **ลูกค้า** — เรียกดูสินค้า เพิ่มลงตะกร้า สั่งซื้อ และดูประวัติการสั่งซื้อ
- **Admin** — จัดการสินค้า (เพิ่ม / แก้ไข / ลบ) และดูคำสั่งซื้อทั้งหมดของระบบ

---

## ✨ ฟีเจอร์หลัก

### สำหรับลูกค้า
- สมัครสมาชิก / เข้าสู่ระบบด้วย JWT Authentication
- เรียกดูสินค้าทั้งหมดพร้อมรูปภาพและราคา
- เพิ่มสินค้าลงตะกร้า พร้อมแสดง badge จำนวนสินค้า
- สั่งซื้อสินค้าและดูประวัติการสั่งซื้อ
- แก้ไขข้อมูลโปรไฟล์และเปลี่ยนรหัสผ่าน

### สำหรับ Admin
- เพิ่ม / แก้ไข / ลบสินค้า พร้อมอัปโหลดรูปภาพ
- ดูและจัดการคำสั่งซื้อทั้งหมดของระบบ

---

## 🛠️ Tech Stack

### Frontend
| เทคโนโลยี | การใช้งาน |
|---|---|
| React 19 | UI Library |
| Vite | Build Tool |
| React Router v7 | Client-side Routing |
| Tailwind CSS | Styling |
| Lucide React | Icon Library |
| Sonner | Toast Notifications |

### Backend
| เทคโนโลยี | การใช้งาน |
|---|---|
| Node.js + Express | REST API Server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password Hashing |
| Multer | File Upload |
| CORS | Cross-Origin Resource Sharing |

### Infrastructure & Deploy
| บริการ | การใช้งาน |
|---|---|
| Vercel | Deploy Frontend |
| Render | Deploy Backend |
| MongoDB Atlas | Cloud Database |
| Cloudinary | Cloud Image Storage |

---

## 📁 โครงสร้างโปรเจค

```
InHouse-Shop/
├── backend/
│   ├── middlewares/
│   │   └── verifyToken.js      # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js             # Register / Login
│   │   ├── products.js         # CRUD สินค้า
│   │   ├── carts.js            # ตะกร้าสินค้า
│   │   ├── orders.js           # คำสั่งซื้อ
│   │   └── users.js            # โปรไฟล์ผู้ใช้
│   └── server.js
├── src/
│   ├── components/
│   │   └── Header.jsx
│   └── pages/
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       ├── ProductsPage.jsx
│       ├── CartPage.jsx
│       ├── HistoryPage.jsx
│       ├── ProfilePage.jsx
│       ├── ManagePage.jsx      # Admin only
│       └── OrderPage.jsx       # Admin only
├── .env.example
├── index.html
└── vite.config.js
```

---

## 🚀 วิธีติดตั้งและรันบนเครื่อง

### สิ่งที่ต้องมีก่อน
- Node.js v18+
- MongoDB (local หรือ Atlas)

### 1. Clone โปรเจค
```bash
git clone https://github.com/Pongpun1/InHouse-Shop.git
cd InHouse-Shop
```

### 2. ติดตั้ง Backend
```bash
cd backend
npm install
```

สร้างไฟล์ `.env` ใน folder `backend/`
```env
MONGO_URI=mongodb://localhost:27017/my_ecommerce
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

```bash
node server.js
```

### 3. ติดตั้ง Frontend
```bash
# กลับไปที่ root
cd ..
npm install
```

สร้างไฟล์ `.env` ที่ root
```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

## 🔐 Role และสิทธิ์การใช้งาน

| Role | สิทธิ์ |
|---|---|
| `customer` | ดูสินค้า, ตะกร้า, สั่งซื้อ, ประวัติ, โปรไฟล์ |
| `admin` | ทุกอย่างของ customer + จัดการสินค้า + ดูคำสั่งซื้อทั้งหมด |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | `/api/auth/register` | สมัครสมาชิก |
| POST | `/api/auth/login` | เข้าสู่ระบบ |

### Products
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/products` | ดูสินค้าทั้งหมด |
| POST | `/api/products` | เพิ่มสินค้า (Admin) |
| PUT | `/api/products/:id` | แก้ไขสินค้า (Admin) |
| DELETE | `/api/products/:id` | ลบสินค้า (Admin) |

### Cart
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/cart` | ดูตะกร้าสินค้า |
| POST | `/api/cart` | เพิ่มสินค้าลงตะกร้า |
| PUT | `/api/cart/:itemId` | แก้ไขจำนวนสินค้า |
| DELETE | `/api/cart/:itemId` | ลบสินค้าออกจากตะกร้า |

### Orders
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/orders` | ดูคำสั่งซื้อของตัวเอง |
| GET | `/api/orders/all` | ดูคำสั่งซื้อทั้งหมด (Admin) |
| POST | `/api/orders` | สร้างคำสั่งซื้อ |

### Users
| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/users/profile` | ดูข้อมูลโปรไฟล์ |
| PUT | `/api/users/profile` | แก้ไขข้อมูลโปรไฟล์ |
| PUT | `/api/users/password` | เปลี่ยนรหัสผ่าน |

---

## CI/CD

โปรเจกต์นี้ใช้ GitHub Actions สำหรับ CI/CD pipeline โดยจะรันอัตโนมัติเมื่อมีการ push หรือเปิด Pull Request ไปที่ branch `main` ดูรายละเอียด workflow ได้ที่ [`.github/workflows`](.github/workflows)

## Deployment

โปรเจกต์นี้ deploy แยกส่วนตาม service ดังนี้:

- **Frontend:** [Vercel](https://vercel.com)
- **Backend:** [Render](https://render.com)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)

## Running with Docker

รันโปรเจกต์ทั้งหมด (frontend, backend, MongoDB) ในเครื่องด้วย Docker Compose:

```bash
docker compose up --build
```

หลังจากนั้นเข้าใช้งานได้ที่:

- Frontend: http://localhost
- Backend API: http://localhost:3000

## 👨‍💻 ผู้พัฒนา

**Pongpun** — Full Stack Developer  
📎 [github.com/Pongpun1](https://github.com/Pongpun1)
