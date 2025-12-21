# 📦 Installation Guide - Messenger Clone

Hướng dẫn chi tiết cài đặt và chạy Messenger Clone trên máy local.

---

## 📋 Yêu cầu hệ thống

- **Node.js**: v18.0.0 trở lên
- **MySQL**: v8.0 trở lên
- **npm** hoặc **yarn**
- **Git**

---

## 🔧 Cài đặt từng bước

### **Bước 1: Clone Repository**

```bash
git clone https://github.com/yourusername/MessengerClone.git
cd MessengerClone
```

---

### **Bước 2: Cài đặt MySQL Database**

#### Tạo Database mới:

```sql
CREATE DATABASE messenger_clone;
```

#### Kiểm tra MySQL đang chạy:

```bash
# Windows
net start MySQL80

# macOS/Linux
sudo service mysql start
```

---

### **Bước 3: Setup Backend (Server)**

#### 3.1. Di chuyển vào thư mục server:

```bash
cd server
```

#### 3.2. Cài đặt dependencies:

```bash
npm install
```

#### 3.3. Tạo file `.env`:

Sao chép `.env.example` thành `.env`:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

#### 3.4. Cấu hình `.env`:

Mở file `.env` và điền thông tin của bạn:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=messenger_clone
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# JWT Secret (Đổi thành chuỗi bí mật của bạn)
JWT_SECRET=messenger_secret_key_2024_change_this
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173
```

**⚠️ LƯU Ý:** Thay `your_mysql_password_here` bằng mật khẩu MySQL của bạn!

#### 3.5. Chạy Server:

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**✅ Server chạy thành công khi thấy:**

```
✅ Database connection has been established successfully.
✅ All models were synchronized successfully.
✅ Socket.io initialized
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server is running on port 5000
📡 Environment: development
🌐 Health check: http://localhost:5000/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **Bước 4: Setup Frontend (Client)**

#### 4.1. Mở terminal mới và di chuyển vào thư mục client:

```bash
cd client
```

#### 4.2. Cài đặt dependencies:

```bash
npm install
```

#### 4.3. Tạo file `.env`:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

#### 4.4. Cấu hình `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

#### 4.5. Chạy Frontend:

```bash
npm run dev
```

**✅ Frontend chạy thành công khi thấy:**

```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🌐 Truy cập ứng dụng

Mở trình duyệt và truy cập:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🎯 Kiểm tra cài đặt

### **1. Kiểm tra Backend:**

```bash
curl http://localhost:5000/health
```

Kết quả mong đợi:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-21T10:00:00.000Z"
}
```

### **2. Kiểm tra Database:**

Kết nối vào MySQL và kiểm tra tables:

```sql
USE messenger_clone;
SHOW TABLES;
```

Kết quả mong đợi:

```
+---------------------------+
| Tables_in_messenger_clone |
+---------------------------+
| messages                  |
| users                     |
+---------------------------+
```

---

## 🐛 Xử lý lỗi thường gặp

### **Lỗi 1: "Unable to connect to the database"**

**Nguyên nhân:** Không kết nối được MySQL

**Giải pháp:**
```bash
# Kiểm tra MySQL đang chạy
# Windows
net start MySQL80

# Kiểm tra thông tin đăng nhập
mysql -u root -p
```

---

### **Lỗi 2: "Port 5000 is already in use"**

**Nguyên nhân:** Port 5000 đã được sử dụng

**Giải pháp:**
```bash
# Windows - Tìm và kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

Hoặc đổi port trong `.env`:
```env
PORT=5001
```

---

### **Lỗi 3: "CORS Error"**

**Nguyên nhân:** Cấu hình CORS không đúng

**Giải pháp:** Kiểm tra `CLIENT_URL` trong `server/.env`:
```env
CLIENT_URL=http://localhost:5173
```

---

### **Lỗi 4: "Cannot find module"**

**Nguyên nhân:** Thiếu dependencies

**Giải pháp:**
```bash
# Server
cd server
rm -rf node_modules package-lock.json
npm install

# Client
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Cập nhật Code

Khi pull code mới từ git:

```bash
git pull origin main

# Update dependencies
cd server && npm install
cd ../client && npm install
```

---

## 🧪 Testing

### **Tạo User Test:**

1. Mở http://localhost:5173/register
2. Đăng ký user 1:
   - Username: `user1`
   - Email: `user1@test.com`
   - Password: `123456`

3. Logout và đăng ký user 2:
   - Username: `user2`
   - Email: `user2@test.com`
   - Password: `123456`

4. Đăng nhập bằng user1 và chat với user2!

---

## 📚 Scripts có sẵn

### **Server Scripts:**
```bash
npm start       # Chạy production mode
npm run dev     # Chạy development mode (nodemon)
```

### **Client Scripts:**
```bash
npm run dev     # Chạy development server
npm run build   # Build cho production
npm run preview # Preview production build
npm run lint    # Kiểm tra code
```

---

## 🎓 Cấu trúc Monorepo

```
MessengerClone/
├── client/              # Frontend (Port 5173)
│   ├── src/
│   ├── package.json
│   └── .env
│
├── server/              # Backend (Port 5000)
│   ├── src/
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 💡 Tips

1. **Luôn chạy Server trước, sau đó mới chạy Client**
2. **Kiểm tra port conflicts trước khi chạy**
3. **Đảm bảo MySQL đã chạy**
4. **Kiểm tra .env configuration**
5. **Clear browser cache nếu gặp lỗi UI**

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra lại các bước cài đặt
2. Xem phần "Xử lý lỗi thường gặp"
3. Mở issue trên GitHub
4. Liên hệ: your.email@example.com

---

**Chúc bạn cài đặt thành công! 🎉**
