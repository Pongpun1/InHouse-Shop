# ใช้ Node.js version 20 เป็น base image
# "alpine" คือ Linux ขนาดเล็กมาก (~5MB) ทำให้ image เล็กกว่า ubuntu มาก
FROM node:20-alpine

# กำหนดโฟลเดอร์ทำงานใน container
WORKDIR /app

# copy package.json ก่อน แล้วค่อย npm install
# เทคนิคนี้ทำให้ Docker cache node_modules ไว้
# ถ้าโค้ดเปลี่ยนแต่ package.json ไม่เปลี่ยน จะไม่ npm install ซ้ำ ประหยัดเวลา
COPY package*.json ./
RUN npm install

# copy โค้ดทั้งหมดเข้ามาใน container
COPY . .

# บอกว่า container นี้ใช้ port 3000
EXPOSE 3000

# คำสั่งที่รันตอน container เริ่มทำงาน
CMD ["node", "server.js"]